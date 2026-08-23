// Registered/user port range only — excludes privileged ports (<1024, may need
// elevated host privileges to bind) and the OS ephemeral range (>=49152, reserved
// for outgoing/dynamic connections, not meant for fixed service ports).
const MIN_PORT = 1024;
const MAX_PORT = 49151;

export function validateDockerPorts(rawPorts) {
  if (rawPorts === undefined) {
    throw new Error('nutin.config.js: "dockerPorts" not found. It must be an array of integers (e.g. [9090, 6969])');
  }

  if (!Array.isArray(rawPorts)) {
    throw new Error('nutin.config.js: "dockerPorts" must be an array of integers (e.g. [9090, 6969]).');
  }

  if (rawPorts.length === 0) {
    throw new Error('nutin.config.js: "dockerPorts" must contain at least one port (e.g. [9090]).');
  }

  const seen = new Set();

  for (let i = 0; i < rawPorts.length; i++) {
    const port = rawPorts[i];

    if (typeof port !== 'number' || !Number.isInteger(port)) {
      throw new Error(`nutin.config.js: "dockerPorts[${i}]" must be an integer; ports must be numbers, e.g. 9090 not "9090".`);
    }

    if (port < MIN_PORT) {
      throw new Error(`nutin.config.js: "dockerPorts[${i}]" (${port}) is a privileged port (<1024) — use a registered port between ${MIN_PORT} and ${MAX_PORT}.`);
    }

    if (port > MAX_PORT) {
      throw new Error(`nutin.config.js: "dockerPorts[${i}]" (${port}) is in the OS ephemeral port range (49152-65535) — use a registered port between ${MIN_PORT} and ${MAX_PORT}.`);
    }

    if (port < MIN_PORT || port > MAX_PORT) {
      throw new Error(`nutin.config.js: "dockerPorts[${i}]" (${port}) is outside of port range (${MIN_PORT} / ${MAX_PORT} .`);
    }

    if (seen.has(port)) {
      throw new Error(`nutin.config.js: "dockerPorts" contains duplicate port ${port} — each port must be listed once.`);
    }
    seen.add(port);
  }

  return rawPorts;
}
