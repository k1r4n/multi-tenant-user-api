import handleData from './handler';
import * as winston from './services/winston';

async function init() {

    winston.intialize();
    const logger = winston.getClient();

    logger.info('Creating Mongo connection');
    await handleData().then(() => {
        process.exit(0);
    }).catch((error: any) => {
        process.exit(error);
    });
}

init();