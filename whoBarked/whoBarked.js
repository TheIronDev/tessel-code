// Import the interface to Tessel hardware
var tessel = require('tessel'),
	ambientlib = require('ambient-attx4'),
	cameraLib = require('camera-vc0706'),
	http = require('http'),
	querystring = require('querystring');

var ambient = ambientlib.use(tessel.port['A']),
	camera = cameraLib.use(tessel.port['B']),
	notificationLED = tessel.led[3],
	AMBIENT_SOUND_TRIGGER_LEVEL = 0.05;

function handleError(err) {
	console.error(err);
}

function ambientReadyHandler() {
	ambient.setSoundTrigger(AMBIENT_SOUND_TRIGGER_LEVEL);
}

function takePicture(newDate) {
	notificationLED.high();
	camera.takePicture(function(err, image) {
		if (err) {
			return console.log('error taking image', err);
		}

		notificationLED.low();
		// Name the image
		var name = 'picture-' + newDate.toISOString() + '.jpg';
		// Save the image
		console.log('Picture saving as', name, '...');
		// process.sendfile(name, image);
		uploadPicture(name, image);
	});
}

function uploadPicture(name, image) {

	var post_data = querystring.stringify({
		'name' : name,
		'image': image
	});

	var post_options = {
		host: 'tessel-sandbox.herokuapp.com',
		port: '80',
		path: '/cloudinary',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length
		}
	};

	// Set up the request
	var post_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('Response: ' + chunk);
		});
	});

	// post the data
	post_req.write(post_data);
	post_req.end();
}

function ambientSoundHandler(data) {
	var newDate = new Date();
	console.log("Dog barked at %s", newDate.toUTCString());

	// Clear it
	ambient.clearSoundTrigger();

	takePicture(newDate);

	//After 1.5 seconds reset sound trigger
	setTimeout(function () {
		ambient.setSoundTrigger(AMBIENT_SOUND_TRIGGER_LEVEL);
	},1500);

}

ambient.on('ready', ambientReadyHandler);
ambient.on('sound-trigger', ambientSoundHandler);


camera.on('ready', function() {
	// Should I do anything here?  My assumption is lets just leave the camera running.
});

ambient.on('error', handleError);
camera.on('error', handleError);
