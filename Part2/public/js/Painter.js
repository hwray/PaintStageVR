function Painter( scene, isLocal ) {
	
	// Constants
	var NUM_COLORS = 60; 

	// Globals
	var line;
	var shapes = { };
	var up = new THREE.Vector3( 0, 1, 0 );
	var point1 = new THREE.Vector3(); 
	var point2 = new THREE.Vector3(); 
	var point4 = new THREE.Vector3();
	var point5 = new THREE.Vector3();
	var vector = new THREE.Vector3();
	var vector1 = new THREE.Vector3();
	var vector2 = new THREE.Vector3();
	var vector3 = new THREE.Vector3();
	var vector4 = new THREE.Vector3();
	var matrix1 = new THREE.Matrix4(); 
	var matrix2 = new THREE.Matrix4(); 
	var allStrokes = [ ]; 
	var newStrokes = [ ]; 
	var batchedStrokes = [ ]; 
	var minThickness = 0.001; 
	var maxThickness = 0.5; 
	var thickness = 0.01; 
	var colorHex = 0x00ffff; 
	var color = new THREE.Color( colorHex ); 


	// Init
	
	initLine( scene ); 

	createTubeShape( thickness ); 

	if ( isLocal ) {
		initColorPalette(); 
	}



	function initLine( scene ) {
		// Create line object that represents strokes via a dynamic BufferGeometry

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

		var material = new THREE.MeshStandardMaterial( {
			roughness: 0.9,
			metalness: 0.0,
			vertexColors: THREE.VertexColors,
			side: THREE.DoubleSide
		} );

		line = new THREE.Mesh( geometry, material );
		line.frustumCulled = false;
		line.castShadow = true;
		line.receiveShadow = true;

		scene.add( line );
	}


	function createTubeShape( thickness ) {
		// Create the shape that forms the basis of each segment in the line BufferGeometry. 
		// A different shape is created and stored each time the thickness changes to a new value. 

		// Shapes
		var PI2 = Math.PI * 2;
		var sides = 10;
		var array = [];
		for ( var i = 0; i < sides; i ++ ) {
			var angle = ( i / sides ) * PI2;
			array.push( new THREE.Vector3( Math.sin( angle ) * thickness, Math.cos( angle ) * thickness, 0 ) );
		}

		shapes[ "" + thickness ] = array;

		return array; 
	}


	function initColorPalette() {

		// Add color palette pickers

		for ( var i = 0; i < NUM_COLORS; i++ ) {
			var color = new THREE.Color(getRandomColor()); 
			var geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
			var material = new THREE.MeshBasicMaterial( { color: color } );
			var cube = new THREE.Mesh( geometry, material );

			var row = Math.floor(i / 20); 

			cube.position.set( -2.7, 1.3 + row * 0.2, -0.9 + (i - row * 20) * 0.2 ); 
			cube.userData.isColorPalette = true; 
			cube.userData.color = color.getHex(); 
			cube.name = "palette" + color.getHex(); 
			Core.addCursorObject( cube, false ); 
		}
	}

	function getRandomColor() {
	    var letters = '0123456789ABCDEF';
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 16)];
	    }
	    return color;
	}


	function stroke( color, point1, point2, matrix1, matrix2, thickness ) {

		var shape; 
		if ( shapes[ "" + thickness ] ) {

			// If this thickness of line has been drawn before, get its corresponding shape
			shape = shapes[ "" + thickness ]; 

		} else {

			// If this is a new thickness, create the necessary shape
			shape = createTubeShape( thickness ); 
		}

		// Add a new stroke to the painting BufferGeometry, 
		// by creating a new "tube" shape between the previous stroke point and the current point. 
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
		// Update the line's BufferGeometry data

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


	function update( shouldPaint ) {

		// Store current count of line BufferGeometry
		var count = line.geometry.drawRange.count; 

		// Get SphericalCursor's world matrix
		var matrix = SphericalCursor.getCursor().matrixWorld; 

		// Set the current stroke point to the cursor world position
		point1.setFromMatrixPosition( matrix ); 

		// Construct rotation matrix, looking from point2 (the previous stroke point) to point1 (the current stroke point)
		matrix1.lookAt( point2, point1, up); 

		if ( shouldPaint ) {

			// Add the stroke to the line BufferGeometry
			stroke( color, point1, point2, matrix1, matrix2, thickness ); 

			// Store the stroke data for later network replication
			newStrokes.push( [ colorHex, point1.clone(), point2.clone(), matrix1.clone(), matrix2.clone(), thickness ] ); 

		} else {
			// Player has released left click - paint stroke has ended

			// Add the data from this paint stroke to the list of batched stroke data, to be replicated on the next network update 
			batchedStrokes = batchedStrokes.concat( newStrokes ); 

			// Clear the new strokes array
			newStrokes = [ ]; 

		}

		// Store the current paint point / rotation matrix to use as previous for the next update
		point2.copy( point1 );
		matrix2.copy( matrix1 );

		// Update the line BufferGeometry based on the new geometry count
		updateGeometry( count, line.geometry.drawRange.count ); 
	}


	function updateFromNetwork( strokes ) {
		// Update stroke data from network 

	    var count = line.geometry.drawRange.count; 

	    for ( var i = 0; i < strokes.length; i++ ) {

	    	var stroke = strokes[i];

	    	colorHex = stroke[0]; 
		    color.set( colorHex ); 

		    this.stroke( color, stroke[1], stroke[2], stroke[3], stroke[4], stroke[5] ); 
	    }

	    updateGeometry( count, line.geometry.drawRange.count ); 

	}


	function setColor( inColorHex ) {
		colorHex = inColorHex; 
		color.set( colorHex ); 
		SphericalCursor.setColor( colorHex ); 
	}


	function getUpdateData() {
		// Return batched strokes for broadcast to the server

		var result = []; 

		if ( batchedStrokes.length > 0 ) {

			result = batchedStrokes.slice(); 

			allStrokes = allStrokes.concat( batchedStrokes ); 

			batchedStrokes = [ ]; 
		}

		return result; 
	}


	function getAllData() {

		return allStrokes; 
	}


	function changeThickness( direction ) {
		thickness += direction * 0.01; 

		thickness = Math.min( Math.max( thickness, minThickness ), maxThickness )
	}




	return {
		update: update, 
		updateFromNetwork: updateFromNetwork,
		setColor: setColor,
		stroke: stroke,
		getUpdateData: getUpdateData, 
		getAllData: getAllData, 
		changeThickness: changeThickness
	}; 
}