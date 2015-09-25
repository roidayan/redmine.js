/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('ui.gravatar', [])
       .factory('gravatar', ['$httpParamSerializer', '$cacheFactory', GravatarService]);

  function GravatarService($httpParamSerializer, $cacheFactory) {
      var api_url = "http://www.gravatar.com/avatar/";
      var params = {
          s: 24,
          d: 'identicon'
      };
      var _params = $httpParamSerializer(params);
      var cache = $cacheFactory('gravatar');

      function getUrl(mail) {
          if (typeof mail !== 'string') {
              return '';
          }

          var url = cache.get(mail);

          if (!url) {
              url = api_url + md5(mail) + '?' + _params;
              cache.put(mail, url);
          }

          return url;
      }

      return {
          get: getUrl
      };
  }

})();
