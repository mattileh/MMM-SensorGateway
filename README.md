# MMM-SensorGateway
Example to forward BLE beaconing sensors info into MagicMirror² platform.
This module enables taking a shortcut for having live sensor data in your mirror, without touching the Pi hardware.

### MagicMirror² platform
* https://magicmirror.builders/

### MagicMirror² 3rd party modules
* https://github.com/MichMich/MagicMirror/wiki/3rd-party-modules

### Movesense
* www.movesense.com

### Ruuvi
* https://ruuvi.com/

### Example UI of module installed

![Example UI](/documentation/exampleui.png)

* RuuviTag(s) environment information is routed to MagicMirror platform.
* (optional) Movesense tag is used as a control platform / poor man's power switch for demo purposes
  * Doubletapping the configured Movesense switches off (and back on) the MM2 screen
  * Firmwares for above mentioned demo can be found from `firmwares` folder (for own implementation see beaconing examples in : https://bitbucket.org/suunto/movesense-device-lib/src/master/samples/custom_bleadv_app/) 
  

# Installation guide

Out of scope :
* Install python library for RuuviTag (see : https://github.com/ttu/ruuvitag-sensor/blob/master/install_guide_pi.md ) and tags can be seen (verify with `ruuvitag -f` section of instructions)
  * Python 2.7 tested on this project scope.
  * (current) Data Format 3 Protocol Specification (RAWv1) supported
* Updating Movesense firmware (Movesense has a sample app that can do the FOTA update)  
* Finding out the MAC addresses of the beacons (you can use forexample NRFConnect or the mobile application provided by Movesense and Ruuvi)
* Verify that RasPi has Bluetooth up&running in hci0:

`hcitool dev` should print out something similar `Devices: hci0    B8:27:EB:A8:03:11`

### Clone and configure module 
* Clone MMM-SensorGateway under modules in the MM2 platform as all 3rd party modules
* Configuration (into config/config.js) :

```
		{
			module: "MMM-SensorGateway",
			position: "bottom_bar",
			config: {
					controlsensor:
					{
						type: "movesense",
						MAC: "01:11:12:C2:18:04"
					},
					envsensors: [
						{
							type: "ruuvi",
							location: "Living room2",
							MAC: "FE:11:11:1C:11:11"
						},
						{
							type: "ruuvi",
							location: "Bedroom",
							MAC: "D3:21:CC:34:DF:95"
						},
						{
							type: "ruuvi",
							location: "Balcony",
							MAC: "CE:90:63:D7:33:60"
						}
					]
			}
 }
```
please note all MAC ADDRESSES are in UPPERCASE
`controlsensor` is optional configuration block
* run `npm install` in module's directory to install websocket and exec modules.

### Install script for Gateway
* run install script with root priviledges : `MagicMirror/modules/MMM-SensorGateway $ sudo ./install.sh`
  * This will setup an service that will kick in during RasPi boot-up
* Expected output

```
Remove existing service
Removed /etc/systemd/system/default.target.wants/local_blegateway.service.
Creating service
Write service file
Write launcher file /usr/share/local_blegateway/local_blegatewaykickstart.sh
Enable service
Created symlink /etc/systemd/system/default.target.wants/local_blegateway.service → /lib/systemd/system/local_blegateway.service.

If everything went well, service can be started, stoped and status checked
by normal service commands, like:
   sudo service local_blegateway start
   sudo service local_blegateway status
   sudo service local_blegateway stop
```

* Start service (or reboot Pi) : `sudo service local_blegateway start`
  * (optional) verify that service is running:

```
sudo service local_blegateway status

--> you should expect seeing the packets routed:

Oct 16 19:45:40 raspberrypi local_blegatewaykickstart.sh[962]: {'temp': 22, 'battery': 0, 'state': 1, 'packet': 189, 'MAC': '0A:1C:1C:12:18:04', 'type': 'movesense'}
Oct 16 19:45:40 raspberrypi local_blegatewaykickstart.sh[962]: {'acceleration': 1003.0807544759296, 'pressure': 1008.86, 'temperature': 20.17, 'acceleration_y': -9, 'acceleration_x': -9, 'battery': 3043, 'acceleration_z': 1003, 'data_for
```

# Troubleshooting

* Gateway and MM2 module uses TCP port 8001 for communicating (check if another software is using this)
* Gateway can be changed to route beacons to local network (for example debugging from PC). See def _main(argv): in bleAdvWebSocket.py
* Run gateway manually go to gateway folder and `sudo python bleAdvWebSocket.py`
* Check that MAC ADDRESSES are in UPPERCASE in configuration
* RuuviTags are broadcasting with Data Format 3 Protocol Specification (RAWv1)

# Special thanks

* Gateway is reusing https://bitbucket.org/suunto/movesense-raspi-gateway/src/master/src/ which is based on examples took from beacontools by Citruz. https://github.com/citruz/beacontools and for Ruuvi the above mentioned `ruuvitag-sensor` python library, which was super easy to take in use, is utilized.

