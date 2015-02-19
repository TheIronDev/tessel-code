// Import the interface to Tessel hardware
var tessel = require('tessel'),
	ambientlib = require('ambient-attx4'),
	cameraLib = require('camera-vc0706');

var ambient = ambientlib.use(tessel.port['A']),
	camera = cameraLib.use(tessel.port['D']),
	notificationLED = tessel.led[3];

function handleError(err) {
	console.error(err);
}

function ambientReadyHandler() {
	ambient.setSoundTrigger(0.05);
}

function ambientSoundHandler(data) {
	var newDate = new Date();
	console.log("Dog barked at %s", newDate.toUTCString());

	// Clear it
	ambient.clearSoundTrigger();

	//After 1.5 seconds reset sound trigger
	setTimeout(function () {

		ambient.setSoundTrigger(0.05);

	},1500);

}

ambient.on('ready', ambientReadyHandler);
ambient.on('sound-trigger', ambientSoundHandler);


camera.on('ready', function() {
	// Camera integration is our next step
	return true;
	notificationLED.high();
	// Take the picture
	camera.takePicture(function(err, image) {
		if (err) {
			console.log('error taking image', err);
		} else {
			notificationLED.low();
			// Name the image
			var name = 'picture-' + Math.floor(Date.now()*1000) + '.jpg';
			// Save the image
			console.log('Picture saving as', name, '...');
			process.sendfile(name, image);
			console.log('done.');
			// Turn the camera off to end the script
			camera.disable();
		}
	});
});

ambient.on('error', handleError);
camera.on('error', handleError);
