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


echo "Update system"
sudo apt-get --assume-yes update &&  sudo apt-get dist-upgrade && echo +++ upgrade successful +++

echo "Install bluetooth libraries"
sudo apt-get --assume-yes install bluetooth bluez blueman

echo "Install ruuvitag-sensor package"
sudo apt-get --assume-yes install bluez-hcidump && echo +++ install successful +++

yes | sudo pip install ruuvitag-sensor==1.1.0

echo "Install build packages and websocket python dependencies"
sudo apt-get --assume-yes install build-essential libssl-dev libffi-dev python-dev
sudo apt-get --assume-yes  install python-bluez

yes | pip install websocket==0.2.1
yes | pip install websocket-client==0.57.0

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