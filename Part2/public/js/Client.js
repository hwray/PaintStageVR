var Client = function() {


	var socket = io();



	socket.on( 'connect', function() {
		console.log("CONNECTING"); 
		Core.init(); 
	    socket.emit( 'requestOldPlayers', { } );
	});


	socket.on( 'createPlayer', function( id ) {
		console.log("CREATING LOCAL PLAYER: " + id ); 
	    Core.createPlayer( id );
	});


	socket.on( 'update', function( data ) {
		console.log("UPDATING FROM NETWORK"); 
	    Core.updateFromNetwork( data );
	}); 


	socket.on( 'addOtherPlayer', function( id ) {
		console.log("ADDING OTHER PLAYER"); 
	    Core.addOtherPlayer( id );
	});


	socket.on( 'removeOtherPlayer', function( id ) {
		console.log("REMOVING OTHER PLAYER"); 
	    Core.removeOtherPlayer( id );
	});



	( function update() {
		requestAnimationFrame( update );

		var data = Core.update(); 

		if ( data ) {

			socket.emit( 'update', data );
		}

	} )(); 


}(); 