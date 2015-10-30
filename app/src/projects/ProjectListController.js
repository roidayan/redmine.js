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

    function setup() {
        self.errorLoading = false;
        self.errorMessage = '';
        self.memberships = memberships.getLocal();
        memberships.getMemberships().catch(function(err) {
            $log.error(err);
            self.errorLoading = true;
            self.errorMessage = err;
        });
    }

  }

})();
