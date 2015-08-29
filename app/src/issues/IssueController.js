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
          '$routeParams',
          '$log',
          '$location',
          '$localStorage',
          '$filter',
          '$q',
          'Page',
          'gravatar',
          IssueController
       ]);

  function IssueController( issueService, userService, projectService, IssueClassFactory, issueStatuses, $routeParams, $log, $location, $localStorage, $filter, $q, Page, gravatar ) {
    var self = this;

    self.issueId = $routeParams.issueId;
    self.issue = null;
    self.issueIcon = '';
    self.issueIconClass = '';
    self.issueItems = [];
    self.author = {};
    self.assignee = {};
    /* users participating in the ticket by id */
    self.users = {};
    self.getUserAvatar = getUserAvatar;
    /* meta names by meta id and key id */
    self.meta = {
        'fixed_version_id': {},
        'status_id': {}
    };

    Page.setTitle('Issue');
    Page.setExtLink(issueService.issuesUrl + '/' + self.issueId);

    self.loading = true;
    getIssue().then(function() {
        updateJournals();
        self.loading = false;
    });

    function getIssue() {
        if (!self.issueId) {
            console.error("missing issue id");
            return;
        }

        var q = issueService.query({
            'issue_id': self.issueId,
            'include': 'journals'
        }).$promise.then(function(data) {
            console.log(data);
            self.issue = data.issue;
            setIssueItems();
            self.issueIcon = IssueClassFactory.getIcon(self.issue);
            self.issueIconClass = IssueClassFactory.getTrackerClass(self.issue);
            return $q.all([
                getAuthor(),
                getAssignee(),
                getProjectVersions(),
                getIssueStatuses()
            ]);
        });

        return q;
    }

    function updateJournals() {

        var id_to_name = {
            'fixed_version_id': 'Target version',
            'status_id': 'Status',
            'assigned_to_id': 'Assignee'
        };

        self.issue.journals.forEach(function(journal) {
            journal.details.forEach(function(detail) {
                var name = id_to_name[detail.name] || detail.name;
                var old_value, new_value;

                if (self.meta[detail.name]) {
                    old_value = self.meta[detail.name][detail.old_value] || '[' + detail.old_value + ']';
                    new_value = self.meta[detail.name][detail.new_value] || '[' + detail.new_value + ']';
                } else {
                    old_value = '[' + detail.old_value + ']';
                    new_value = '[' + detail.new_value + ']';
                }

                if (name == 'description')
                    detail.text = "Description updated";
                else if (!detail.old_value)
                    detail.text = name + " set to " + new_value;
                else if (!detail.new_value)
                    detail.text = name + " deleted (" + old_value + ")";
                else
                    detail.text = name + " changed from " + old_value + " to " + new_value;
            });
        });
    }

    function setIssueItems() {
        function getItemName(item) {
            return self.issue[item] ? self.issue[item]['name'] : '-';
        }
        // project status assignee
        var items = {
            'Project': {
                'name': self.issue.project.name
                /**
                 * TODO link to project issues
                 * /projects/:id
                 */
            },
            'Status': {
                'name': self.issue.status.name
            },
            'Priority': {
                'name': self.issue.priority.name
            },
            'Assignee': {
                'name': self.issue.assigned_to.name,
                'avatar': ''
            },
            'Target Version': {
                'name': getItemName('fixed_version')
            },
            'Category': {
                'name': getItemName('category')
            },
            'Created': {
                'name': $filter('date')(self.issue.created_on, 'medium')
            },
            'Updated': {
                'name': $filter('date')(self.issue.updated_on, 'medium')
            }
        };

        self.issueItems = items;
    }

    function getAuthor() {
        var author_id = self.issue.author.id;

        var q = userService.query({
            'user_id': author_id
        }).$promise.then(function(data) {
            console.log(data);
            self.author = data.user;
            self.author.avatar = gravatar.get(self.author.mail);
            self.users[self.author.id] = self.author;
        });

        return q;
    }

    function getAssignee() {
        var assigned_to_id = self.issue.assigned_to.id;

        var q = userService.query({
            'user_id': assigned_to_id
        }).$promise.then(function(data) {
            console.log(data);
            self.assignee = data.user;
            self.assignee.avatar = gravatar.get(self.assignee.mail);
            self.issueItems['Assignee']['avatar'] = self.assignee.avatar;
            self.users[self.assignee.id] = self.assignee;
        });

        return q;
    }

    function getUserAvatar(user) {
        return (self.users[user.id] && self.users[user.id].avatar) || '';
    }

    function getProjectVersions() {
        var projectId = self.issue.project.id;

        if (!projectId) {
            console.error("no project id");
            return $q.when(true);
        }

        var q = projectService.query({
            'project_id': projectId,
            'query': 'versions'
        }).$promise.then(function(data) {
            console.log(data);
            data.versions.forEach(function(version) {
                self.meta['fixed_version_id'][version.id] = version.name;
            });
        });

        return q;
    }

    function getIssueStatuses() {
        var q = issueStatuses.query().$promise.then(function(data) {
            console.log(data);
            data.issue_statuses.forEach(function(status) {
                self.meta['status_id'][status.id] = status.name;
            });
        });

        return q;
    }

  }

})();
