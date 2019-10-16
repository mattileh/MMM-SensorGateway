#!/bin/bash
#
# Sensor gateway for BLE advertisement messages to local server
#
#

servicename="local_blegateway"
servicefile="/lib/systemd/system/$servicename.service"
destpath="/usr/share/$servicename"
servicelauncher="$destpath/local_blegatewaykickstart.sh"
servicesettingsfile="/etc/local_blegateway.cnf"
srcpath=`pwd`
repopath=$PWD

echo "Copy screen toggle script"
/bin/cp -rf $repopath/scripts/screen.sh /usr/bin/screen.sh

if [ -f "$servicefile" ]; then
    echo "Remove existing service"
    service $servicename stop
    systemctl disable $servicename
fi

sleep 2

if [ ! -d "$destpath" ]; then
    echo "Make dir $destpath"
    mkdir $destpath
fi

echo "Creating service"

if [ ! -f "$servicesettingsfile" ]; then
    # Settings file doesn't exists, write some defaults:
    echo "#
# Settings for Movesense and RuuviTag BLE advertisement message gateway to websocket inteface
#
[bluetooth]
# Raspberry's bluetooth interface
hci=0
" > $servicesettingsfile 
fi

echo "Write service file $serviceFile"
echo "[Unit]
Description=$servicename, Movesense and RuuviTag BLE advertisement message gateway to websocket interface
After=bluetooth.target

[Service]
Type=simple
Restart=always
RestartSec=15
User=pi
ExecStart=$servicelauncher

[Install]
WantedBy=default.target" > $servicefile

echo "Write launcher file $servicelauncher"

echo "#!/bin/bash

cd $repopath/gateway/
sudo /usr/bin/env python bleAdvWebSocket.py
" > $servicelauncher

sudo chmod +x $servicelauncher
echo "Enable service"
systemctl enable $servicename

echo ""
echo "If everything went well, service can be started, stoped and status checked"
echo "by normal service commands, like:"
echo "   sudo service $servicename start"
echo "   sudo service $servicename status"
echo "   sudo service $servicename stop"
echo ""
