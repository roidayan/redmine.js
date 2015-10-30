/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
    'use strict';

    angular
        .module('rmProjects')
        .factory('memberships', [
            '$log',
            '$q',
            '$localStorage',
            'userService',
            MembershipsService]);

    function MembershipsService( $log, $q, $localStorage, userService ) {
        var memberships = $localStorage.memberships || [];

        function saveLocal() {
            $localStorage.memberships = memberships;
        }

        function getMemberships() {
            var q = userService.get({
                'user_id': 'current',
                'include': 'memberships'
            }).$promise.then(function(data) {
                $log.debug(data);
                memberships.length = 0;
                angular.extend(memberships, data.user.memberships);
                saveLocal();
                return memberships;
            }).catch(function(e) {
                return $q.reject("Failed to get memberships");
            });

            return q;
        }

        return {
            getMemberships: getMemberships,
            getLocal: function() { return memberships; }
        };
    }

})();
