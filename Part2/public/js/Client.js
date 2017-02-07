var Client = function() {

	// Globals
	var socket = io();		// local Socket.io connection


	socket.on( 'connect', function() {
		// Initial socket connection

		// Initialize app core
		Core.init(); 

		// Request current app data from server: other players, objects, etc. 
	    socket.emit( 'requestCurrentData', { } );
	});


	socket.on( 'createPlayer', function( data ) {
		// Initial message from server to create the local player

		// Create the local player
	    Core.createPlayer( data );
	});


	socket.on( 'getAllData', function( id ) {
		// New remote player has requested current app data

		// Get all existing app data for this player
	    var data = Core.getAllData();

	    // Save the ID of the new / requesting player so server knows which socket to forward the data to
	    data.requesterId = id; 

	    // Send the data to server
	    socket.emit( 'allData', data ); 
	});


	socket.on( 'giveAllData', function( data ) {
		// Receiving all current remote app data from another player

		// Update the local game with all current remote app data
		Core.updateAllFromNetwork( data ); 
	});


	socket.on( 'update', function( data ) {
		// Receiving updated data from another player

		// Update other player's data in local game
	    Core.updateFromNetwork( data );
	}); 


	socket.on( 'addOtherPlayer', function( data ) {
		// A new player has joined the game

		// Create the other player and add them to the local game
	    Core.addOtherPlayer( data );
	});


	socket.on( 'removeOtherPlayer', function( id ) {
		// A remote player has left the game

		// Remove the player from the local game
	    Core.removeOtherPlayer( id );
	});



	( function update() {
		// Main update loop

		// Callback this update loop when the next animation frame is available
		requestAnimationFrame( update );

		// Update the local game and return updated data for this player
		var data = Core.update(); 

		if ( data ) {

			// Broadcast updated local data to other players via server
			socket.emit( 'update', data );
		}

	} )(); 


}(); 