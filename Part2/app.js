// Constants
var PORT = 3000; 

// Globals
var express = require( 'express' );
var app = express();
var http = require( 'http' ).Server( app );
var io = require( 'socket.io' )( http );

// Static directories
app.use( express.static( 'public' ) );


app.get( '/', function( req, res ) {

	res.sendFile( '/index.html' , { root: __dirname } );
});


var players = [ ]; 

io.on( 'connection', function( socket ) {

    var id = socket.id;

    players.push( id ); 

    socket.emit( 'createPlayer', id );

    console.log("New player: " + id); 

    // Send position data as well? 
    socket.broadcast.emit( 'addOtherPlayer', id );

    socket.on( 'requestOldPlayers', function() {
        for ( var i = 0; i < players.length; i++ ) {
            if ( players[i].id != id ) {
            	// Send position data as well? 
                socket.emit( 'addOtherPlayer', players[i] );
            }
        }
    });


    socket.on( 'updatePosition', function( data ) {
    	socket.broadcast.emit( 'updatePosition', data );
    });


    socket.on( 'disconnect', function() {

        console.log('a user disconnected');

        io.emit( 'removeOtherPlayer', id );
    });

});


http.listen( PORT, function() {

	console.log( 'App listening on port ' + PORT );
});
