function Player( inId, isLocalPlayer, inIsFirst, inIsWebVR, camera, inScene ) {
	
	// Globals
	var isLocal; 
	var isWebVR; 
	var mesh; 
	var id; 
	var isEnabled; 
	var leftMouseDown = false; 

	var size = 0.3; 
	var height = 1.8; 

	var scene; 

	var painter; 

	var isFirst; 


	// Events
	window.addEventListener( 'mousedown', onMouseDown, false ); 
	window.addEventListener( 'mouseup', onMouseUp, false ); 


	init( inId, isLocalPlayer, inIsFirst, inIsWebVR, camera, inScene ); 


	function init( inId, isLocalPlayer, inIsFirst, inIsWebVR, camera, inScene ) {

		id = inId; 
		isLocal = isLocalPlayer; 
		isWebVR = inIsWebVR; 

		isEnabled = false; 

		isFirst = inIsFirst; 

		scene = inScene; 

		size = isFirst ? 0.3 : 0.03; 
		height = isFirst ? 1.8 : 0.18; 

		if ( isLocal ) {

			Controls.init( camera, scene, isWebVR, height ); 

		} else {

			initMesh(); 
		}

		painter = new Painter( scene, isLocal );
	}


	function initMesh() {

		var geometry = new THREE.BoxGeometry( size, size, size );
   		var material = new THREE.MeshBasicMaterial( { color: 0x7777ff, wireframe: false } );
   		mesh = new THREE.Mesh( geometry, material );

   		mesh.rotation.set( 0, 0, 0 );

   		mesh.position.set( 0, 0, 0 ); 
	}


	function update() {

		if ( isEnabled && isLocal ) {

			Controls.update(); 

			var intersect = SphericalCursor.getIntersect(); 

			if ( intersect && intersect.object.userData.isColorPalette && leftMouseDown ) {
				painter.setColor( SphericalCursor.getIntersect().object.userData.color ); 
			}

			if ( leftMouseDown ) {

				painter.update( true ); 
			} else {

				painter.update( false ); 
			}
		}

	}


	function updateFromNetwork( data ) {

	    mesh.position.set( data.pos.x, data.pos.y, data.pos.z ); 
	    mesh.rotation.set( data.dir.x, data.dir.y, data.dir.z ); 

	    for ( var i = 0; i < data.strokes.length; i++ ) {

	    	var stroke = data.strokes[i]; 

	    	painter.updateFromNetwork( stroke ); 
	    }



    	for ( var i = 0; i < data.drag.length; i++ ) {

    		var drag = data.drag[i]; 

    		if (drag) {

		    	var dragObj = scene.getObjectByName( drag.name, true ); 

		    	dragObj.position.copy( drag.pos ); 
		    }
	    }
	}


	function setEnabled( bool ) {
		isEnabled = bool; 
		Controls.setEnabled( bool ); 
	}


	function getUpdateData() {

		var data = {
			id: id, 
			pos: isLocal ? Controls.getPosition() : mesh.position,
			dir: isLocal ? Controls.getDirection() : mesh.rotation, 
			strokes: isLocal ? painter.getUpdateData() : [ ], 
			drag: isLocal ? [ SphericalCursor.getDraggedObjectData() ] : [ ]
		}; 

		return data; 
	}


	function getAllData() {

		var data = {
			id: id, 
			isFirst: isFirst,
			pos: isLocal ? Controls.getPosition() : mesh.position,
			dir: isLocal ? Controls.getDirection() : mesh.rotation, 
			strokes: isLocal ? painter.getAllData() : [ ],
			drag: isLocal ? Core.getDraggableObjectData() : [ ]
		}

		return data; 
	}


	function onMouseDown( event ) {

		if ( event.button == 0 ) {

			leftMouseDown = true; 

		} else if ( event.button == 1 ) {

			SphericalCursor.setMiddleMouseDown( true ); 

		} else if ( event.button == 2 ) {

			SphericalCursor.setRightMouseDown( true ); 

		}
	}


	function onMouseUp( event ) {

		if ( event.button == 0 ) {

			leftMouseDown = false; 

		} else if ( event.button == 1 ) {

			SphericalCursor.setMiddleMouseDown( false ); 

		} else if ( event.button == 2 ) {

			SphericalCursor.setRightMouseDown( false ); 
		}
	}


	function changePainterThickness( direction ) {
		painter.changeThickness( direction ); 
	}


	return {
		update: update, 
		mesh: mesh, 
		setEnabled: setEnabled, 
		updateFromNetwork: updateFromNetwork,
		getUpdateData: getUpdateData, 
		getAllData: getAllData, 
		id: id, 
		changePainterThickness: changePainterThickness
	}; 
}