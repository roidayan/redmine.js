/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
        .module('rmIssues')
        .service('issueStatuses', [
            '$resource',
            '$q',
            'settingsService',
            IssueStatusesService]);

  function IssueStatusesService( $resource, $q, settingsService ) {
      var _resource = null;
      var apiRemoteUrl = settingsService.getRemoteUrl();
      var apiKey = settingsService.getApiKey();
      var _url = apiRemoteUrl + '/issue_statuses.json';
      var _params = {};
      var _actions = {
          get: {
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
