/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
        .module('rmIssues')
        .factory('issueService', [
            '$resource',
            '$q',
            '$log',
            '$cacheFactory',
            'settingsService',
            IssueService]);

  function IssueService( $resource, $q, $log, $cacheFactory, settingsService ) {
      var apiRemoteUrl, apiKey, url, resource;
      var relative = '/issues/:issue_id.json';
      var relative_statuses = '/issue_statuses.json';
      var relative_priorities = '/enumerations/issue_priorities.json';
      var params = {};
    //   var aborter = $q.defer();
      var cache = $cacheFactory('issueCache');
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
          var url = apiRemoteUrl + relative;
          var headers = {
              'X-Redmine-API-Key': apiKey,
          };
          var actions = {
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
                  headers: headers
              },
              update: {
                  method: 'PUT',
                  interceptor: postInterceptor,
                  isArray: false,
                  timeout: 10000,
                  //timeout: aborter.promise,
                  headers: headers
              },
              save: {
                  method: 'POST',
                  interceptor: postInterceptor,
                  isArray: false,
                  timeout: 10000,
                  //timeout: aborter.promise,
                  headers: headers
              },
              queryStatuses: {
                  url: apiRemoteUrl + relative_statuses,
                  method: 'GET',
                  isArray: false,
                  cache: cache,
                  timeout: 10000,
                  headers: headers
              },
              queryPriorities: {
                  url: apiRemoteUrl + relative_priorities,
                  method: 'GET',
                  isArray: false,
                  cache: cache,
                  timeout: 10000,
                  headers: headers
              }
          };

          cache.removeAll();
          var _r = $resource(url, params, actions);
          _r.issuesUrl = apiRemoteUrl + '/issues';
          return _r;
      }

    //   _resource.abort = function() {
    //       /**
    //        * XXX: abort not working because of bug in ngResource.
    //        * https://github.com/angular/angular.js/pull/12657
    //        */
    //       $log.debug("resource aborter");
    //       aborter.resolve();
    //       /* TODO renew */
    //       $log.debug("new aborter");
    //       aborter = $q.defer();
    //       _resource = createResource();
    //   };

      function getResource() {
          if (apiRemoteUrl !== settingsService.getRemoteUrl()) {
              apiRemoteUrl = settingsService.getRemoteUrl();
              resource = null;
          }
          if (apiKey !== settingsService.getApiKey()) {
              apiKey = settingsService.getApiKey();
              resource = null;
          }
          if (!resource)
              resource = createResource();
          return resource;
      }

      return {
          get: function() {
              return getResource().get.apply(this, arguments);
          },
          update: function() {
              return getResource().update.apply(this, arguments);
          },
          save: function() {
              return getResource().save.apply(this, arguments);
          },
          queryStatuses: function() {
              return getResource().queryStatuses.apply(this, arguments);
          },
          queryPriorities: function() {
              return getResource().queryPriorities.apply(this, arguments);
          }
      }
  }

})();
