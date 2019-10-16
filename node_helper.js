/* global Module */

/* node_helper.js
 *
 * Magic Mirror By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 *
 * Module MMM-SensorGateway By Matti Lehtinen
 * MIT Licensed.
 */

// call in the required classes
var NodeHelper = require('node_helper');
//TODO: change to non deprecated child_process
var exec = require('exec');

// the main module helper create
module.exports = NodeHelper.create({
  start: function () {
    var self = this;
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ port: 8001 });

    wss.on('connection', function connection(ws) {
      ws.on('message', function incoming(message) {
        //ENABLE FOR DEBUGGING PURPOSES:
//        console.log('MMM-SensorGateway node_helper - received: %s', message);
        var obj = JSON.parse(message);

        if (obj.hasOwnProperty('type')){
          if(obj.type==="movesense"){
            self.sendSocketNotification('MOVESENSE_CONTROL_PACKET', message);
          }else if(obj.type==="ruuvi"){
            self.sendSocketNotification('RUUVI_ENVIRONMENT_PACKET', message);
          }
        }
      });
    });
  },
  socketNotificationReceived: function (notification, payload) {
    //some lease for toggling on/off
    var opts = { timeout: 1000 };

    if (notification === 'SENSORGATEWAY_START') {
      console.log("MMM-SensorGateway node_helper: SENSORGATEWAY_START notification received. Module is now up&running");
    }
    else if (notification === 'MOVESENSE_ON') {
      exec("sudo /usr/bin/screen.sh on", opts, (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
      });
    }
    else if (notification === 'MOVESENSE_OFF') {
      exec("sudo /usr/bin/screen.sh off", opts, (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
      });
    }
  }
});

//------------ end -------------
