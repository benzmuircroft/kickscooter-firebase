
'use strict';


const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();//functions.config().firebase);

var WebSocketClient = require('websocket').client;

//const language = require('@google-cloud/language');
//const client = new language.LanguageServiceClient();
const express = require('express');
const app = express();
const config = express();

const request = require('request');


const COMODULE_BASE_URL = "https://api.comodule.com/externalsharingmoduleapi/v2/module/";
const COMODULE_API_KEY = "fbd3djb0v8sf9665h52gbu97ll";

const EMULATOR_BOX_ID = "emul_labbox_poc_01";

var headersOpt = {  
    "content-type": "application/json",
};

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//


const VULOG_API_CLIENT_SECRET = '697c7fd9-5075-4924-9fee-f6ec36fa6509';
const VULOG_API_CLIENT_ID = 'LABBOX-POC_secure';
const VULOG_API_CLIENT_KEY= '5da5d077-aa01-48b9-aaa5-b383c5cef317';


var bodyParser = require('body-parser');
app.use(bodyParser.json());


app.post('/login',  (req, res) => {

	let email = 'spaltrie@vulog.com';
	let uid = 'a8DFs5K3vcRRoCQB6GSFA11Mim32';

	console.log('Request', req.body);  	

	vulog_api_login(uid, email, 'Azerty123!', 
		(body) => {
		   res.send('You are logged in!');		
		}, 
		(error, statusCode, body) => {
		   res.status(403).send('Unable to Login :(');					
		});
 });

const vulog_api_login = (uid, username, password, next, failure) => {
	let url = 'https://demo-java-api.vulog.com:484/auth/realms/LABBOX-POC/protocol/openid-connect/token';
	let formParams = {
		'client_secret': VULOG_API_CLIENT_SECRET,
		'client_id': VULOG_API_CLIENT_ID,
		'grant_type':'password',
		'username': username,
		'password': password
	};
	let headersOpt = {  
	   'Content-Type': 'application/x-www-form-urlencoded',
	   	};

	generic_request('post', url, headersOpt, null, formParams, true, 
		(body) => {
		  	console.log('UID ==> ', uid);
		  	let myUser = admin.database().ref('/users/' + uid); 
		  	//console.log('body ==> ', body.access_token);
		  	myUser.update({'token': body.access_token})
			next(body);
		}, 
		failure);

}

app.post('/book/:id',  (req, res) => {

	let vehicleId = req.params.id;// 'bb6b398b-b8b8-410d-87c1-50e82e695f7f';
	let userId = 'a8DFs5K3vcRRoCQB6GSFA11Mim32';

	admin.database().ref('/users/' + userId).once('value', function (snapshot) {
		let myUser = snapshot.val();
		//console.log('user =>', myUser);
		//console.log('myUser.token =>', myUser.email);

		vulog_api_book_vehicle(userId, vehicleId, myUser.token, 
			(body) => {
			   res.send('You have booked your vehicle!');		
			}, 
			(error, statusCode, body) => {
			   res.status(403).send('Unable to book your vehicle :(');					
			}
		);
	});

});

app.post('/cancelBooking/:id',  (req, res) => {

	let bookingId = req.params.id;;
	let userId = 'a8DFs5K3vcRRoCQB6GSFA11Mim32';

	admin.database().ref('/users/' + userId).once('value', function (snapshot) {
		let myUser = snapshot.val();
		console.log('user =>', myUser);
		console.log('myUser.token =>', myUser.email);

		vulog_api_cancel_booking(userId, bookingId, myUser.token, 
			(body) => {
			   res.send('You trip has been cancelled!');		
			}, 
			(error, statusCode, body) => {
			   res.status(403).send('Unable to cancel your trip :(');					
			}
		);
	});

});

app.post('/startJourney/:id',  (req, res) => {

	let bookingId = req.params.id;;
	let userId = 'a8DFs5K3vcRRoCQB6GSFA11Mim32';

	admin.database().ref('/users/' + userId).once('value', function (snapshot) {
		let myUser = snapshot.val();
		console.log('user =>', myUser);
		console.log('myUser.token =>', myUser.email);

		vulog_api_start_journey(userId, bookingId, myUser.token, 
			(body) => {
			   res.send('You trip has started!');		
			}, 
			(error, statusCode, body) => {
			   res.status(403).send('Unable to start your trip :(');					
			}
		);
	});

});

