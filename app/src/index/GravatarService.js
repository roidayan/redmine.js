/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('redmineApp')
       .factory('gravatar', ['$httpParamSerializer', '$cacheFactory', GravatarService]);

  function GravatarService($httpParamSerializer, $cacheFactory) {
      var api_url = "http://www.gravatar.com/avatar/";
      var params = "?s=24&d=identicon";
      var cache = $cacheFactory('gravatar');

      function get(mail) {
          if (typeof mail !== 'string')
              return '';

          var url = cache.get(mail);

          if (!url) {
              url = api_url + md5(mail) + params
              cache.put(mail, url);
          }

          return url
      }

      return {
          get: get
      };
  }

})();
