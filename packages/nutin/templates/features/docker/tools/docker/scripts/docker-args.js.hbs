import { parseArgs } from 'util';

// The flags docker:build and docker:run accept, turned into a docker command line.
// Ports are never one of them: they come from nutin.config.js "dockerPorts" (see docker-ports.js),
// the same list nginx listens on and the Dockerfile exposes.

const TAG = /^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/;
const CONTAINER_NAME = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;
const PLATFORM = /^[a-z0-9]+\/[a-z0-9_]+(\/[a-z0-9]+)?(,[a-z0-9]+\/[a-z0-9_]+(\/[a-z0-9]+)?)*$/;
const BUILD_ARG = /^[A-Za-z_][A-Za-z0-9_]*=/;
const RESTART = /^(no|always|unless-stopped|on-failure(:\d+)?)$/;
const PROGRESS = ['auto', 'plain', 'tty', 'quiet', 'rawjson'];

function check(pattern, expected) {
  return (value) => (pattern.test(value) ? null : expected);
}

const platform = {
  type: 'string', value: '<os/arch>', check: check(PLATFORM, 'os/arch, e.g. linux/amd64'),
  description: 'Target platform, e.g. linux/amd64 for a server when building on Apple silicon',
};
const help = { type: 'boolean', short: 'h', description: 'Show this help' };
const dryRun = { type: 'boolean', description: 'Print the docker command without running it' };

export const BUILD_FLAGS = {
  'no-cache': { type: 'boolean', description: 'Build without the layer cache' },
  pull: { type: 'boolean', description: 'Pull newer versions of the base images (node, alpine)' },
  platform,
  tag: {
    type: 'string', short: 't', multiple: true, value: '<tag>', check: check(TAG, 'letters, digits, "_", "." and "-", e.g. 1.2.0'),
    description: 'Also tag the image <image>:<tag>; <image>:latest is always set (repeatable)',
  },
  'build-arg': {
    type: 'string', multiple: true, value: '<KEY=VALUE>', check: check(BUILD_ARG, 'KEY=VALUE, e.g. NODE_VERSION=24.21.0'),
    description: 'Set a Dockerfile ARG: NODE_VERSION, ALPINE_VERSION (repeatable)',
  },
  progress: {
    type: 'string', value: '<mode>', check: (value) => (PROGRESS.includes(value) ? null : PROGRESS.join(', ')),
    description: `Build output: ${PROGRESS.join(', ')}`,
  },
  'dry-run': dryRun,
  help,
};

export const RUN_FLAGS = {
  detach: { type: 'boolean', short: 'd', description: 'Run in the background' },
  name: {
    type: 'string', value: '<name>', check: check(CONTAINER_NAME, 'letters, digits, "_", "." and "-"'),
    description: 'Container name (default: the project\'s)',
  },
  rm: { type: 'boolean', description: 'Remove the container when it stops (the default in the foreground)' },
  restart: {
    type: 'string', value: '<policy>', check: check(RESTART, 'no, always, unless-stopped or on-failure[:N]'),
    description: 'Restart policy: no, always, unless-stopped, on-failure[:N]',
  },
  tag: {
    type: 'string', short: 't', value: '<tag>', check: check(TAG, 'letters, digits, "_", "." and "-", e.g. 1.2.0'),
    description: 'Image tag to run (default: latest)',
  },
  platform: { ...platform, description: 'Platform of the image to run, when it was built for several' },
  'dry-run': dryRun,
  help,
};

const PORT_FLAG = /^(-p|-P|--publish|--publish-all|--port)(=|$)|^-[pP]./;

function flagName(name, spec) {
  return spec.short ? `-${spec.short}, --${name}` : `--${name}`;
}

/**
 * Parses argv against BUILD_FLAGS or RUN_FLAGS. Throws an Error with a message meant for the
 * user: a port flag, an unknown flag, a missing or invalid value.
 */
