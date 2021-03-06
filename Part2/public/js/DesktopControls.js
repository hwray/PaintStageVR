var DesktopControls = function() {

	// Parts of this code are based on the Three.js PointerLockControls example, as well as the internal implementation of PointerLockControls: 
	// https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html

	// Constants
	var JUMP_HEIGHT = 10; 								// controls jump height/speed
	var GRAVITY = 9.8; 									// controls gravitational constant
	var PI_2 = Math.PI / 2; 

	// Globals
	var enabled = false; 								// sets whether the controls are currently active
	var moveFront = false; 								// is forward movement key currently pressed
	var moveBack = false; 								// is back movement key currently pressed
	var moveLeft = false; 								// is left movement key currently pressed
	var moveRight = false; 								// is right movement key currently pressed
	var lookUp = false; 
	var lookDown = false; 
	var lookLeft = false; 
	var lookRight = false; 
	var canJump = false; 
	var height = 1.8; 
	var velocity = new THREE.Vector3(); 				// tracks current player velocity for smoother acceleration/deceleration
	var raycaster; 										// raycaster for checking collision while jumping
	var speed = 0; 

	var pitchObject; 
	var yawObject; 

	// Events
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	function init( camera, scene, inHeight ) {

    	camera.rotation.set( 0, 0, 0 );

    	height = inHeight; 

    	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, -1, 0 ), 0, height );

    	speed = height == 1.8 ? 250 : 100; 

		pitchObject = new THREE.Object3D();
		pitchObject.add( camera );

		yawObject = new THREE.Object3D();
		yawObject.position.y = height == 1.8 ? height : 1.2 + height; 
		if (height != 1.8) {
			yawObject.position.z = -2;
			yawObject.rotation.y += Math.PI; 
		} else {
			yawObject.position.z = 8; 
		}

		yawObject.add( pitchObject );

		scene.add( yawObject ); 

    	SphericalCursor.init( camera, scene ); 
	}


	function update( delta ) {

		if ( !enabled ) {
			return; 
		}

		SphericalCursor.update(); 

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
		velocity.y -= GRAVITY * 10.0 * delta;

		// Add velocity from currently pressed movement keys
		if ( moveFront ) velocity.z -= speed * delta;
		if ( moveBack ) velocity.z += speed * delta;
		if ( moveLeft ) velocity.x -= speed * delta;
		if ( moveRight ) velocity.x += speed * delta;
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
		//raycaster.ray.origin.y -= height;
		var intersects = raycaster.intersectObjects( Core.getCursorObjects(), true );

		if ( intersects.length > 0 ) {
			// Object intersected - we are on the ground

			velocity.y = Math.max( 0, velocity.y );

			canJump = true; 
		}
	}


	function updatePosition( delta ) {

		yawObject.translateX( velocity.x * delta );
		yawObject.translateY( velocity.y * delta );
		yawObject.translateZ( velocity.z * delta );

		if ( yawObject.position.y < height ) {
			velocity.y = 0;
			yawObject.position.y = height;
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

			case 32: // space
				if ( canJump === true ) {
					velocity.y += JUMP_HEIGHT;
					canJump = false;
				}
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
		SphericalCursor.setEnabled( bool ); 
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