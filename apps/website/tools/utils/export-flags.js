import process from 'process';
import builderConfig from '../../builder.config.js';

export const isProd = process.env.npm_config_bundle || process.env.NODE_ENV === 'production';

export const isVerbose = process.env.npm_config_log || builderConfig.verbose;
