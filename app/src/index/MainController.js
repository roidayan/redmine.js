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
          'Page',
          MainController
       ]);

  function MainController( $mdSidenav, $q, Page ) {
    var self = this;

    self.toggleSidenav = toggleSidenav;
    self.closeSidenav = closeSidenav;
    self.page = Page;

    self.go = function( path ) {
        closeSidenav();
        Page.changeView(path);
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
