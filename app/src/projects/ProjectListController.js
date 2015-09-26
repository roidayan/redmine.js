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
          '$timeout',
          'settingsService',
          'Page',
          ProjectListController
       ]);

  function ProjectListController( memberships, $log, $timeout, settingsService, Page ) {
    var self = this;

    self.projects = [];
    self.goProject = goProject;
    self.loading = 100;
    self.total_count = 0;

    Page.setTitle('Projects');

    if (settingsService.isConfigured())
        setup();
    else
        Page.changeView('/settings');

    function goProject(project) {
        Page.changeView('/projects/' + project.id);
    }

    function setup() {
        self.memberships = memberships.get();
    }

  }

})();
