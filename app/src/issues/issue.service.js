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
                      'include':    'journals,relations',
                      'limit':      100,
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
          return $resource(url, params, actions);
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

      /**
       * This function add params with the f[] op[] v[] structure as
       * the redmine UI uses.
       * @param  {string} name    Filter name
       * @param  {list}   value   List of values
       * @param  {object} params  Output object
       */
      function addParam(name, value, params) {
          var f = params['f[]'] || [];
          if (f.indexOf(name) < 0) {
              f.push(name);
              params['f[]'] = f;
          }
          // TODO: status_id strings needs here 'o' for open.
          params['op['+name+']'] = '=';
          var v = params['v['+name+'][]'] || [];
          params['v['+name+'][]'] = value;
          return params;
      }

      function addParams(newParams, params) {
          for (var param in newParams) {
              addParam(param, newParams[param], params);
          }
          return params;
      }

      return {
          getUrl: function(issue_id) {
              return settingsService.getRemoteUrl() + '/issues/' + issue_id;
          },
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
          },
          addParam: addParam,
          addParams: addParams
      };
  }

})();
