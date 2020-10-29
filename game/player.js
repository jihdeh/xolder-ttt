class Player {
  /**
   * The Player instance represents the competitors X and O
   * it listens for data and then sends message out to the clients
   * @param {Class} game The Game class instance
   * @param {Object} socketInstance The Socket instace object TCP or WS
   * @param {String} playerMarker Either X or O
   * @param {String} messageListener The socket event listener method name i.e data for TCP, message for WS
   */
  constructor(game, socketInstance, playerMarker, messageListener = 'data') {
    Object.assign(this, { game, socketInstance, playerMarker });

    this.sendMessage(`Player ${playerMarker} ready!`);
    const isPlayerX = playerMarker === 'X';

    if (isPlayerX) {
      game.presentPlayer = this;
      this.sendMessage('LISTEN Awaiting opponent');
    } else {
      //switch oppoent back to player x on player o joined
      this.opponent = game.playerX;
      this.opponent.opponent = this;
      this.opponent.sendMessage('LISTEN Opponent Joined, Start game');
    }

    socketInstance.on(messageListener, (buffer) => {
      const userInput = buffer.toString('utf-8').trim();

      if (/^PLAY \d+$/.test(userInput)) {
        this.nextPlay(game, userInput);
      } else if (userInput === 'EXIT') {
        socketInstance.close();
      }
    });

    socketInstance.on('close', () => {
      try {
        this.opponent.sendMessage(`PLAYER_${playerMarker}_EXITED`);
      } catch (e) {
        /* noop */
      }
    });
  }

  nextPlay(game, userInput) {
    const position = Number(userInput.substring(5));

    try {
      game.play(position, this);

      this.sendMessage(`MARKING_POSITION ${position}`);
      this.opponent.sendMessage(`OPPONENT_MOVED_TO_POSITION ${position}`);

      const winner = this.game.hasWinner();
      const isBoardFilled = this.game.isBoardFilled();

      if (winner) {
        this.opponent.sendMessage('YOU LOST :(');
        this.sendMessage('YOU WON!!');
      } else if (isBoardFilled) {
        [this, this.opponent].forEach((playerWsInstance) => playerWsInstance.sendMessage('TIE'));
      }
    } catch (e) {
      this.sendMessage(`LISTEN ${e.message}`);
    }
  }

  sendMessage(message) {
    this.socketInstance.send(`${message}\n`);
  }
}

module.exports = Player;
