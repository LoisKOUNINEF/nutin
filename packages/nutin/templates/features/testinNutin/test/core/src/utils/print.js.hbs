import config from '#root/test.config.js';

export function printSummary(passed, failed, time) {
  const totalTime = time.toFixed(2);
  const total = passed + failed;
  print.boldBlue(`\nTest Summary`);
  print.boldInfo(`✓ ${passed} passed`);
  print.boldError(`✗ ${failed} failed`);
  print.info(`📖 ${total} total`);
  print.info(`⌚️ Time: ${totalTime}ms \n`);
}

export function printResults(results) {
  const sortedResults = results.sort((a, b) => {
    if (a.status === 'passed' && b.status === 'failed') return -1;
    if (a.status === 'failed' && b.status === 'passed') return 1;
    return 0;
  });

  sortedResults.forEach(result => {
    if (result.status === 'passed') {
      if (config.verbose ) console.log(`${chalk.green('✓')} ${chalk.cyan(`${result.suiteName}`)} - ${chalk.green(`${result.name}`)}`);
    } else {
      print.error(`✗ ${result.suiteName} - ${result.name}`);
      if (config.verbose ) print.grayError(result.error);
    }
  });
}

export function printStart() {
  print.boldHead('\nRunning tests...');  
}

export const chalk = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  purple: (s) => `\x1b[35m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  boldGreen: (s) => `\x1b[1;32m${s}\x1b[0m`,
  boldRed: (s) => `\x1b[1;31m${s}\x1b[0m`,
  boldBlue: (s) => `\x1b[1;34m${s}\x1b[0m`,
  boldYellow: (s) => `\x1b[1;33m${s}\x1b[0m`,
  boldCyan: (s) => `\x1b[1;36m${s}\x1b[0m`,
  boldPurple: (s) => `\x1b[1;35m${s}\x1b[0m`,
};

export const print = {
  head: (s) => console.log(`${chalk.purple(s)}`),  
  boldHead : (s) => console.log(`${chalk.boldPurple(s)}`),
  section: (s) => console.log(`${chalk.yellow(s)}`),
  boldSection: (s) => console.log(`${chalk.boldYellow(s)}`),
  info: (s) => console.log(`${chalk.green(s)}`),
  boldInfo: (s) => console.log(`${chalk.boldGreen(s)}`),
  success: (s) => console.log(`${chalk.cyan(s)}`),
  boldSuccess: (s) => console.log(`${chalk.boldCyan(s)}`),
  error: (s) => console.error(`${chalk.red(s)}`),
  boldError: (s) => console.error(`${chalk.boldRed(s)}`),
  grayError: (s) => console.error(`${chalk.gray(s)}`),
  blue: (s) => console.log(`${chalk.blue(s)}`),
  boldBlue: (s) => console.log(`${chalk.boldBlue(s)}`),
}