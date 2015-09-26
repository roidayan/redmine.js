/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
       .module('rmIssues')
       .controller('IssueListController', [
          '$scope',
          'issueService',
          'userService',
          '$log',
          '$q',
          '$localStorage',
          '$cacheFactory',
          'Page',
          'settingsService',
          IssueListController
       ]);

  function IssueListController( $scope, issueService, userService, $log, $q,
                                $localStorage, $cacheFactory, Page,
                                settingsService ) {
    var self = this;

    self.loading = false;
    self.issues = [];
    self.users = [];
    self.total_count = 0;

    Page.setTitle('Issues');

    var cache = $cacheFactory.get('issueListCtrlCache') || $cacheFactory('issueListCtrlCache');
    self.selectedStatuses = cache.get('statusFilter') || [];

    if (settingsService.isConfigured())
        setup();
    else
        Page.changeView('/settings');

    function setup() {
        self.loading = true;
        getIssueStatuses();
        getIssues().then(function() {
            self.loading = false;
        }).catch(function(e) {
            self.loading = false;
            // self.errorLoading = true;
            // self.errorMessage = e.statusText || 'error occured';
            $log.debug('error');
            $log.debug(e);
        });
    }

    function getIssues() {
        var params = {
            'assigned_to_id': 'me',
            'status_id': 'open'
        };

        if (self.selectedStatuses && self.selectedStatuses.length > 0) {
            var ids = self.selectedStatuses.map(
                function(item) {
                    return item.id;
                }
            );
            params['status_id'] = ids.join('|');
        }

        // params = issueService.addParams(params, {});

        var q = issueService.get(params).$promise.then(function(data) {
            $log.debug(data);
            self.issues = data.issues;
            self.total_count = data.total_count;
            self.issues.forEach(function(issue) {
                getUser(issue.author.id).then(function(user) {
                    issue['author']['mail'] = user.mail;
                });
            });
        });

        return q;
    }

    function getIssueStatuses() {
        var q = issueService.queryStatuses().$promise.then(function(data) {
            $log.debug(data);
            self.statuses = data.issue_statuses;
        });

        return q;
    }

    self.statusFilter = function(newItems, oldItems) {
        if (oldItems === newItems)
            return;
        cache.put('statusFilter', newItems);
        self.loading = true;
        getIssues().finally(function() {
            self.loading = false;
        });
    };

    function getUser(user_id) {
        if (!user_id)
            return $q.when(true);
        if (self.users[user_id])
            return $q.when(self.users[user_id]);

        var q = userService.get({
            'user_id': user_id
        }).$promise.then(function(data) {
            // $log.debug(data);
            var user = data.user;
            self.users[user.id] = user;
            return user;
        }).catch(function(e) {
            $log.error("failed to get user " + user_id);
            $q.reject();
        });

        return q;
    }

    /**
     *  XXX: this breaks all $resource calls later because the timeout
     *  promise is resolved.
     */
    // $scope.$on('$destroy', function() {
    //     _services.forEach(function(p) {
    //         p.abort();
    //     });
    // });

  }

})();
