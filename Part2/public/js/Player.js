function Player( inId, isLocalPlayer, inIsWebVR, camera, inScene ) {
	
	// Constants
	var SIZE = 0.3; 
	var HEIGHT = 1.8; 

	// Globals
	var isLocal; 
	var isWebVR; 
	var mesh; 
	var id; 
	var isEnabled; 
	var leftMouseDown = false; 

	var scene; 

	var painter; 


	// Events
	window.addEventListener( 'mousedown', onMouseDown, false ); 
	window.addEventListener( 'mouseup', onMouseUp, false ); 


	init( inId, isLocalPlayer, inIsWebVR, camera, inScene ); 


	function init( inId, isLocalPlayer, inIsWebVR, camera, inScene ) {

		id = inId; 
		isLocal = isLocalPlayer; 
		isWebVR = inIsWebVR; 

		isEnabled = false; 

		scene = inScene; 

		if ( isLocal ) {

			Controls.init( camera, scene, isWebVR, HEIGHT ); 

		} else {

			initMesh(); 
		}

		painter = new Painter( scene, isLocal );
	}


	function initMesh() {

		var geometry = new THREE.BoxGeometry( SIZE, SIZE, SIZE );
   		var material = new THREE.MeshBasicMaterial( { color: 0x7777ff, wireframe: false } );
   		mesh = new THREE.Mesh( geometry, material );

   		mesh.rotation.set( 0, 0, 0 );

   		mesh.position.set( 0, 0, 0 ); 
	}


	function update() {

		if ( isEnabled && isLocal ) {

			Controls.update(); 

			var intersect = SphericalCursor.getIntersect(); 

			if ( intersect && intersect.object.userData.isColorPalette ) {
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
	}


	function setEnabled( bool ) {
		isEnabled = bool; 
		Controls.setEnabled( bool ); 
	}


	function getData() {

		var data = {
			id: id, 
			pos: isLocal ? Controls.getPosition() : mesh.position,
			dir: isLocal ? Controls.getDirection() : mesh.rotation, 
			strokes: isLocal ? painter.getNewStrokes() : [ ]
		}; 

		return data; 
	}


	function onMouseDown( event ) {

		if ( event.button == 0 ) {

			leftMouseDown = true; 

		} else if ( event.button == 2 ) {

			SphericalCursor.setRightMouseDown( true ); 
		}
	}


	function onMouseUp( event ) {

		if ( event.button == 0 ) {

			leftMouseDown = false; 

		} else if ( event.button == 2 ) {

			SphericalCursor.setRightMouseDown( false ); 
		}
	}


	function getLine() {
		return line; 
	}



	return {
		update: update, 
		mesh: mesh, 
		setEnabled: setEnabled, 
		updateFromNetwork: updateFromNetwork,
		getData: getData, 
		id: id, 
		getLine: getLine
	}; 
}