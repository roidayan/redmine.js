/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('rmProjects')
       .controller('FavProjectController', [
          'projectService',
          'debounce',
          'settingsService',
          'favProject',
          '$log',
          '$location',
          '$localStorage',
          '$q',
          FavProjectController
       ]);

  function FavProjectController( projectService, debounce, settingsService, favProject, $log, $location, $localStorage, $q ) {
    var self = this;

    self.projectSearchText = null;
    self.loading = false;
    self.lookFor = lookFor;
    self.addFav = addFav;
    self.canAdd = canAdd;

    if (!settingsService.isConfigured())
        $location.path('/settings');

    function canAdd() {
        if (!self.project || favProject.isFavorite(self.project.id))
            return false;
        return true;
    }

    function addFav() {
        if (canAdd()) {
            favProject.addFavorite(self.project);
        }
    }

    function lookFor() {
        self.project = null;
        self.canAddFav = false;
        self.errorMessage = null;

        if (self.projectSearchText) {
            self.loading = true;
            getProject(self.projectSearchText).then(function() {
                self.loading = false;
            });
        }
    }

    function getProject(search) {
        var q = projectService.query({
            'project_id': search
        }).$promise.then(function(data) {
            $log.debug(data);
            self.project = data.project;
            if (!favProject.isFavorite(self.project.id))
                self.canAddFav = true;
        }).catch(function(e) {
            if (e.status === 0 && e.statusText === '')
                e.statusText = self.errorMessage = 'Not found';
            else
                self.errorMessage = e.status + ' ' + e.statusText;
            self.loading = false;
            return $q.reject(e);
        });

        return q;
    }

    /**
     * XXX: Load all projects.
     * Not being used. too slow to load all projects and use angular filter
     * in view. maybe use pagination if projects are sorted by name.
     */
    // refresh();
    // self.projects = [];
    // self.loading = 100;
    // self.total_count = 0;

    function refresh() {
        projectService.query({limit: 1000}).$promise.then(function(data) {
            $log.debug(data);
            self.projects = data.projects;
            self.total_count = data.total_count;
            self.limit = data.limit;
            self.offset = data.offset + data.limit;
            loadMore();
        });
    }

    function loadMore() {
        if (!angular.isNumber(self.offset) || self.offset >= self.total_count) {
            self.loading = 100;
            saveLocal();
            return;
        }
        $log.debug("load from offset " + self.offset);
        self.loading = self.offset * 100 / self.total_count;
        projectService.query({offset: self.offset, limit: self.limit}).$promise.then(function(data) {
            self.projects = self.projects.concat(data.projects);
            self.offset += data.limit;
            loadMore();
        });
    }

  }

})();
