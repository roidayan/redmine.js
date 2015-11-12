/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
    'use strict';

    angular
        .module('rmIssues')
        .directive('issueDetails', IssueDetailsDirective);

    function IssueDetailsDirective() {
        return {
            restrict: 'E',
            templateUrl: './src/issues/view/issueDetails.html'
        };
    }

})();
