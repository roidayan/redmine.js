/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
    'use strict';

    angular
       .module('redmineApp')
       .directive('appScroll', ['$window', ScrollDirective]);

    function ScrollDirective($window) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var $e = angular.element(element);
                var $p = $e.parent();
                var last_position = 0;
                var onScroll = function(ev) {
                    var pos = ev.srcElement.scrollTop;
                    // on click we get pos 1
                    if (pos === 1)
                        return;
                    // console.log("last pos " + last_position + " curr pos " + pos);
                    if (pos > last_position) {
                        // console.log('go down');
                        $e.addClass('hide2');
                    } else {
                        // console.log('go up');
                        $e.removeClass('hide2');
                    }
                    last_position = pos;
                };
                $p.on('scroll', onScroll);
                $p.on('$destroy', function() {
                    // console.log('destroy');
                    $p.off('scroll', onScroll);
                });
            }
        }
    }

})();
