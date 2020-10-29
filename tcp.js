const net = require('net');
const { Game, Player } = require('./game');

(() => {
  let game = null;

  net
    .createServer((socket) => {
      console.log('TCP connection');
      socket.send = socket.write;
      socket.close = socket.destroy;
      if (game === null) {
        game = new Game();
        game.playerX = new Player(game, socket, 'X');
      } else {
        game.playerO = new Player(game, socket, 'O');
        game = null;
      }
    })
    .listen(62001, () => {
      console.log('Tic Tac Toe Server is Running');
    });
})();
