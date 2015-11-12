/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
    'use strict';

    angular
        .module('rmIssues')
        .directive('issueHistory', IssueHistoryDirective);

    function IssueHistoryDirective() {
        return {
            restrict: 'E',
            templateUrl: './src/issues/view/issueHistory.html'
        };
    }

})();
