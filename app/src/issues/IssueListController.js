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
          '$log',
          '$location',
          '$localStorage',
          'Page',
          'settingsService',
          IssueListController
       ]);

  function IssueListController( $scope, issueService, $log, $location, $localStorage, Page, settingsService ) {
    var self = this;

    self.loading = false;
    self.issues = [];
    self.total_count = 0;

    Page.setTitle('Issues');

    if (settingsService.isConfigured())
        setup();
    else
        $location.path('/settings');

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

        if (self.filter_by_status_id && self.filter_by_status_id.length > 0) {
            params['status_id'] = self.filter_by_status_id.join('|');
        }

        // params = issueService.addParams(params, {});

        var q = issueService.get(params).$promise.then(function(data) {
            $log.debug(data);
            self.issues = data.issues;
            self.total_count = data.total_count;
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
        self.filter_by_status = newItems;
        self.filter_by_status_id = newItems.map(function(item) { return item.id; });
        getIssues();
    };

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
