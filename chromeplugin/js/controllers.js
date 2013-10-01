'use strict';

/* Controllers */
function TestCtrl($scope, $q, $routeParams,$location,$log,OptionService, TestService, AlertService) {
  console.log('TestCtrl');
  $scope.configurations = OptionService.getConfigs();
  $scope.currentConfig = OptionService.newConfig(); 
  $scope.disableHidePassedFilter = false; 
  $scope.working= false; 

  $scope.newConfig= function(){
    $scope.currentConfig = OptionService.newConfig(); 
  };

  $scope.hideDeleted= function(item) {
    return !item.deleted;
  };

  $scope.hidePassed= function(item) {
    return !item.result || item.result.RESULT != "Passed"; //|| (item.test.showpassed && item.test.showpassed==true);
  };

  $scope.edit= function(config) {
    $location.path('/options').search({action:'edit',id:config.id});
  };

  $scope.delete= function(config) {
    $location.path('/options').search({action:'delete',id:config.id});
  };

  $scope.new = function(config) {
    $location.path('/options').search({action:'new'});
  };

  $scope.runTestMethod= function(method,config,test) {
    if($scope.working){return}
    $scope.working = true;
    TestService.runTestMethod(method,config,test,true).then(
      function(){
        $scope.working = false;
      }
    ); 
  };

  $scope.runAllInComponent= function(test,config) {
    if($scope.working){return}
    $scope.working = true;
    TestService.runAllInComponent(test,config,true).then(
      function(){
        $scope.working = false;
      }
    ); 

  };

  $scope.runAllInConfig= function(config) {
    if($scope.working){return}
    $scope.working = true;
    TestService.runAllInConfig(config,true).then(
      function(){
        $scope.working = false;
      }
    ); 
  };

  $scope.loadTests= function(config) {
    if($scope.working){return}
    $scope.working = true;
    if(config.tests&&config.tests.length){
      var reload = confirm("Reload?")
      if(reload!=true){
        $scope.working = false;
        return;
      }
    }

    config.tests = [];
    config.show=true;
    TestService.getDirectory(config,".",true).then(function(){
      $scope.working = false;
      $log.info('DONE');
    });
  };
}

function OptionCtrl($log, $scope, $routeParams,$location,OptionService,AlertService) {
  console.log('OptionCtrl');

  $scope.configurations= OptionService.getConfigs();

  $scope.saveConfig= function(){
    $log.info($scope.currentConfig.id);
    $log.info({currentConfig:$scope.currentConfig});

    if(!('id' in $scope.currentConfig)){
      AlertService.addAlert('Added Config');
      OptionService.addConfig($scope.currentConfig);
    }
    OptionService.saveConfigurations();
    //AlertService.addAlert('Configuration Saved');
    $location.path('/tests');
  };

  /*$scope.addConfig= function(save){
    OptionService.addConfig($scope.currentConfig);
    $scope.currentConfig = $scope.newConfig();
  };
  */

  $scope.edit= function(config){
    $scope.currentConfig = config;  
  };

  $scope.delete= function(config){
    AlertService.addAlert("Deleted: " + config.id);
    $scope.currentConfig = config;  
    config.deleted=true;
    $scope.saveConfig();
    //$location.path('/tests');
  };

  $scope.cancel = function(){
    $scope.currentConfig.deleted = false;  
    $location.path('/tests');
  };

  $scope.hideDeleted= function(item) {
    return !item.deleted;
  };

  if($routeParams.action =='edit'){
    $scope.edit(OptionService.getConfig($routeParams.id)); 
  }

  if($routeParams.action =='delete'){
    $scope.delete(OptionService.getConfig($routeParams.id)); 
  }

  if($routeParams.action =='save'){
    OptionService.saveConfigurations();
    $location.path('/tests');
  }

  if($routeParams.action =='new'){
    $scope.currentConfig = OptionService.newConfig(); 
  }

  $scope.newConfig= function(){
    $scope.currentConfig = OptionService.newConfig(); 
  };

}

