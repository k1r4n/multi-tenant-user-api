import mongoose, { Collection } from 'mongoose';
import Bluebird from 'bluebird';

import config from '../config';
import { getClient } from './winston';
import { resolve } from 'url';

Promise = Bluebird as any || Promise;

(<any>mongoose).Promise = Bluebird;

const dbList: any = {};

async function createDatabaseConnection(name: string, flag: string): Promise<any> {
    const logger = getClient();
    return new Promise(async (resolve, reject) => {
        const  connection = await mongoose.createConnection(`${config.mongoUrl}/${name}`, {useNewUrlParser: true});
        logger.info(`MongoDB connection to database ${name} successful`);

        const dbSchema = new mongoose.Schema({
            id: Number,
            name: String,
        }, { collection: 'dbList' });
        
        const userSchema = new mongoose.Schema({
            id: Number,
            name: String,
            username: String,
            email: String,
            avatar: String,
            address: {
                street: String,
                suite: String,
                city: String,
                zipcode: String,
                geo: {
                    lat: String,
                    lng: String,
                },
            },
            phone: String,
            website: String,
            company: {
                name: String,
                catchPhrase: String,
                bs: String,
            },
            posts: [{
                userId: Number,
                id: Number,
                title: String,
                body: String,
                comments: [{
                    postId: Number,
                    id: Number,
                    name: String,
                    email: String,
                    body: String,
                }],
            }],
        }, { collection: name });
        
        const client = connection.model((flag === 'list') ? 'dbList' :name, (flag === 'list') ? dbSchema : userSchema);
        resolve(client);
    });
}

export default async function initializMongo(): Promise<any> {
    const logger = getClient();
    return new Promise(async (resolve, reject) => {
        let userDbList: any;
        await createDatabaseConnection(config.dbList, 'list').then(async (client: any) => {
            userDbList = client;
        }).catch((error: any) => {
            logger.error(error);
            reject(error);
        });
        let dbNameList: any;
        await userDbList.find().then((data: any) => {
            dbNameList = data;
        }).catch((error: any) => {
            logger.error(error);
            reject(error);
        });

        const totalCount = dbNameList.length;
        let savedCount: number = 0;
        dbNameList.map(async (dbName: any) => {
            await createDatabaseConnection(dbName.name, 'user').then((client: any) => {
                dbList[dbName.name] = client;
                savedCount++;
                if (savedCount === totalCount) {
                    resolve();
                }
            }).catch((error: any) => {
                logger.error(error);
                reject(error);
            });
        });
    });
}

export function mongoClient() {
    return dbList;
}