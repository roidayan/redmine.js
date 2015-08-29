/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
        .module('rmIssues')
        .service('issuePriorities', [
            '$resource',
            '$q',
            'settingsService',
            IssuePrioritiesService]);

  function IssuePrioritiesService( $resource, $q, settingsService ) {
      var _resource = null;
      var apiRemoteUrl = settingsService.getRemoteUrl();
      var apiKey = settingsService.getApiKey();
      var _url = apiRemoteUrl + '/enumerations/issue_priorities.json';
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

      return $resource(_url, _params, _actions);
  }

})();
