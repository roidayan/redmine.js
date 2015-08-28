/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular.module('rmUsers')
         .service('userService', [
             '$resource',
             'settingsService',
             userService]);

  function userService( $resource, settingsService ) {
      var apiRemoteUrl = settingsService.getRemoteUrl();
      var apiKey = settingsService.getApiKey();
      var _url = apiRemoteUrl + '/users/:user_id.json';
      var _params = {};
      var _actions = {
          query: {
              method: 'GET',
              isArray: false,
              headers: {
                  'X-Redmine-API-Key': apiKey,
              }
          }
      };
      var _resource = $resource(_url, _params, _actions);

      return _resource;
  }

})();
