var Client = function() {


	var socket = io();



	socket.on( 'connect', function() {
		Core.init(); 
	    socket.emit( 'requestOldPlayers', { } );
	});


	socket.on( 'createPlayer', function( id ) {
	    Core.createPlayer( id );
	});


	socket.on( 'update', function( data ) {
	    Core.updateFromNetwork( data );
	}); 


	socket.on( 'addOtherPlayer', function( id ) {
	    Core.addOtherPlayer( id );
	});


	socket.on( 'removeOtherPlayer', function( id ) {
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