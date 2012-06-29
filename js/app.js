
'use strict';

/* App Module */

angular.module('mxunit', ['mxunitfilters', 'mxunitServices']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/options', {template: 'partials/options.html',   controller: OptionCtrl}).
      when('/tests', {template: 'partials/tests.html',   controller: TestCtrl}).
      otherwise({redirectTo: '/tests'});
}]);
