import os
import sys
import time
import datetime
import argparse
import ConfigParser
import io
import json
from bleAdvScanner import bleAdvScanner
import uuid
import base64
import struct
import websocket
import thread
import array
from binascii import hexlify
from ruuvitag_sensor.ruuvi import RuuviTagSensor

from threading import Thread

client = None
target = None

# function handles ruuvi beacons
def handle_data(found_data):
#    print('MAC ' + found_data[0])
    print(found_data[1])
    payload = {"type":"ruuvi", "MAC": found_data[0], "temperature": found_data[1]["temperature"], "pressure": found_data[1]["pressure"], "humidity": found_data[1]["humidity"]}
    ws.send(json.dumps(payload))

def _to_int(string):
    """Convert a one element byte string to int for python 2 support."""
    if isinstance(string, str):
        return ord(string[0])
    else:
        return string

def _bt_addr_to_string(addr):
        """Convert a binary string to the hex representation."""
        addr_str = array.array('B', addr)
        addr_str.reverse()
        hex_str = hexlify(addr_str.tostring()).decode('ascii').upper()
        # insert ":" seperator between the bytes
        #return ':'.join(a+b for a, b in zip(hex_str[::2], hex_str[1::2]))
        hex_str = ':'.join(a+b for a, b in zip(hex_str[::2], hex_str[1::2]))
        return hex_str.encode("ascii")

# function handles Movesense beacons with MMM magic
def callback(raw):
	global ws
	bt_addr = _bt_addr_to_string(raw[7:13])
	temperature = _to_int(raw[38])
	paketti = _to_int(raw[40])
	battery = _to_int(raw[41])
	state = _to_int(raw[42])
	payload = {"type":"movesense", "MAC": bt_addr, "packet": paketti, "battery":battery, "state": state,"temp": temperature}
	print(payload)
	ws.send(json.dumps(payload))

def on_message(ws, message):
    print message

def on_error(ws, error):
    print error
    print "### ERROR:Check if server is on ###"

def on_close(ws):
    print "### WebSocket closed ###"

def runRuuviTag():
    RuuviTagSensor.get_datas(handle_data)

def on_open(ws):

    def run(*args):
        parser = argparse.ArgumentParser()
        parser.add_argument('-f', '--settingsFile', default='/etc/local_blegateway.cnf',
                            help='Settings file (overrides all other parameters)')
        args = parser.parse_args()

        if args.settingsFile and os.path.exists(args.settingsFile):
            with open(args.settingsFile) as f:
                setf = f.read()
                config = ConfigParser.RawConfigParser(allow_no_value=True)
                config.readfp(io.BytesIO(setf))
        else:
            print ('Cannot read settings from "%s"' % args.settingsFile)
            return

        bthci = config.get('bluetooth', 'hci')
        print "PUUKKO start scanner"
        scanner = bleAdvScanner(callback, bt_device_id=int(bthci))
        scanner.start()

        # Run forever
        while (1):
            time.sleep(60)
            print ("I'm alive")
        #        ws.close()
        print ("run returning..")

    thread.start_new_thread(run, ())
    thread.start_new_thread(runRuuviTag, ())

def _main(argv):
    global ws
    websocket.enableTrace(False)

# use ip address in local network for debugging purposes
#    hostname = "ws://192.168.10.63:8001/"
# rasperry pi modules running on localhost:
    hostname = "ws://localhost:8001/"
    print("puukko - hostname: " +hostname)
    ws = websocket.WebSocketApp(hostname,
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)

    ws.on_open = on_open
    ws.run_forever()


if __name__ == '__main__':
    _main(sys.argv[1:])

