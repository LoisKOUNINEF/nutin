import { validateDockerPorts } from './docker-ports.js';

describe('validateDockerPorts', () => {
  it('throws when dockerPorts is not set', () => {
    expect(() => validateDockerPorts(undefined)).toThrow('"dockerPorts" not found');
  });

  it('throws when dockerPorts is not an array', () => {
    expect(() => validateDockerPorts(9090)).toThrow('must be an array of integers');
    expect(() => validateDockerPorts('9090')).toThrow('must be an array of integers');
    expect(() => validateDockerPorts({ port: 9090 })).toThrow('must be an array of integers');
  });

  it('throws when dockerPorts is empty', () => {
    expect(() => validateDockerPorts([])).toThrow('must contain at least one port');
  });

  it('throws when an entry is not an integer', () => {
    expect(() => validateDockerPorts(['8080'])).toThrow('must be an integer');
    expect(() => validateDockerPorts([8080.5])).toThrow('must be an integer');
    expect(() => validateDockerPorts([NaN])).toThrow('must be an integer');
    expect(() => validateDockerPorts([true])).toThrow('must be an integer');
    expect(() => validateDockerPorts([null])).toThrow('must be an integer');
  });

  it('throws for privileged ports below 1024', () => {
    expect(() => validateDockerPorts([80])).toThrow('privileged port');
    expect(() => validateDockerPorts([1023])).toThrow('privileged port');
  });

  it('throws for ephemeral ports at or above 49152', () => {
    expect(() => validateDockerPorts([49152])).toThrow('ephemeral port range');
    expect(() => validateDockerPorts([60000])).toThrow('ephemeral port range');
  });

  it('throws for duplicate ports', () => {
    expect(() => validateDockerPorts([8080, 8080])).toThrow('duplicate port');
  });

  it('identifies the invalid entry by index in the error message', () => {
    expect(() => validateDockerPorts([8080, 80])).toThrow('dockerPorts[1]');
  });

  it('accepts the registered-port range boundaries', () => {
    expect(validateDockerPorts([1024])).toEqual([1024]);
    expect(validateDockerPorts([49151])).toEqual([49151]);
  });

  it('returns a valid multi-port array unchanged', () => {
    expect(validateDockerPorts([8080, 8081, 3000])).toEqual([8080, 8081, 3000]);
  });
});
