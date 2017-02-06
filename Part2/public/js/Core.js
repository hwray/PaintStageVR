var Core = function() {

	// Globals
	var camera; 
	var scene; 
	var renderer;
	var effect;  
	var player; 
	var otherPlayers = { }; 
	var cursorObjects = [ ]; 
	var draggableObjects = [ ]; 
	var isWebVR = false; 
	var loader; 
	var assetIDs = [ 
		//"parrot",
		//"stork", 
		"fox"//, 
		//"horse"
	]; 
	var clock = new THREE.Clock(); 
	var mixer; 


	// Events
	window.addEventListener( 'resize', onWindowResize, false );


	function init() {

		initScene(); 

		initGeometry(); 

		initRenderer(); 

		initModels(); 

		initPointerLockEvents(); 

		isWebVR = WebVR.isAvailable(); 

		if ( isWebVR ) {

			console.log("WebVR available!"); 

			effect = new THREE.VREffect( renderer );

			document.body.appendChild( WebVR.getButton( effect ) );
		
		} else {

			console.log( "No WebVR available!" ); 
			//document.body.appendChild( WebVR.getMessage() );

		}

	}


	function initScene() {

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, .01, 1000 );

		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0x222222 );
		scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

		scene.add( new THREE.HemisphereLight( 0x888877, 0x777788 ) );

