function Painter( scene, isLocal ) {
	
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

	var point1 = new THREE.Vector3(); 
	var point2 = new THREE.Vector3(); 

	var matrix1 = new THREE.Matrix4(); 
	var matrix2 = new THREE.Matrix4(); 

	var newStrokes = [ ]; 

	var colorHex = 0x00ffff; 
	var color = new THREE.Color( colorHex ); 


	init( scene, isLocal ); 


	function init( scene, isLocal ) {

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


		if ( isLocal ) {
			var colors = [ 	0xff00ff, 0xff0000, 0x00ffff ]; 

			for ( var i = 0; i < colors.length; i++ ) {
				var geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
				var material = new THREE.MeshBasicMaterial( { color: colors[i] } );
				var cube = new THREE.Mesh( geometry, material );
				cube.position.set( 0 + i, 2, -3); 
				cube.userData.isColorPalette = true; 
				cube.userData.color = colors[i]; 
				Core.addCursorObject( cube ); 
			}
		}
	}


	function stroke( color, point1, point2, matrix1, matrix2 ) {

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


	function update( shouldPaint ) {

		var count = line.geometry.drawRange.count; 

		var matrix = SphericalCursor.getCursor().matrixWorld; 

		point1.setFromMatrixPosition( matrix ); 

		matrix1.lookAt( point2, point1, up); 

		if ( shouldPaint ) {

			stroke( color, point1, point2, matrix1, matrix2 ); 

			newStrokes.push( [ colorHex, point1.clone(), point2.clone(), matrix1.clone(), matrix2.clone() ] ); 
		}

		point2.copy( point1 );
		matrix2.copy( matrix1 );

		updateGeometry( count, line.geometry.drawRange.count ); 
	}


	function updateFromNetwork( stroke ) {

	    var count = line.geometry.drawRange.count; 

	    colorHex = stroke[0]; 
	    color.set( colorHex ); 

	    this.stroke( color, stroke[1], stroke[2], stroke[3], stroke[4] ); 

	    updateGeometry( count, line.geometry.drawRange.count ); 

	}


	function setColor( inColorHex ) {
		colorHex = inColorHex; 
		color.set( colorHex ); 
	}


	function getNewStrokes() {

		var result = newStrokes.slice(); 

		newStrokes = [ ]; 

		return result; 
	}




	return {
		update: update, 
		updateFromNetwork: updateFromNetwork,
		setColor: setColor,
		stroke: stroke,
		getNewStrokes: getNewStrokes
	}; 
}