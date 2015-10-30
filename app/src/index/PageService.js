/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('redmineApp')
       .factory('Page', ['$window', '$location', PageService]);

  function PageService($window, $location) {
      var title = 'title';
      var extLink = '';

      function reset() {
          /* jshint validthis: true */
          this.setTitle('');
          this.setExtLink('');
      }

      function changeView(view) {
          $location.path(view);
      }

      return {
          changeView: changeView,
          reset: reset,
          title: function() { return title; },
          setTitle: function(newTitle) { title = newTitle; },
          getExtLink: function() { return extLink; },
          setExtLink: function(link) { extLink = link; },
          openExtLink: function() { $window.open(extLink, '_system'); },
      };
  }

})();
