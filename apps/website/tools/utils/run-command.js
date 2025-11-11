export function runCommand(cmd) {
  import('child_process').then(({ execSync }) => {
    execSync(cmd, { stdio: 'inherit' });
  });
}
