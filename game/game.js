/**
 * Game class, provides interface if board is filled up
 * if there's a winner and
 * setting next player
 */
class Game {
  constructor() {
    this.board = Array(9).fill(null);
  }

  isBoardFilled() {
    return this.board.every((square) => square);
  }

  hasWinner() {
    const board = this.board;
    // blocks are numbered from top to bottom then left to right, as 0...8
    const board_wins = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    return board_wins.some(([b1, b2, b3]) => board[b1] != null && board[b1] === board[b2] && board[b2] === board[b3]);
  }

  play(position, player) {
    const opponent = player.opponent;
    if (!opponent) {
      throw new Error('There is no opponent');
    } else if (player !== this.presentPlayer) {
      throw new Error('Sorry, wait your turn!');
    } else if (this.board[position]) {
      throw new Error('Block not empty');
    }
    this.board[position] = this.presentPlayer;
    this.presentPlayer = this.presentPlayer.opponent;
  }
}

module.exports = Game;