app.post('/endJourney/:id',  (req, res) => {

	let bookingId = req.params.id;;
	let userId = 'a8DFs5K3vcRRoCQB6GSFA11Mim32';

	admin.database().ref('/users/' + userId).once('value', function (snapshot) {
		let myUser = snapshot.val();
		console.log('user =>', myUser);
		console.log('myUser.token =>', myUser.email);

		vulog_api_end_journey(userId, bookingId, myUser.token, 
			(body) => {
			   res.send('You trip has ended!');		
			}, 
			(error, statusCode, body) => {
			   res.status(403).send('Unable to end your trip :(');					
			}
		);
	});

});


const vulog_api_book_vehicle = (userId, vehicleId, userToken, next, failure) => {


	let url = 'https://demo-java-api.vulog.com/apiv3/vehicles/'+ vehicleId + '/journey';
	let opt = {
		'url': url, 
		'method': 'post',
		'userId': userId, 
		'userToken': userToken, 
		'bookStatus': true, 
		'bookStartedStatus': false
	}
	vulog_api_journey_ongoing(opt, next, failure);

}


const vulog_api_start_journey = (userId, bookingId, userToken, next, failure) => {


	let url = 'https://demo-java-api.vulog.com/apiv3/journeys/'+ bookingId + '/trip'
	let opt = {
		'url': url, 
		'method': 'post',
		'userId': userId, 
		'userToken': userToken, 
		'bookStatus': true, 
		'bookStartedStatus': true
	}

	vulog_api_journey_ongoing(opt, next, failure);

}

const vulog_api_cancel_booking = (userId, bookingId, userToken, next, failure) => {


	let url = 'https://demo-java-api.vulog.com/apiv3/journeys/'+ bookingId + '/booking'
	let opt = {
		'userId': userId, 
		'url': url, 
		'bookingId': bookingId, 
		'userToken': userToken
	};
	vulog_api_journey_terminate(opt, next, failure);

}

const vulog_api_end_journey = (userId, bookingId, userToken, next, failure) => {


	let url = 'https://demo-java-api.vulog.com/apiv3/journeys/'+ bookingId + '/trip';
	let opt = {
		'userId': userId, 
		'url': url, 
		'bookingId': bookingId, 
		'userToken': userToken
	};
	vulog_api_journey_terminate(opt, next, failure);


}

const vulog_api_journey_terminate = (opt, next, failure) => {

	let headersOpt = {  
	   'Content-Type': 'application/json',
	   'x-api-key': VULOG_API_CLIENT_KEY,
		'Authorization': 'Bearer ' + opt.userToken
	};

	generic_request('delete', opt.url, headersOpt, {}, {}, true, 
		(body) => {
			admin.database().ref().child('vehicles').orderByChild('vulogBookingId').equalTo(opt.bookingId).once("value", function(snapshot) {
				snapshot.forEach(function(vehicleSnap) {
					//console.log('vehicle =>', vehicleSnap.val());
					let vehicleIotId = vehicleSnap.val().id;
					//console.log('vehicleIotId =>', vehicleIotId);
					let vehicle = admin.database().ref('/vehicles/' + vehicleIotId);
					vehicle.update({'booked': false, 'vulogBookingId': null, 'bookingSarted': false});
			   });

			});

			admin.database().ref('/users/' + opt.userId).update({'vulogVehicleId': null, 'vulogBookingId': null});
		}, 
		failure);

}

const	vulog_api_journey_ongoing = (opt, next, failure) => {
	let headersOpt = {  
	   'Content-Type': 'application/json',
	   'x-api-key': VULOG_API_CLIENT_KEY,
		'Authorization': 'Bearer ' + opt.userToken
	};

	generic_request(opt.method, opt.url, headersOpt, {}, {}, true, 
		(body) => {
			let bookingId = body.id;
			let vehicleId = body.vehicleId;

			admin.database().ref().child('vehicles').orderByChild('vulogId').equalTo(vehicleId).once("value", function(snapshot) {
				snapshot.forEach(function(vehicleSnap) {
					//console.log('vehicle =>', vehicleSnap.val());
					let vehicleIotId = vehicleSnap.val().id;
					//console.log('vehicleIotId =>', vehicleIotId);
					let vehicle = admin.database().ref('/vehicles/' + vehicleIotId);
					vehicle.update({'booked': opt.bookStatus, 'vulogBookingId': bookingId, 'bookingSarted': opt.bookStartedStatus});
			   });

			});

			admin.database().ref('/users/' + opt.userId).update({'vulogVehicleId': vehicleId, 'vulogBookingId': bookingId});
		}, 
		failure);

}

