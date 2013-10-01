
'use strict';

/* App Module */

angular.module('mxunit', ['mxunitfilters', 'mxunitServices','AlertService']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/options', {templateUrl: 'partials/options.html',   controller: OptionCtrl}).
      when('/tests', {templateUrl: 'partials/tests.html',   controller: TestCtrl}).
      otherwise({redirectTo: '/tests'});
}]);
