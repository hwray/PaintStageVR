function Player( inId, isLocal, inIsFirst, inIsWebVR, camera, inScene ) {
	
	// Globals
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




	init( inId, isLocal, inIsFirst, inIsWebVR, camera, inScene ); 


	function init( inId, isLocal, inIsFirst, inIsWebVR, camera, inScene ) {

		id = inId; 
		isWebVR = inIsWebVR; 

		isEnabled = false; 

		isFirst = inIsFirst; 

		scene = inScene; 

		size = isFirst ? 0.3 : 0.03; 
		height = isFirst ? 1.8 : 0.18; 

		if ( !isLocal ) {

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

   		scene.add( mesh ); 
	}


	function update() {

		if ( isEnabled ) {

			var intersect = SphericalCursor.getIntersect(); 

			if ( intersect && leftMouseDown ) {
				if ( intersect.object.userData.isColorPalette ) {
					painter.setColor( SphericalCursor.getIntersect().object.userData.color ); 
				} else if ( intersect.object.userData.isSpotLightControl ) {
					Core.toggleSpotlight(); 
				}
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

	    Core.setSpotLight( data.light ); 
	}


	function setEnabled( bool ) {
		isEnabled = bool; 
	}


	function getUpdateData() {

		var data = {
			id: id, 
			strokes: painter.getUpdateData()
		}; 

		return data; 
	}


	function getAllData() {

		var data = {
			id: id, 
			isFirst: isFirst,
			strokes: painter.getAllData()
		}

		return data; 
	}


	function changePainterThickness( direction ) {
		painter.changeThickness( direction ); 
	}


	function setLeftMouseDown( bool ) {
		leftMouseDown = bool; 
	}


	return {
		id: id, 
		update: update, 
		setEnabled: setEnabled, 
		updateFromNetwork: updateFromNetwork,
		getUpdateData: getUpdateData, 
		getAllData: getAllData, 
		changePainterThickness: changePainterThickness, 
		setLeftMouseDown: setLeftMouseDown
	}; 
}