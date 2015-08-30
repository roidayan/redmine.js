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
          'IssueClassFactory',
          '$log',
          '$location',
          '$routeParams',
          '$q',
          'Page',
          ProjectController
       ]);

  function ProjectController( projectService, issueService, IssueClassFactory, $log, $location, $routeParams, $q, Page ) {
    var self = this;

    self.projectId = $routeParams.projectId;
    self.project = null;
    self.issues = null;
    self.total_count = 0;
    self.getIcon = IssueClassFactory.getIcon;
    self.getTrackerClass = IssueClassFactory.getTrackerClass;
    self.getPriorityClass = IssueClassFactory.getPriorityClass;
    self.showIssue = showIssue;
    self.setup = setup;

    Page.setTitle('Project');
    setup();

    function setup() {
        self.loading = true;
        self.errorLoading = false;
        $q.all([
            getProject(),
            getProjectIssues()
        ]).then(function() {
            self.loading = false;
        }).catch(function(e) {
            console.error('error');
            self.loading = false;
            self.errorLoading = true;
        });
    }

    function getProject() {
        if (!self.projectId){
            console.error("no project id");
            return $q.when(true);
        }

        var q = projectService.query({
            'project_id': self.projectId
        }).$promise.then(function(data) {
            console.log(data);
            self.project = data.project;
        })
        .catch(function(e) {
            console.error('error getting project');
            console.debug(e);
            return $q.reject(e);
        });

        return q;
    }

    function getProjectIssues() {
        if (!self.projectId){
            console.error("no project id");
            return $q.when(true);
        }

        var q = issueService.query({
            'project_id': self.projectId
        }).$promise.then(function(data) {
            console.log(data);
            self.issues = data.issues;
            self.total_count = data.total_count;
        }).catch(function(e) {
            console.error('error getting project issues');
            console.debug(e);
            if (e.status === 0 && e.data === null) {
                // Request has been canceled
            } else {
                // Server error
            }
            return $q.reject(e);
        });

        return q;
    }

    function showIssue(issue) {
        $location.path('/issues/' + issue.id);
    }

  }

})();
