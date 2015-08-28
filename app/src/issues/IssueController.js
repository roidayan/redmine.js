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
          'IssueClassFactory',
          '$routeParams',
          '$log',
          '$location',
          '$localStorage',
          '$filter',
          '$q',
          'Page',
          IssueController
       ]);

  function IssueController( issueService, userService, IssueClassFactory, $routeParams, $log, $location, $localStorage, $filter, $q, Page ) {
    var self = this;
    var cache = {};

    self.issueId = $routeParams.issueId;
    self.issue = null;
    self.issueIcon = '';
    self.issueIconClass = '';
    self.issueItems = [];
    self.author = {};
    self.assignee = {};

    Page.setTitle('Issue');

    self.loading = true;
    $q.when( getIssue() ).then(function() {
        self.loading = false;
    });

    function getIssue() {
        if (!self.issueId) {
            console.error("missing issue id");
            return;
        }

        var q = issueService.query({
            'issue_id': self.issueId
        }).$promise.then(function(data) {
            console.log(data);
            self.issue = data.issue;
            setIssueItems();
            self.issueIcon = IssueClassFactory.getIcon(self.issue);
            self.issueIconClass = IssueClassFactory.getTrackerClass(self.issue);
            return getAuthor() && getAssignee();
        });

        return q;
    }

    function setIssueItems() {
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
                'avatar': null
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
            var avatar = getAvatar(self.assignee);
            self.issueItems['Assignee']['avatar'] = avatar;
        });

        return q;
    }

    function getAvatar(user) {
        if (!user || !user.mail)
            return '';

        if (!cache[user.mail])
            cache[user.mail] = "http://www.gravatar.com/avatar/"+md5(user.mail)+"?s=24&d=identicon";

        return cache[user.mail];
    }

  }

})();