const generic_request = (method, url, headersOpt, body, form, jsonFlag, next, failure) => {
	request(
   {
   	method: method,
		url: url, 
		headers: headersOpt,
		body: body,
		form: form,
     json: true
    }, function (error, response, body) {  
		if (!error && response.statusCode == 200) {
		  	//console.log('UID ==> ', uid);
		  	//let myUser = admin.database().ref('/users/' + uid).val(); 
		  	//console.log('body ==> ', body.access_token);
		  	//myUser.update({'token': body.access_token})
			next(body);
		}
		else {
			console.log('statusCode =>', response.statusCode);
			console.log('Error =>', error);
			//console.log('Body Error =>', body);
			failure(error, response.statusCode, body);
		}
		return;
  });
	return;
}

app.get('/helloWorld',  (req, res) => {
  res.send("Hello from Firebase Yo Man!");
 });

app.post('/synthesisHook',  (req, res) => {
  handleSynthesis(req.body, false);
  res.send("Post success from Firebase!");
 });

app.get('/refresh/:id',  (req, res) => {
  let iotId = req.params.id;
  res.send(`Refresh IoT => ${iotId}`);
  handleRefreshIoT(iotId);

 });

app.get('/startIoT/:id',  (req, res) => {
  	let iotId = req.params.id;
  	validateFirebaseIdToken(req, res, () => {
		console.log(`Auth user for Start => `, req.user);
		res.send(`Starting IoT => ${iotId}`);
		handleVehiclePower(iotId, req.user, true);
  	});
});

app.get('/stopIoT/:id',  (req, res) => {
  	let iotId = req.params.id;
  	validateFirebaseIdToken(req, res, () => {
		console.log(`Auth user for Stop => `, req.user);
		res.send(`Starting IoT => ${iotId}`);
		handleVehiclePower(iotId, req.user, false);
  	});
});

config.post('/vehicles',  (req, res) => {
  handleConfigVehicles(req, res);
  res.send("Config vehicles success!");
 });


// Expose the API as a function
exports.api = functions.region('europe-west1').https.onRequest(app);
exports.config = functions.region('europe-west1').https.onRequest(config);

function handleSynthesis(jsonData, simulateVuboxMsg) {
  let jsonDataStr = JSON.stringify(jsonData);
  console.log(`handleSynthesis => ${jsonDataStr}`);
  let db = admin.database();
  let synthesis = db.ref("/synthesis"); // Generate an ID for each synthesis using push
  synthesis.push(jsonData);
  let iots = db.ref("/iots/"+jsonData.id); // IoT Id will be used here, we use set
  iots.set(jsonData);
  
  if (simulateVuboxMsg) {
	  //let boxId = jsonData.id; ==> do not use the COMODULE Box Id
	  let boxData = new BoxData(EMULATOR_BOX_ID, jsonData.vehiclePowerOn, true, true, jsonData.gpsLongitude, jsonData.gpsLatitude);
	  sendWebSocketMsg(boxData);
  }


}

function sendWebSocketMsg(boxData) {
  let wsClient = new WebSocketClient();

  let boxDataStr = JSON.stringify(boxData);
  //console.log(`Websocket BoxData to send => ${boxDataStr}`);

  wsClient.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
  });
 

  wsClient.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
      console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        console.log("Received: '" + message.utf8Data + "'");
      }
    });

	//console.log(`Creating updateBoxMessage(boxData)`);
    let msg = updateBoxMessage(boxData);
	console.log(`Sending WebSocket Message => ${msg}`);
    connection.send(msg);
    connection.close();
    
  });
 
  //console.log(`wsClient Connect Start`);

  let wsToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImxhYmJveF9wb2MiLCJ0Y3BfaG9zdCI6IjU0LjM2LjE1NS4xOTgiLCJ0Y3BfcG9ydCI6ODAwOCwiaHR0cF9ob3N0IjoiNTQuMzYuMTU1LjE5OCIsImh0dHBfcG9ydCI6ODA4MiwiZXhwZXJ0Ijp0cnVlLCJyb2xlIjoiVVNFUiIsImlhdCI6MTUzODY0NjU2NH0.mKSCksjNcW43mWHB-a_8lD0j7CKanhZDQog9BBJS0Cw";

  //console.log(`Token => ${wsToken}`);
  wsClient.connect('ws://emulator.vulog.center:8081/box?token='+ wsToken);//, 'echo-protocol');


}
function handleConfigVehicles(req, res) {
  let jsonData = req.body;
  let jsonDataStr = JSON.stringify(jsonData);
  console.log(`handleConfigVehicles => ${jsonDataStr}`);
  let vehicles = admin.database().ref("/vehicles");
  vehicles.set(jsonData);
}

