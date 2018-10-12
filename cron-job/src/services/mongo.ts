import mongoose from 'mongoose';
import Bluebird from 'bluebird';

import config from '../config';
import { getClient } from './winston';

Promise = Bluebird as any || Promise;

(<any>mongoose).Promise = Promise;
const connection: any = {};
export default async function createDatabase(id: number, dbName: string): Promise<any> {
    const logger = getClient();
    return new Promise(async (resolve, reject) => {
        connection[`mongoose${id}`] = await mongoose.createConnection(`${config.mongoUrl}/${dbName === '' ? `user${id}` : dbName}`, {useNewUrlParser: true});

        logger.info(`MongoDB connection to database ${dbName === '' ? `user${id}` : dbName} successful`);

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
        }, { collection: `user${id}` });

        const client = await connection[`mongoose${id}`].model((dbName !== '') ? 'dbList' : `user${id}`, (dbName !== '') ? dbSchema : userSchema);
        resolve(client);
    });
}