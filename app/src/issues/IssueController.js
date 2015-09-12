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
          'issueStatuses',
          'issuePriorities',
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

  function IssueController( issueService, userService, projectService, IssueClassFactory, issueStatuses, issuePriorities,
      $routeParams, $log, $location, $localStorage, $filter, $q, $mdToast, Page, gravatar ) {
    var self = this;

    self.issueId = $routeParams.issueId;
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
        'priority_id': {}
    };

    /* methods */
    self.getUserAvatar = getUserAvatar;
    self.editIssue = editIssue;
    self.updateIssue = updateIssue;
    self.cancelEdit = viewIssue;
    self.isEmptyObject = function(ob) {
        return ob ? Object.keys(ob).length === 0 : true;
    };

    /**
     * init
     */

    Page.setTitle('Issue');
    Page.setExtLink(issueService.issuesUrl + '/' + self.issueId);

    self.loading = true;
    getIssue().then(function() {
        updateJournals();
        self.loading = false;
    }).catch(function(e) {
        self.loading = false;
        // self.errorLoading = true;
        // self.errorMessage = e.statusText || 'error occured';
        $log.debug('getIssue error');
        $log.debug(e);
    });

    /**
     * internal
     */

    function goProject(project) {
        $location.path('/projects/' + project.id);
    }

    function editIssue() {
        $location.path('/issues/' + self.issueId + '/edit');
        //self.action = 'edit';
    }

    function viewIssue() {
        $location.path('/issues/' + self.issueId);
        //self.action = 'view';
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
            setIssueItems();
            setIssueFields();
            self.issueIcon = IssueClassFactory.getIcon(self.issue);
            self.issueIconClass = IssueClassFactory.getTrackerClass(self.issue);
            return $q.all([
                getAuthor(),
                getAssignee(),
                getProject(),
                getProjectVersions(),
                getProjectMemberhips(),
                // doesn't really require issue details first.
                getIssueStatuses(),
                getIssuePriorities()
            ]);
        });

        return q;
    }

    function updateJournals() {

        var id_to_name = {
            'fixed_version_id': 'Target version',
            'status_id':        'Status',
            'assigned_to_id':   'Assignee',
            'priority_id':      'Priority',
            'category_id':      'Category',
            'subject':          'Subject',
            'done_ratio':       '% Done'
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
                    var id = detail.old_value || detail.new_value;
                    getUser(id).then(function(user) {
                        if (detail.old_value)
                            old_value = user.firstname + ' ' + user.lastname;
                        else
                            new_value = user.firstname + ' ' + user.lastname;
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
                label: 'Status',
                key: 'status_id',
                value: getFieldId('status'),
                required: true,
                choices: function() { return self.meta['status_id'] || {}; }
            },
            {
                label: 'Priority',
                key: 'priority_id',
                value: getFieldId('priority'),
                required: true,
                choices: function() { return self.meta['priority_id'] || {}; }
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
                choices: function() { return self.meta['memberships'] || {}; }
            },
            {
                label: 'Target Version',
                key: 'fixed_version_id',
                value: getFieldId('fixed_version'),
                choices: function() { return self.meta['fixed_version_id'] || {}; }
            },
            {
                label: 'Category',
                key: 'category_id',
                value: getFieldId('category'),
                choices: function() { return self.meta['categories'] || {}; }
            }
        ];
    }

    function setIssueItems() {
        var items = {
            'Project': {
                'name': self.issue.project.name,
                'click': function() { goProject(self.issue.project); }
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
        });

        return q;
    }

    function getUserAvatar(user) {
        return (self.users[user.id] && self.users[user.id].avatar) || '';
    }

    function getProject() {
        var projectId = self.issue.project.id;

        if (!projectId) {
            $log.error("no project id");
            return $q.when(true);
        }

        var q = projectService.get({
            'project_id': projectId,
        }).$promise.then(function(data) {
            $log.debug(data);
            self.meta['categories'] = {};
            self.meta['trackers'] = {};
            data.project.issue_categories.forEach(function(cat) {
                self.meta['categories'][cat.id] = cat.name;
            });
            data.project.trackers.forEach(function(tracker) {
                self.meta['trackers'][tracker.id] = tracker.name;
            });
        });

        return q;
    }

    function getProjectVersions() {
        var projectId = self.issue.project.id;

        if (!projectId) {
            $log.error("no project id");
            return $q.when(true);
        }

        var q = projectService.get({
            'project_id': projectId,
            'query': 'versions'
        }).$promise.then(function(data) {
            $log.debug(data);
            data.versions.forEach(function(version) {
                self.meta['fixed_version_id'][version.id] = version.name;
            });
        });

        return q;
    }

    function getProjectMemberhips() {
        var projectId = self.issue.project.id;

        if (!projectId) {
            $log.error("no project id");
            return $q.when(true);
        }

        var q = projectService.get({
            'project_id': projectId,
            'query': 'memberships'
        }).$promise.then(function(data) {
            $log.debug(data);
            self.meta['memberships'] = {};
            data.memberships.forEach(function(membership) {
                self.meta['memberships'][membership.user.id] = membership.user.name;
            });
        });

        return q;
    }

    function getIssueStatuses() {
        var q = issueStatuses.get().$promise.then(function(data) {
            $log.debug(data);
            data.issue_statuses.forEach(function(status) {
                self.meta['status_id'][status.id] = status.name;
            });
        });

        return q;
    }

    function getIssuePriorities() {
        var q = issuePriorities.get().$promise.then(function(data) {
            $log.debug(data);
            data.issue_priorities.forEach(function(priority) {
                self.meta['priority_id'][priority.id] = priority.name;
            });
        });

        return q;
    }

    function updateIssue(form) {
        $log.debug('form');
        $log.debug(form);
        if (!form.$valid)
            return;
        if (!self.issueId) {
            $log.error("no issue id");
            return;
        }
        // TODO: if not dirty there is no need to send anything
        // will need a cancel button?
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

        // update issue
        issueService.update({issue_id: self.issueId}, {'issue': post_fields})
            .$promise.then(function(e) {
                $log.debug('updated');
                self.loading = false;
                $mdToast.showSimple('Updated');
                viewIssue();
                //self.action = 'view';
        });
        // TODO refresh local issue
    }

  }

})();
