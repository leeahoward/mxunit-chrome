'use strict';

/* Services */

angular.module('mxunitServices',[]).
	factory('OptionService', function(){
		var storagekey = "mxunit";
		var loaded = false;
		var configurations = [];

		function getConfigs(){
			if(loaded==true){
				console.log('loaded');
				return configurations;	
			}

			console.log('not loaded');
			var tmp = [];
			var json= localStorage[storagekey];
		    if(typeof json!= "undefined") {
		        tmp=window.JSON.parse(json);
		        if(!tmp.length){
		        	tmp= [];
		        }
		    }
		    else{
		    	tmp=[];
		    }
		    //console.log(tmp);
		    for(var i=0;i<tmp.length;i++){
		    	tmp[i].id = i;
		    	tmp[i].TIME= 0;
		    	for(var x=0;x<tmp[i].tests.length;x++){
		    		var test = tmp[i].tests[x];
		    		test.config = tmp[i];
		    		test.config.TIME = 0;
			    	for(var y=0;y<test.runnablemethods.length;y++){
			    		var method = test.runnablemethods[y];
			    		method.test = test;
			    		method.TIME= 0;
			    		method.config= test.config;
			    	}
		    	}
		    }
		    configurations = tmp;
		    loaded=true;
		    console.log(configurations);
		    return configurations;
		}

		function getConfigsForStorage(){
			var c = getConfigs();
			var c_return = [];
			for(var i=0;i<c.length;i++){
				//console.log(c[i]);
				if(!c[i].deleted){
					c_return[c_return.length] = 
						{
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
			var f_return = [];
			methods = methods?methods:[];
			for(var i=0;i<methods.length;i++){
				f_return[f_return.length] = {
					name:methods[i].name
				};
			}
			return f_return;
		}

		function addConfig(config){
			console.log('addConfig');
			console.log(config);
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

	      localStorage[storagekey] = window.JSON.stringify(getConfigsForStorage());
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
	factory('TestService', function($http,OptionService){
		var storagekey = "mxunit";
		var loaded = false;
		var testRunKey= 0;

		//recursively loads all tests in the folder.  Seperate ajax call for each folder.
		function getDirectory(config,directoryname){
			//http://nwahec.leespc.com/rest/test/RemoteFacade.cfc?method=getTestsInDirectory&directoryname=/&returnformat=json
			var serverurl = config.serverurl;
			var params = {method:'getDirectory',directoryname:directoryname,returnformat:'json'};
			var webfolder = serverurl.substring(0,serverurl.lastIndexOf('/'));
			$http({
				method:'GET',
				url:serverurl,
			    params: params,
			    dataType: 'json',
			}).
		    success(function(response) {
		    	//console.log(response);
		    	//loop through directories and recursively call this method
		    	for(var i=0;i<response.DIRECTORIES.length;i++){
		    		config[response.DIRECTORIES[i].NAME] = [];
			    	getDirectory( config, directoryname + '/' + response.DIRECTORIES[i].NAME );
		    	}
		    	//loop through files and get all tests for the file
	    		config[directoryname] = response.FILEMD;

		    	for(var i=0;i<response.FILEMD.length;i++){
		    		if(response.FILEMD[i].PATH){
			    		var newtest= {config:config,runnablemethods:[],componentName:response.FILEMD[i].PATH,componentPath:response.FILEMD[i].NAME};
			    		for(var x=0;x< response.FILEMD[i].RUNNABLEMETHODS.length;x++){
				    		var newmethod= {name:response.FILEMD[i].RUNNABLEMETHODS[x],test:newtest,config:config};
				    		newtest.runnablemethods[newtest.runnablemethods.length] = newmethod;
			    		}
			    		config.tests[config.tests.length] = newtest;
					}
			    }
		    }).
		    error(function(ErrorMsg) {
		       console.log('Error');
		    });
		}

		//recursively loads all tests in the folder.  Seperate ajax call for each folder.
		function runTestMethod(method){
			//http://nwahec.leespc.com/rest/test/RemoteFacade.cfc?method=getTestsInDirectory&directoryname=/&returnformat=json
			var serverurl = method.config.serverurl;
			var params = {method:'executetestcase',componentName:method.test.componentPath,returnformat:'json',methodnames:method.name,testRunKey:testRunKey};
			testRunKey++;
			method.result = {RESULT:"Running"};
			$http({
				method:'GET',
				url:serverurl,
			    params: params,
			    dataType: 'json',
			}).
		    success(function(response) {
		    	method.result = response[method.test.componentPath][method.name];
		    	method.test.TIME += parseFloat(method.result.TIME);
		    	method.config.TIME += parseFloat(method.result.TIME);
		    	if(method.result.RESULT != 'Passed'){
			    	method.test.RESULT= method.result.RESULT;
		    	}
		    }).
		    error(function(ErrorMsg) {
		       console.log('Error');
		    });
		}

		return {
			getDirectory:getDirectory,
			runTestMethod:runTestMethod
		};
	}).filter('directoryOpenStatusIndicator',function(){
	    return function(item) {
	    	if(item.show &&  item.show==true){
	    		return '-';
	    	}else{
	    		return '+';
	    	}
	    } 
	});