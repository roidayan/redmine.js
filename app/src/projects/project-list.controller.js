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
          'projectService',
          '$log',
          '$timeout',
          'settingsService',
          'Page',
          ProjectListController
       ]);

  function ProjectListController( memberships, projectService, $log, $timeout, settingsService, Page ) {
    var self = this;

    self.memberships = [];
    self.setup = setup;
    self.goProject = goProject;

    Page.setTitle('Projects');

    if (settingsService.isConfigured())
        setup();
    else
        Page.changeView('/settings');

    function goProject(project) {
        Page.changeView('/projects/' + project.id);
    }

    self.filterActive = function(membership) {
        if (!membership.project.status)
            return true;
        return membership.project.status === projectService.project_status.active;
    };

    function setup() {
        self.errorLoading = false;
        self.errorMessage = '';
        self.memberships = memberships.getLocal();
        memberships.getMemberships().catch(function(err) {
            $log.error('ProjectListController::setup: error:', err);
            self.errorLoading = true;
            self.errorMessage = err;
        });
    }

  }

})();
