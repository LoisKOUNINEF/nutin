import { BUILD_FLAGS, RUN_FLAGS, parseDockerFlags, buildCommand, runCommand, imageName, containerName, helpText } from './docker-args.js';

const build = (argv) => buildCommand(parseDockerFlags(argv, BUILD_FLAGS), { image: 'my-app', context: '.' });
const run = (argv) => runCommand(parseDockerFlags(argv, RUN_FLAGS), { image: 'my-app', container: 'my-app', ports: [9090, 9091] });

describe('docker-args', () => {
  it('builds <image>:latest from tools/docker/Dockerfile by default', () => {
    expect(build([])).toEqual(['build', '-t', 'my-app:latest', '-f', 'tools/docker/Dockerfile', '.']);
  });

  it('passes every build flag on, with repeated tags and build args', () => {
    expect(build(['--no-cache', '--pull', '--platform', 'linux/amd64', '-t', '1.2.0', '--tag=stable',
      '--build-arg', 'NODE_VERSION=24.21.0', '--build-arg', 'ALPINE_VERSION=3.24', '--progress', 'plain'])).toEqual([
      'build', '-t', 'my-app:latest', '-t', 'my-app:1.2.0', '-t', 'my-app:stable',
      '--no-cache', '--pull', '--platform', 'linux/amd64',
      '--build-arg', 'NODE_VERSION=24.21.0', '--build-arg', 'ALPINE_VERSION=3.24',
      '--progress', 'plain', '-f', 'tools/docker/Dockerfile', '.',
    ]);
  });

  it('runs in the foreground with --rm, named after the project, on every configured port', () => {
    expect(run([])).toEqual({
      args: ['run', '--rm', '--name', 'my-app', '-p', '9090:9090', '-p', '9091:9091', 'my-app:latest'],
      name: 'my-app',
      rm: true,
    });
  });

  it('keeps a detached container unless --rm is passed', () => {
    expect(run(['-d']).args).toEqual(['run', '-d', '--name', 'my-app', '-p', '9090:9090', '-p', '9091:9091', 'my-app:latest']);
    expect(run(['-d']).rm).toBe(false);
    expect(run(['--detach', '--rm']).args).toContain('--rm');
  });

  it('passes the name, restart policy, platform and tag on, without --rm under a restart policy', () => {
    expect(run(['-d', '--name', 'web', '--restart', 'unless-stopped', '--platform', 'linux/arm64', '-t', '1.2.0']).args).toEqual([
      'run', '-d', '--name', 'web', '--restart', 'unless-stopped', '--platform', 'linux/arm64',
      '-p', '9090:9090', '-p', '9091:9091', 'my-app:1.2.0',
    ]);
    expect(run(['--restart', 'on-failure:3']).args).not.toContain('--rm');
  });

  it('refuses --rm with --restart, which docker rejects', () => {
    expect(() => run(['--rm', '--restart', 'always'])).toThrow('can\'t be combined');
  });

  it('refuses every port flag: ports come from nutin.config.js', () => {
    ['-p', '-p8080:80', '-P', '--publish', '--publish=80:80', '--publish-all', '--port', '--port=80'].forEach((flag) => {
      expect(() => parseDockerFlags([flag, '80'], RUN_FLAGS)).toThrow('"dockerPorts"');
      expect(() => parseDockerFlags([flag], BUILD_FLAGS)).toThrow('"dockerPorts"');
    });
    // --progress and --pull merely start with "-p" after the dash.
    expect(parseDockerFlags(['--pull', '--progress', 'plain'], BUILD_FLAGS).pull).toBe(true);
  });

  it('lists the supported flags for an unknown flag or a stray argument', () => {
    expect(() => parseDockerFlags(['--nope'], RUN_FLAGS)).toThrow('Unknown option \'--nope\'. Supported flags: -d, --detach, --name');
    expect(() => parseDockerFlags(['-d'], BUILD_FLAGS)).toThrow('Supported flags: --no-cache');
    expect(() => parseDockerFlags(['latest'], RUN_FLAGS)).toThrow('Supported flags:');
  });

  it('reports a missing value', () => {
    expect(() => parseDockerFlags(['--name'], RUN_FLAGS)).toThrow('argument missing');
  });

  it('rejects invalid values with what is expected', () => {
    expect(() => parseDockerFlags(['--tag', 'v 1'], RUN_FLAGS)).toThrow('Invalid --tag "v 1"');
    expect(() => parseDockerFlags(['--tag', 'ok', '--tag=-bad'], BUILD_FLAGS)).toThrow('Invalid --tag "-bad"');
    expect(() => parseDockerFlags(['--name', 'my app'], RUN_FLAGS)).toThrow('Invalid --name');
    expect(() => parseDockerFlags(['--restart', 'sometimes'], RUN_FLAGS)).toThrow('Invalid --restart');
    expect(() => parseDockerFlags(['--progress', 'loud'], BUILD_FLAGS)).toThrow('Invalid --progress');
    expect(() => parseDockerFlags(['--build-arg', 'NODE_VERSION'], BUILD_FLAGS)).toThrow('Invalid --build-arg');
    expect(() => parseDockerFlags(['--platform', 'amd64'], BUILD_FLAGS)).toThrow('Invalid --platform');
    expect(parseDockerFlags(['--platform', 'linux/arm64/v8,linux/amd64'], BUILD_FLAGS).platform).toBe('linux/arm64/v8,linux/amd64');
  });

  it('turns a scoped package name into a valid image and container name', () => {
    expect(imageName('@Acme/site')).toBe('acme/site');
    expect(containerName('@acme/site')).toBe('acme-site');
    expect(imageName('my-app')).toBe('my-app');
  });

  it('help lists every flag', () => {
    const text = helpText(RUN_FLAGS, 'npm run docker:run -- [flags]');
    expect(text).toContain('Usage: npm run docker:run -- [flags]');
    Object.keys(RUN_FLAGS).forEach((name) => expect(text).toContain(`--${name}`));
    expect(text).toContain('-d, --detach');
    expect(parseDockerFlags(['-h'], BUILD_FLAGS).help).toBe(true);
  });
});
