var SphericalCursor = function() {

	// CONSTANTS
	var SENSITIVITY = 1000;              			// to adjust how sensitive the mouse control is
	var DISTANCE_SCALE_FACTOR = -0.05;  			// to scale down the cursor based on its collision distance
	var DEFAULT_CURSOR_SCALE = 20;     				// scale to set the cursor if no raycast hit is found
	var MAX_DISTANCE = 100;             			// maximum distance to raycast
	var SPHERE_RADIUS = 1000;           			// sphere radius to project cursor onto if no raycast hit
	var HIGHLIGHT_COLOR = 0x66ffff; 				// highlight tint for objects selected with cursor
	var DEFAULT_COLOR = 0xfffffff; 					// default object tint

	// Globals
	var enabled = false; 							// controls whether the cursor is active
	var mouse = new THREE.Vector3( 0, 0, 0.5 ); 	// tracks the mouse X and Y movement
	var hit = null; 								// tracks the current object being intersected by the cursor
	var raycaster = new THREE.Raycaster();			// raycaster for getting intersects
	raycaster.far = MAX_DISTANCE;  					// set max distance to raycast

	// Events
	window.addEventListener( "mousemove", onMouseMove );


	function update() {

		if ( !enabled ) {
			return; 
		}

		// Update raycaster position/direction and check for intersected objects
		var intersects = updateRaycaster(); 

		if ( intersects.length > 0 ) {
			// Object intersected

			// Store closest intersected object as current hit
			updateHit( intersects[0] ); 

		} else {
			// No objects intersected

			// Clear previous hit object
			updateHit( null ); 
		}

		// Update cursor position and scale
		updateCursor(); 
	}


	function updateRaycaster() {

		// Clone mouse vector to avoid clobbering with calculations
		var mouseVector = mouse.clone(); 

		// Unproject mouse position into 3D space using camera projection matrix
		mouseVector.unproject( camera );

		// Get the normalized direction vector from the camera to the 3D mouse position
		var direction = mouseVector.sub( camera.position ).normalize(); 

		// Set raycast from the camera in the direction of the 3D mouse position
		raycaster.set( camera.position, direction ); 

		// Return all intersected objects from the furnitureGroup
		return raycaster.intersectObject( furnitureGroup, true ); 
	}


	function updateHit( intersect ) {

		if ( !intersect && hit ) {
			// No hit object

			// Reset previous hit object to default color
			hit.object.material.color.set( DEFAULT_COLOR ); 

		} else if ( intersect ) {
			// Hit object

			if ( hit ) {
				// Handle previous hit object

				// If previous hit object is the same as the new one, store the new intersect and return without changing colors
				if ( hit.object == intersect.object ) {
					hit = intersect; 
					return; 
				}

				// Reset current hit object's color to default
				hit.object.material.color.set( DEFAULT_COLOR );
			}

			// Highlight the new hit object
			intersect.object.material.color.set( HIGHLIGHT_COLOR ); 
		}

		// Store the intersect as the current hit object
		hit = intersect; 
	}


	function updateCursor() {

		if ( hit ) {

			// Position cursor at intersection point
			cursor.position.copy( hit.point ); 

			// Scale cursor by distance and DISTANCE_SCALE_FACTOR
			var scale = ( hit.distance * DISTANCE_SCALE_FACTOR + 1.0 ) / 2.0
			cursor.scale.set( scale, scale, scale ); 

		} else {

			// Position cursor at default position on sphere
			// Explanation: 
			// - Normalize raycaster direction vector (which points to mouse's position in 3D space) to set length = 1
			// - Multiply vector by SPHERE_RADIUS to set length = SPHERE_RADIUS
			// - Add vector to raycaster origin (camera position) to get mouse's position in 3D space at SPHERE_RADIUS distance from camera
			cursor.position.copy( raycaster.ray.origin.add( raycaster.ray.direction.normalize().multiplyScalar( SPHERE_RADIUS ) ) ); 

			// Scale cursor to default scale
			cursor.scale.set( DEFAULT_CURSOR_SCALE, DEFAULT_CURSOR_SCALE, DEFAULT_CURSOR_SCALE ); 
		}
	}


	function onMouseMove( event ) {

		if ( !enabled ) {
			return; 
		}

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		// Move mouse position based on sensitivity
		mouse.x += movementX / SENSITIVITY; 
		mouse.y -= movementY / SENSITIVITY; 
	}


	function setEnabled( bool ) {

		enabled = bool; 
	}


	return {
		update: update, 
		setEnabled: setEnabled
	};

}();

