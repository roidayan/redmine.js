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
          'IssueClassFactory',
          '$log',
          '$location',
          '$localStorage',
          'Page',
          'settingsService',
          IssueListController
       ]);

  function IssueListController( $scope, issueService, IssueClassFactory, $log, $location, $localStorage, Page, settingsService ) {
    var self = this;

    self.loading = false;
    self.issues = [];
    self.total_count = 0;
    self.getIcon = IssueClassFactory.getIcon;
    self.getTrackerClass = IssueClassFactory.getTrackerClass;
    self.getPriorityClass = IssueClassFactory.getPriorityClass;
    self.showIssue = showIssue;

    Page.setTitle('Issues');

    if (settingsService.isConfigured())
        setup();
    else
        $location.path('/settings');

    function setup() {
        getIssues().catch(function(e) {
            self.loading = false;
            // self.errorLoading = true;
            // self.errorMessage = e.statusText || 'error occured';
            $log.debug('error');
            $log.debug(e);
        });
    }

    function getIssues() {
        self.loading = true;

        var q = issueService.query({
            'assigned_to_id': 'me'
        }).$promise.then(function(data) {
            $log.debug(data);
            self.issues = data.issues;
            self.total_count = data.total_count;
            self.loading = false;
        });

        return q;
    }

    function showIssue(issue) {
        $location.path('/issues/' + issue.id);
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
