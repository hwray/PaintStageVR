function Player( inId, isLocal, inIsFirst, inIsWebVR, camera, inScene ) {
	
	// Globals
	var id = inId; 
	var scene = inScene; 
	var isFirst = inIsFirst; 
	var isWebVR = inIsWebVR; 
	var isEnabled = false; 
	var leftMouseDown = false; 
	var size = isFirst ? 0.5 : 0.05; 
	var height = isFirst ? 1.8 : 0.18; 
	var painter; 
	var mesh; 

	// Events
	window.addEventListener( 'mousedown', onMouseDown, false ); 
	window.addEventListener( 'mouseup', onMouseUp, false ); 
	window.addEventListener( "DOMMouseScroll", onScroll, false ); 
	window.addEventListener( "mousewheel",    onScroll, false );


	// Init
	if ( !isLocal ) {

		initMesh(); 
	}

	painter = new Painter( scene, isLocal );



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

	    if (data.strokes.length > 0) {
		    painter.updateFromNetwork( data.strokes ); 
		}

    	for ( var i = 0; i < data.drag.length; i++ ) {

    		var drag = data.drag[i]; 

    		if (drag) {

		    	var dragObj = scene.getObjectByName( drag.name, true ); 

		    	if ( dragObj ) {
		    		dragObj.position.copy( drag.pos ); 
		    	}
		    }
	    }
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

	function setPaintColor( color ) {
		painter.setColor( color ); 
	}


	function getMesh() {
		return mesh; 
	}


	function onMouseDown( event ) {

		if ( event.button == 0 ) {
			// Left click

			leftMouseDown = true; 
		}
	}


	function onMouseUp( event ) {

		if ( event.button == 0 ) {

			leftMouseDown = false; 
		}
	}


	function onScroll( event ){

		var direction = ( event.detail < 0 || event.wheelDelta > 0 ) ? 1 : -1;

		if ( leftMouseDown ) {

			painter.changeThickness( direction ); 
		}
	}


	return {
		id: id, 
		update: update, 
		setEnabled: setEnabled, 
		updateFromNetwork: updateFromNetwork,
		getUpdateData: getUpdateData, 
		getAllData: getAllData, 
		setPaintColor: setPaintColor,
		getMesh: getMesh
	}; 
}