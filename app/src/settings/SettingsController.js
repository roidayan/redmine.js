/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('rmSettings')
       .controller('SettingsController', [
          '$mdToast',
          'settingsService',
          'Page',
          SettingsController
       ]);

  function SettingsController( $mdToast, settingsService, Page ) {
    var self = this;

    self.settings = settingsService.read() || {};
    self.save = save;
    self.predefinedServers = {
        'hostedredmine.com': 'http://hostedredmine.com/'
    };
    self.selectedServer = self.predefinedServers[self.settings.server] || 'custom';

    Page.setTitle('Settings');

    function save(form) {
        if (self.selectedServer != 'custom')
            self.settings.server = self.selectedServer;
        if (!form.$valid) {
            console.log("form is not valid");
            return;
        }
        settingsService.save(self.settings);
        $mdToast.showSimple('Settings saved');
    }

  }

})();
