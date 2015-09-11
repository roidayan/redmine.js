/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
        .module('rmIssues')
        .directive('editIssue', EditIssueDirective);

  function EditIssueDirective() {
      return {
          restrict: 'E',
          templateUrl: './src/issues/view/editIssue.html'
      };
  }

})();
