var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var socketSessions = require('socket.io-handshake');
var crypto = require('crypto');
function sha256( data ){
	return crypto.createHash('sha256').update(data).digest('hex');
}

console.log( sha256('password') );
//io.use( socketSessions() );
app.use( express.static(__dirname + '/www'));
var clients = {};
var users = {
	tholum : '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
};
io.on('connection', function(socket){
	console.log( "connection" );
	//We want anyone to be able to connect who is providing us a shell to them
	//The one's we are worried about are people trying to connect to the shell
	socket.on( 'createClient' , function( data ){
		if( clients.hasOwnProperty( data.name ) ){
			socket.emit( 'creationerror', 'name exists');
		} else {
			clients[data.name] = { name : data.name };
			socket.on('disconnect', function() {
				delete clients[data.name];
			} );
			socket.on( data.name + 'data' , function( newdata ){
				socket.broadcast.emit( data.name + 'data' , newdata );
			});
		}
		
	});
	socket.on('auth' , function( data ){
		console.log( data.username );
		console.log( sha256( data.password ) );
		if( users.hasOwnProperty( data.username ) && sha256( data.password ) == users[data.username] ){
			socket.username = data.username;
			socket.emit( 'authSuccess' , data.username );
		} else {
			//Setting up a random timeout to prevent the sidechannel timing attack of getting valid usernames 
			// ( Basicly without this a the if function would error out a fraction of a second sooner if the user
			// did not exist, becouse the first 1/2 of the if statement would return false and javascript would not
			// bother checking the second half
			setTimeout( function(){ socket.emit('Invalid Username or Password'); },  Math.floor( Math.random() * 1000 ) +1   );
		}
	});
	socket.on( 'joinClient' , function( ci ){
		console.log( socket.username );
		console.log( ci.name );
		if( socket.username !== undefined ){
			socket.on( ci.name + 'data' , function( data ){
				socket.broadcast.emit( ci.name + 'data' , data );
			});
		}
	}); 
	/*socket.on('xxlocalhostdata' , function( data ){
		socket.broadcast.emit( 'localhostdata' , data );
	});
	
	socket.on('serverAuth' , function(data){
		socket.join( data.server );
	});
	socket.on('clientAuth' , function(data){
		socket.join( data.server );
	});*/
});

http.listen(8011);
