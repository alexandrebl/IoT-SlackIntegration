var mraa = require("mraa");
var request = require('request');

var tempSensor = new mraa.Aio(0);
var ledProcess = new mraa.Gpio(2);

main();

function main(){
    console.log("Config");
    config();
    
    setInterval(function () {
        ledProcessOn();
        startSensorWatch();
        ledProcessOff();
    }, 4000);
}

function config(){
    ledProcess.dir(mraa.DIR_OUT);
}

function startSensorWatch() {          
    var a = tempSensor.read();
    console.log("Analog Pin (A0) Output: " + a);

    var resistance = (1023 - a) * 10000 / a; //get the resistance of the sensor;
    var celsius_temperature = 1 / (Math.log(resistance / 10000) / 3975 + 1 / 298.15) - 273.15;//convert to temperature via datasheet ;
    var fahrenheit_temperature = (celsius_temperature * (9 / 5)) + 32;
    console.log("Fahrenheit Temperature: " + fahrenheit_temperature);
    console.log("Celcius Temperature: " + celsius_temperature);  
    
    var data = getdata(fahrenheit_temperature, celsius_temperature);
    
    postOnSlack(data);
}

function ledProcessOn(){
    ledProcess.write(1);
}

function ledProcessOff(){
    ledProcess.write(0);
}

function getdata(fahrenheit, celsius){
    var msg = "Fahrenheit: " + fahrenheit.toFixed(2) + "°F / Celsius: " + celsius.toFixed(2) + "°C";
    var data = {
        "text": "Actual local temperature:",
        "attachments": [
            {
                "color": "#0066ff",
                "text": msg,
                "footer": "Slack API IoT Integration with Intel Edison",
                "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
            }
        ]
   }
   
   return data;
}

function postOnSlack(data){
    var options = {
        uri: 'https://hooks.slack.com/services/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',
        method: 'POST',
        json: data
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Success")
        }else{
            console.log("Error status code: " + response.statusCode);
            console.log("Error: " + error);
        }
    });
}