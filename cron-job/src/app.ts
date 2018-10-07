import handleData from './handler';
import * as winston from './services/winston';
import initializeMongo from './services/mongo';

async function init() {

    winston.intialize();
    const logger = winston.getClient();

    logger.info('Creating Mongo connection');
    let mongoClient: any;
    await initializeMongo().then((client: any) => {
        mongoClient = client; 
    }).catch((error: any) => {
        process.exit(1);
    });
    await handleData(mongoClient).then(() => {
        process.exit(0);
    }).catch((error: any) => {
        process.exit(error);
    });
}

init();