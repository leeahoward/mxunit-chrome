
'use strict';

/* Controllers */
function TestCtrl($scope, $routeParams,$location,$log,OptionService, TestService) {
  console.log('TestCtrl');
  $scope.configurations= OptionService.getConfigs();
  $scope.currentConfig = OptionService.newConfig(); 
  $scope.disableHidePassedFilter = false; 

  $scope.newConfig= function(){
    $scope.currentConfig = OptionService.newConfig(); 
  };

  $scope.hideDeleted= function(item) {
    return !item.deleted;
  };

  $scope.hidePassed= function(item) {
    return !item.result || item.result.RESULT != "Passed" || (item.test.showpassed && item.test.showpassed==true);
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


  $scope.runTestMethod= function(method) {
    TestService.runTestMethod(method);
  };

  $scope.runAllTest= function(test) {
    test.TIME = 0;
    test.show=true;
    test.RESULT="Ok";
    for(var i=0;i<test.runnablemethods.length;i++){
      TestService.runTestMethod(test.runnablemethods[i]);
    }
  };

  $scope.runAllConfig= function(config) {
    config.TIME = 0;
    config.show=true;

    for(var i=0;i<config.tests.length;i++){
      $scope.runAllTest(config.tests[i]);
    }
  };

  $scope.loadTests= function(config) {
    if(config.tests&&config.tests.length){
      var reload = confirm("Reload?")
      if(reload!=true){
        return;
      }
    }

    config.tests = [];
    config.show=true;
    TestService.getDirectory(config,".").then(function(){
      $log.info('DONE');
    });
  };
}

function OptionCtrl($scope, $routeParams,$location,OptionService) {
  console.log('OptionCtrl');

  $scope.configurations= OptionService.getConfigs();

  $scope.saveConfig= function(){
    if(!$scope.currentConfig.id){
      OptionService.addConfig($scope.currentConfig);
    }
    OptionService.saveConfigurations();
    $location.path('/tests');
  };

  $scope.addConfig= function(){
    OptionService.addConfig($scope.currentConfig);
    OptionService.saveConfigurations();
    $scope.currentConfig = $scope.newConfig();
  };

  $scope.edit= function(config){
    $scope.currentConfig = config;  
  };

  $scope.delete= function(config){
    $scope.currentConfig = config;  
    config.deleted=true;
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

