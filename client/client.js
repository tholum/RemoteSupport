var io = require('socket.io-client');
var pty = require('pty.js');
var serverName = 'localhost';
socket = io.connect('http://localhost:8011', {
    port: 8011
});

var term = pty.spawn('bash', [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
});
socket.on('connect', function(s){
	socket.emit( 'createClient' , { name : serverName } );
});
	//socket.join('serverAuth' , { server : 'localhost' } );
//	console.log( servername + 'data' );
	socket.on( serverName + 'data' , function(data){
		term.write(data);
	} );
	socket.on( serverName + 'resize' , function( data ){
		term.resize( data.rows , data.cols );
	});
	term.on('data', function(data) {
		socket.emit( serverName + 'data' , data )
	});
//});

