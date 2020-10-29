window.onload = function () {
  const section = document.querySelector('section');
  const infoParagraph = document.querySelector('#info');

  const exitBtn = document.querySelector('#exit');
  const block = (location) => document.querySelector(`#s${location}`);

  exitBtn.addEventListener('click', () => exitSignal('Bye!'));

  let playerMark,
    gameOver = false,
    opponentMark;

  function initialize() {
    gameOver = false;
    socket = new WebSocket(`ws://localhost:8080`);
    socket.addEventListener('message', (event) => {
      processCommand(event.data);
    });
    document.querySelectorAll('section div').forEach((section) => (section.textContent = ''));
    exitBtn.style.display = 'inline';
    socket.onerror = () => exitSignal('Socket error: server down, please check');
  }

  function processCommand(command) {
    infoParagraph.textContent = command;
    const lastCommandChar = command.trim().charAt(command.trim().length - 1);

    if (command.startsWith('Player')) {
      playerMark = command[7];
      opponentMark = playerMark === 'X' ? 'O' : 'X';
    } else if (command.startsWith('OTHER_PLAYER_LEFT')) {
      exitSignal(!gameOver ? 'Other player left the game' : '');
    } else if (command.startsWith('MARKING_POSITION')) {
      block(lastCommandChar).textContent = playerMark;
      infoParagraph.textContent = 'You played, wait next turn';
    } else if (command.startsWith('OPPONENT_MOVED_TO_POSITION')) {
      block(lastCommandChar).textContent = opponentMark;
      infoParagraph.textContent = 'Opponent moved, your turn';
    } else if (command.startsWith('YOU LOST')) {
      exitSignal(command);
    } else if (command.startsWith('YOU WON')) {
      exitSignal(command);
    } else if (command.startsWith('TIE')) {
      exitSignal(command);
    }
  }

  for (let i = 0; i < 9; i++) {
    const block = document.createElement('div');
    block.setAttribute('id', `s${i}`);
    block.addEventListener('click', () => {
      socket.send(`PLAY ${i}`);
    });
    section.appendChild(block);
  }

  initialize();

  const exitSignal = (message) => {
    infoParagraph.textContent = message || 'Game over';
    socket.send('EXIT');
    gameOver = true;
    exitBtn.style.display = 'none';
  };
};
