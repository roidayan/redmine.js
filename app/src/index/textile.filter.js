/*!
 * Redmine.js
 * @license GPLv2
 */
 (function(){
    'use strict';

    angular
        .module('redmineApp')
        .filter('textile', TextileFilter);

    function TextileFilter() {
        return function(input) {
            if (!input) {
                return '';
            }
            return textile(input);
        };
    }

})();
