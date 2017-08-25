/*
    Project: Steam Hour Bot
    Flow Community TeamSpeak: flowcm.ddns.net
    Created by Swayer
    
    version.1.3

*/

///////////////////////////////Variables
var Steam = require('steam-user'), fs = require('fs'), readlineSync = require('readline-sync');
var client = new Steam();
var settings = require('./config.json');

//This fiels are empty, there is no logs or something else to steal your details. Only entered in the CMD.
var username = readlineSync.question("[ACCOUNT] Steam Username: ");
var password = readlineSync.question('[ACCOUNT] Steam Password: ', {hideEchoBack: true});
var mobileCode = readlineSync.question("[STEAM GUARD] Steam App Code: ");

var wstream;
var dtiming = new Date();
var tstamp = Math.floor(Date.now() / 1000);


///////////////////////////////Looping function

var forallArray = function(array) {
  for (var i = array.Length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

///////////////////////////////login process

client.logOn({
  accountName: username,
  password: password,
  twoFactorCode: mobileCode  
});

client.on("loggedOn", function() {
  client.setPersona(Steam.EPersonaState.Online);
  log("Logged on Steam Client as " + settings.username +".");    	
  client.gamesPlayed(forallArray(settings.games));
  games(settings.games);     
});


///////////////////////////////logs file

if (!fs.existsSync("./log/"))
{
	fs.mkdirSync("./log/");
	wstream = fs.createWriteStream(process.cwd() + "\\log\\" + tstamp + '.log');
}
else
{
	wstream = fs.createWriteStream(process.cwd() + "\\log\\" + tstamp + '.log');
}

//friend replys
client.on("friendMessage", function(steamID, message) {
    if (message == "hello") {
        client.chatMessage(steamID, "Hi! I'm here at the moment...");
    }
    if (message == "play") {
        client.chatMessage(steamID, "Hey! Can we play later?");
    }  
    if (message == "yes") {
        client.chatMessage(steamID, "Thank you! See you soon.");
    } 	
});


///////////////////////////////errors

client.on("error", function(err) {
  //log("[STEAM] Login Failed on Client.");    
  //log(err);
    
    if (err.eresult == Steam.EResult.InvalidPassword)
    {
        log("Login Failed, Password.");
        shutdown();
    }
    else if (err.eresult == Steam.EResult.AlreadyLoggedInElsewhere)
    {
        log("Already logged in!");
        shutdown();
    }
    else if (err.eresult == Steam.EResult.AccountLogonDenied)
    {
        log("Login Denied - SteamGuard required");
        shutdown();
    }
    
});


///////////////////////////////shutdown process

process.on('SIGINT', function() {
	log("Logging off...");
	shutdown();
});


////////////////////////////FUNCTIONS

function log(message) {
	var date = new Date();
	var time = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
	
	for(var i = 1; i < 6; i++) {
		if(time[i] < 10) {
			time[i] = '0' + time[i];
		}
	}
	
	console.log(time[0] + '-' + time[1] + '-' + time[2] + ' ' + time[3] + ':' + time[4] + ':' + time[5] + ' - [STEAM] ' + message);
}


client.on("connected", function() {
  log("Initializing Servers.");
});

function games() {
    
	if(settings.games.length < 30)
		{
            log("Initializing " + settings.games.length + " Games...");             
        
        } else {
            
            log("Exceeded the limit " + settings.games.length + " of 30 Games...");
	        log("Logging off...");           
			client.logOff();
	        shutdown();                   
        }    
}

function shutdown(code) {
	client.logOff();
	client.once('disconnected', function() {
		process.exit(code);
	});

	setTimeout(function() {
		process.exit(code);
	}, 500);
}
