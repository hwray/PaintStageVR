var Controls = function() {

	// Parts of this code are based on the Three.js PointerLockControls example: 
	// https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html

	// Constants
	var ACCELERATION = 40.0;							// controls rate of acceleration for movement
	var DECELERATION = 10.0; 							// controls rate of deceleration for movement
	var JUMP_HEIGHT = 15; 								// controls jump height/speed
	var GRAVITY = 9.8; 									// controls gravitational constant
	var CAMERA_HEIGHT = 1.8; 							// camera height as set in index.html - used for checking collision while jumping
	var DOWN_VECTOR = new THREE.Vector3( 0, -1, 0 ); 	// constant down vector for checking collision while jumping

	// Globals
	var enabled = false; 								// sets whether the controls are currently active
	var moveFront = false; 								// is forward movement key currently pressed
	var moveBack = false; 								// is back movement key currently pressed
	var moveLeft = false; 								// is left movement key currently pressed
	var moveRight = false; 								// is right movement key currently pressed
	var canJump = false; 								// can the user currently jump (or are they already in the air)
	var velocity = new THREE.Vector3(); 				// tracks current player velocity for smoother acceleration/deceleration
	var clock = new THREE.Clock(); 						// clock for tracking time between frames
	var raycaster = new THREE.Raycaster();				// raycaster for checking collision while jumping
	raycaster.far = CAMERA_HEIGHT; 						// raycast only the distance from the camera to the ground

	// Events
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );


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

		// Decrease current X / Z velocity
		velocity.x -= velocity.x * DECELERATION * delta;
		velocity.z -= velocity.z * DECELERATION * delta;

		// Decrease current Y velocity by gravity constant
		velocity.y -= GRAVITY * 10 * delta;

		// Add velocity from currently pressed movement keys
		if ( moveFront ) velocity.z -= ACCELERATION * delta;
		if ( moveBack ) velocity.z += ACCELERATION * delta;
		if ( moveLeft ) velocity.x -= ACCELERATION * delta;
		if ( moveRight ) velocity.x += ACCELERATION * delta;
	}


	function updateJump() {

		// Raycast downwards from the camera position to the ground
		raycaster.set( camera.position, DOWN_VECTOR ); 	
		var intersections = raycaster.intersectObjects( scene.children, true );

		if ( intersections.length > 0 ) {
			// Object intersected - we are on the ground

			velocity.y = Math.max( 0, velocity.y );
			canJump = true;
		}
	}


	function updatePosition( delta ) {

		// Move the camera according to current velocity
		camera.translateX( velocity.x * delta );
		camera.translateY( velocity.y * delta );
		camera.translateZ( velocity.z * delta );
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

			case 32: // space
				if ( canJump === true ) {
					velocity.y += JUMP_HEIGHT;
				}
				canJump = false;
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
	}


	return {
		update: update, 
		setEnabled: setEnabled
	};

}(); 