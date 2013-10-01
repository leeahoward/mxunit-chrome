'use strict';
angular.module('AlertService',[],['$provide',function($provide){
 $provide.
    factory('AlertService', ['$log','$timeout','$q',function($log,$timeout,$q){
      var shareddata={
        alerts:[]
      };

      function addAlert(message,type,timeout) {
        var myalert = {msg: message,type:type};
        var timeoutvalue = (timeout||timeout===0?timeout:3)*1000;

        var deferred = $q.defer();
        deferred.promise.then(function(){
            closeAlertByAlert(myalert);
        });

        shareddata.alerts.push(myalert);

        $log.info('alert:' + message);
        $log.info('timeout:' + timeoutvalue);
        if(type != 'error'){
          if(timeoutvalue && timeoutvalue !== 0){
            $timeout(function(){
              deferred.resolve({});
            },
            timeoutvalue);
          }
        }
        return deferred;
      }

      function closeAlert(index) {
        shareddata.alerts.splice(index, 1);
      }

      function closeAlertByAlert(myalert) {
        var index=-1;
        //allow passing deferred object 
        if(myalert.promise){
          myalert.resolve({});
          return;
        }

        shareddata.alerts.filter(function(item,i){
          if(item===myalert){
            index = i;
          }
        });
        if(index>=0){
          closeAlert(index);
        }
      }

      return{
        shareddata:shareddata,
        closeAlertByAlert:closeAlertByAlert,
        addAlert:addAlert,
        closeAlert:closeAlert
      }
  }]);
}])
.controller('AlertCtrl', 
  ['$log','$scope','AlertService', function(
    $log,  $scope , AlertService) {
    $scope.servicedata= AlertService.shareddata;
      //{ type: 'success', msg: 'Well done! You successfully read this important alert message.' }
    $log.info('AlertCtrl');

    $scope.addAlert = function(message,type){
      if(!type){
        type = 'info';
      }
      AlertService.addAlert(message,type)
    };

    $scope.closeAlert = function(index){
      AlertService.closeAlert(index);
    };

}]);