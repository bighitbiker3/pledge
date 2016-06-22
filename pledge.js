'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

var $Promise = function(){
  this.state = 'pending';
  this.value = null;
  this.handlerGroups = []
};

var Deferral = function(){
  this.$promise = new $Promise();
};

var defer = function(){
  return new Deferral();
};

Deferral.prototype.resolve = function(data){
  if(this.$promise.state !== 'pending'){
    return;
  } else {
    this.$promise.value = data;
    this.$promise.state = 'resolved';

    if (this.$promise.handlerGroups.length > 0) {
      this.$promise.then();
    }
  }



};
Deferral.prototype.reject = function(reason){
  if(this.$promise.state !== 'pending'){
    return;
  } else {
    this.$promise.state = 'rejected';
    this.$promise.value = reason;
    if (this.$promise.handlerGroups.length > 0) {
      this.$promise.then();
    }
  }
};

$Promise.prototype.then = function( success, error) {
    var cbObj = {};
    cbObj.forwarder = new Deferral();
    if (success || error) {

        if ( success instanceof Function) {
          cbObj.successCb = success;
        }
        if (error instanceof Function) {
          cbObj.errorCb = error;
        }
    }
    this.handlerGroups.push(cbObj);

    if (this.state !== 'pending') {
      this.callHandlers();
    }

    if (success !== null && !(error instanceof Function)) {
       return cbObj.forwarder.$promise;
     }

  };

$Promise.prototype.callHandlers = function() {

  if (this.state === 'resolved') {
    while (this.handlerGroups.length > 0) {
      // if handler has success CB
      if (this.handlerGroups[0].successCb) {
        var returnVal = this.handlerGroups[0].successCb(this.value);
        if (!(returnVal instanceof $Promise)) {
          this.handlerGroups[0].forwarder.$promise.value = returnVal;
          this.handlerGroups[0].forwarder.$promise.state = this.state;
        }

      }

      // if handler does not have success cb -- bubble down
      else if (!this.handlerGroups[0].successCb) {
        this.handlerGroups[0].forwarder.$promise.value = this.value;
        this.handlerGroups[0].forwarder.$promise.state = this.state;
      }

      this.handlerGroups.shift();

    }
  }
  else if(this.state === 'rejected'){
    while (this.handlerGroups.length > 0) {
      if(this.handlerGroups[0].errorCb) {
        var returnErr = this.handlerGroups[0].errorCb(this.value);
        console.log(this.handlerGroups[0]);
        if (!(returnErr instanceof $Promise)) {
          this.handlerGroups[0].forwarder.$promise.value = returnErr;
          this.handlerGroups[0].forwarder.$promise.state = 'resolved';
        }

      }

      // avoid infinite loop for handlers that don't have error cb
      else if (!this.handlerGroups[0].errorCb){
        this.handlerGroups[0].forwarder.$promise.value = this.value;
        this.handlerGroups[0].forwarder.$promise.state = this.state;
      }

      this.handlerGroups.shift();

    }
  }
};

$Promise.prototype.catch = function(errorFn){
  this.then(null, errorFn);
};


/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
