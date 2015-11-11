/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('redmineApp')
       .service('Page', ['$window', '$location', PageService]);

  function PageService($window, $location) {
      var title = 'title';
      var extLink = '';
      var backButtonCb = null;

      var reset = function() {
          /* jshint validthis: true */
          this.setTitle('');
          this.setExtLink('');
          this.backButtonCb = null;
      };

      var changeView = function(view) {
          $location.path(view);
      };

      return {
          changeView: changeView,
          reset: reset,
          title: function() { return title; },
          setTitle: function(newTitle) { title = newTitle; },
          getExtLink: function() { return extLink; },
          setExtLink: function(link) { extLink = link; },
          openExtLink: function() { $window.open(extLink, '_system'); },
          setBackButton: function(cb) { this.backButtonCb = cb; },
          showBackButton: function() { return this.backButtonCb !== null; },
          backButton: function() { this.backButtonCb(); }
      };
  }

})();
