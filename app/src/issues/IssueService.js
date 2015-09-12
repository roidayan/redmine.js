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
            '$log',
            '$cacheFactory',
            'settingsService',
            IssueService]);

  function IssueService( $resource, $q, $log, $cacheFactory, settingsService ) {
      var _resource = null;
      var aborter = $q.defer();
      var apiRemoteUrl = settingsService.getRemoteUrl();
      var apiKey = settingsService.getApiKey();
      var _url = apiRemoteUrl + '/issues/:issue_id.json';
      var _params = {};
      var cache = $cacheFactory('resourceIssueCache');
      var postInterceptor = {
          response: function(response) {
              // TODO: Need to clear key of url + query params
              // Need to clear all keys for specific issue.
              // cache.remove(response.config.url);
              cache.removeAll();
              return response.resource;
          }
      };

      function createResource() {
          var _actions = {
              get: {
                  method: 'GET',
                  params: {
                      'status_id':  'open',
                      'include':    'journals',
                      'limit':      10,
                      'sort':       'priority:desc,updated_on:desc'
                  },
                  isArray: false,
                  cache: cache,
                  timeout: 10000,
                  //timeout: aborter.promise,
                  headers: {
                      'X-Redmine-API-Key': apiKey,
                  }
              },
              update: {
                  method: 'PUT',
                  interceptor: postInterceptor,
                  isArray: false,
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
          $log.debug("resource aborter");
          aborter.resolve();
          /* TODO renew */
          $log.debug("new aborter");
          aborter = $q.defer();
          _resource = createResource();
      };

      return _resource;
  }

})();
