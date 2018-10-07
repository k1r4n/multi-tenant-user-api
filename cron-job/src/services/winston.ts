import winston from 'winston';

import config from '../config';

export function intialize (): void {
    if (config.log.logFile) {
        winston.configure({
            transports: [
                new (winston.transports.File)({
                    filename: config.log.logFile,
                    level: config.log.logLevel,
                    handleExceptions: true,
                })
            ]
        });
    } else {
        winston.configure({
            transports: [
                new winston.transports.Console({
                    level: config.log.logLevel,
                    handleExceptions: true,
                })
            ]
        });
    }
}

export function getClient(): typeof winston {
    return winston;
}