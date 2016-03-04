/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
    'use strict';

    angular
        .module('rmProjects')
        .service('memberships', [
            '$log',
            '$q',
            '$localStorage',
            'userService',
            'projectService',
            MembershipsService]);

    function MembershipsService( $log, $q, $localStorage, userService, projectService ) {
        if ( ! $localStorage.memberships ) {
            $localStorage.memberships = [];
        }
        var localMemberships = $localStorage.memberships;

        function getProjectsStatuses(memberships) {
            var all = [];
            memberships.forEach(function(membership) {
                var q = projectService.get({
                    'project_id': membership.project.id
                }).$promise.then(function(data) {
                    var project = data.project;
                    // project status is available from redmine 2.5.0 ?
                    if (project.status) {
                        project.status_name = projectService.get_status_name(project.status);
                    }
                    membership.project = project;
                });
                all.push(q);
            });
            return $q.all(all).then(function() {
                return memberships;
            });
        }

        function getMemberships() {
            var q = userService.get({
                'user_id': 'current',
                'include': 'memberships'
            }).$promise.then(function(data) {
                var memberships = data.user.memberships;
                var q = getProjectsStatuses(memberships).then(function(memberships) {
                    $log.debug('MembershipsService::getMemberships:', memberships);
                    // replace local data
                    localMemberships.length = 0;
                    angular.extend(localMemberships, memberships);
                });
                return q;
            }).catch(function(e) {
                return $q.reject("Failed to get memberships");
            });

            return q;
        }

        return {
            getMemberships: getMemberships,
            getLocal: function() { return localMemberships; }
        };
    }

})();