export function parseDockerFlags(rawArgv, flags) {
  // pnpm passes the "--" of npm's form (pnpm run docker:run -- -d) on to the script.
  const argv = rawArgv[0] === '--' ? rawArgv.slice(1) : rawArgv;
  const portFlag = argv.find((arg) => PORT_FLAG.test(arg));
  if (portFlag) {
    throw new Error(`"${portFlag}": ports are set in nutin.config.js "dockerPorts", not on the command line.`);
  }

  const options = Object.fromEntries(Object.entries(flags).map(([name, { type, short, multiple }]) => [
    name, { type, ...(short && { short }), ...(multiple && { multiple }) },
  ]));

  let values;
  try {
    ({ values } = parseArgs({ args: argv, options, strict: true, allowPositionals: false }));
  } catch (err) {
    if (err.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION' || err.code === 'ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL') {
      const supported = Object.entries(flags).map(([name, spec]) => flagName(name, spec)).join(', ');
      throw new Error(`${err.message.split('. ')[0]}. Supported flags: ${supported}.`);
    }
    throw new Error(err.message);
  }

  for (const [name, spec] of Object.entries(flags)) {
    if (!spec.check || values[name] === undefined) continue;
    for (const value of [values[name]].flat()) {
      const expected = spec.check(value);
      if (expected) throw new Error(`Invalid --${name} "${value}": expected ${expected}.`);
    }
  }

  return values;
}

// A package name as a docker image name: lowercase, scope kept as a namespace (@acme/site → acme/site).
export function imageName(packageName) {
  return packageName.toLowerCase().replace(/^@/, '');
}

// Container names can't hold "/": @acme/site → acme-site.
export function containerName(packageName) {
  return imageName(packageName).replace(/\//g, '-');
}

export function buildCommand(flags, { image, context }) {
  return [
    'build',
    '-t', `${image}:latest`,
    ...(flags.tag ?? []).flatMap((tag) => ['-t', `${image}:${tag}`]),
    ...(flags['no-cache'] ? ['--no-cache'] : []),
    ...(flags.pull ? ['--pull'] : []),
    ...(flags.platform ? ['--platform', flags.platform] : []),
    ...(flags['build-arg'] ?? []).flatMap((arg) => ['--build-arg', arg]),
    ...(flags.progress ? ['--progress', flags.progress] : []),
    '-f', 'tools/docker/Dockerfile',
    context,
  ];
}

/**
 * The `docker run` arguments, and the container's name. A foreground run is removed when it
 * stops (--rm), unless it has a restart policy, which docker won't combine with --rm.
 */
export function runCommand(flags, { image, container, ports }) {
  if (flags.rm && flags.restart) {
    throw new Error('--rm and --restart can\'t be combined: docker refuses a restart policy on a container it removes.');
  }

  const name = flags.name ?? container;
  const rm = flags.rm || (!flags.detach && !flags.restart);
  const args = [
    'run',
    ...(flags.detach ? ['-d'] : []),
    ...(rm ? ['--rm'] : []),
    '--name', name,
    ...(flags.restart ? ['--restart', flags.restart] : []),
    ...(flags.platform ? ['--platform', flags.platform] : []),
    ...ports.flatMap((port) => ['-p', `${port}:${port}`]),
    `${image}:${flags.tag ?? 'latest'}`,
  ];
  return { args, name, rm };
}

export function helpText(flags, usage) {
  const rows = Object.entries(flags).map(([name, spec]) => [`${flagName(name, spec)}${spec.value ? ` ${spec.value}` : ''}`, spec.description]);
  const width = Math.max(...rows.map(([flag]) => flag.length));
  return [
    `Usage: ${usage}`,
    '',
    ...rows.map(([flag, description]) => `  ${flag.padEnd(width)}  ${description}`),
    '',
    'Ports are set in nutin.config.js "dockerPorts".',
  ].join('\n');
}
