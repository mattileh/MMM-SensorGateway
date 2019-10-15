/* global Module */

/* node_helper.js
 *
 * Magic Mirror
 * Module: MMM-BackgroundSlideshow
 *
 * Magic Mirror By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 *
 * Module MMM-BackgroundSlideshow By Darick Carpenter
 * MIT Licensed.
 */

// call in the required classes
var NodeHelper = require('node_helper');
var exec = require('exec');

// the main module helper create
module.exports = NodeHelper.create({
  // subclass start method, clears the initial config array
  start: function() {
    // this to self
    var self = this;
    console.log("puukko HELPPERIN START3...");
//    console.log("puukko start ble listener server...");
    const WebSocket = require('ws');
  
    const wss = new WebSocket.Server({ port: 8001 });
//    console.log("puukko - WSS done");
  
    wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log('MovesenseController module received: %s', message);

//TODO PARSE COMMAND HERE WHETHER IT IS COMMAND OR INFO PACKAGE
      var obj = JSON.parse(message);

      if(obj.hasOwnProperty('state')){
        self.sendSocketNotification('MOVESENSE_CONTROL_PACKET',message);
      }
      else if(obj.hasOwnProperty('temperature')){
        self.sendSocketNotification('RUUVI_ENVIRONMENT_PACKET',message);
      }
      });
    });
  
//    console.log("puukko - WSS koodi ohi");
    //this.moduleConfigs = [];
  },
	checkForExecError: function(error, stdout, stderr, res, data) {
		console.log(stdout);
		console.log(stderr);
		this.sendResponse(res, error, data)
	},
	sendResponse: function(res, error, data) {
		if (error) {
			self.text = error;
		}
	},    
  // subclass socketNotificationReceived, received notification from module
  socketNotificationReceived: function(notification, payload) {
    console.log("puukkoHELPER - GENERIC NOTSKU tuli: " +notification);
    var opts = { timeout: 1000 };
		var self = this;

    if (notification === 'MOVESENSE1') {
      console.log("puukkoHELPER - MOVESENSE1 NOTSKU tuli -> lähetä takaisin MOVESENSE_CONTROL_PACKET");
      // this to self
      var text = '{ "employees" : "kakka"}'; 

      this.sendSocketNotification(
        'MOVESENSE_CONTROL_PACKET',
        text);
    }
    else if (notification === 'MOVESENSE_ON') {
      console.log("PUUKKO ON");
        exec("sudo /usr/bin/screen.sh on", opts, (error, stdout, stderr) => 
        { 
          console.log(stdout);
          console.log(stderr);
        });
    }
    else if (notification === 'MOVESENSE_OFF') {
      console.log("PUUKKO OFF");
      exec("sudo /usr/bin/screen.sh off", opts, (error, stdout, stderr) => 
        { 
          console.log(stdout);
          console.log(stderr);
        });
    }

  }
});

//------------ end -------------
