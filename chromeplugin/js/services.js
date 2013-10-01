'use strict';

/* Services */

angular.module('mxunitServices',[]).
	factory('OptionService', function($log,AlertService){
		var urlStorageKey = "mxunit_urls";
		var resultStorageKey= "mxunit_results";
		var loaded = false;
		var configurations = [];

		function getConfigs(){
			if(loaded==true){
				return configurations;	
			}

			var tmp = [];
			var json= localStorage[urlStorageKey];
		    if(typeof json!= "undefined") {
		        tmp=window.JSON.parse(json);
		        if(!tmp.length){
		        	tmp= [];
		        }
		    }
		    else{
		    	tmp=[];
		    }
		    for(var i=0;i<tmp.length;i++){
		    	tmp[i].id = i;
		    }
		    configurations = tmp;
		    loaded=true;
		    //console.log(configurations);
		    return configurations;
		}

		function getConfigsForStorage(){
			var c = getConfigs();
			var c_return = [];
			for(var i=0;i<c.length;i++){
				//console.log(c[i]);
				if(!('deleted' in c[i])){
					c_return[c_return.length] = {
						serverurl:c[i].serverurl,
						id:c_return.length,
						tests:getFilesForStorage(c[i].tests),
						show:c[i].show
					};
				}
			}
			return c_return;
		}

		function getFilesForStorage(files){
			var f_return = [];
			files= files?files:[];
			for(var i=0;i<files.length;i++){
				f_return[f_return.length] = {
					componentPath:files[i].componentPath,
					componentName:files[i].componentName,
					show:files[i].show,
					runnablemethods:getMethodsForStorage(files[i].runnablemethods)
				};
			}
			return f_return;
		}

		function getMethodsForStorage(methods){
			/*
			var f_return = [];
			methods = methods?methods:[];
			for(var i=0;i<methods.length;i++){
				$log.info(methods[i]);
				f_return[f_return.length] = {
					name:methods[i].name,
					result:methods[i].result
				};
			}
			*/
			return methods;
		}

		function addConfig(config){
			var configurations = getConfigs();
			if(!config.id && config.id != 0){
				config.id = configurations.length;
				configurations[configurations.length] = config;
			}
		}

		function newConfig(){
			return {
				serverurl:"NEW",
				verified:false,
				files:[{componentName:"rest.test"},{componentName:"rest.test2"}]
			};
		}

		function saveConfigurations(){
			AlertService.addAlert('Saved!');
	      localStorage[urlStorageKey] = window.JSON.stringify(getConfigs());
		}


		function getConfig(configid){
			return getConfigs()[configid];
		}

		return {
			getConfig:getConfig,
			getConfigs:getConfigs,
			newConfig:newConfig,
			addConfig:addConfig,
			saveConfigurations:saveConfigurations
		};
	}). 
	factory('TestService', function($log,$q,$http,OptionService){
		var loaded = false;
		var testRunKey= newGuid();
		var promisecount = 0;
		var promises = [];

		//recursively loads all tests in the folder.  Seperate ajax call for each folder.
		function getDirectory(config,directoryname){
			//http://nwahec.leespc.com/rest/test/RemoteFacade.cfc?method=getTestsInDirectory&directoryname=/&returnformat=json
			var serverurl = config.serverurl;
			var params = {method:'getDirectory',directoryname:directoryname,returnformat:'json'};
			var webfolder = serverurl.substring(0,serverurl.lastIndexOf('/'));
			var deferred = $q.defer();
			var promises = [];
			$http({
				method:'GET',
				url:serverurl,
			    params: params,
			    dataType: 'json',
			}).success(function(response) {
	    	//loop through directories and recursively call this method
	    	for(var i=0; i<response.DIRECTORIES.length; i++){
	    		config[response.DIRECTORIES[i].NAME ] = [];
		    	promises.push(getDirectory( config, directoryname + '/' + response.DIRECTORIES[i].NAME ));
	    	}
	    	$q.all(promises).then(
	    		function(){
	    			deferred.resolve();	
	    		}
	    	);

	    	//loop through files and get all tests for the file
    		config[directoryname] = response.FILEMD;

	    	for(var i=0;i<response.FILEMD.length;i++){
	    		if(response.FILEMD[i].PATH){
		    		var newtest = {
		    			runnablemethods:[],
		    			componentName:response.FILEMD[i].PATH,
		    			componentPath:response.FILEMD[i].NAME
		    		};
		    		for( var x=0; x<response.FILEMD[i].RUNNABLEMETHODS.length; x++ ){
			    		newtest.runnablemethods.push({
			    			name:response.FILEMD[i].RUNNABLEMETHODS[x],
			    			result:{}
			    		});
		    		}
		    		$log.info({push_test:newtest});
		    		config.tests.push(newtest);
					}
			  }
		  }).error(function(ErrorMsg) {
		    $log.info('Error');
		  });

		  return deferred.promise.then(function(){
		 		OptionService.saveConfigurations(); 
		  });
		}

    function newGuid() {
      var S4 = function() {
         return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
      };
      return 'X' + (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }


    function runAllInComponent(test,config,save){
	    var promises = [];
	    test.TIME = 0;
	    test.show=true;
	    test.RESULT="Ok";
	    for(var i=0;i<test.runnablemethods.length;i++){
	      promises.push(runTestMethod(test.runnablemethods[i],config,test,false));
	    }
	    return $q.all(promises).then(save?OptionService.saveConfigurations:null);
	  }

    function runAllInConfig(config,save){
	    var promises = [];
	    config.TIME = 0;
	    config.show=true;

	    for(var i=0;i<config.tests.length;i++){
	      promises.push(runAllInComponent(config.tests[i],config,false));
	    }
	    return $q.all(promises).then(save?OptionService.saveConfigurations:null);
    }

		//recursively loads all tests in the folder.  Seperate ajax call for each folder.
		function runTestMethod(method,config,test,save){
			//http://nwahec.leespc.com/rest/test/RemoteFacade.cfc?method=getTestsInDirectory&directoryname=/&returnformat=json
			var serverurl = config.serverurl;
			var params = {method:'executetestcase',componentName:test.componentPath,returnformat:'json',methodnames:method.name,testRunKey:testRunKey};
			testRunKey = newGuid();
			method.result = {RESULT:"Running"};
			return $http({
				method:'GET',
				url:serverurl,
		    params: params,
		    dataType: 'json',
			}).success(function(response) {
	    	method.result = response[test.componentPath][method.name];
	    	test.TIME += parseFloat(method.result.TIME);
	    	config.TIME += parseFloat(method.result.TIME);
	    	if(method.result.RESULT != 'Passed'){
		    	test.RESULT= method.result.RESULT;
	    	}
	    }).
	    error(function(ErrorMsg) {
	       console.log('Error');
	    }).then(save?OptionService.saveConfigurations:null);
		}

		return {
			getDirectory:getDirectory,
			runTestMethod:runTestMethod,
			runAllInComponent:runAllInComponent,
			runAllInConfig:runAllInConfig
		};
	});