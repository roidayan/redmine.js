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
          'IssueClassFactory',
          '$routeParams',
          '$log',
          '$location',
          '$localStorage',
          '$filter',
          '$q',
          '$mdToast',
          'Page',
          'gravatar',
          IssueController
       ]);

  function IssueController( issueService, userService, projectService, IssueClassFactory,
      $routeParams, $log, $location, $localStorage, $filter, $q, $mdToast, Page, gravatar ) {
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

    if (self.issueId)
        Page.setExtLink(issueService.getUrl(self.issueId));

    $log.debug('IssueController action: ' + self.action);
    setup();

    /**
     * internal
     */

    function goProject() {
        if (self.projectId)
            $location.path('/projects/' + self.projectId);
    }

    function editIssue() {
        $location.path('/issues/' + self.issueId + '/edit');
        //self.action = 'edit';
    }

    function viewIssue(issue_id) {
        if (issue_id) {
            $location.path('/issues/' + issue_id);
        } else if (self.issueId) {
            $location.path('/issues/' + self.issueId);
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
            $log.debug('IssueController error');
            $log.debug(e);
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
            $log.error("missing issue id");
            return;
        }

        var q = issueService.get({
            'issue_id': self.issueId
        }).$promise.then(function(data) {
            $log.debug(data);
            self.issue = data.issue;
            Page.setTitle(self.issue.tracker.name + ' #' + self.issue.id);
            self.projectId = self.issue.project.id;
            setIssueItems();
            setIssueFields();
            updateRelations();
            updateJournals();
            self.issueIcon = IssueClassFactory.getIcon(self.issue);
            self.issueIconClass = IssueClassFactory.getTrackerClass(self.issue);
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

    function updateRelations() {
        $log.debug('update relations');

        if (!self.issue.relations)
            return;

        var type_to_text = {
            'relates': 'Related to'
        };

        self.issue.relations.forEach(function(relation) {
            switch (relation.relation_type) {
                case 'blocks':
                    var rel;
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
        });
    }

    function updateJournals() {
        $log.debug('update journals');

        if (!self.issue.journals)
            return;

        var id_to_name = {
            'fixed_version_id': 'Target version',
            'status_id':        'Status',
            'assigned_to_id':   'Assignee',
            'priority_id':      'Priority',
            'category_id':      'Category',
            'subject':          'Subject',
            'done_ratio':       '% Done',
            'tracker_id':       'Tracker'
        };

        self.issue.journals.forEach(function(journal) {
            journal.details.forEach(function(detail) {
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
            });
        });
    }

    function getFieldValue(item) {
        if (!self.issue || !item)
            return '';
        return self.issue[item] ? self.issue[item]['name'] : '';
    }

    function getFieldId(item) {
        if (!self.issue || !item)
            return '';
        return self.issue[item] ? self.issue[item]['id'] : '';
    }

    function setIssueFields() {
        // TODO: icons for fields
        // icon for assignee
        // icon for tracker
        self.issueFields = [
            {
                label: 'Tracker',
                key: 'tracker_id',
                value: getFieldId('tracker'),
                required: true,
                type: 'select',
                choices: function() { return self.meta['trackers'] || {}; }
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
                value: getFieldId('status'),
                required: true,
                type: 'select',
                choices: function() { return self.meta['statuses'] || {}; }
            },
            {
                label: 'Priority',
                key: 'priority_id',
                value: getFieldId('priority'),
                required: true,
                type: 'select',
                choices: function() { return self.meta['priorities'] || {}; }
            },
            {
                label: 'Assignee',
                key: 'assigned_to_id',
                value: getFieldId('assigned_to'),
                required: true,
                avatar: function() {
                    var _id = getFieldId('assigned_to');
                    return self.users[_id] ? self.users[_id].avatar : '';
                },
                type: 'select',
                choices: function() { return self.meta['memberships'] || {}; }
            },
            {
                label: 'Target Version',
                key: 'fixed_version_id',
                value: getFieldId('fixed_version'),
                type: 'select',
                choices: function() { return self.meta['versions'] || {}; },
                show: function() { return !self.isEmptyObject(this.choices()); }
            },
            {
                label: 'Category',
                key: 'category_id',
                value: getFieldId('category'),
                type: 'select',
                choices: function() { return self.meta['categories'] || {}; },
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
                'name': self.issue.project.name,
                'click': function() { goProject(); }
            },
            'Status': {
                'name': getFieldValue('status')
            },
            'Priority': {
                'name': getFieldValue('priority')
            },
            'Assignee': {
                'name': getFieldValue('assigned_to'),
                'avatar': ''
            },
            'Target Version': {
                'name': getFieldValue('fixed_version')
            },
            'Category': {
                'name': getFieldValue('category')
            },
            'Created': {
                'name': $filter('date')(self.issue.created_on, 'medium')
            },
            'Updated': {
                'name': $filter('date')(self.issue.updated_on, 'medium')
            },
            '% Done': {
                'name': self.issue.done_ratio
            }
        };

        self.issueItems = items;
    }

    function getAuthor() {
        var author_id = self.issue.author.id;

        var q = userService.get({
            'user_id': author_id
        }).$promise.then(function(data) {
            $log.debug(data);
            self.author = data.user;
            self.author.avatar = gravatar.get(self.author.mail);
            self.users[self.author.id] = self.author;
        }).catch(function(e) {
            $log.error("failed to get author " + author_id);
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
            $log.debug(data);
            self.assignee = data.user;
            self.assignee.avatar = gravatar.get(self.assignee.mail);
            self.issueItems['Assignee']['avatar'] = self.assignee.avatar;
            self.users[self.assignee.id] = self.assignee;
        }).catch(function(e) {
            $log.error("failed to get assignee " + assigned_to_id);
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
            $log.debug(data);
            var _user = data.user;
            _user.avatar = gravatar.get(_user.mail);
            self.users[_user.id] = _user;
            return _user;
        }).catch(function(e) {
            $log.error("failed to get user " + user_id);
            $q.reject();
        });

        return q;
    }

    function getUserAvatar(user) {
        return (self.users[user.id] && self.users[user.id].avatar) || '';
    }

    function getProject() {
        if (!self.projectId) {
            $log.error("no project id");
            return $q.when(true);
        }

        var q = projectService.get({
            'project_id': self.projectId,
        }).$promise.then(function(data) {
            $log.debug(data);
            self.meta['categories'] = data.project.issue_categories;
            self.meta['trackers'] = data.project.trackers;
            data.project.issue_categories.forEach(function(category) {
                self.meta['category_id'][category.id] = category.name;
            });
            data.project.trackers.forEach(function(tracker) {
                self.meta['tracker_id'][tracker.id] = tracker.name;
            });
        });

        return q;
    }

    function getProjectVersions() {
        if (!self.projectId) {
            $log.error("no project id");
            return $q.when(true);
        }

        var q = projectService.get({
            'project_id': self.projectId,
            'query': 'versions'
        }).$promise.then(function(data) {
            $log.debug(data);
            self.meta['versions'] = data.versions;
            data.versions.forEach(function(version) {
                self.meta['fixed_version_id'][version.id] = version.name;
            });
        });

        return q;
    }

    function getProjectMemberhips() {
        if (!self.projectId) {
            $log.error("no project id");
            return $q.when(true);
        }

        var q = projectService.get({
            'project_id': self.projectId,
            'query': 'memberships'
        }).$promise.then(function(data) {
            $log.debug(data);
            self.meta['memberships'] = [];
            for (var i = 0; i < data.memberships.length; i++) {
                self.meta['memberships'].push(data.memberships[i].user);
            }
        });

        return q;
    }

    function getIssueStatuses() {
        var q = issueService.queryStatuses().$promise.then(function(data) {
            $log.debug(data);
            self.meta['statuses'] = data.issue_statuses;
            data.issue_statuses.forEach(function(status) {
                self.meta['status_id'][status.id] = status.name;
            });
        });

        return q;
    }

    function getIssuePriorities() {
        var q = issueService.queryPriorities().$promise.then(function(data) {
            $log.debug(data);
            self.meta['priorities'] = data.issue_priorities;
            data.issue_priorities.forEach(function(priority) {
                self.meta['priority_id'][priority.id] = priority.name;
            });
        });

        return q;
    }

    function submitIssueForm(form) {
        $log.debug('form');
        $log.debug(form);

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
        $log.debug('post fields');
        $log.debug(post_fields);

        if (self.issueId) {
            // update issue
            issueService.update({issue_id: self.issueId}, {'issue': post_fields})
                .$promise.then(function(response) {
                    $log.debug('updated existing issue');
                    self.loading = false;
                    $mdToast.showSimple('Issue updated');
                    viewIssue();
            }).catch(function(e) {
                if (e.status === 0 && e.statusText === '')
                    e.statusText = 'Error updating issue';
                $mdToast.showSimple(e.statusText);
                return $q.reject(e);
            });
        } else if (self.projectId) {
            // new Issue
            post_fields['project_id'] = self.projectId;
            issueService.save({'issue': post_fields})
                .$promise.then(function(response) {
                    $log.debug('created new issue');
                    self.loading = false;
                    $mdToast.showSimple('Created issue');
                    self.issueId = response.issue.id;
                    viewIssue();
            }).catch(function(e) {
                if (e.status === 0 && e.statusText === '')
                    e.statusText = 'Error creating issue';
                $mdToast.showSimple(e.statusText);
                return $q.reject(e);
            });
        } else {
            $log.error('submit error: no issue id nor project id');
            $mdToast.showSimple('Submit error');
        }
    }

  }

})();
