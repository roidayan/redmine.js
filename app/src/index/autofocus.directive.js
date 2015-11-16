/**
 * the HTML5 autofocus property can be finicky when it comes to dynamically loaded
 * templates and such with AngularJS. Use this simple directive to
 * tame this beast once and for all.
 *
 * Usage:
 * <input type="text" autofocus>
 *
 * License: MIT
 */
(function(){
    'use strict';

    angular
        .module('redmineApp')
        .directive('autofocus', ['$timeout', AutofocusDirective]);

     function AutofocusDirective($timeout) {
        return {
            restrict: 'A',
            scope: {
                autofocus: '@'
            },
            link: function($scope, $element) {
                if ($scope.autofocus === 'true') {
                    $timeout(function() {
                        $element[0].focus();
                    }).then(function() {
                        return $timeout(function(){
                            $element[0].scrollIntoView();
                        }, 200);
                    });
                }
            }
        };
    }

})();
