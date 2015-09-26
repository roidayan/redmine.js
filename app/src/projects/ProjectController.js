/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('rmProjects')
       .controller('ProjectController', [
          'projectService',
          'issueService',
          'userService',
          '$localStorage',
          '$cacheFactory',
          '$log',
          '$routeParams',
          '$q',
          'Page',
          ProjectController
       ]);

  function ProjectController( projectService, issueService, userService,
                              $localStorage, $cacheFactory, $log,
                              $routeParams, $q, Page ) {
    var self = this;

    self.projectId = $routeParams.projectId;
    self.project = null;
    self.issues = [];
    self.users = [];
    self.total_count = 0;
    self.setup = setup;
    self.addIssue = addIssue;

    /**
     * init
     */

    Page.setTitle('Project');

    var cache = $cacheFactory.get('projectCtrlCache') || $cacheFactory('projectCtrlCache');
    self.selectedStatuses = cache.get('statusFilter') || [];

    setup();

    /**
     * internal
     */

    function addIssue() {
        Page.changeView('/projects/' + self.projectId + '/issues/new');
    }

    function setup() {
        self.loading = true;
        self.errorLoading = false;
        self.errorMessage = '';
        $q.all([
            getProject(),
            getProjectIssues(),
            getIssueStatuses()
        ]).then(function() {
            self.loading = false;
            Page.setTitle(self.project.name);
        }).catch(function(e) {
            self.loading = false;
            self.errorLoading = true;
            self.errorMessage = e.statusText || 'error occured';
            $log.debug('ProjectController error');
            $log.debug(e);
        });
    }

    function getProject() {
        if (!self.projectId){
            $log.debug("no project id");
            return $q.when(true);
        }

        var q = projectService.get({
            'project_id': self.projectId
        }).$promise.then(function(data) {
            $log.debug(data);
            self.project = data.project;
        })
        .catch(function(e) {
            if (e.status === 0 && e.statusText === '')
                e.statusText = 'error getting project info';
            return $q.reject(e);
        });

        return q;
    }

    function getProjectIssues() {
        if (!self.projectId){
            $log.debug("no project id");
            return $q.when(true);
        }

        var params = {
            'project_id': self.projectId,
            'status_id': 'open'
        };

        if (self.selectedStatuses && self.selectedStatuses.length > 0) {
            var ids = self.selectedStatuses.map(
                function(item) {
                    return item.id;
                }
            );
            params['status_id'] = ids.join('|');
        }

        // params = issueService.addParams(params, {});

        var q = issueService.get(params).$promise.then(function(data) {
            $log.debug(data);
            self.issues = data.issues;
            self.total_count = data.total_count;
            self.issues.forEach(function(issue) {
                getUser(issue.author.id).then(function(user) {
                    issue['author']['mail'] = user.mail;
                });
            });
        }).catch(function(e) {
            if (e.status === 0 && e.statusText === '')
                e.statusText = 'error getting project issues';
            return $q.reject(e);
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
            // $log.debug(data);
            var user = data.user;
            self.users[user.id] = user;
            return user;
        }).catch(function(e) {
            $log.error("failed to get user " + user_id);
            $q.reject();
        });

        return q;
    }

    function getIssueStatuses() {
        var q = issueService.queryStatuses().$promise.then(function(data) {
            $log.debug(data);
            self.statuses = data.issue_statuses;
        });

        return q;
    }

    self.statusFilter = function(newItems, oldItems) {
        if (oldItems === newItems)
            return;
        self.filter_by_status = newItems;
        cache.put('statusFilter', newItems);
        self.loading = true;
        getProjectIssues().finally(function() {
            self.loading = false;
        });
    };

  }

})();
