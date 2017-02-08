var Core = function() {

	// Globals
	var player; 					// local player object
	var otherPlayers = { }; 		// map of other / remote players by their IDs
	var cursorObjects = [ ]; 		// list of objects to check for intersection with SphericalCursor
	var draggableObjects = [ ]; 	// list of objects that are draggable ( object.userData.isDraggable = true )
	var isWebVR = false; 			// is the user's browser WebVR capable? 
	var clock = new THREE.Clock(); 	// Three.js clock for calculating update delta times


	function init() {

		// Init Three.js scene
		Scene.init(); 

		// Init events for locking and unlocking cursor
		initPointerLockEvents(); 

		// TODO: Init WebVR
		/*
		isWebVR = WebVR.isAvailable(); 

		if ( isWebVR ) {

			console.log("WebVR available!"); 

			effect = new THREE.VREffect( renderer );

			document.body.appendChild( WebVR.getButton( effect ) );
		
		} else {

			console.log( "No WebVR available!" ); 
			document.body.appendChild( WebVR.getMessage() );

		}*/
	}


	function update() {

		if ( player ) {

			// Get time since last update
			var delta = clock.getDelta(); 

			// Update local player controls
			Controls.update( delta ); 

			// Update local player paint and interactions
			player.update(); 

			// Update and render the Three.js scene
			Scene.update( delta ); 

			// Return updated local data to Client for broadcasting to other players
			return getUpdateData(); 

			// TODO: Update / render WebVR 
			/*
			if ( isWebVR ) {
				effect.render( Scene.getScene(), Scene.getCamera() ); 
			} else {
				renderer.render( Scene.getScene(), Scene.getCamera() );
			}
			*/
		}

		return null; 
	}


	function createPlayer( data ) {

		console.log( "CREATING LOCAL PLAYER: " + data.id ); 

		// Create and store the local player
		player = new Player( data.id, true, data.isFirst, isWebVR, Scene.getCamera(), Scene.getScene() ); 

		// Init controls
		Controls.init( Scene.getCamera(), Scene.getScene(), isWebVR, data.isFirst ? 1.8 : 0.18 ); 
	}


	function updateFromNetwork( data ) {
		// Got updated remote data from other player

		if ( player && player.id == data.id ) {
			// Should not be receiving remote data for the local player 
			return; 
		}

		if ( otherPlayers[ data.id ] ) {

			// Update the other player with their new remote data
			otherPlayers[ data.id ].updateFromNetwork( data );
		}

		if ( data.light != null ) {
			Scene.setSpotLight( data.light ); 
		}
	}


	function updateAllFromNetwork( data ) {
		// Got comprehensive state of another player from server (upon first joining existing game)

		// Add other player
		var otherPlayer = addOtherPlayer( data ); 

		if ( otherPlayer ) {

			// Update the other player with their current network data
			otherPlayer.updateFromNetwork( data ); 
		}

		if ( data.light != null ) {
			Scene.setSpotLight( data.light ); 
		}
	}


	function addOtherPlayer( data ) {
		// A new player has joined the game

		if ( !data.id || player && player.id == data.id ) {
			// Should not add remote players without an ID, or remote players whose ID matches the local player
			return; 
		} 

		console.log( "CREATING OTHER PLAYER: " + data.id ); 

		// Create and store new remote player from the network
		otherPlayers[ data.id ] = new Player( data.id, false, data.isFirst, false, Scene.getCamera(), Scene.getScene() ); 

	    return otherPlayers[ data.id ]; 
	}


	function removeOtherPlayer( id ) {
		// Other player has left the game

		if ( otherPlayers[ id ] ) {

			// Remove the player from the local game and the list of other players
		    Scene.getScene().remove( otherPlayers[ id ].getMesh() );
		    delete otherPlayers[ id ]; 
		}

		// TODO: Remove paint objects for this player? 
	}



	function getUpdateData() {
		// Get updated data from the local player to broadcast to server

		if ( player ) {

			var data = player.getUpdateData(); 						// player paint strokes and interactions since last update
			data.pos = Controls.getPosition(); 						// player position
			data.dir = Controls.getDirection(); 					// player direction / rotation
			data.drag = [ SphericalCursor.getDraggedObjectData() ]; // player's dragged object name and position
			data.light = Scene.getSpotLightChange(); 				// spotlight state
			return data; 
		}

		return null; 
	}


	function getAllData() {
		// Get comprehensive data from this player to send to new player

		if ( player ) {

			var data = player.getAllData(); 						// all player paint strokes and interactions since start of game
			data.pos = Controls.getPosition(); 						// player position
			data.dir = Controls.getDirection(); 					// player direction / rotation
			data.drag = getDraggableObjectData(); 					// state of all draggable objects
			data.light = Scene.getSpotLightState(); 				// spotlight state
			return data; 
		}

		return null; 
	}


	function getCursorObjects() {
		return cursorObjects; 
	}


	function addCursorObject( object, isDraggable ) {
		// Add a new object to the list of objects that interact with SphericalCursor

		if ( isDraggable ) {
			// Object is draggable

			object.userData.draggable = true; 
			draggableObjects.push( object ); 
		}

		Scene.getScene().add( object ); 
		cursorObjects.push( object ); 
	}


	function getDraggableObjectData() {
		// Get current state for all draggable objects

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


	function setPaintColor( color ) {
		player.setPaintColor( color ); 
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
					// Pointer is locked

					if ( player ) {

						// Enable controls and player updating
						Controls.setEnabled( true ); 
						player.setEnabled( true ); 
					}

					blocker.style.display = 'none';

				} else {
					// Pointer is unlocked

					if ( player ) {

						// Disable controls and player updating
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
		setPaintColor: setPaintColor
	}; 

}(); 