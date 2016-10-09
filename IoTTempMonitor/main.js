var B = 3975;
var mraa = require("mraa");

var tempSensor = new mraa.Aio(0);

function startSensorWatch(socket) {
    'use strict';
    setInterval(function () {
        var a = myAnalogPin.read();
        console.log("Analog Pin (A0) Output: " + a);
                
        var resistance = (1023 - a) * 10000 / a; //get the resistance of the sensor;
        //console.log("Resistance: "+resistance);
        var celsius_temperature = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;//convert to temperature via datasheet ;
        //console.log("Celsius Temperature "+celsius_temperature); 
        var fahrenheit_temperature = (celsius_temperature * (9 / 5)) + 32;
        console.log("Fahrenheit Temperature: " + fahrenheit_temperature);
        console.log("Celcius Temperature: " + celsius_temperature);
    }, 4000);
}

startSensorWatch();