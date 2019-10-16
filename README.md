# MMM-SensorGateway
Example to forward BLE beaconing sensors info into MagicMirror² platform

### MagicMirror² platform
* https://magicmirror.builders/

### MagicMirror² 3rd party modules
* https://github.com/MichMich/MagicMirror/wiki/3rd-party-modules

### Movesense
* www.movesense.com
* https://bitbucket.org/suunto/movesense-device-lib

### Ruuvi
* https://ruuvi.com/

### Example UI of module installed

![Example UI](/documentation/exampleui.png)

* RuuviTag(s) information is routed to MagicMirror platform.
* Movesense tag is used as a control platform for demo purposes.
  * Doubletapping the configured Movesense switches off (and back on) the MM2 screen
  * Example firmwares can be found from firmwares folder (for own implementation see beaconing examples in : https://bitbucket.org/suunto/movesense-device-lib/src/master/samples/custom_bleadv_app/) 
  

# Installation guide

Out of scope :
* install python library for RuuviTag (see : https://github.com/ttu/ruuvitag-sensor/blob/master/install_guide_pi.md ) and tags can be seen (verify with `ruuvitag -f` section of instructions)
  *  Python 2.7 tested on this project scope. 
* Verify that RasPi has Bluetooth up&running in hci0:

`hcitool dev` should print out something similar `Devices: hci0    B8:27:EB:A8:03:11`

### clone 
* Clone MMM-SensorGateway under modules in the MM2 platform as all 3rd party modules

### install script
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

* Gateway and MM2 modules uses TCP port 8001 for communicating (check if another software is using this)
* Gateway can be changed to route beacons to local network (for example debugging from PC). See def _main(argv): in bleAdvWebSocket.py
* Run gateway manually go to gateway folder and `sudo python bleAdvWebSocket.py`
