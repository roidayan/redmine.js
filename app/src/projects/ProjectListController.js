/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('rmProjects')
       .controller('ProjectListController', [
          'favProject',
          '$log',
          '$location',
          '$filter',
          'Page',
          ProjectListController
       ]);

  function ProjectListController( favProject, $log, $location, $filter, Page ) {
    var self = this;

    self.projects = [];
    self.goProject = goProject;
    self.loading = 100;
    self.total_count = 0;
    self.addFavProject = addFavProject;

    Page.setTitle('Projects');
    getFavorites();

    function goProject(project) {
        $location.path('/projects/' + project.id);
    }

    function addFavProject() {
        $location.path('/addFavProject');
    }

    function getFavorites() {
        var _p = favProject.getFavorites();
        self.projects = $filter('orderBy')(_p, 'name');
    }

  }

})();
