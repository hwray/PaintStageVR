var Client = function() {

	var socket = io();


	socket.on('updatePosition', function( data ){
	    Core.updatePlayerPosition( data );
	}); 


	socket.on('connect', function() {
	    Core.init();
	    socket.emit( 'requestOldPlayers', { } );
	});


	socket.on('createPlayer', function( id ) {
	    Core.createPlayer( id );
	});


	socket.on('addOtherPlayer', function( id ) {
	    Core.addOtherPlayer( id );
	});


	socket.on('removeOtherPlayer', function( id ) {
	    Core.removeOtherPlayer( id );
	});


	function getSocket() {
		return socket; 
	}

	return {
		getSocket: getSocket
	}; 

}(); 