const winston = require('winston');

const {
  APP_LOG_LEVEL,
} = process.env;

module.exports = {
  logger: {
    level: APP_LOG_LEVEL || 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'wallet' },
    transports: [
      new winston.transports.Console(),
    ],
  },
};
