/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){

  angular
       .module('redmineApp')
       .factory('debounce', ['$timeout', DebounceService]);

    function DebounceService($timeout) {
        return function(func, wait) {
          var timeout, args, context, result;

          function debounce() {
            context = this;
            args = arguments;

            var later = function () {
              timeout = null;
              result = func.apply(context, args);
            };

            if (timeout) {
              $timeout.cancel(timeout);
            }

            timeout = $timeout(later, wait);
          }

          debounce.cancel = function () {
              if (timeout) {
                  $timeout.cancel(timeout);
                  timeout = null;
              }
          };

          return debounce;
        };
    }

})();
