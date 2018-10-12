import handleData from './handler';
import * as winstonService from './services/winston';
import winston = require('winston');

async function init() {

    winstonService.intialize();
    const logger: typeof winston = winstonService.getClient();

    logger.info('Creating Mongo connection');
    await handleData().then(() => {
        process.exit(0);
    }).catch((error: any) => {
        process.exit(error);
    });
}

init();