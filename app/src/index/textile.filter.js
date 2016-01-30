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
        var issue_ref = new RegExp("(?:^| |\r|\n|\s)(#([0-9]+))(?: |$|\r|\s|\n)");

        return function(input) {
            if (!input) {
                return '';
            }
            /* link markup */
            input = input.replace(issue_ref, " <a href=\"#/issues/$2\">$1</a> ");
            /* textile */
            return textile("<p>"+input+"</p>");
        };
    }

})();
