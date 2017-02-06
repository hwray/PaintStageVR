var Scene = function() {

	// Globals
	var camera; 
	var scene; 
	var renderer;
	var effect;  
	var spotLight; 

	var mixers = [ ]; 
	var loader; 
	var assetIDs = [ 
		"flamingo",
		"fox", 
		"horse",
		"hummingbird", 
		"parrot", 
		"rabbit", 
		"toad", 
		"treefrog", 
		"stork"
	]; 


	function init() {

		initScene(); 

		initGeometry(); 

		initRenderer(); 

		initModels(); 
	}


	function initScene() {

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, .01, 1000 );

		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0x222222 );
		scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

		scene.add( new THREE.HemisphereLight( 0x888877, 0x777788 ) );

		spotLight = new THREE.SpotLight( 0xffffff ); 

		// TODO: Intensity? 

		spotLight.castShadow = true; 
		spotLight.shadow.camera.top = 2;
		spotLight.shadow.camera.bottom = -2;
		spotLight.shadow.camera.right = 2;
		spotLight.shadow.camera.left = -2;
		spotLight.shadow.mapSize.set( 4096, 4096 );


		var geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
		var lightCube = new THREE.Mesh( geometry, material );
		lightCube.position.set( 0, 6, 0); 

		lightCube.add( spotLight ); 

		lightCube.name = "lightCube"; 

		lightCube.userData.isSpotLightControl = true; 

		Core.addCursorObject( lightCube, true ); 
	}



	function initGeometry() {

		var geometry = new THREE.BoxGeometry( 2, 1.5, 1 );
		var material = new THREE.MeshStandardMaterial( {
			color: 0x444444,
			roughness: 1.0,
			metalness: 0.0
		} );

		var table = new THREE.Mesh( geometry, material );

		table.position.y = 0.35;
		table.position.z = -1;
		table.castShadow = true;
		table.receiveShadow = true;
		table.name = "table"; 
		scene.add( table );

		var geometry = new THREE.PlaneGeometry( 4, 4 );
		var material = new THREE.MeshStandardMaterial( {
			color: 0x222222,
			roughness: 1.0,
			metalness: 0.0
		} );

		var floor = new THREE.Mesh( geometry, material );

		floor.rotation.x = - Math.PI / 2;
		floor.receiveShadow = true;
		floor.name = "floor"; 
		scene.add( floor );
		scene.add( new THREE.GridHelper( 20, 40, 0x111111, 0x111111 ) );

		Core.addCursorObject(table); 
		Core.addCursorObject(floor); 
	}


	function initRenderer() {

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true; 
		renderer.gammaInput = true; 
		renderer.gammaOutput = true; 
		document.body.appendChild( renderer.domElement );
	}


	function initModels() {

		loader = new THREE.JSONLoader();

		for (var i = 0; i < assetIDs.length; i++) {

			loadAsset(assetIDs[i], i); 
		}
	}


	function loadAsset( id, index ) {

		var filename = "../models/" + id + ".js"; 

		loader.load(filename, function ( geometry, materials ) {

			morphColorsToFaceColors(geometry);
      		geometry.computeMorphNormals();

      		var material = new THREE.MeshPhongMaterial({
      			color: 0xffffff, 
      			shininess: 30, 
      			morphTargets: true, 
      			morphNormals: true, 
      			vertexColors: THREE.FaceColors, 
      			shading: THREE.FlatShading
      		});

			var mesh; 


			mesh = new THREE.MorphBlendMesh(geometry, material); 


			mesh.name = id; 
			Core.addCursorObject( mesh, true ); 

			var mixer = new THREE.AnimationMixer( mesh ); 

			var clip = THREE.AnimationClip.CreateFromMorphTargetSequence( 'run', geometry.morphTargets, 30 );
			mixer.clipAction( clip ).setDuration( 1 ).play();

			mixers.push( mixer ); 

			mesh.position.set( index, index, index ); 
			mesh.scale.set( 0.005, 0.005, 0.005 ); 
		});
	}


	function morphColorsToFaceColors(geometry) {

		if (geometry.morphColors && geometry.morphColors.length) {

			var colorMap = geometry.morphColors[0];

			for (var i = 0; i < colorMap.colors.length; i++) {

				geometry.faces[i].color = colorMap.colors[i];
			}
		}
	}


	function update( delta ) {

		if ( renderer ) {

			for ( var i = 0; i < mixers.length; i++ ) {

				mixers[i].update( delta ); 
			}
		}

		renderer.render( scene, camera );
	}


	function getScene() {
		return scene; 
	}


	function getCamera() {
		return camera; 
	}


	function getSpotLight() {
		return spotLight; 
	}


	function setSize() {
		renderer.setSize( window.innerWidth, window.innerHeight );
	}


	return {
		init: init,
		update: update, 
		getScene: getScene, 
		getCamera: getCamera, 
		getSpotLight: getSpotLight, 
		setSize: setSize
	}; 

}(); 