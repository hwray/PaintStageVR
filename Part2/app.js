// Constants
var PORT = 3000; 							// port for app to listen to

// Globals
var express = require( 'express' );			// Express
var app = express();						// Express app
var http = require( 'http' ).Server( app );	// HTTP server
var io = require( 'socket.io' )( http );	// Socket.io listener
var players = [ ]; 							// list of current players

// Static file directories
app.use( express.static( 'public' ) );


app.get( '/', function( req, res ) {
	// New HTTP request to server root

	// Send index.html as response
	res.sendFile( '/index.html' , { root: __dirname } );
});


io.on( 'connection', function( socket ) {
	// New Socket.io connection

	console.log( "New player: " + socket.id ); 

	// Store new player
    var id = socket.id;

    // Create new player data: their ID and whether they are the first player (determines player size)
    var data = {
    	id: id, 
    	isFirst: players.length == 0
    }; 

    // Tell new player to create the local player character 
    socket.emit( 'createPlayer', data );

    // Tell all other players to add the new remote player to their local games
    socket.broadcast.emit( 'addOtherPlayer', data );


    socket.on( 'requestCurrentData', function() {
    	// New player has created their local game and player character, and is now requesting current app data from remote users

    	// Store the new player in the players array
    	// (Want to do this here, rather than on initial connection, because of the possibility of multiple initial connections due to page pre-fetch etc.)
    	// (Only want to store players that actually fully connect and create a local game / player character first)
    	players.push( id ); 

    	// Tell all other players to respond with all their current local data
    	socket.broadcast.emit( 'getAllData', id ); 
    });

    
    socket.on( 'allData', function( data ) { 
    	// Player has responded with all their current local data

    	// Send the data to the new remote player who requested it
    	io.to( data.requesterId ).emit( 'giveAllData', data );  
    }); 


    socket.on( 'update', function( data ) {
    	// Player has updated their local game state and sent updated data

    	// Broadcast this player's update data to all other players
    	socket.broadcast.emit( 'update', data );
    });

    
    socket.on( 'disconnect', function() {
    	// Player has left game or disconnected from server

        console.log( 'Player disconnected: ' + id );

        // Remove the player from the list of players
        for ( var i = 0; i < players.length; i++ ) {

        	if ( players[i] == id ) {
        		players.splice( i, 1 );
        	}
        }

        // Tell all other players that this player has left the game, and that they should remove this player from their local games
        io.emit( 'removeOtherPlayer', id );
    });

});


// Initialize the HTTP server to listen on the specified PORT
http.listen( PORT, function() {

	console.log( 'App listening on port ' + PORT );
});
