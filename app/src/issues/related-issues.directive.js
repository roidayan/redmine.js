/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
    'use strict';

    angular
        .module('rmIssues')
        .directive('relatedIssues', RelatedIssuesDirective);

    function RelatedIssuesDirective() {
        return {
            restrict: 'E',
            templateUrl: './src/issues/view/relatedIssues.html'
        };
    }

})();
