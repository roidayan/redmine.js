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
          'settingsService',
          'Page',
          ProjectListController
       ]);

  function ProjectListController( memberships, $log, $location, settingsService, Page ) {
    var self = this;

    self.projects = [];
    self.goProject = goProject;
    self.loading = 100;
    self.total_count = 0;

    Page.setTitle('Projects');

    if (settingsService.isConfigured())
        setup();
    else
        $location.path('/settings');

    function goProject(project) {
        $location.path('/projects/' + project.id);
    }

    function setup() {
        self.memberships = memberships.get();
    }

  }

})();
