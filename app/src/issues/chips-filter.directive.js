/*!
 * Redmine.js
 * @license GPLv2
 */
(function(){
  'use strict';

  angular
        .module('rmIssues')
        .directive('chipsFilter', ['$timeout', ChipsFilterDirective]);

  function ChipsFilterDirective($timeout) {
      return {
          restrict: 'E',
          scope: {
              placeholder: '@',
              items: '=',
              selectedItems: '=',
              change: '&'
          },
          templateUrl: './src/issues/view/chipsFilter.html',
          link: function(scope, element, attrs) {
              /**
               * TODO: ng-change not working with md-chips
               * so we use $watchCollection
               * https://github.com/angular/material/issues/3857
               */
              scope.querySearch = querySearch;
              scope.queryUnselectedItems = queryUnselectedItems;
              scope.blur = blur;

              scope.$watchCollection('selectedItems', function(newItems, oldItems) {
                  scope.change({
                      newItems: newItems,
                      oldItems: oldItems
                  });
              });

              /**
               * TODO: Md Autocomplete: Blur on selected element
               * https://github.com/angular/material/issues/3976
               * TODO: md-selected-item-change called twice
               * https://github.com/angular/material/issues/3279
               */
              function blur() {
                  // XXX: using $timeout for blur to work on md-on-remove
                  $timeout(function() {
                      element.find('input').blur();
                      var r = element.find('md-autocomplete-wrap');
                      r.scope().$mdAutocompleteCtrl.hidden = true;
                  });
              }

              function queryUnselectedItems() {
                  if (!scope.items) {
                      return [];
                  }
                  var d = {};
                  var results = [];
                  var i;

                  for (i = 0; i < scope.selectedItems.length; i++) {
                      d[scope.selectedItems[i].id] = true;
                  }
                  for (i = 0; i < scope.items.length; i++) {
                      if (!d[scope.items[i].id])
                        results.push(scope.items[i]);
                  }
                  return results;
              }

              function querySearch(query) {
                  var results = query ? scope.items.filter(createFilterFor(query)) : [];
                  return results;
              }

              function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);
                return function filterFn(item) {
                    var lowercaseItem = angular.lowercase(item.name);
                    return (lowercaseItem.indexOf(lowercaseQuery) === 0);
                };
              }
          }
      };
  }

})();
