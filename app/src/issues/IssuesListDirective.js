/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
        .module('rmIssues')
        .directive('rmIssuesList', [
            'IssueClassFactory',
            '$location',
            IssuesListDirective]);

  function IssuesListDirective( IssueClassFactory, $location ) {
      return {
          restrict: 'E',
          scope: {
              listTitle: '@',
              issues: '=',
              totalCount: '='
          },
          templateUrl: './src/issues/view/issuesList.html',
          link: function(scope, element, attrs) {
              scope.getIcon = IssueClassFactory.getIcon;
              scope.getTrackerClass = IssueClassFactory.getTrackerClass;
              scope.getPriorityClass = IssueClassFactory.getPriorityClass;
              scope.showIssue = function(issue) {
                  $location.path('/issues/' + issue.id);
              };
          }
      };
  }

})();
