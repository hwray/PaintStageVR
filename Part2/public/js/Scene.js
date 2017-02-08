var Scene = function() {

	// Constants
	var BACKGROUND_COLOR = 0x222222; 
	var FLOOR_COLOR = 0x222222; 
	var FLOOR_SIZE = 6; 
	var FOG_COLOR = 0xffffff; 
	var FOG_NEAR = 10; 
	var FOG_FAR = 75; 
	var LIGHT_CUBE_SIZE = 0.5; 				// size of the cube that visualizes spotlight position
	var TABLE_COLOR = 0x444444; 

	// Globals
	var camera; 
	var scene; 
	var renderer;
	var effect;  
	var spotLight; 
	var spotLightChanged = false; 
	var loader; 
	var mixers = [ ]; 
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
	var assetScales = {
		"flamingo": 0.006,
		"fox": 0.007,
		"horse": 0.004,
		"hummingbird": 0.015,
		"parrot": 0.006,
		"rabbit": 0.006,
		"toad": 0.007,
		"treefrog": 0.007,
		"stork": 0.006
	}; 


	// Events
	window.addEventListener( 'resize', onWindowResize, false );


	function init() {

		// Init basic scene variables
		initScene(); 

		// Init lights
		initLights(); 

		// Init scene geometry
		initGeometry(); 

		// Init renderer
		initRenderer(); 

		// Load and init animated models
		initModels(); 
	}


	function initScene() {

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, .01, 1000 );

		scene = new THREE.Scene();
		scene.background = new THREE.Color( BACKGROUND_COLOR );
		scene.fog = new THREE.Fog( FOG_COLOR, FOG_NEAR, FOG_FAR );
	}


	function initLights() {

		var hemisphereLight = new THREE.HemisphereLight( 0x888877, 0x777788 ); 
		hemisphereLight.intensity = 0.2; 

		scene.add( hemisphereLight );

		spotLight = new THREE.SpotLight( 0xffffff ); 
		spotLight.angle = Math.PI / 8;
		spotLight.intensity = 1; 
		spotLight.castShadow = true; 
		spotLight.shadow.camera.top = 2;
		spotLight.shadow.camera.bottom = -2;
		spotLight.shadow.camera.right = 2;
		spotLight.shadow.camera.left = -2;
		spotLight.shadow.mapSize.set( 4096, 4096 );

		var geometry = new THREE.BoxGeometry( LIGHT_CUBE_SIZE, LIGHT_CUBE_SIZE, LIGHT_CUBE_SIZE );
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
		var lightCube = new THREE.Mesh( geometry, material );
		lightCube.position.set( 0, 7.5, -2); 

		lightCube.add( spotLight ); 

		lightCube.name = "lightCube"; 

		lightCube.userData.isSpotLightControl = true; 

		Core.addCursorObject( lightCube, true ); 
	}


	function initGeometry() {

		initTable( 0, 0.6, -2, 4, 1.2, 1 ); 
		initTable( -3, 0.6, 1, 1, 1.2, 4);
		initTable( 3, 0.6, 1, 1, 1.2, 4);

		var geometry = new THREE.PlaneGeometry( FLOOR_SIZE, FLOOR_SIZE );
		var material = new THREE.MeshStandardMaterial( {
			color: FLOOR_COLOR,
			roughness: 1.0,
			metalness: 0.0
		} );

		var floor = new THREE.Mesh( geometry, material );

		floor.rotation.x = - Math.PI / 2;
		floor.receiveShadow = true;
		floor.name = "floor"; 
		scene.add( new THREE.GridHelper( 20, 40, 0x111111, 0x111111 ) );

		Core.addCursorObject(floor); 
	}


	function initTable( x, y, z, s_x, s_y, s_z ) {

		var geometry = new THREE.BoxGeometry( s_x, s_y, s_z );
		var material = new THREE.MeshStandardMaterial( {
			color: TABLE_COLOR,
			roughness: 1.0,
			metalness: 0.0
		} );

		var table = new THREE.Mesh( geometry, material );

		table.position.x = x; 
		table.position.y = y;
		table.position.z = z;
		table.castShadow = true;
		table.receiveShadow = true;
		table.name = "table"; 

		Core.addCursorObject(table); 

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

			var mesh = new THREE.MorphBlendMesh(geometry, material); 

			mesh.name = id; 
			Core.addCursorObject( mesh, true ); 

			var mixer = new THREE.AnimationMixer( mesh ); 

			var clip = THREE.AnimationClip.CreateFromMorphTargetSequence( 'run', geometry.morphTargets, 30 );
			mixer.clipAction( clip ).setDuration( 10 ).play();

			mixers.push( mixer ); 

			var scale = assetScales[ id ]; 

			mesh.position.set( 2.9, 1.3, -1.0 + index * 0.5); 
			mesh.rotation.y -= Math.PI / 2; 
			mesh.scale.set( scale, scale, scale ); 
		});
	}


	function morphColorsToFaceColors(geometry) {

		if ( geometry.morphColors && geometry.morphColors.length ) {

			var colorMap = geometry.morphColors[0];

			for ( var i = 0; i < colorMap.colors.length; i++ ) {

				geometry.faces[i].color = colorMap.colors[i];
			}
		}
	}


	function update( delta ) {

		if ( renderer ) {

			// Update all animated models
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


	function setSpotLight( intensity ) {
		spotLight.intensity = intensity; 
	}


	function getSpotLightChange() {

		if ( spotLightChanged ) {
			spotLightChanged = false; 
			return spotLight.intensity; 
		} 

		return null; 
	}


	function getSpotLightState() {
		return spotLight.intensity; 
	}


	function toggleSpotLight() {
		// Toggle the Three.js spotlight on/off

		// TODO: Set some kind of timeout to avoid toggling each frame the left mouse is clicked? 
		spotLight.intensity = spotLight.intensity > 0 ? 0 : 1; 

		spotLightChanged = true; 
	}


	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

		// TODO: Resize WebVR effect
		/*
		if ( isWebVR ) {
			effect.setSize( window.innerWidth, window.innerHeight );
		} else {
			renderer.( window.innerWidth, window.innerHeight );
		}*/
	}


	return {
		init: init,
		update: update, 
		getScene: getScene, 
		getCamera: getCamera, 
		setSpotLight: setSpotLight, 
		getSpotLightChange: getSpotLightChange, 
		toggleSpotLight: toggleSpotLight, 
		getSpotLightState: getSpotLightState
	}; 

}(); 