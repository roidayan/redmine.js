/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
        .module('rmProjects')
        .service('projectService', [
            '$resource',
            'settingsService',
            ProjectService]);

  function ProjectService( $resource, settingsService ) {
      var apiRemoteUrl = settingsService.getRemoteUrl();
      var apiKey = settingsService.getApiKey();
      var _url = apiRemoteUrl + '/projects/:project_id/:query.json';
      var _params = {};
      var _actions = {
          query: {
              method: 'GET',
              isArray: false,
              cache: true,
              timeout: 10000,
              headers: {
                  'X-Redmine-API-Key': apiKey,
              }
          }
      };
      var _resource = $resource(_url, _params, _actions);

      return _resource;
  }

})();
