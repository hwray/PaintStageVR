function Player( inId, isLocalPlayer ) {
	
	// Globals
	var isLocal; 
	var mesh; 
	var id; 
	var isEnabled; 


	init( inId, isLocalPlayer ); 


	function init( inId, isLocalPlayer ) {

		id = inId; 
		isLocal = isLocalPlayer; 

		isEnabled = true; 

		if ( isLocal ) {

			Controls.init(); 

		} else {

			initMesh(); 
		}
	}


	function initMesh() {

		var geometry = new THREE.BoxGeometry( 1, 1, 1 );
   		var material = new THREE.MeshBasicMaterial( { color: 0x7777ff, wireframe: false } );
   		mesh = new THREE.Mesh( geometry, material );

   		mesh.rotation.set( 0, 0, 0 );

   		mesh.position.set( 0, 0, 0 ); 
	}


	function update() {

		if ( isEnabled && isLocal ) {
			Controls.update(); 
			Client.getSocket().emit( 'updatePosition', { id: id, pos: Controls.getPosition(), dir: Controls.getDirection() } ); 
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



	return {
		update: update, 
		mesh: mesh, 
		setEnabled: setEnabled, 
		updatePosition: updatePosition
	}; 
}