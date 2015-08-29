/*!
 * Redmine.js
 * (c) 2015 Roi Dayan
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
    .module('redmineApp', [
        'ngMaterial',
        'ngAria',
        'ngRoute',
        'ngResource',
        'ngStorage',
        'rmSettings',
        'rmProjects',
        'rmIssues',
        'rmUsers'
    ])

    .value('appName', 'Reminde.js')
    .value('appVersion', '0.0.0')
    .value('appAuthor', 'Roi Dayan')

    .config( function( $mdThemingProvider, $routeProvider, $locationProvider, $localStorageProvider ) {

        $localStorageProvider.setKeyPrefix('redmineApp-');

        $mdThemingProvider.theme('default')
            .primaryPalette('indigo')
            .accentPalette('pink')
            .warnPalette('red');

        $routeProvider
          .when('/projects', {
              templateUrl: './src/projects/view/projects.html',
              controller: 'ProjectListController as ctrl'
          })
          .when('/projects/:projectId', {
              templateUrl: './src/projects/view/project.html',
              controller: 'ProjectController as ctrl'
          })
          .when('/addFavProject', {
              templateUrl: './src/projects/view/addFavProject.html',
              controller: 'FavProjectController as ctrl'
          })
          .when('/issues', {
              templateUrl: './src/issues/view/issues.html',
              controller: 'IssueListController as ctrl'
          })
          .when('/issues/:issueId', {
              templateUrl: './src/issues/view/issue.html',
              controller: 'IssueController as ctrl'
          })
          .when('/settings', {
              templateUrl: './src/settings/view/settings.html',
              controller: 'SettingsController as ctrl'
          })
          .when('/about', {
              templateUrl: './src/index/view/about.html',
              controller: function(Page) {
                  Page.setTitle('About');
              }
          })
          .otherwise({
              redirectTo: '/projects'
          });

        //$locationProvider.html5Mode(true);
    })

    .run(function($rootScope, Page) {
        $rootScope.$on('$routeChangeSuccess',
        function(event, curr, prev) {
            Page.reset();
        });
    });

})();
