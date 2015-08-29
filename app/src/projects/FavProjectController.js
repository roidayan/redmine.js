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
          '$log',
          '$location',
          '$localStorage',
          '$q',
          FavProjectController
       ]);

  function FavProjectController( projectService, debounce, $log, $location, $localStorage, $q ) {
    var self = this;

    self.projectId = null;
    self.project = null;
    self.loading = false;
    self.statusText = null;
    self.lookFor = lookFor;
    self.addFav = addFav;
    self.canAddFav = canAddFav;
    self.favIds = [];

    loadLocal();

    function alreadyFav() {
        return self.favIds.indexOf(self.project.id) > -1;
    }

    function canAddFav() {
        return (self.project && !alreadyFav());
    }

    function addFav() {
        if (canAddFav()) {
            console.log("add to fav");
            self.projects.items.push(self.project);
            saveLocal();
            self.favIds.push(self.project.id);
        }
    }

    function lookFor() {
        self.loading = true;
        self.project = null;
        self.statusText = null;

        if (self.projectId) {
            getProject().then(function(){
                self.loading = false;
            });
        }
    }

    function loadLocal() {
        var _projects = $localStorage.projects;
        if (_projects) {
            self.projects = _projects;
            _projects.items.forEach(function(i){
                self.favIds.push(i.id);
            });
        } else {
            self.projects = {items: []};
        }

        console.log(self.favIds);
    }

    function saveLocal() {
        $localStorage.projects = self.projects;
    }

    function getProject() {
        if (!self.projectId){
            console.error("no project id");
            return $q.when(true);
        }

        var q = projectService.query({
            'project_id': self.projectId
        }).$promise.then(function(data) {
            console.log(data);
            self.project = data.project;
        }).catch(function(e){
            self.statusText = e.statusText;
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
            console.log(data);
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
        console.log("load from offset " + self.offset);
        self.loading = self.offset * 100 / self.total_count;
        projectService.query({offset: self.offset, limit: self.limit}).$promise.then(function(data) {
            self.projects = self.projects.concat(data.projects);
            self.offset += data.limit;
            loadMore();
        });
    }

  }

})();
