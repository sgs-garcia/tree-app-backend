import readline from 'readline';

export function getUserConfirmation(message: string) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${message} (y/n): `, response => {
      rl.close();
      if (response === 'y') {
        return resolve();
      }
      reject();
    });
  });
}
