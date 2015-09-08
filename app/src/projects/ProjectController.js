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
          'favProject',
          '$localStorage',
          '$log',
          '$location',
          '$routeParams',
          '$q',
          'Page',
          ProjectController
       ]);

  function ProjectController( projectService, issueService, IssueClassFactory, favProject, $localStorage, $log, $location, $routeParams, $q, Page ) {
    var self = this;

    self.projectId = $routeParams.projectId;
    self.project = null;
    self.issues = [];
    self.total_count = 0;
    self.getIcon = IssueClassFactory.getIcon;
    self.getTrackerClass = IssueClassFactory.getTrackerClass;
    self.getPriorityClass = IssueClassFactory.getPriorityClass;
    self.showIssue = showIssue;
    self.setup = setup;

    Page.setTitle('Project');
    Page.isFavorite = isFav;
    Page.toggleFavorite = toggleFav;

    setup();

    function toggleFav() {
        self.project && favProject.toggleFavorite(self.project);
    }

    function isFav() {
        return favProject.isFavorite(self.projectId);
    }

    function setup() {
        self.loading = true;
        self.errorLoading = false;
        self.errorMessage = '';
        $q.all([
            getProject(),
            getProjectIssues()
        ]).then(function() {
            self.loading = false;
        }).catch(function(e) {
            self.loading = false;
            self.errorLoading = true;
            self.errorMessage = e.statusText || 'error occured';
            $log.debug('error');
            $log.debug(e);
        });
    }

    function getProject() {
        if (!self.projectId){
            $log.debug("no project id");
            return $q.when(true);
        }

        var q = projectService.query({
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

        var q = issueService.query({
            'project_id': self.projectId
        }).$promise.then(function(data) {
            $log.debug(data);
            self.issues = data.issues;
            self.total_count = data.total_count;
        }).catch(function(e) {
            if (e.status === 0 && e.statusText === '')
                e.statusText = 'error getting project issues';
            return $q.reject(e);
        });

        return q;
    }

    function showIssue(issue) {
        $location.path('/issues/' + issue.id);
    }

  }

})();
