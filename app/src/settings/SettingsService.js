/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular.module('rmSettings')
         .service('settingsService', [
             '$localStorage',
             SettingsService]);

  function SettingsService( $localStorage ) {
      return {
          read: function() {
              return $localStorage.settings;
          },
          save: function(data) {
              $localStorage.settings = data;
          },
          getRemoteUrl: function() {
              var _settings = this.read() || {};
              return _settings.server;
          },
          getApiKey: function() {
              var _settings = this.read() || {};
              return _settings.apiKey;
          },
          isConfigured: function() {
              return this.getApiKey() && this.getRemoteUrl();
          }
      };
  }

})();
