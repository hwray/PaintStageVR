var Client = function() {


	var socket = io();


	// Initial socket connection
	socket.on( 'connect', function() {

		// Initialize app core
		Core.init(); 

		// Request existing app data: other players, objects, etc. 
	    socket.emit( 'requestOldData', { } );
	});


	// Initial message from server to create the local player
	socket.on( 'createPlayer', function( data ) {

		// Create the local player
	    Core.createPlayer( data );
	});


	// New player has requested existing app data
	socket.on( 'getAllData', function( id ) {

		// Get all existing app data for this player
	    var data = Core.getAllData();

	    // Save the ID of the new / requesting player so server knows which socket to forward the data to
	    data.requesterId = id; 

	    // Send the data to server
	    socket.emit( 'allData', data ); 
	});


	// Server has responded to requestOldData() request with existing app data from another player
	socket.on( 'giveAllData', function( data ) {

		// Update the local game with all existing app data
		Core.updateAllFromNetwork( data ); 
	});


	// Updated data from another player has been received from the server
	socket.on( 'update', function( data ) {

		// Update other player's data in local game
	    Core.updateFromNetwork( data );
	}); 


	// New player has joined
	socket.on( 'addOtherPlayer', function( data ) {

		// Add them to the local game
	    Core.addOtherPlayer( data );
	});


	// Player has left game
	socket.on( 'removeOtherPlayer', function( id ) {

		// Remove the player from the local game
	    Core.removeOtherPlayer( id );
	});


	// Main update loop
	( function update() {

		requestAnimationFrame( update );

		// Update the local game and return updated data for this player
		var data = Core.update(); 

		if ( data ) {

			// Broadcast updated data to other players  via server
			socket.emit( 'update', data );
		}

	} )(); 


}(); 