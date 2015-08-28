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
    var cache = {};

    self.projectId = $routeParams.projectId;
    self.project = null;
    self.issues = null;
    self.getIcon = IssueClassFactory.getIcon;
    self.getIconClass = IssueClassFactory.getIconClass;
    self.getPriorityClass = IssueClassFactory.getPriorityClass;
    self.showIssue = showIssue;

    Page.setTitle('Project');

    self.loading = true;
    $q.all([
        getProject(),
        getProjectIssues()
    ]).then(function() {
        self.loading = false;
    });

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
        }).catch(function(e){
            if (e.status === 0 && e.data === null) {
                // Request has been canceled
            } else {
                // Server error
            }
            console.error('error getting project issues');
            console.log(e);
        });

        return q;
    }

    function showIssue(issue) {
        $location.path('/issues/' + issue.id);
    }

  }

})();
