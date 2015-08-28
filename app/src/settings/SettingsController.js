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
    var cache = {};

    self.settings = settingsService.read();
    self.save = save;

    Page.setTitle('Settings');

    function save(form) {
        if (!form.$valid)
            return;
        settingsService.save(self.settings);
        $mdToast.showSimple('Settings saved');
    }

  }

})();
