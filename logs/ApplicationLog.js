const winston = require('winston');

const consoleLog = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
});

const consoleRequestLog = new winston.transports.Console();

function getRequestLogFormatter() {
    const {combine, timestamp, printf} = winston.format;

    return combine(
        winston.format.colorize(),
        timestamp({
            format: () => new Date().toLocaleString()
        }),
        printf(info => {
            const {req, res} = info.message;
            return `${info.level}: [${info.timestamp}] - ${req.get('User-Agent')} - ${req.hostname}${req.port || ''}${req.originalUrl}`;
        })
    );
}

function createRequestLogger(transports) {
    const requestLogger = winston.createLogger({
        format: getRequestLogFormatter(),
        transports: transports
    })

    return function logRequest(req, res, next) {
        requestLogger.info({req, res})
        next()
    }
}

const myCustomLevels = {
    levels: {
      error: 0,
      warn: 1,
      info: 2
    },
    colors: {
      error: 'red',
      warn: 'yellow',
      info: 'blue'
    }
  };

function  generalLogger(transports) {
    winston.addColors(myCustomLevels.colors);

    const log = winston.createLogger({
        levels: myCustomLevels.levels,
        transports: transports
    })
    return log;
}

module.exports = {
    requestLogger: createRequestLogger([consoleRequestLog]),
    appLogger: generalLogger([consoleLog])
}