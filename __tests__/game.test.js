const { test, expect, beforeEach, describe } = require('@jest/globals');
const { Buffer } = require('buffer');
const { Game, Player } = require('../game');

const game = new Game();
const socket = {
  on: (listener, cb) => {},
  close: () => {},
  send: () => {},
};

test('should initialize for playerX', () => {
  let eventListener = [];
  socket.send = (message) => {
    eventListener.push(message);
  };
  game.playerX = new Player(game, socket, 'X');
  expect(eventListener[0]).toContain('Player X ready');
  expect(eventListener[1]).toContain('LISTEN Awaiting opponent');
});

test('should initialize for playerO', () => {
  let eventListener = [];
  socket.send = (message) => {
    eventListener.push(message);
  };
  game.playerX = new Player(game, socket, 'O');
  expect(eventListener[0]).toContain('Player O ready');
});

describe('Players', () => {
  let onSpy, marks;

  beforeEach(() => {
    marks = [
      [0, 3, 6],
      [1, 2, 4],
    ];
    onSpy = jest.fn();
  });

  test('should win for playerX', async () => {
    let playerX = marks[0];
    let playerO = marks[1];
    let bufStr = '0';

    const socket = {
      on: (listener, cb) => {
        const bufferedStr = Buffer.from(bufStr);
        return cb(bufferedStr);
      },
      close: () => {},
      send: (message) => {
        console.log(message);
      },
    };

    game.playerX = new Player(game, socket, 'X');
    game.playerO = new Player(game, socket, 'O');
  });
});
