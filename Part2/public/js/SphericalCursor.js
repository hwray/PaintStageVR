var SphericalCursor = function() {

	// CONSTANTS
	var SENSITIVITY = 5000;              			// to adjust how sensitive the mouse control is
	var DISTANCE_SCALE_FACTOR = -0.3;  			// to scale down the cursor based on its collision distance
	var DEFAULT_SCALE = 0.1;     				// scale to set the cursor if no raycast hit is found
	var HIGHLIGHT_COLOR = 0x66ffff; 				// highlight tint for objects selected with cursor
	var DEFAULT_COLOR = 0xfffffff; 					// default object tint
	var SCROLL_WHEEL_SENSITIVITY = 0.1; 
	var MAX_DISTANCE = 10; 
	var MIN_DISTANCE = 0.1; 
	var MAX_SCALE = 2; 
	var MIN_SCALE = 0.2; 

	// Globals
	var enabled = false						// controls whether the cursor is active
	var mouse = new THREE.Vector3( 0, 0, 0.5 ); 	// tracks the mouse X and Y movement
	var hit = null; 								// tracks the current object being intersected by the cursor
	var cursor; 
	var currColor = 0x00ffff; 
	var currScale = 1; 
	var currDistance = 5;             			// maximum distance to raycast
	var currPos = new THREE.Vector3(); 
	var raycaster = new THREE.Raycaster();			// raycaster for getting intersects
	raycaster.far = currDistance;  					// set max distance to raycast
	

	var camera; 

	var leftMouseDown = false; 
	var rightMouseDown = false; 
	var dragObject = null; 

	// Events
	window.addEventListener( "mousemove", onMouseMove );



	function init( inCamera, scene ) {

		camera = inCamera; 

		// cursor
		cursor = new THREE.Mesh(
			new THREE.SphereGeometry( 1.0 ),
			new THREE.MeshPhongMaterial( { color: "#00FFFF" } )
		);
		cursor.name = "cursor";
		scene.add( cursor );

		// So cursor appears on top
		cursor.renderOrder = 1;
		cursor.material.depthTest = false;

		enabled = true; 
	}; 


	function update() {

		if ( !enabled ) {
			return; 
		}

		// Update raycaster position/direction and check for intersected objects
		var intersects = updateRaycaster(); 

		if ( intersects.length > 0 ) {
			// Object intersected

			// Store closest intersected object as current hit
			var intersect = null; 
			for ( var i = 0; i < intersects.length; i++ ) {

				if ( intersects[i].object.userData.isDragging ) {
					continue; 

				} else {
					intersect = intersects[i]; 
					break; 
				}
			}

			updateHit( intersect ); 

		} else {
			// No objects intersected

			// Clear previous hit object
			updateHit( null ); 
		}

		// Update cursor position and scale
		updateCursor(); 

		updateDrag(); 

		updateInteractions(); 
	}


	function updateRaycaster() {

		// Clone mouse vector to avoid clobbering with calculations
		var mouseVector = mouse.clone(); 

		var position = Controls.getPosition(); 

		// Unproject mouse position into 3D space using camera projection matrix
		mouseVector.unproject( camera );

		// Get the normalized direction vector from the camera to the 3D mouse position
		var direction = mouseVector.sub( position ).normalize(); 

		// Set raycast from the camera in the direction of the 3D mouse position
		raycaster.set( position, direction ); 

		// Return all intersected objects from the scene
		return raycaster.intersectObjects( Core.getCursorObjects(), true ); 
	}


	function updateHit( intersect ) {

		if ( !intersect && hit ) {
			// No hit object

			// Reset previous hit object to default color
			//hit.object.material.color.set( DEFAULT_COLOR ); 
			cursor.material.color.setHex( currColor ); 

		} else if ( intersect ) {
			// Hit object

			cursor.material.color.setHex( 0xffffff );  

			if ( hit ) {
				// Handle previous hit object

				// If previous hit object is the same as the new one, store the new intersect and return without changing colors
				/*if ( hit.object == intersect.object ) {
					hit = intersect; 
					return; 
				}*/

				// Reset current hit object's color to default
				//hit.object.material.color.set( DEFAULT_COLOR );
			}

			// Highlight the new hit object
			//intersect.object.material.color.set( HIGHLIGHT_COLOR ); 
		}

		// Store the intersect as the current hit object
		hit = intersect; 
	}


	function updateCursor() {

		var distance = 0; 
		var goalPos = new THREE.Vector3(); 

		if ( hit ) {

			// Position cursor at intersection point
			goalPos.copy( hit.point ); 
			// cursor.position.copy( hit.point ); 

			distance = hit.distance; 

		} else {

			// Position cursor at default position on sphere
			// Explanation: 
			// - Normalize raycaster direction vector (which points to mouse's position in 3D space) to set length = 1
			// - Multiply vector by sphereRadius to set length = sphereRadius
			// - Add vector to raycaster origin (camera position) to get mouse's position in 3D space at sphereRadius distance from camera
			//cursor.position.copy( raycaster.ray.origin.add( raycaster.ray.direction.normalize().multiplyScalar( currDistance ) ) ); 
			goalPos.copy( raycaster.ray.origin.add( raycaster.ray.direction.normalize().multiplyScalar( currDistance ) ) ); 

			distance = currDistance; 
		}

		// Lerp cursor from current to goal position
		lerpPosition( goalPos ); 

		// Scale cursor according to current distance
		var scale = ( distance / MAX_DISTANCE ) * DEFAULT_SCALE; 
		cursor.scale.set( scale, scale, scale ); 
	}


	function lerpPosition( goalPos ) {

		currPos.lerp( goalPos, 0.9 ); 

		cursor.position.copy( currPos ); 
	}


	function updateDrag() {

		if ( dragObject ) {

			if ( rightMouseDown ) {

				dragObject.position.copy( cursor.position ); 

			} else {

				dragObject.userData.isDragging = false; 
				dragObject = null; 

			}

		} else if ( !dragObject && rightMouseDown && hit && hit.object.userData.draggable == true) {

			dragObject = hit.object; 

			dragObject.userData.isDragging = true; 

			currDistance = hit.distance; 
		}
	}


	function updateInteractions() {

		if ( hit && leftMouseDown ) {
			if ( hit.object.userData.isColorPalette ) {
				Core.setPaintColor( hit.object.userData.color ); 
			} else if ( hit.object.userData.isSpotLightControl ) {
				Core.toggleSpotlight(); 
			}
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


	function setLeftMouseDown( bool ) {
		leftMouseDown = bool; 
	}


	function setRightMouseDown( bool ) {
		rightMouseDown = bool;
	}



	function setEnabled( bool ) {

		enabled = bool; 
	}


	function getCursor() {
		return cursor;  
	}


	function getIntersect() {
		return hit; 
	}


	function getDraggedObjectData() {

		if ( dragObject ) {

			return {
				name: dragObject.name, 
				pos: dragObject.position.clone()
			}; 
		}

		return null; 
	}


	function setColor( colorHex ) {
		currColor = colorHex; 
		cursor.material.color.setHex( colorHex ); 
	}


	function updateCurrentDistance( direction ) {

		currDistance += direction * SCROLL_WHEEL_SENSITIVITY; 

		currDistance = Math.min( Math.max( currDistance, MIN_DISTANCE ), MAX_DISTANCE )

		raycaster.far = currDistance; 
	}


	function changeScale( direction ) {
		currScale += direction * SCALE_SENSITIVITY; 
		currDistance = Math.min( Math.max( currDistance, MIN_SCALE ), MAX_SCALE )

	}


	return {
		init: init,
		update: update, 
		setEnabled: setEnabled, 
		getCursor: getCursor, 
		setLeftMouseDown: setLeftMouseDown,
		setRightMouseDown: setRightMouseDown, 
		getDraggedObjectData: getDraggedObjectData, 
		setColor: setColor, 
		updateCurrentDistance: updateCurrentDistance, 
		changeScale: changeScale
	};

}();

