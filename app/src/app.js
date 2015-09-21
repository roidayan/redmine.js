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
        'ngMessages',
        'ngStorage',
        'appSettings',
        'rmProjects',
        'rmIssues',
        'rmUsers'
    ])

    .constant('appName',       'Reminde.js')
    .constant('appVersion',    '0.0.0')
    .constant('appAuthor',     'Roi Dayan')
    .constant('appCopyright',  '(c) 2015 Roi Dayan')
    .constant('appProduction', false)

    .config( function( $mdThemingProvider, $routeProvider, $locationProvider, $localStorageProvider, $httpProvider, $logProvider, appProduction ) {

        $localStorageProvider.setKeyPrefix('redmineApp-');

        if ( appProduction && appProduction === true )
            $logProvider.debugEnabled(false);

        $mdThemingProvider.theme('default')
            .primaryPalette('indigo')
            .accentPalette('pink')
            .warnPalette('red')
            .backgroundPalette('blue-grey', {'default': '50'});

        $routeProvider
          .when('/projects', {
              templateUrl: './src/projects/view/projects.html',
              controller: 'ProjectListController as ctrl'
          })
          .when('/projects/:projectId', {
              templateUrl: './src/projects/view/project.html',
              controller: 'ProjectController as ctrl'
          })
          .when('/projects/:projectId/issues/:action', {
              templateUrl: './src/issues/view/editIssue.html',
              controller: 'IssueController as ctrl'
          })
          .when('/issues', {
              templateUrl: './src/issues/view/issues.html',
              controller: 'IssueListController as ctrl'
          })
          .when('/issues/:issueId', {
              templateUrl: './src/issues/view/issue.html',
              controller: 'IssueController as ctrl'
          })
          .when('/issues/:issueId/:action', {
              templateUrl: './src/issues/view/editIssue.html',
              controller: 'IssueController as ctrl'
          })
          .when('/settings', {
              templateUrl: './src/settings/view/settings.html',
              controller: 'SettingsController as ctrl'
          })
          .when('/about', {
              scope: {},
              templateUrl: './src/index/view/about.html',
              controller: function($scope, Page, appName, appVersion, appCopyright) {
                  Page.setTitle('About');
                  $scope.appName = appName;
                  $scope.appVersion = appVersion;
                  $scope.appCopyright = appCopyright;
              }
          })
          .otherwise({
              redirectTo: '/projects'
          });

        $httpProvider.useLegacyPromiseExtensions = false;
        //$locationProvider.html5Mode(true);
    })

    .run(function($rootScope, Page) {
        $rootScope.$on('$routeChangeSuccess',
            function(event, curr, prev) {
                Page.reset();
        });

        FastClick.attach(document.body);
    });

})();
