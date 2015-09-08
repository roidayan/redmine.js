/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
    'use strict';

    angular
        .module('rmProjects')
        .factory('favProject', [
            '$localStorage',
            FavProjectService]);

    function FavProjectService( $localStorage ) {
        var favProjects = $localStorage.projects || { items: {} };

        function saveLocal() {
            $localStorage.projects = favProjects;
        }

        function isFav(id) {
            return favProjects.items[id] !== undefined;
        }

        function addFav(project) {
          if (project && !isFav(project)) {
              favProjects.items[project.id] = project;
              saveLocal();
          }
        }

        function removeFav(project) {
            if (project && isFav(project.id)) {
                delete favProjects.items[project.id];
                saveLocal();
            }
        }

        function toggleFav(project) {
            if (isFav(project.id))
                removeFav(project);
            else
                addFav(project);
        }

        return {
          isFavorite: isFav,
          addFavorite: addFav,
          removeFavorite: removeFav,
          toggleFavorite: toggleFav,
          getFavorites: function(){ return favProjects.items; }
        };
    }

})();
