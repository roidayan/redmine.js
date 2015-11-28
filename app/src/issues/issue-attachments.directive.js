/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
    'use strict';

    angular
        .module('rmIssues')
        .directive('issueAttachments', issueAttachmentsDirective);

    function issueAttachmentsDirective() {
        return {
            restrict: 'E',
            templateUrl: './src/issues/view/issueAttachments.html'
        };
    }

})();