function updateBoxMessage(boxData) {
  //console.log(`updateBoxMessage => ${EMULATOR_BOX_ID}`);
	let boxMessage = new BoxMessage(EMULATOR_BOX_ID,
	    "live",
	    "update",
	    boxData);
	let boxMessageStr = JSON.stringify(boxMessage);
	//console.log(`Sending boxMessage => ${boxMessageStr}`);
    
	return JSON.stringify(boxMessage);
}

function handleVehiclePower(iotId, user, powerState) {
  let url = COMODULE_BASE_URL + iotId + "/vehiclePowerOn" + "?apiKey=" + COMODULE_API_KEY;
  console.log("COMODULE POWER URL= " + url);
  let vehicle = admin.database().ref("/vehicles/" + iotId);
  console.log("handleVehiclePower -> Vehicle = ", vehicle);
  if (powerState) {
		vehicle.update({"booked": true, "bookedByName": user.name, "bookedByEmail":user.email, "bookedByUid": user.uid});
  }
  else {
		vehicle.update({"booked": false, "bookedByName": null, "bookedByEmail": null, "bookedByUid": null});
  }
  
  request.post(
        {
        url: url, 
        body: {value: powerState}, 
        headers: headersOpt,
        json: true
    }, function (error, response, body) {  
        //Print the Response
        console.log(body);  	
        if (!error && response.statusCode == 200) {
	        //console.log("Parsing the body");  	
		    //var jsonData = JSON.parse(body);
		    var jsonData = body;
	        //console.log("jsonData = " + jsonData);  	
	        handleSynthesis(jsonData, true);
		}

  });

}

function handleRefreshIoT(iotId) {
  let url = COMODULE_BASE_URL + iotId + "?apiKey=" + COMODULE_API_KEY;
  //console.log("COMODULE REFRESH URL= " + url)
  request.get(
        {
        url: url, 
        headers: headersOpt,
        json: true,
    }, function (error, response, body) {  
        //Print the Response
        console.log(body);  	
        if (!error && response.statusCode == 200) {
	        //console.log("Parsing the body");  	
		    //var jsonData = JSON.parse(body);
		    var jsonData = body;
	        //console.log("jsonData = " + jsonData);  	
	        handleSynthesis(jsonData, true);
		}

  });

}

class BoxData {
    constructor(boxId, inCharge, doorLocked, doorClosed, longitude, latitude) {
        this.box_id = boxId;
	    this.in_charge = inCharge;
    	this.doorLocked = doorLocked;
    	this.doorClosed = doorClosed;
    	this.longitude = longitude;
    	this.latitude = latitude;
    }
}

class BoxMessage {
    constructor(boxId, type, name, data) {
        this.box_id = boxId;
        this.type = type;
        this.name = name;
        //this.token = token;
        this.data = data;

    }
}


// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = (req, res, next) => {
  let noAuth = req.query.noAuth;
  console.log(`Start / Stop noAuth: ${noAuth}`);
  if (noAuth === 'true') {
  	return next(true);
  }

  console.log('Check if request is authorized with Firebase ID token');

  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
        'Make sure you authorize your request by providing the following HTTP header:',
        'Authorization: Bearer <Firebase ID Token>');
    res.status(403).send('Unauthorized');
    return false;
  }

  // Read the ID Token from the Authorization header.
  let idToken = req.headers.authorization.split('Bearer ')[1];
  console.log(`Found "Authorization" header: ${idToken}`);

  let reqScope = req;
  let result = admin.auth().verifyIdToken(idToken).then((decodedIdToken) => {
    console.log('ID Token correctly decoded', decodedIdToken);
    //this.reqScope.user = decodedIdToken;
    reqScope.user = decodedIdToken;
    req.user = decodedIdToken;
    console.log('req1', req);
    return next(true);
    //return next();
  }).catch((error) => {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
    return;
  });

};


