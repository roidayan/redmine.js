/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('rmProjects')
       .controller('ProjectListController', [
          'memberships',
          '$log',
          '$location',
          'Page',
          ProjectListController
       ]);

  function ProjectListController( memberships, $log, $location, Page ) {
    var self = this;

    self.projects = [];
    self.goProject = goProject;
    self.loading = 100;
    self.total_count = 0;

    Page.setTitle('Projects');

    function goProject(project) {
        $location.path('/projects/' + project.id);
    }

    self.memberships = memberships.get();

  }

})();
