var DesktopControls = function() {

	// Parts of this code are based on the Three.js PointerLockControls example: 
	// https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html

	// Constants
	var SPEED = 5000.0;									// controls rate of speed for movement
	var JUMP_HEIGHT = 15; 								// controls jump height/speed
	var GRAVITY = 9.8; 									// controls gravitational constant
	var CAMERA_HEIGHT = 10; 							// camera height as set in index.html - used for checking collision while jumping
	var PI_2 = Math.PI / 2; 

	// Globals
	var enabled = true; 								// sets whether the controls are currently active
	var moveFront = false; 								// is forward movement key currently pressed
	var moveBack = false; 								// is back movement key currently pressed
	var moveLeft = false; 								// is left movement key currently pressed
	var moveRight = false; 								// is right movement key currently pressed
	var lookUp = false; 
	var lookDown = false; 
	var lookLeft = false; 
	var lookRight = false; 
	var velocity = new THREE.Vector3(); 				// tracks current player velocity for smoother acceleration/deceleration
	var clock = new THREE.Clock(); 						// clock for tracking time between frames
	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, -1, 0 ), 0, HEIGHT );		// raycaster for checking collision while jumping

	var pitchObject; 
	var yawObject; 

	var HEIGHT = 10; 


	// Events
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	function init( camera, scene ) {

    	camera.rotation.set( 0, 0, 0 );

		pitchObject = new THREE.Object3D();
		pitchObject.add( camera );

		yawObject = new THREE.Object3D();
		yawObject.position.y = 10;
		yawObject.add( pitchObject );

		scene.add( yawObject ); 

    	SphericalCursor.init( camera, scene ); 
	}

	function update() {

		if ( !enabled ) {
			return; 
		}

		SphericalCursor.update(); 

		// Get delta time from last update
		var delta = clock.getDelta(); 

		// Update camera velocity
		updateVelocity( delta ); 

		updateLook(); 

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


	function updateLook() {
		var movementX = 0
		var movementY = 0; 

		if ( lookLeft ) movementX -= 0.05; 
		if ( lookRight ) movementX += 0.05; 
		if ( lookUp )	movementY -= 0.05; 
		if ( lookDown ) movementY += 0.05; 

		yawObject.rotation.y -= movementX;
		pitchObject.rotation.x -= movementY;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
	}


	function updateJump() {

		raycaster.ray.origin.copy( yawObject.position );
		raycaster.ray.origin.y -= HEIGHT;
		var intersects = raycaster.intersectObjects( Core.getSceneObjects(), true );

		if ( intersects.length > 0 ) {
			// Object intersected - we are on the ground

			velocity.y = Math.max( 0, velocity.y );
		}
	}


	function updatePosition( delta ) {

		yawObject.translateX( velocity.x * delta );
		yawObject.translateY( velocity.y * delta );
		yawObject.translateZ( velocity.z * delta );

		if ( yawObject.position.y < HEIGHT ) {
			velocity.y = 0;
			yawObject.position.y = HEIGHT;
		} 
	}


	function onKeyDown( event ) {

		switch ( event.keyCode ) {

			case 38: // up
				lookUp = true; 
				break; 

			case 87: // w
				moveFront = true;
				break;

			case 37: // left
				lookLeft = true; 
				break; 

			case 65: // a
				moveLeft = true; 
				break;

			case 40: // down
				lookDown = true; 
				break; 

			case 83: // s
				moveBack = true;
				break;

			case 39: // right
				lookRight = true; 
				break; 

			case 68: // d
				moveRight = true;
				break;
		}
	}


	function onKeyUp( event ) {

		switch( event.keyCode ) {

			case 38: // up
				lookUp = false; 
				break; 

			case 87: // w
				moveFront = false;
				break;

			case 37: // left
				lookLeft = false; 
				break; 

			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
				lookDown = false; 
				break; 

			case 83: // s
				moveBack = false;
				break;

			case 39: // right
				lookRight = false; 
				break; 

			case 68: // d
				moveRight = false;
				break;	
		}
	}


	function setEnabled( bool ) {

		enabled = bool; 
	}


	function getPosition() {
		return yawObject.position; 
	}

	function getDirection() {

		var direction = new THREE.Vector3( 0, 0, - 1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		var v = new THREE.Vector3(); 

		rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

		v.copy( direction ).applyEuler( rotation );

		return v;
	}


	return {
		init: init, 
		update: update, 
		setEnabled: setEnabled, 
		getPosition: getPosition, 
		getDirection: getDirection
	};

}(); 