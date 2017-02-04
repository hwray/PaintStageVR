var Core = function() {

	// Globals
	var camera; 
	var scene; 
	var renderer; 
	var mesh; 
	var player; 
	var otherPlayers = { }; 


	// Events
	window.addEventListener( 'resize', onWindowResize, false );

	function init() {

		initScene(); 

		initGeometry(); 

		initRenderer(); 

		initPointerLockEvents(); 

		animate();
	}


	function initScene() {

		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

		scene = new THREE.Scene();
		scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

		var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
		light.position.set( 0.5, 1, 0.75 );
		scene.add( light );
	}


	function initGeometry() {

		var geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
		geometry.rotateX( - Math.PI / 2 );

		for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

			var vertex = geometry.vertices[ i ];
			vertex.x += Math.random() * 20 - 10;
			vertex.y += Math.random() * 2;
			vertex.z += Math.random() * 20 - 10;

		}

		for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

			var face = geometry.faces[ i ];
			face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
			face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
			face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

		}

		var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

		mesh = new THREE.Mesh( geometry, material );
		scene.add( mesh );
	}


	function initRenderer() {

		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor( 0xffffff );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );
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


	function animate() {

		requestAnimationFrame( animate );

		if ( player ) {
			player.update(); 
		}

		renderer.render( scene, camera );

	}


	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	}


	function createPlayer( id ) {

		player = new Player( id, true ); 

		Controls.init(); 
	}


	function updatePlayerPosition( data ) {
		if ( id = player.id ) {
			return; 
		}

		if ( otherPlayers[ data.id ] ) {

			otherPlayers[ data.id ].updatePosition( data );
		}
	}


	function addOtherPlayer( id ) {

		if ( id == player.id ) {
			return; 
		} 

		var otherPlayer = new Player( id, false ); 

	    otherPlayers[ id ] = otherPlayer;

	    scene.add( otherPlayer.mesh );

	}


	function removeOtherPlayer( id ){

	    scene.remove( otherPlayers[ id ].mesh );
	}


	function getCamera() {
		return camera; 
	}


	function getScene() {
		return scene; 
	}


	return {
		init: init, 
		createPlayer: createPlayer, 
		addOtherPlayer: addOtherPlayer, 
		removeOtherPlayer: removeOtherPlayer,
		updatePlayerPosition: updatePlayerPosition, 
		getCamera: getCamera, 
		getScene: getScene
	}; 

}(); 