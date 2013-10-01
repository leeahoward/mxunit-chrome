'use strict';

/* Filters */

angular.module('mxunitfilters', []).filter('deleted', function() {
  return function(input) {
    return input.deleted ? '\u2713' : '\u2718';
  };
}).filter('statusIcon', function() {
    return function(string) {
      if(string=="Error"){
        return "icon-warning-sign";
      }
      if(string=="Passed"){
        return "icon-thumbs-up";
      }
      if(string=="Failed"){
        return "icon-thumbs-down";
      }
      if(string=="Running"){
        return "icon-refresh";
      }
      if(string=="Ok"){
        return "icon-thumbs-up";
      }
      return "icon-hand-right";
    }
}).filter('typeIcon', function() {
    return function(string) {
      if(string=="Error"){
        return "icon-thumbs-down";
      }
      if(string=="Passed"){
        return "icon-thumbs-up";
      }
      if(string=="Failed"){
        return "icon-thumbs-up";
      }
    }
}).filter('directoryOpenStatusIndicator',function(){
      return function(item) {
        if(item.show &&  item.show==true){
          return 'icon-minus';
        }else{
          return 'icon-plus';
        }
      } 
  });