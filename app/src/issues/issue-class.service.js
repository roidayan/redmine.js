/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
    'use strict';

    angular
    .module('rmIssues')
    .service('IssueClass', [
        '$log',
        IssueClass
    ]);

    function IssueClass( $log ) {
        var _trackers = {
            1: {
                name: 'bug',
                icon: 'bug_report'
            },
            2: {
                name: 'feature',
                icon: 'description'
            },
            4: {
                name: 'task',
                icon: 'class'
            },
            'default': {
                name: 'default',
                icon: 'label'
            }
        };

        function _getTracker(issue) {
            if (!issue || !issue.tracker) {
                $log.error('missing issue tracker');
                $log.debug(issue);
                return '';
            }

            var id = issue.tracker.id || 'default';
            var _i = _trackers[id] ? _trackers[id] : _trackers['default'];

            return _i;
        }

        function getIcon(issue) {
            var _i = _getTracker(issue);

            return _i === '' ? '' : _i.icon;
        }

        function getTrackerClass(issue) {
            var _i = _getTracker(issue);

            return 'issue-tracker-' + _i.name.toLowerCase();
        }

        function getPriorityClass(issue) {
            var _i = _getTracker(issue);

            return 'issue-priority-' + _i.name.toLowerCase();
        }

        return {
            getIcon: getIcon,
            getTrackerClass: getTrackerClass,
            getPriorityClass: getPriorityClass
        };
    }

})();
