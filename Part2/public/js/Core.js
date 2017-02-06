var Core = function() {

	// Globals
	var player; 
	var otherPlayers = { }; 
	var cursorObjects = [ ]; 
	var draggableObjects = [ ]; 
	var isWebVR = false; 
	var clock = new THREE.Clock(); 

	var middleMouseDown = false; 

	// Events
	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener( 'mousedown', onMouseDown, false ); 
	window.addEventListener( 'mouseup', onMouseUp, false ); 
	window.addEventListener( "DOMMouseScroll", onScroll, false ); // for Firefox
	window.addEventListener( "mousewheel",    onScroll, false ); // for everyone else


	function init() {

		Scene.init(); 

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
						Controls.setEnabled( true ); 
						player.setEnabled( true ); 
					}

					blocker.style.display = 'none';

				} else {

					if ( player ) {
						Controls.setEnabled( false ); 
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

		if ( player ) {

			Controls.update(); 

			var delta = clock.getDelta(); 

			player.update(); 

/*
			if ( isWebVR ) {
				effect.render( Scene.getScene(), Scene.getCamera() ); 
			} else {
				renderer.render( Scene.getScene(), Scene.getCamera() );
			}
*/

			Scene.update( delta ); 

			return getUpdateData(); 
		}

		return null; 
	}


	function onWindowResize() {

		Scene.getCamera().aspect = window.innerWidth / window.innerHeight;
		Scene.getCamera().updateProjectionMatrix();

		/*if ( isWebVR ) {
			effect.setSize( window.innerWidth, window.innerHeight );
		} else {*/
			Scene.setSize( window.innerWidth, window.innerHeight );
		//}
	}


	function createPlayer( data ) {

		console.log("CREATING LOCAL PLAYER: " + data.id + " " + data.isFirst); 

		player = new Player( data.id, true, data.isFirst, isWebVR, Scene.getCamera(), Scene.getScene() ); 

		Controls.init( Scene.getCamera(), Scene.getScene(), isWebVR, data.isFirst ? 1.8 : 0.18 ); 
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

		var otherPlayer = new Player( data.id, false, data.isFirst, false, Scene.getCamera(), Scene.getScene() ); 

	    otherPlayers[ data.id ] = otherPlayer;

	    return otherPlayer; 

	}


	function removeOtherPlayer( id ) {

	    Scene.getScene().remove( otherPlayers[ id ].mesh );

	    delete otherPlayers[ id ]; 
	}



	function getUpdateData() {

		if ( player ) {

			var data = player.getUpdateData(); 
			data.pos = Controls.getPosition(); 
			data.dir = Controls.getDirection(); 
			data.drag = [ SphericalCursor.getDraggedObjectData() ]; 
			data.light = getSpotLightState(); 
			return data; 
		}

		return null; 
	}


	function getAllData() {

		if ( player ) {

			var data = player.getAllData(); 
			data.pos = Controls.getPosition(); 
			data.dir = Controls.getDirection(); 
			data.drag = /*Core.*/getDraggableObjectData(); 
			data.light = getSpotLightState(); 
			return data; 
		}

		return null; 
	}


	function getCursorObjects() {
		return cursorObjects; 
	}


	function addCursorObject( object, isDraggable ) {

		if ( isDraggable ) {
			object.userData.draggable = true; 
			draggableObjects.push( object ); 
		}

		Scene.getScene().add( object ); 
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


	var canToggle = true; 
	function toggleSpotlight() {
		if ( !canToggle ) {
			return; 
		}

		Scene.getSpotLight().intensity = getSpotLightState() ? 1 : 0; 
		canToggle = false; 

		setTimeout( function( ) { 
			canToggle = true; 
		}, 1000);
	}


	function getSpotLightState() {
		return Scene.getSpotLight().intensity == 0;
	}

	function setSpotLight( bool ) {
		Scene.getSpotLight().intensity = bool ? 1 : 0; 
	}



	function onMouseDown( event ) {

		if ( event.button == 0 ) {

			player.setLeftMouseDown( true ); 

		} else if ( event.button == 1 ) {

			middleMouseDown = true;  

		} else if ( event.button == 2 ) {

			SphericalCursor.setRightMouseDown( true ); 

		}
	}


	function onMouseUp( event ) {

		if ( event.button == 0 ) {

			player.setLeftMouseDown( false ); 

		} else if ( event.button == 1 ) {

			middleMouseDown = false; 

		} else if ( event.button == 2 ) {

			SphericalCursor.setRightMouseDown( false ); 
		}
	}


	function onScroll( event ){

		var direction = ( event.detail < 0 || event.wheelDelta > 0 ) ? 1 : -1;

		if ( middleMouseDown ) {

			player.changePainterThickness( direction ); 

		} else {

			SphericalCursor.updateCurrentDistance( direction ); 
		}
	}




	return {
		init: init, 
		createPlayer: createPlayer, 
		addOtherPlayer: addOtherPlayer, 
		removeOtherPlayer: removeOtherPlayer,
		update: update, 
		updateFromNetwork: updateFromNetwork, 
		updateAllFromNetwork: updateAllFromNetwork, 
		getAllData: getAllData,

		getCursorObjects: getCursorObjects, 
		addCursorObject: addCursorObject, 
		toggleSpotlight: toggleSpotlight, 
		setSpotLight: setSpotLight
	}; 

}(); 