/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){

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
      var pending = $q.when(true);

      pending.then(function(){
        $mdSidenav('left').toggle();
      });
    }

    function closeSidenav() {
        var pending = $q.when(true);

        pending.then(function(){
          $mdSidenav('left').close();
        });
    }

  }

})();
