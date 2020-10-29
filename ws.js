const http = require('http');
const WebSocket = require('ws');
const { Game, Player } = require('./game');

const server = http.createServer();
const wss = new WebSocket.Server({ port: 8080 });

let game = null;

wss.on('connection', function connection(socket) {
  console.log('WSS Connection');
  const socketListenerMethod = 'message';

  if (game === null) {
    game = new Game();
    const playerXMarker = 'X';
    game.playerX = new Player(game, socket, playerXMarker, socketListenerMethod);
  } else {
    const playerOMarker = '0';
    game.playerO = new Player(game, socket, playerOMarker, socketListenerMethod);
    game = null;
  }
});

server.listen(9080, () => {
  console.log('Tic Tac Toe Server is Running');
});
