/*
    Iot Intel Edison Api REST Slack Integration
    by Alexandre Brandão Lustosa
    Github: https://github.com/alexandrebl
    Twitter: https://twitter.com/abrandaolustosa
    LinkedIn: https://www.linkedin.com/in/abrandaol
    E-mail: alexandre.brandao.lustosa@gmail.com
            alexandre@insidesis.com
*/

//Load mraa eletronic sensor library
var mraa = require("mraa");
//Load http request library
var request = require('request');

//Sensor variable
var tempSensor = new mraa.Aio(0);
//Led process indicator
var ledProcess = new mraa.Gpio(2);

//Initialize application
main();

//Main function
function main(){
    //Print message
    console.log("Config");
    //Setup configurations
    config();
    
    //Set loop process each 4 seconds
    setInterval(function () {
        //Set led process indicator on
        ledProcessOn();
        //Read Sensor
        var data = readTempSensor();
        //Post data on Slack
        postOnSlack(data);
        //Set led process indicator on
        ledProcessOff();
    }, 4000);
}

//Setup configuration
function config(){
    //Set pin direction
    ledProcess.dir(mraa.DIR_OUT);
}

//Read temperature sensor
function readTempSensor() {          
    //Read sensor
    var a = tempSensor.read();
    
    //Set resistênce value
    var resistance = (1023 - a) * 10000 / a;
    //Convert temperature to celsius according mraa datasheet
    var celsius_temperature = 1 / (Math.log(resistance / 10000) / 3975 + 1 / 298.15) - 273.15;
    //Convert temperature to fahrenheit
    var fahrenheit_temperature = (celsius_temperature * (9 / 5)) + 32;
    
    //Print message
    console.log("Fahrenheit Temperature: " + fahrenheit_temperature);
    //Print message
    console.log("Celcius Temperature: " + celsius_temperature);  
    
    //Set response message
    var data = formatData(fahrenheit_temperature, celsius_temperature);
    
    //Return
    return data;
}

//Set led process indicator on
function ledProcessOn(){
    //Write signal to up
    ledProcess.write(1);
}

//Set led process indicator off
function ledProcessOff(){
    //Write signal to down
    ledProcess.write(0);
}

//Format message
function formatData(fahrenheit, celsius){
    //Set message
    var msg = "Fahrenheit: " + fahrenheit.toFixed(2) + "°F / Celsius: " + celsius.toFixed(2) + "°C";
    
    //Set data
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
    };
   
    //Return
    return data;
}

//Post data on Slack  WebHoook Integration
function postOnSlack(data){
    //Set options and message
    var options = {
        //Webhook uri, replace by your uri Slack web hook integration
        uri: 'https://hooks.slack.com/services/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',
        method: 'POST', //Request type
        json: data      //Data
    };

    //Do post request
    request(options, function (error, response, body) {
        //Verify response
        if (!error && response.statusCode == 200) {
            //Print message
            console.log("Success");
        }else{
            //Print message
            console.log(error);
        }
    });
}