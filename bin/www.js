#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('chat:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
//creación del websocket a partir del servidor http:
const io = require('socket.io')(server);
//suscripción a eventos:
io.on('connection', (socket) => {
  console.log('Conexión de nuevo cliente');
  socket.broadcast.emit('mensaje_chat', {
    usuario: 'INFO',
    mensaje: 'Se ha conectado un nuevo usuario'
  });

  io.emit('num_clientes', io.engine.clientsCount);

  //detectar la desconexión de un usuario:
  socket.on('disconnect', ()=>{
    //actualizar nº usuarios:
    io.emit('num_clientes', io.engine.clientsCount);
    io.emit('mensaje_chat', {
      usuario: 'INFO',
      mensaje: 'Se ha desconectado un usuario'
    })
  })


  socket.on('mensaje_chat', data => {
    //console.log(data);
    //emito el mensaje a todos los usuarios conectados
    io.emit('mensaje_chat', data);
  });
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
