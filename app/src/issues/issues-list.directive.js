/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
        .module('rmIssues')
        .directive('rmIssuesList', [
            'IssueClass',
            'Page',
            IssuesListDirective]);

  function IssuesListDirective( IssueClass, Page ) {
      return {
          restrict: 'E',
          scope: {
              listTitle: '@',
              issues: '=',
              limit: '=',
              totalCount: '='
          },
          templateUrl: './src/issues/view/issuesList.html',
          link: function(scope, element, attrs) {
              scope.getIcon = IssueClass.getIcon;
              scope.getTrackerClass = IssueClass.getTrackerClass;
              scope.getPriorityClass = IssueClass.getPriorityClass;
              scope.begin = 0;
              scope.showIssue = function(issue) {
                  Page.changeView('/issues/' + issue.id);
              };
              scope.showMore = function() {
                  scope.limit += 10;
              };
              scope.getCounterTitle = function() {
                  var first = scope.begin + 1;
                  var last = scope.begin + scope.limit;
                  var total = scope.totalCount;
                  var count = scope.issues.length;
                  if (scope.limit < total) {
                    //   return '('+first+'-'+last+'/'+total+')';
                      return '('+scope.limit+'/'+total+')';
                  } else {
                      return '('+count+'/'+total+')';
                  }
              };
          }
      };
  }

})();
