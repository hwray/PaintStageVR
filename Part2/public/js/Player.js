function Player( inId, isLocalPlayer, camera, scene ) {
	
	// Globals
	var isLocal; 
	var mesh; 
	var id; 
	var isEnabled; 

	var PLAYER_SIZE = 1; 


	init( inId, isLocalPlayer, camera, scene ); 


	function init( inId, isLocalPlayer, camera, scene ) {

		id = inId; 
		isLocal = isLocalPlayer; 

		isEnabled = true; 

		if ( isLocal ) {

			if ( WebVR.isAvailable() === false ) {

				console.log( "No WebVR available!" ); 
				//document.body.appendChild( WebVR.getMessage() );

			} else {

				console.log( "WebVR available!" ); 
			}

			Controls.init( camera, scene ); 

		} else {

			initMesh(); 
		}
	}


	function initMesh() {

		var geometry = new THREE.BoxGeometry( PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE );
   		var material = new THREE.MeshBasicMaterial( { color: 0x7777ff, wireframe: false } );
   		mesh = new THREE.Mesh( geometry, material );

   		mesh.rotation.set( 0, 0, 0 );

   		mesh.position.set( 0, 0, 0 ); 
	}


	function update() {

		if ( isEnabled && isLocal ) {
			Controls.update(); 
		}

	}


	function updatePosition( data ) {

	    mesh.position.set( data.pos.x, data.pos.y, data.pos.z ); 
	    mesh.rotation.set( data.dir.x, data.dir.y, data.dir.z ); 
	}


	function setEnabled( bool ) {
		isEnabled = bool; 
		Controls.setEnabled( bool ); 
	}


	function getData() {

		return {
			id: id, 
			pos: isLocal ? Controls.getPosition() : mesh.position,
			dir: isLocal ? Controls.getDirection() : mesh.rotation
		}; 
	}



	return {
		update: update, 
		mesh: mesh, 
		setEnabled: setEnabled, 
		updatePosition: updatePosition,
		getData: getData, 
		id: id
	}; 
}