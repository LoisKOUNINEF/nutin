import readline from 'readline';

export const promptBoolean = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    let answered = false;

    rl.question(`${question} (y/n): `, (answer) => {
      answered = true;
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });

    rl.on('close', () => {
      if (!answered) resolve(false);
    });
  });
};
