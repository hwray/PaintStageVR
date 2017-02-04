var DesktopControls = function() {

	// Parts of this code are based on the Three.js PointerLockControls example: 
	// https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html

	// Constants
	var SPEED = 5000.0;									// controls rate of speed for movement
	var JUMP_HEIGHT = 15; 								// controls jump height/speed
	var GRAVITY = 9.8; 									// controls gravitational constant
	var CAMERA_HEIGHT = 10; 							// camera height as set in index.html - used for checking collision while jumping

	// Globals
	var enabled = true; 								// sets whether the controls are currently active
	var moveFront = false; 								// is forward movement key currently pressed
	var moveBack = false; 								// is back movement key currently pressed
	var moveLeft = false; 								// is left movement key currently pressed
	var moveRight = false; 								// is right movement key currently pressed
	var velocity = new THREE.Vector3(); 				// tracks current player velocity for smoother acceleration/deceleration
	var clock = new THREE.Clock(); 						// clock for tracking time between frames
	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, -1, 0 ), 0, HEIGHT );		// raycaster for checking collision while jumping

	var HEIGHT = 10; 

	var mouseControls; 
	var keyboardControls; 

	// Events
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	function init() {

    	mouseControls = new THREE.PointerLockControls( Core.getCamera() );
    	Core.getScene().add( mouseControls.getObject() );
	}

	function update() {

		if ( !enabled ) {
			return; 
		}

		// Get delta time from last update
		var delta = clock.getDelta(); 

		// Update camera velocity
		updateVelocity( delta ); 

		// Update jump state
		updateJump(); 

		// Update camera position
		updatePosition( delta ); 
	}


	function updateVelocity( delta ) {

		// Remove current X / Z velocity (no deceleration)
		// This is more comfortable for VR, where acceleration/deceleration that does not match the user's proprioception leads to vection sickness
		velocity.x = 0; 
		velocity.z = 0; 

		// Decrease current Y velocity by gravity constant
		velocity.y -= GRAVITY * 100.0 * delta;

		// Add velocity from currently pressed movement keys
		if ( moveFront ) velocity.z -= SPEED * delta;
		if ( moveBack ) velocity.z += SPEED * delta;
		if ( moveLeft ) velocity.x -= SPEED * delta;
		if ( moveRight ) velocity.x += SPEED * delta;
	}


	function updateJump() {

		// Raycast downwards from the camera position to the ground
		raycaster.ray.origin.copy( mouseControls.getObject().position );
		raycaster.ray.origin.y -= HEIGHT;
		var intersects = raycaster.intersectObjects( Core.getScene().children );

		if ( intersects.length > 0 ) {
			// Object intersected - we are on the ground

			velocity.y = Math.max( 0, velocity.y );
		}
	}


	function updatePosition( delta ) {

		// Move the camera according to current velocity
		mouseControls.getObject().translateX( velocity.x * delta );
		mouseControls.getObject().translateY( velocity.y * delta );
		mouseControls.getObject().translateZ( velocity.z * delta );

		if ( mouseControls.getObject().position.y < HEIGHT ) {
			velocity.y = 0;
			mouseControls.getObject().position.y = HEIGHT;
		} 
	}


	function onKeyDown( event ) {

		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveFront = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; 
				break;

			case 40: // down
			case 83: // s
				moveBack = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;
		}
	}


	function onKeyUp( event ) {

		switch( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveFront = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBack = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;	
		}
	}


	function setEnabled( bool ) {

		enabled = bool; 
		mouseControls.enabled = bool; 
	}


	function getPosition() {
		return mouseControls.getObject().position; 
	}

	function getDirection() {
		return mouseControls.getDirection( new THREE.Vector3() ); 
	}


	return {
		init: init, 
		update: update, 
		setEnabled: setEnabled, 
		getPosition: getPosition, 
		getDirection: getDirection
	};

}(); 