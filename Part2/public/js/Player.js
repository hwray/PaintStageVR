function Player( inId, isLocalPlayer, inIsWebVR, camera, scene ) {
	
	// Constants
	var SIZE = 0.3; 
	var HEIGHT = 1.8; 

	// Globals
	var isLocal; 
	var isWebVR; 
	var mesh; 
	var id; 
	var isEnabled; 
	var mouseDown = false; 

	var newStrokes = [ ]; 

	var line;
	var shapes = { };
	var up = new THREE.Vector3( 0, 1, 0 );
	var vector = new THREE.Vector3();
	var vector1 = new THREE.Vector3();
	var vector2 = new THREE.Vector3();
	var vector3 = new THREE.Vector3();
	var vector4 = new THREE.Vector3();
	var point4 = new THREE.Vector3();
	var point5 = new THREE.Vector3();

	var controllerPoint1 = new THREE.Vector3(); 
	var controllerPoint2 = new THREE.Vector3(); 

	var controllerMatrix1 = new THREE.Matrix4(); 
	var controllerMatrix2 = new THREE.Matrix4(); 


	// Events
	window.addEventListener( 'mousedown', onMouseDown, false ); 
	window.addEventListener( 'mouseup', onMouseUp, false ); 


	init( inId, isLocalPlayer, inIsWebVR, camera, scene ); 


	function init( inId, isLocalPlayer, inIsWebVR, camera, scene ) {

		id = inId; 
		isLocal = isLocalPlayer; 
		isWebVR = inIsWebVR; 

		isEnabled = true; 

		initDrawingGeometry( scene ); 

		if ( isLocal ) {

			Controls.init( camera, scene, isWebVR, HEIGHT ); 

		} else {

			initMesh(); 
		}
	}


	function initMesh() {

		var geometry = new THREE.BoxGeometry( SIZE, SIZE, SIZE );
   		var material = new THREE.MeshBasicMaterial( { color: 0x7777ff, wireframe: false } );
   		mesh = new THREE.Mesh( geometry, material );

   		mesh.rotation.set( 0, 0, 0 );

   		mesh.position.set( 0, 0, 0 ); 
	}


	function initDrawingGeometry( scene ) {

		var geometry = new THREE.BufferGeometry();
		var positions = new THREE.BufferAttribute( new Float32Array( 1000000 * 3 ), 3 );
		positions.dynamic = true;
		geometry.addAttribute( 'position', positions );
		var normals = new THREE.BufferAttribute( new Float32Array( 1000000 * 3 ), 3 );
		normals.dynamic = true;
		geometry.addAttribute( 'normal', normals );
		var colors = new THREE.BufferAttribute( new Float32Array( 1000000 * 3 ), 3 );
		colors.dynamic = true;
		geometry.addAttribute( 'color', colors );
		geometry.drawRange.count = 0;

		//
		/*
		var path = "textures/cube/SwedishRoyalCastle/";
		var format = '.jpg';
		var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];
		var reflectionCube = new THREE.CubeTextureLoader().load( urls );
		*/

		var material = new THREE.MeshStandardMaterial( {
			roughness: 0.9,
			metalness: 0.0,
			// envMap: reflectionCube,
			vertexColors: THREE.VertexColors,
			side: THREE.DoubleSide
		} );

		line = new THREE.Mesh( geometry, material );
		line.frustumCulled = false;
		line.castShadow = true;
		line.receiveShadow = true;
		scene.add( line );

		// Shapes
		var PI2 = Math.PI * 2;
		var sides = 10;
		var array = [];
		for ( var i = 0; i < sides; i ++ ) {
			var angle = ( i / sides ) * PI2;
			array.push( new THREE.Vector3( Math.sin( angle ) * 0.01, Math.cos( angle ) * 0.01, 0 ) );
		}

		shapes[ 'tube' ] = array;
	}


	function stroke( color, point1, point2, matrix1, matrix2 ) {

		console.log("STROKING: " + id); 

		//var color = controller.getColor();
		var shape = shapes[ 'tube' ];
		var geometry = line.geometry;
		var attributes = geometry.attributes;
		var count = geometry.drawRange.count;
		var positions = attributes.position.array;
		var normals = attributes.normal.array;
		var colors = attributes.color.array;
		for ( var j = 0, jl = shape.length; j < jl; j ++ ) {
			var vertex1 = shape[ j ];
			var vertex2 = shape[ ( j + 1 ) % jl ];
			// positions
			vector1.copy( vertex1 );
			vector1.applyMatrix4( matrix2 );
			vector1.add( point2 );
			vector2.copy( vertex2 );
			vector2.applyMatrix4( matrix2 );
			vector2.add( point2 );
			vector3.copy( vertex2 );
			vector3.applyMatrix4( matrix1 );
			vector3.add( point1 );
			vector4.copy( vertex1 );
			vector4.applyMatrix4( matrix1 );
			vector4.add( point1 );
			vector1.toArray( positions, ( count + 0 ) * 3 );
			vector2.toArray( positions, ( count + 1 ) * 3 );
			vector4.toArray( positions, ( count + 2 ) * 3 );
			vector2.toArray( positions, ( count + 3 ) * 3 );
			vector3.toArray( positions, ( count + 4 ) * 3 );
			vector4.toArray( positions, ( count + 5 ) * 3 );
			// normals
			vector1.copy( vertex1 );
			vector1.applyMatrix4( matrix2 );
			vector1.normalize();
			vector2.copy( vertex2 );
			vector2.applyMatrix4( matrix2 );
			vector2.normalize();
			vector3.copy( vertex2 );
			vector3.applyMatrix4( matrix1 );
			vector3.normalize();
			vector4.copy( vertex1 );
			vector4.applyMatrix4( matrix1 );
			vector4.normalize();
			vector1.toArray( normals, ( count + 0 ) * 3 );
			vector2.toArray( normals, ( count + 1 ) * 3 );
			vector4.toArray( normals, ( count + 2 ) * 3 );
			vector2.toArray( normals, ( count + 3 ) * 3 );
			vector3.toArray( normals, ( count + 4 ) * 3 );
			vector4.toArray( normals, ( count + 5 ) * 3 );
			// colors
			color.toArray( colors, ( count + 0 ) * 3 );
			color.toArray( colors, ( count + 1 ) * 3 );
			color.toArray( colors, ( count + 2 ) * 3 );
			color.toArray( colors, ( count + 3 ) * 3 );
			color.toArray( colors, ( count + 4 ) * 3 );
			color.toArray( colors, ( count + 5 ) * 3 );
			count += 6;
		}
		geometry.drawRange.count = count;
	}


	function updateGeometry( start, end ) {

		if ( start === end ) return;
		var offset = start * 3;
		var count = ( end - start ) * 3;
		var geometry = line.geometry;
		var attributes = geometry.attributes;
		attributes.position.updateRange.offset = offset;
		attributes.position.updateRange.count = count;
		attributes.position.needsUpdate = true;
		attributes.normal.updateRange.offset = offset;
		attributes.normal.updateRange.count = count;
		attributes.normal.needsUpdate = true;
		attributes.color.updateRange.offset = offset;
		attributes.color.updateRange.count = count;
		attributes.color.needsUpdate = true;
	}


	function update() {

		if ( isEnabled && isLocal ) {
			Controls.update(); 
		}

		var count = line.geometry.drawRange.count; 

		// TODO: Move to Controls. (?)

		var matrix = SphericalCursor.getCursor().matrixWorld; 

		var point1 = controllerPoint1; 
		var point2 = controllerPoint2; 

		var matrix1 = controllerMatrix1; 
		var matrix2 = controllerMatrix2; 

		point1.setFromMatrixPosition( matrix ); 

		matrix1.lookAt( point2, point1, up); 

		if ( mouseDown ) {
			stroke( new THREE.Color(0x00ffff), point1, point2, matrix1, matrix2 ); 
			newStrokes[ newStrokes.length ] = [ new THREE.Vector3().copy(point1), new THREE.Vector3().copy(point2), new THREE.Matrix4().copy(matrix1), new THREE.Matrix4().copy(matrix2) ]; 
		}

		point2.copy( point1 );
		matrix2.copy( matrix1 );

		updateGeometry( count, line.geometry.drawRange.count ); 

	}


	function updateFromNetwork( data ) {

	    mesh.position.set( data.pos.x, data.pos.y, data.pos.z ); 
	    mesh.rotation.set( data.dir.x, data.dir.y, data.dir.z ); 

	    var count = line.geometry.drawRange.count; 

	    for ( var i = 0; i < data.strokes.length; i++ ) {
	    	var stroke = data.strokes[i]; 
	    	this.stroke( new THREE.Color( 0xff00ff ), stroke[0], stroke[1], stroke[2], stroke[3] ); 
	    }

	    updateGeometry( count, line.geometry.drawRange.count ); 
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
			strokes: newStrokes.slice(0)
		}; 

		newStrokes = [ ]; 

		return data; 
	}


	function onMouseDown() {
		mouseDown = true; 
	}


	function onMouseUp() {
		mouseDown = false; 
	}




	return {
		update: update, 
		mesh: mesh, 
		setEnabled: setEnabled, 
		updateFromNetwork: updateFromNetwork,
		getData: getData, 
		id: id, 
		stroke: stroke
	}; 
}