/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
        .module('rmIssues')
        .service('issueService', [
            '$resource',
            '$q',
            'settingsService',
            IssueService]);

  function IssueService( $resource, $q, settingsService ) {
      var _resource = null;
      var aborter = $q.defer();
      var apiRemoteUrl = settingsService.getRemoteUrl();
      var apiKey = settingsService.getApiKey();
      var _url = apiRemoteUrl + '/issues/:issue_id.json';
      var _params = {
          'status_id': 'open',
          limit: 10,
          sort: 'priority:desc,updated_on:desc'
      };

      function createResource() {
          var _actions = {
              query: {
                  method: 'GET',
                  isArray: false,
                  cache: true,
                  timeout: 10000,
                  //timeout: aborter.promise,
                  headers: {
                      'X-Redmine-API-Key': apiKey,
                  }
              }
          };

          var _r = $resource(_url, _params, _actions);
          _r.issuesUrl = apiRemoteUrl + '/issues';
          return _r;
      }

      _resource = createResource();

      _resource.abort = function() {
          /**
           * XXX: abort not working because of bug in ngResource.
           * https://github.com/angular/angular.js/pull/12657
           */
          console.debug("resource aborter");
          aborter.resolve();
          /* TODO renew */
          console.log("new aborter");
          aborter = $q.defer();
          _resource = createResource();
      };

      return _resource;
  }

})();