/*
		var light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 0, 0, 0 );
		light.castShadow = true;
		light.shadow.camera.top = 2;
		light.shadow.camera.bottom = -2;
		light.shadow.camera.right = 2;
		light.shadow.camera.left = -2;
		light.shadow.mapSize.set( 4096, 4096 );
		*/

		var light = new THREE.SpotLight( 0xffffff ); 

		// TODO: Params??? 

		light.castShadow = true; 
		light.shadow.camera.top = 2;
		light.shadow.camera.bottom = -2;
		light.shadow.camera.right = 2;
		light.shadow.camera.left = -2;
		light.shadow.mapSize.set( 4096, 4096 );


		var geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
		var lightCube = new THREE.Mesh( geometry, material );
		lightCube.position.set( 0, 6, 0); 

		lightCube.add( light ); 

		lightCube.name = "lightCube"; 

		Core.addCursorObject( lightCube, true ); 


		//scene.add( light );


		// scene.add( new THREE.DirectionalLightHelper( light ) );
		// scene.add( new THREE.CameraHelper( light.shadow.camera ) );
		//
	}



	function initGeometry() {

		var geometry = new THREE.BoxGeometry( 0.5, 0.8, 0.5 );
		var material = new THREE.MeshStandardMaterial( {
			color: 0x444444,
			roughness: 1.0,
			metalness: 0.0
		} );

		var table = new THREE.Mesh( geometry, material );

		table.position.y = 0.35;
		table.position.z = 0.85;
		table.castShadow = true;
		table.receiveShadow = true;
		table.name = "table"; 
		scene.add( table );

		/*
		var table = new THREE.Mesh( geometry, material );
		table.position.y = 0.35;
		table.position.z = -0.85;
		table.castShadow = true;
		table.receiveShadow = true;
		scene.add( table );
		*/

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

		cursorObjects.push(table); 
		cursorObjects.push(floor); 
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

			//var hasAnimation = true; 

			//if (hasAnimation) {

			mesh = new THREE.MorphBlendMesh(geometry, material); 

			//} else {

			//	mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(material));

			//}

			scene.add( mesh ); 

			mixer = new THREE.AnimationMixer( mesh ); 

			var clip = THREE.AnimationClip.CreateFromMorphTargetSequence( 'run', geometry.morphTargets, 30 );
			mixer.clipAction( clip ).setDuration( 1 ).play();

			mesh.position.set( 1, 1, 1 ); 
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


	function initPointerLockEvents() {
		var blocker = document.getElementById( 'blocker' );
		var instructions = document.getElementById( 'instructions' );

		// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

		var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

		if ( havePointerLock ) {

			var element = document.body;

			var pointerlockchange = function ( event ) {

				if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

					if ( player ) {
						player.setEnabled( true ); 
					}

					blocker.style.display = 'none';

				} else {

					if ( player ) {
						player.setEnabled( false ); 
					}

					blocker.style.display = '-webkit-box';
					blocker.style.display = '-moz-box';
					blocker.style.display = 'box';

					instructions.style.display = '';
				}
			};

			var pointerlockerror = function ( event ) {

				instructions.style.display = '';
			};

			// Hook pointer lock state change events
			document.addEventListener( 'pointerlockchange', pointerlockchange, false );
			document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
			document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

			document.addEventListener( 'pointerlockerror', pointerlockerror, false );
			document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
			document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

			instructions.addEventListener( 'click', function ( event ) {

				instructions.style.display = 'none';

				// Ask the browser to lock the pointer
				element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
				element.requestPointerLock();

			}, false );

		} else {

			instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

		}
	}


	function update() {

		if ( player && renderer ) {

			if ( mixer ) {

				mixer.update( ( clock.getDelta() ) ); 

			}


			player.update(); 

			if ( isWebVR ) {
				effect.render( scene, camera ); 
			} else {
				renderer.render( scene, camera );
			}

			return getUpdateData(); 
		}

		return null; 
	}


	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		if ( isWebVR ) {
			effect.setSize( window.innerWidth, window.innerHeight );
		} else {
			renderer.setSize( window.innerWidth, window.innerHeight );
		}
	}


	function createPlayer( data ) {

		console.log("CREATING LOCAL PLAYER: " + data.id + " " + data.isFirst); 

		player = new Player( data.id, true, data.isFirst, isWebVR, camera, scene ); 
	}


	function updateFromNetwork( data ) {
		if ( player && player.id == data.id ) {
			return; 
		}

		if ( otherPlayers[ data.id ] ) {

			otherPlayers[ data.id ].updateFromNetwork( data );
		}
	}


	function updateAllFromNetwork( data ) {

		var otherPlayer = addOtherPlayer( data ); 

		if ( otherPlayer ) {
			otherPlayer.updateFromNetwork( data ); 
		}
	}


	function addOtherPlayer( data ) {

		if ( !data.id || player && player.id == data.id ) {
			return; 
		} 

		console.log("CREATING OTHER PLAYER: " + data.id + " " + data.isFirst); 

		var otherPlayer = new Player( data.id, false, data.isFirst, false, camera, scene ); 

	    otherPlayers[ data.id ] = otherPlayer;

	    scene.add( otherPlayer.mesh );

	    return otherPlayer; 

	    //var line = otherPlayer.getLine(); 

	    //line.name = "line"; 

	    //cursorObjects.push( line ); 

	}


	function removeOtherPlayer( id ) {

	    scene.remove( otherPlayers[ id ].mesh );

	    delete otherPlayers[ id ]; 
	}



	function getUpdateData() {

		if ( player ) {

			return player.getUpdateData(); 
		}

		return null; 
	}


	function getAllData() {

		if ( player ) {

			return player.getAllData(); 
		}

		return null; 
	}


	function getCursorObjects() {
		return cursorObjects; 
	}


	function getSceneObjects() {
		return cursorObjects; 
	}


	function addCursorObject( object, isDraggable ) {

		if ( isDraggable ) {
			object.userData.draggable = true; 
			draggableObjects.push( object ); 
		}

		scene.add( object ); 
		cursorObjects.push( object ); 
	}


	function getDraggableObjectData() {

		var data = [ ]; 

		for ( var i = 0; i < draggableObjects.length; i++ ) {
			var object = draggableObjects[i]; 
			data.push( { 
				name: object.name, 
				pos: object.position 
			} );  
		}

		return data; 
	}



	return {
		init: init, 
		update: update, 
		createPlayer: createPlayer, 
		addOtherPlayer: addOtherPlayer, 
		removeOtherPlayer: removeOtherPlayer,
		updateFromNetwork: updateFromNetwork, 
		updateAllFromNetwork: updateAllFromNetwork, 
		getAllData: getAllData,

		getCursorObjects: getCursorObjects, 
		getSceneObjects: getSceneObjects, 
		addCursorObject: addCursorObject, 
		getDraggableObjectData: getDraggableObjectData
	}; 

}(); 