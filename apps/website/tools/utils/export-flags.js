import process from 'process';

export const isProd = process.env.npm_config_bundle || process.env.NODE_ENV === 'production';

export const isVerbose = process.env.npm_config_log || process.env.npm_config_verbose;
