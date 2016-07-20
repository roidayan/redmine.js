/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('rmIssues')
       .controller('IssueController', [
          'issueService',
          'userService',
          'projectService',
          'IssueClass',
          '$routeParams',
          '$log',
          '$localStorage',
          '$filter',
          '$q',
          '$mdToast',
          'Page',
          'gravatar',
          IssueController
       ]);

  function IssueController( issueService, userService, projectService,
                            IssueClass, $routeParams, $log,
                            $localStorage, $filter, $q, $mdToast, Page,
                            gravatar ) {
    var self = this;

    self.issueId = $routeParams.issueId;
    self.projectId = $routeParams.projectId;
    self.action = $routeParams.action || 'view';
    self.issue = null;
    self.issueIcon = '';
    self.issueIconClass = '';
    self.issueItems = [];
    self.author = {};
    self.assignee = {};
    /* users participating in the ticket by id */
    self.users = {};

    /* meta names by meta id and key id */
    self.meta = {
        'fixed_version_id': {},
        'status_id': {},
        'priority_id': {},
        'category_id': {},
        'tracker_id': {}
    };

    /* methods */
    self.getUserAvatar = getUserAvatar;
    self.editIssue = editIssue;
    self.viewIssue = viewIssue;
    self.submitIssueForm = submitIssueForm;
    self.cancelEdit = cancelEdit;
    self.isEmptyObject = function(ob) {
        return ob ? Object.keys(ob).length === 0 : true;
    };

    /**
     * init
     */

    if (self.action === 'new')
        Page.setTitle('New Issue');
    else
        Page.setTitle('Issue');

    Page.setBackButton(function(){
        if (self.action === 'edit')
            viewIssue();
        else
            goProject();
    });

    if (self.issueId)
        Page.setExtLink(issueService.getUrl(self.issueId));

    $log.debug('IssueController action:', self.action);
    setup();

    /**
     * internal
     */

    function goProject() {
        if (self.projectId)
            Page.changeView('/projects/' + self.projectId);
    }

    function editIssue() {
        Page.changeView('/issues/' + self.issueId + '/edit');
        //self.action = 'edit';
    }

    function viewIssue(issue_id) {
        if (issue_id) {
            Page.changeView('/issues/' + issue_id);
        } else if (self.issueId) {
            Page.changeView('/issues/' + self.issueId);
        }
        //self.action = 'view';
    }

    function cancelEdit() {
        if (self.issueId)
            viewIssue();
        else
            goProject();
    }

    function setup() {
        self.loading = true;
        self.errorLoading = false;
        self.errorMessage = '';
        var promises = [
            getIssueStatuses(),
            getIssuePriorities()
        ];
        if (self.issueId)
            promises.push(getIssue());
        else if (self.projectId)
            getProjectInfo(promises);

        $q.all(promises).then(function() {
            if (self.projectId)
                setIssueFields();
            self.loading = false;
        }).catch(function(e) {
            self.loading = false;
            self.errorLoading = true;
            self.errorMessage = e.statusText || 'error occured';
            $log.error('IssueController::setup: error:', e);
        });
    }

    /**
     * Add project info promises to existing list
     * @param  {[type]} promises Existing list
     * @return {[type]}          promises
     */
    function getProjectInfo(promises) {
        return promises.push.apply(promises, [
            getProject(),
            getProjectVersions(),
            getProjectMemberhips()
        ]);
    }

    function getIssue() {
        if (!self.issueId) {
            $log.error('IssueController::getIssue: missing issue id');
            return;
        }

        var q = issueService.get({
            'issue_id': self.issueId
        }).$promise.then(function(data) {
            $log.debug('IssueController::getIssue:', data);
            self.issue = data.issue;
            Page.setTitle(self.issue.tracker.name + ' #' + self.issue.id);
            self.projectId = self.issue.project.id;
            setIssueItems();
            setIssueFields();
            updateRelations();
            updateJournals();
            self.issueIcon = IssueClass.getIcon(self.issue);
            self.issueIconClass = IssueClass.getTrackerClass(self.issue);
            var promises = [
                getAuthor(),
                getAssignee()
            ];
            getProjectInfo(promises);
            return $q.all(promises).then(function() {
                updateJournals();
            });
        });

        return q;
    }

    function updateRelation(relation) {
        var type_to_text = {
            'relates': 'Related to'
        };

        switch (relation.relation_type) {
            case 'blocks':
                if (relation.issue_id === self.issue.id) {
                    relation.text = 'Blocks #' + relation.issue_to_id;
                    relation.target_issue_id = relation.issue_to_id;
                } else {
                    relation.text = 'Blocked by #' + relation.issue_id;
                    relation.target_issue_id = relation.issue_id;
                }
                break;
            default:
                var rel = type_to_text[relation.relation_type] ?
                            type_to_text[relation.relation_type] :
                                relation.relation_type;
                var target_issue_id = relation.issue_id !== self.issue.id ?
                                        relation.issue_id :
                                        relation.issue_to_id;
                relation.text = rel + ' #' + target_issue_id;
                relation.target_issue_id = target_issue_id;
                break;
        }
        return relation;
    }

    function updateRelations() {
        $log.debug('IssueController::updateRelations');

        if (!self.issue.relations)
            return;

        self.issue.relations.forEach(updateRelation);
    }

    function getIssueAttachment(id) {
        if (self.issue.attachments) {
            for (var i = 0; i < self.issue.attachments.length; i++) {
                if (self.issue.attachments[i].id == id)
                    return self.issue.attachments[i];
            }
        }
        return '';
    }

    function updateJournalDetails(detail) {
        var id_to_name = {
            'fixed_version_id': 'Target version',
            'status_id':        'Status',
            'assigned_to_id':   'Assignee',
            'priority_id':      'Priority',
            'category_id':      'Category',
            'subject':          'Subject',
            'done_ratio':       '% Done',
            'tracker_id':       'Tracker',
            'label_blocks':     'Blocks',
            'label_blocked_by': 'Blocked by',
            'label_relates_to': 'Related to'
        };

        var name = id_to_name[detail.name] || detail.name;
        var old_value = '[' + detail.old_value + ']';
        var new_value = '[' + detail.new_value + ']';

        if (detail.name == 'subject') {
            old_value = '"' + detail.old_value + '"';
            new_value = '"' + detail.new_value + '"';
        } else if (detail.name == 'done_ratio') {
            old_value = detail.old_value;
            new_value = detail.new_value;
        } else if (self.meta[detail.name]) {
            old_value = self.meta[detail.name][detail.old_value] || old_value;
            new_value = self.meta[detail.name][detail.new_value] || new_value;
        }

        function updateText(detail) {
            if (detail.property == 'attachment') {
                var target = detail.new_value;
                var attachment = getIssueAttachment(detail.name);
                if (attachment)
                    target = '<a href="'+attachment.content_url+'">'+detail.new_value+'</a>';
                detail.text = "File " + target + " added.";
                return;
            }

            if (detail.property == 'relation') {
                new_value = '<a href="#/issues/'+detail.new_value+'">' + new_value + '</a>';
                old_value = '<a href="#/issues/'+detail.old_value+'">' + old_value + '</a>';
            }

            if (detail.name == 'description')
                detail.text = "Description updated";
            else if (!detail.old_value)
                detail.text = name + " set to " + new_value;
            else if (!detail.new_value)
                detail.text = name + " deleted (was " + old_value + ")";
            else
                detail.text = name + " changed from " + old_value + " to " + new_value;
        }

        updateText(detail);

        if (detail.name == 'assigned_to_id') {
            var promises = [];
            if (detail.old_value) {
                promises.push(getUser(detail.old_value));
            }
            if (detail.new_value) {
                promises.push(getUser(detail.new_value));
            }
            $q.all(promises).then(function() {
                var old_user = self.users[detail.old_value];
                var new_user = self.users[detail.new_value];
                if (detail.old_value && old_user)
                    old_value = old_user.firstname + ' ' + old_user.lastname;
                if (detail.new_value && new_user)
                    new_value = new_user.firstname + ' ' + new_user.lastname;
                updateText(detail);
            });
        }
    }

    function updateJournals() {
        $log.debug('IssueController::updateJournals');

        if (!self.issue.journals)
            return;

        var issue_ref = new RegExp(" (#([0-9]+)) ");
        self.issue.journals.forEach(function(journal) {
            journal.details.forEach(updateJournalDetails);
        });
    }

    function getFieldValue(item) {
        if (!self.issue || !item)
            return '';
        return self.issue[item] ? self.issue[item].name : '';
    }

    function getFieldId(item) {
        if (!self.issue || !item)
            return '';
        return self.issue[item] ? self.issue[item].id : '';
    }

    function getFieldDefault(items) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].is_default)
                return items[i].id;
        }
        return '';
    }

    function getFieldFirst(items) {
        return items.length > 0 ? items[0].id : '';
    }

    function setIssueFields() {
        // TODO: icons for fields
        // icon for assignee
        // icon for tracker
        self.issueFields = [
            {
                label: 'Tracker',
                key: 'tracker_id',
                value: getFieldId('tracker') || getFieldFirst(self.meta.trackers),
                required: true,
                type: 'select',
                choices: function() { return self.meta.trackers || {}; }
            },
            {
                label: 'Subject',
                key: 'subject',
                value: self.issue ? self.issue.subject : '',
                required: true,
                flex: 100
            },
            {
                label: 'Description',
                key: 'description',
                value: self.issue ? self.issue.description : '',
                flex: 100,
                type: 'textarea'
            },
            {
                label: 'Status',
                key: 'status_id',
                value: getFieldId('status') || getFieldDefault(self.meta.statuses),
                required: true,
                type: 'select',
                choices: function() { return self.meta.statuses || {}; }
            },
            {
                label: 'Priority',
                key: 'priority_id',
                value: getFieldId('priority') || getFieldDefault(self.meta.priorities),
                required: true,
                type: 'select',
                choices: function() { return self.meta.priorities || {}; }
            },
            {
                label: 'Assignee',
                key: 'assigned_to_id',
                value: getFieldId('assigned_to'),
                required: false,
                avatar: function() {
                    var _id = getFieldId('assigned_to');
                    return self.users[_id] ? self.users[_id].avatar : '';
                },
                type: 'select',
                choices: function() { return self.meta.memberships || {}; }
            },
            {
                label: 'Target Version',
                key: 'fixed_version_id',
                value: getFieldId('fixed_version'),
                type: 'select',
                choices: function() { return self.meta.versions || {}; },
                show: function() { return !self.isEmptyObject(this.choices()); }
            },
            {
                label: 'Category',
                key: 'category_id',
                value: getFieldId('category'),
                type: 'select',
                choices: function() { return self.meta.categories || {}; },
                show: function() { return !self.isEmptyObject(this.choices()); }
            },
            {
                label: 'Notes',
                key: 'notes',
                value: '',
                flex: 100,
                type: 'textarea',
                show: function() { return self.action === 'edit'; },
                focus: true
            },
        ];
    }

    function setIssueItems() {
        var items = {
            'Project': {
                name: self.issue.project.name,
                click: function() { goProject(); }
            },
            'Status': {
                name: getFieldValue('status')
            },
            'Priority': {
                name: getFieldValue('priority')
            },
            'Assignee': {
                name: getFieldValue('assigned_to'),
                avatar: ''
            },
            'Target Version': {
                name: getFieldValue('fixed_version')
            },
            'Category': {
                name: getFieldValue('category')
            },
            'Created': {
                name: $filter('date')(self.issue.created_on, 'medium')
            },
            'Updated': {
                name: $filter('date')(self.issue.updated_on, 'medium')
            },
            '% Done': {
                name: self.issue.done_ratio
            }
        };

        self.issueItems = items;
    }

    function getAuthor() {
        var author_id = self.issue.author.id;

        var q = userService.get({
            'user_id': author_id
        }).$promise.then(function(data) {
            $log.debug('IssueController::getAuthor:', data);
            self.author = data.user;
            self.author.avatar = gravatar.get(self.author.mail);
            self.users[self.author.id] = self.author;
        }).catch(function(e) {
            $log.error('IssueController::getAUthor: failed to get author ' + author_id);
            $q.reject();
        });

        return q;
    }

    function getAssignee() {
        if (!self.issue.assigned_to)
            return $q.when(true);
        var assigned_to_id = self.issue.assigned_to.id;

        var q = userService.get({
            'user_id': assigned_to_id
        }).$promise.then(function(data) {
            $log.debug('IssueController::getAssignee:', data);
            self.assignee = data.user;
            self.assignee.avatar = gravatar.get(self.assignee.mail);
            self.issueItems.Assignee.avatar = self.assignee.avatar;
            self.users[self.assignee.id] = self.assignee;
        }).catch(function(e) {
            $log.error('IssueController::getAssignee: failed to get assignee ' + assigned_to_id);
            $q.reject();
        });

        return q;
    }

    function getUser(user_id) {
        if (!user_id)
            return $q.when(true);
        if (self.users[user_id])
            return $q.when(self.users[user_id]);

        var q = userService.get({
            'user_id': user_id
        }).$promise.then(function(data) {
            $log.debug('IssueController::getUser:', data);
            var _user = data.user;
            _user.avatar = gravatar.get(_user.mail);
            self.users[_user.id] = _user;
            return _user;
        }).catch(function(e) {
            $log.error('IssueController::getUser: failed to get user ' + user_id);
            $q.reject();
        });

        return q;
    }

    function getUserAvatar(user) {
        return (self.users[user.id] && self.users[user.id].avatar) || '';
    }

    function getProject() {
        if (!self.projectId) {
            $log.error('IssueController::getProject: no project id');
            return $q.when(true);
        }

        var q = projectService.get({
            'project_id': self.projectId,
        }).$promise.then(function(data) {
            $log.debug('IssueController::getProject', data);
            self.meta.categories = data.project.issue_categories;
            self.meta.trackers = data.project.trackers;
            data.project.issue_categories.forEach(function(category) {
                self.meta.category_id[category.id] = category.name;
            });
            data.project.trackers.forEach(function(tracker) {
                self.meta.tracker_id[tracker.id] = tracker.name;
            });
        });

        return q;
    }

    function getProjectVersions() {
        if (!self.projectId) {
            $log.error('IssueController::getProjectVersions: no project id');
            return $q.when(true);
        }

        var q = projectService.get({
            'project_id': self.projectId,
            'query': 'versions'
        }).$promise.then(function(data) {
            $log.debug('IssueController::getProjectVersions:', data);
            self.meta.versions = data.versions;
            data.versions.forEach(function(version) {
                self.meta.fixed_version_id[version.id] = version.name;
            });
        });

        return q;
    }

    function getProjectMemberhips() {
        if (!self.projectId) {
            $log.error('IssueController::getProjectMemberhips: no project id');
            return $q.when(true);
        }

        var q = projectService.get({
            'project_id': self.projectId,
            'query': 'memberships'
        }).$promise.then(function(data) {
            $log.debug('IssueController::getProjectMemberhips:', data);
            self.meta.memberships = [];
            for (var i = 0; i < data.memberships.length; i++) {
                if (data.memberships[i].user)
                    self.meta.memberships.push(data.memberships[i].user);
                else if (data.memberships[i].group)
                    $log.debug("TODO: support assignee group", data.memberships[i].group);
            }
        });

        return q;
    }

    function getIssueStatuses() {
        var q = issueService.queryStatuses().$promise.then(function(data) {
            $log.debug('IssueController::getIssueStatuses:', data);
            self.meta.statuses = data.issue_statuses;
            data.issue_statuses.forEach(function(status) {
                self.meta.status_id[status.id] = status.name;
            });
        });

        return q;
    }

    function getIssuePriorities() {
        var q = issueService.queryPriorities().$promise.then(function(data) {
            $log.debug('IssueController::getIssuePriorities:', data);
            self.meta.priorities = data.issue_priorities;
            data.issue_priorities.forEach(function(priority) {
                self.meta.priority_id[priority.id] = priority.name;
            });
        });

        return q;
    }

    function submitIssueForm(form) {
        $log.debug('IssueController::submitIssueForm: valid:', form.$valid);
        if (!form.$valid)
            return;
        self.loading = true;
        // prepare post fields
        var post_fields = {};
        for (var i = 0; i < self.issueFields.length; i++) {
            // TODO: take only dirty fields
            var key = self.issueFields[i].key;
            var value = self.issueFields[i].value;
            post_fields[key] = value;
        }
        $log.debug('IssueController::submitIssueForm: post_fields:', post_fields);

        if (self.issueId) {
            // update issue
            issueService.update({issue_id: self.issueId}, {'issue': post_fields})
                .$promise.then(function(response) {
                    $log.debug('IssueController::submitIssueForm: updated existing issue');
                    self.loading = false;
                    $mdToast.showSimple('Issue updated');
                    viewIssue();
            }).catch(function(e) {
                $log.error('IssueController::submitIssueForm: submit error:', e);
                if (e.status === 0 && e.statusText === '')
                    e.statusText = 'Error updating issue';
                $mdToast.showSimple(e.statusText);
                return $q.reject(e);
            });
        } else if (self.projectId) {
            // new Issue
            post_fields.project_id = self.projectId;
            issueService.save({'issue': post_fields})
                .$promise.then(function(response) {
                    $log.debug('IssueController::submitIssueForm: created new issue');
                    self.loading = false;
                    $mdToast.showSimple('Created issue');
                    self.issueId = response.issue.id;
                    viewIssue();
            }).catch(function(e) {
                $log.error('IssueController::submitIssueForm: submit error:', e);
                if (e.status === 0 && e.statusText === '')
                    e.statusText = 'Error creating issue';
                $mdToast.showSimple(e.statusText);
                return $q.reject(e);
            });
        } else {
            $log.error('IssueController::submitIssueForm: submit error: no issue id nor project id');
            $mdToast.showSimple('Submit error');
        }
    }

  }

})();
