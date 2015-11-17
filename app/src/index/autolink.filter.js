/*!
 * Redmine.js
 * @license GPLv2
 */
 (function(){
    'use strict';

    angular
        .module('redmineApp')
        .filter('autolink', AutolinkFilter);

    function AutolinkFilter() {
        return function(input) {
            if (!input) {
                return '';
            }
            return Autolinker.link(input, {className: 'autolink'});
        };
    }

})();
