/* global Module */

/* Magic Mirror
 * Module: MMM-SensorGateway
 *
 * By Matti Lehtinen
 * MIT Licensed.
 */
Module.register("MMM-SensorGateway", {
	// Override start method.
	start: function () {
		if (this.config.envsensors.length > 0) {
			this.envsensors = new Array({
				MAC: this.config.envsensors[0].MAC, location: this.config.envsensors[0].location,
				pressure: NaN, temperature: NaN, humidity: NaN
			});

			for (var i = 1; i < this.config.envsensors.length; i++) {
				this.envsensors.push({
					MAC: this.config.envsensors[i].MAC, location: this.config.envsensors[i].location, temperature: this.config.envsensors[i].temperature,
					pressure: NaN, temperature: NaN, humidity: NaN
				});
			}
		}

		this.gLocationText = "No data"
		this.gState = 1,
			this.gTemp = NaN,
			this.gPressure = NaN,
			this.gHumidity = NaN
	},
	// Define required translations.
	getTranslations: function () {
		return {
			en: "translations/en.json",
			fi: "translations/fi.json",
			sv: "translations/sv.json",
		};
	},
	sendInitNotification: function () {
		//From module developer documentation:
		//https://github.com/MichMich/MagicMirror/tree/develop/modules
		//Note 2: The socket connection is established as soon as the module sends its first message using sendSocketNotification.
		this.sendSocketNotification("SENSORGATEWAY_START", {});
	},
	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");

		wrapper.className = "thin small bright pre-line";

		var places = document.createElement('table');
		places.className = 'small';
		var title = document.createElement('header');
		title.innerHTML = this.translate("HOME");
		title.className = 'bold medium bright';

		wrapper.appendChild(title);

		var TR_element = document.createElement('tr');

		var locationIcon = document.createElement('th');
		locationIcon.innerHTML = this.translate("LOCATION");

		var team_logo_image = document.createElement('img');
		team_logo_image.src = "modules/MMM-SensorGateway/images/home.png";
		team_logo_image.width = 40;
		team_logo_image.height = 40;
		locationIcon.appendChild(team_logo_image);
		TR_element.appendChild(locationIcon);

		var temperatureIcon = document.createElement('th');
		temperatureIcon.innerHTML = this.translate("TEMPERATURE");

		var logoimage2 = document.createElement('img');
		logoimage2.src = "modules/MMM-SensorGateway/images/temperature.png";
		logoimage2.width = 40;
		logoimage2.height = 40;
		temperatureIcon.appendChild(logoimage2);
		TR_element.appendChild(temperatureIcon);

		var pressureIcon = document.createElement('th');
		pressureIcon.innerHTML = this.translate("AIR_PRESSURE");

		var image3 = document.createElement('img');
		image3.src = "modules/MMM-SensorGateway/images/pressure.png";
		image3.width = 40;
		image3.height = 40;
		pressureIcon.appendChild(image3);
		TR_element.appendChild(pressureIcon);

		var humidityIcon = document.createElement('th');
		humidityIcon.innerHTML = this.translate("HUMIDITY");

		var image4 = document.createElement('img');
		image4.src = "modules/MMM-SensorGateway/images/humidity.png";
		image4.width = 40;
		image4.height = 40;
		humidityIcon.appendChild(image4);
		TR_element.appendChild(humidityIcon);

		places.appendChild(TR_element);

		for (var i = 0; i < this.envsensors.length; i++) {
			var valueRow = document.createElement('tr');
			var tmpLocation = document.createElement('td');
			tmpLocation.innerHTML = this.envsensors[i].location;
			valueRow.appendChild(tmpLocation);

			var valTemperature2 = document.createElement('td');
			valTemperature2.innerHTML = this.envsensors[i].temperature + " C";

			var degreeLabel = "°";

			if (config.units === "metric") {
				console.log("PUUKKO METRIC");
				valTemperature2.innerHTML = this.envsensors[i].temperature + degreeLabel + " C";
			} else {
				if (this.envsensors[i].temperature != NaN) {
					var farenheit = this.envsensors[i].temperature * 9 / 5 + 32;
					valTemperature2.innerHTML = farenheit.toFixed(2) + degreeLabel + " F";
				} else {
					valTemperature2.innerHTML = this.envsensors[i].temperature + "F";
				}
			}

			valueRow.appendChild(valTemperature2);

			var valPressure2 = document.createElement('td');
			valPressure2.innerHTML = this.envsensors[i].pressure + " hPa";
			valueRow.appendChild(valPressure2);

			var valHumidity2 = document.createElement('td');
			valHumidity2.innerHTML = this.envsensors[i].humidity + " %";
			valueRow.appendChild(valHumidity2);

			places.appendChild(valueRow);
			//			Log.log(this.envsensors[i].location + ' adding location');
		}

		wrapper.appendChild(places);

		return wrapper;
	},
	// Override socket notification handler.
	notificationReceived: function (notification, payload, sender) {
		if (notification == 'MODULE_DOM_CREATED') {
			//we are ready to receive sensor data
			this.sendInitNotification();
		}
	},

	// Override socket notification handler.
	socketNotificationReceived: function (notification, payload) {
		var obj = JSON.parse(payload);

		var self = this;
		if (notification === 'MOVESENSE_CONTROL_PACKET') {
			if (this.config.controlsensor.MAC === obj.MAC) {
				if (obj.state === 1) {
					if (self.gState != 1) {
						self.gState = 1;
						this.sendSocketNotification("MOVESENSE_ON", {});
					}
				}
				else if (obj.state === 2) {
					if (self.gState != 2) {
						self.gState = 2;
						this.sendSocketNotification("MOVESENSE_OFF", {});
					}
				}
			}
		} //control package
		else if (notification === 'RUUVI_ENVIRONMENT_PACKET') {
			console.log("puukko - RUUVI_ENVIRONMENT_PACKET!" + obj);
			for (var i = 0; i < this.envsensors.length; i++) {
				var sensor = this.envsensors[i];
				if (sensor.MAC === obj.MAC) {
					sensor.temperature = obj.temperature;
					sensor.pressure = obj.pressure;
					sensor.humidity = obj.humidity;
					self.updateDom();
				}
			}
		}

	}, //function
});
