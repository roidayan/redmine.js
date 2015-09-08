/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('redmineApp')
       .factory('Page', ['$window', PageService]);

  function PageService($window) {
      var title = 'title';
      var rightButton = {};
      var extLink = '';

      return {
          reset: function() {
              this.setTitle('');
              this.setExtLink('');
              this.isFavorite = null;
              this.toggleFavorite = null;
          },
          title: function() { return title; },
          setTitle: function(newTitle) { title = newTitle; },
          rightButton: function() { return rightButton; },
          setRightButton: function(icon, cb) { rightButton = {'cb': cb, 'icon': icon } },
          extLink: function() { return extLink; },
          setExtLink: function(link) { extLink = link; },
          openExtLink: function(link) { $window.open(extLink, '_system'); },
          isFavorite: null,
          toggleFavorite: null
      };
  }

})();
