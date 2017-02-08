var SphericalCursor = function() {

	// CONSTANTS
	var SENSITIVITY = 5000;              			// to adjust how sensitive the mouse control is
	var DISTANCE_SCALE_FACTOR = -0.3;  			// to scale down the cursor based on its collision distance
	var DEFAULT_SCALE = 0.1;     				// scale to set the cursor if no raycast hit is found
	var SCROLL_WHEEL_SENSITIVITY = 0.1; 
	var MAX_DISTANCE = 15; 
	var MIN_DISTANCE = 0.1; 
	var MAX_SCALE = 2; 
	var MIN_SCALE = 0.2; 
	var HIGHLIGHT_INTENSITY = 0.5; 

	// Globals
	var enabled = false						// controls whether the cursor is active
	var mouse = new THREE.Vector3( 0, 0, 0.5 ); 	// tracks the mouse X and Y movement
	var hit = null; 								// tracks the current object being intersected by the cursor
	var cursor; 
	var currColor = 0x00ffff; 
	var currScale = 1; 
	var currDistance = 7;             			// maximum distance to raycast
	var currPos = new THREE.Vector3(); 
	var raycaster = new THREE.Raycaster();			// raycaster for getting intersects
	raycaster.far = currDistance;  					// set max distance to raycast
	var goalPos = new THREE.Vector3(); 
	

	var camera; 

	var leftMouseDown = false; 
	var rightMouseDown = false; 
	var dragObject = null; 

	// Events
	window.addEventListener( "mousemove", onMouseMove );
	window.addEventListener( 'mousedown', onMouseDown, false ); 
	window.addEventListener( 'mouseup', onMouseUp, false ); 
	window.addEventListener( "DOMMouseScroll", onScroll, false ); 
	window.addEventListener( "mousewheel",    onScroll, false );



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
			hit.object.material.color.addScalar( -HIGHLIGHT_INTENSITY );

			cursor.material.color.setHex( currColor ); 

		} else if ( intersect ) {
			// Hit object

			cursor.material.color.setHex( 0xffffff );  

			if ( hit ) {
				// Handle previous hit object

				// If previous hit object is the same as the new one, store the new intersect and return without changing colors
				if ( hit.object == intersect.object ) {
					hit = intersect; 
					return; 
				}

				// Reset current hit object's color to default
				hit.object.material.color.addScalar( -HIGHLIGHT_INTENSITY );
			}

			// Highlight the new hit object
			intersect.object.material.color.addScalar( HIGHLIGHT_INTENSITY ); 
		}

		// Store the intersect as the current hit object
		hit = intersect; 
	}


	function updateCursor() {

		var distance = 0; 

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
		lerpPosition( goalPos, 0.9 ); 
		//cursor.position.copy( goalPos ); 

		// Scale cursor according to current distance
		var scale = ( distance / MAX_DISTANCE ) * DEFAULT_SCALE; 

		cursor.scale.set( scale, scale, scale ); 

		if (hit) {
			cursor.scale.set( scale * 2, scale * 2, scale * 2 ); 
		}

		currDistance = distance; 
	}


	function lerpPosition( goalPos, alpha ) {

		currPos.lerp( goalPos, alpha ); 

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
				Scene.toggleSpotLight(); 
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


	function setEnabled( bool ) {

		enabled = bool; 
	}


	function getCursor() {
		return cursor;  
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


	function onMouseDown( event ) {

		if ( event.button == 0 ) {
			// Left click

			leftMouseDown = true; 

		} else if ( event.button == 2 ) {
			// Right click

			rightMouseDown = true; 
		}
	}


	function onMouseUp( event ) {

		if ( event.button == 0 ) {
			// Left click released

			leftMouseDown = false; 

		} else if ( event.button == 2 ) {
			// Right click released
			
			rightMouseDown = false; 
		}
	}


	function onScroll( event ) {
		// Mouse scrolling

		var direction = ( event.detail < 0 || event.wheelDelta > 0 ) ? 1 : -1;

		if ( !leftMouseDown ) {

			updateCurrentDistance( direction ); 
		}
	}


	return {
		init: init,
		update: update, 
		setEnabled: setEnabled, 
		getCursor: getCursor, 
		getDraggedObjectData: getDraggedObjectData, 
		setColor: setColor
	};

}();

