/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('ui.gravatar')
       .directive('gravatar', ['gravatar', GravatarDirective]);

  function GravatarDirective(gravatar) {
      return {
          restrict: 'A',
          scope: {
              gravatar: '@'
          },
          link: function(scope, element, attrs) {
              var directiveName, item, opts, unbind;
              directiveName = 'gravatar';
              scope.$watch('gravatar', function(value) {
                  element.attr('src', gravatar.get(value));
              });
          }
      };
  }

})();
