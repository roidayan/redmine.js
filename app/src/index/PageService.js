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
      var rightButton = {};
      var extLink = '';

      function reset() {
          this.setTitle('');
          this.setExtLink('');
          this.isFavorite = null;
          this.toggleFavorite = null;
      }

      function changeView(view) {
          $location.path(view);
      }

      return {
          changeView: changeView,
          reset: reset,
          title: function() { return title; },
          setTitle: function(newTitle) { title = newTitle; },
          rightButton: function() { return rightButton; },
          setRightButton: function(icon, cb) { rightButton = {'cb': cb, 'icon': icon } },
          getExtLink: function() { return extLink; },
          setExtLink: function(link) { extLink = link; },
          openExtLink: function() { $window.open(extLink, '_system'); },
          isFavorite: null,
          toggleFavorite: null
      };
  }

})();
