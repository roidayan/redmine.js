/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){

  angular
       .module('redmineApp')
       .factory('Page', PageService);

  function PageService() {
      var title = 'title';
      var rightButton = {};

      return {
          title: function() { return title; },
          setTitle: function(newTitle) { title = newTitle; },
          rightButton: function() { return rightButton; },
          setRightButton: function(icon, cb) { rightButton = {'cb': cb, 'icon': icon } }
      };
  }

})();
