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

    console.log( "New player: " + id ); 

    // Send position data as well? 
    socket.broadcast.emit( 'addOtherPlayer', id );

    socket.on( 'requestOldPlayers', function() {


    	socket.broadcast.emit( 'getAllData', id ); 
    });


    socket.on( 'allData', function( data ) { 

    	io.to( data.requesterId ).emit( 'giveAllData', data );  
    }); 


    socket.on( 'update', function( data ) {
    	socket.broadcast.emit( 'update', data );
    });


    socket.on( 'disconnect', function() {

        console.log( 'Player disconnected: ' + id );

        for ( var i = 0; i < players.length; i++ ) {

        	if ( players[i] == id ) {
        		players.splice( i, 1 );
        	}
        }

        io.emit( 'removeOtherPlayer', id );
    });

});


http.listen( PORT, function() {

	console.log( 'App listening on port ' + PORT );
});
