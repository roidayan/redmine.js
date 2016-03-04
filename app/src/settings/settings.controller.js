/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('appSettings')
       .controller('SettingsController', [
          '$mdToast',
          '$window',
          'settingsService',
          'Page',
          SettingsController
       ]);

  function SettingsController( $mdToast, $window, settingsService, Page ) {
    var self = this;

    self.settings = settingsService.read() || {};
    self.save = save;
    self.openUrl = openUrl;
    self.predefinedServers = {
        'hostedredmine.com': 'https://hostedredmine.com'
    };
    self.selectedServer = self.predefinedServers[self.settings.server] || 'custom';

    Page.setTitle('Settings');

    function save(form) {
        if (self.selectedServer != 'custom')
            self.settings.server = self.selectedServer;
        if (!form.$valid) {
            $log.debug("SettingsController::save error: form is not valid");
            return;
        }
        settingsService.save(self.settings);
        $mdToast.showSimple('Settings saved');
        /* requires reload */
        // .then(function(){
        //     $window.location.reload();
        // });
    }

    function openUrl(url) {
        $window.open(url, '_system');
    }

  }

})();
