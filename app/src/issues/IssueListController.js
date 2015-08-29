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
          IssueListController
       ]);

  function IssueListController( $scope, issueService, IssueClassFactory, $log, $location, $localStorage, Page ) {
    var self = this;

    self.loading = false;
    self.issues = [];
    self.total_count = 0;
    self.getIcon = IssueClassFactory.getIcon;
    self.getTrackerClass = IssueClassFactory.getTrackerClass;
    self.getPriorityClass = IssueClassFactory.getPriorityClass;
    self.showIssue = showIssue;

    Page.setTitle('Issues');

    var _services = [];
    var q = getIssues();

    function getIssues() {
        self.loading = true;

        var service = issueService;
        _services.push(service);
        var q = service.query({
            'assigned_to_id': 'me'
        }).$promise.then(function(data) {
            console.log(data);
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
