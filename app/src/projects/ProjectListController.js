/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('rmProjects')
       .controller('ProjectListController', [
          'projectService',
          '$log',
          '$location',
          '$localStorage',
          '$filter',
          'Page',
          ProjectListController
       ]);

  function ProjectListController( projectService, $log, $location, $localStorage, $filter, Page ) {
    var self = this;

    self.projects = [];
    self.goProject = goProject;
    self.loading = 100;
    self.total_count = 0;
    self.addFavProject = addFavProject;

    Page.setTitle('Projects');
    loadLocal();

    function goProject(project) {
        $location.path('/projects/' + project.id);
    }

    function addFavProject() {
        $location.path('/addFavProject');
    }

    function loadLocal() {
        var _projects = $localStorage.projects;
        if (_projects) {
            self.projects = $filter('orderBy')(_projects.items, 'name');
        }
    }

    function saveLocal() {
        $localStorage.projects = {
            items: self.projects
        };
    }

  }

})();
