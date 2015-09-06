/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('redmineApp')
       .controller('MainController', [
          '$mdSidenav',
          '$q',
          '$location',
          'Page',
          MainController
       ]);

  function MainController( $mdSidenav, $q, $location, Page ) {
    var self = this;

    self.toggleSidenav = toggleSidenav;
    self.closeSidenav = closeSidenav;
    self.page = Page;

    self.go = function( path ) {
        closeSidenav();
        $location.path(path);
    }

    self.menu_items = [
        {
            title: 'Projects',
            icon: 'store',
            link: '/projects'
        },
        {
            title: 'Issues',
            icon: 'bug_report',
            link: '/issues'
        },
        {
            title: 'Settings',
            icon: 'settings',
            link: '/settings'
        },
        {
            title: 'About',
            icon: 'info',
            link: '/about'
        }
    ];

    function toggleSidenav() {
        $mdSidenav('left').toggle();
    }

    function closeSidenav() {
        $mdSidenav('left').close();
    }

  }

})();
