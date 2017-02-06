// Constants
var PORT = 3000; 

// Globals
var express = require( 'express' );
var app = express();
var http = require( 'http' ).Server( app );
var io = require( 'socket.io' )( http );
var players = [ ]; 

// Static directories
app.use( express.static( 'public' ) );


app.get( '/', function( req, res ) {

	res.sendFile( '/index.html' , { root: __dirname } );
});



io.on( 'connection', function( socket ) {

	console.log( "New player: " + socket.id ); 

	// Store new player
    var id = socket.id;
    players.push( id ); 

    // Give new player their ID and whether they are the first player, and tell them to create the local player character
    var data = {
    	id: id, 
    	isFirst: players.length == 1
    }; 
    socket.emit( 'createPlayer', data );

    // Tell all other players to add the new player to their local games
    socket.broadcast.emit( 'addOtherPlayer', data );


    // The new player is requesting existing app data 
    socket.on( 'requestOldData', function() {

    	// Tell all other players to respond with their existing app data
    	socket.broadcast.emit( 'getAllData', id ); 
    });


    // The player has responded with their existing app data
    socket.on( 'allData', function( data ) { 

    	// Send existing app data to the new player who requested it
    	io.to( data.requesterId ).emit( 'giveAllData', data );  
    }); 


    // The player has updated its local game state
    socket.on( 'update', function( data ) {

    	// Broadcast this player's data to all other players
    	socket.broadcast.emit( 'update', data );
    });


    // Player has left game or disconnected from server
    socket.on( 'disconnect', function() {

        console.log( 'Player disconnected: ' + id );

        // Remove the player from the list of players
        for ( var i = 0; i < players.length; i++ ) {

        	if ( players[i] == id ) {
        		players.splice( i, 1 );
        	}
        }

        // Tell all players that this player has left the game
        io.emit( 'removeOtherPlayer', id );
    });

});


http.listen( PORT, function() {

	console.log( 'App listening on port ' + PORT );
});
