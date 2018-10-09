import mongoose, { Collection } from 'mongoose';
import Bluebird from 'bluebird';

import config from '../config';
import { getClient } from './winston';
import { resolve } from 'url';

Promise = Bluebird as any || Promise;

(<any>mongoose).Promise = Bluebird;

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
            lang: String,
        },
    },
    phone: String,
    website: String,
    compant: {
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
}, { collection: 'users' });

const dbList: any = {};

async function createDatabaseConnection(name: string, flag: string): Promise<any> {
    const logger = getClient();
    return new Promise(async (resolve, reject) => {
        console.log(`${config.mongoUrl}/${name}`)
        await mongoose.connect(`${config.mongoUrl}/${name}`, {useNewUrlParser: true}).then(() => {
            logger.info('MongoDB connection successfull');
        }).catch((error: any) => {
            logger.error(`${error.message} \nExiting!!!`);
            reject(error.message);
        });
    
        
        const client = mongoose.model((flag === 'list') ? 'dbList' : 'User', (flag === 'list') ? dbSchema : userSchema);
        resolve(client);
    });
}

export default async function initializMongo(): Promise<any> {
    const logger = getClient();
    return new Promise(async (resolve, reject) => {
        let dbList: any;
        await createDatabaseConnection('user10', 'user').then(async (client: any) => {
            dbList = client;
        });

        mongoose.connect(`${config.mongoUrl}/test`, {useNewUrlParser: true});
        await mongoose.connection.on('open', async function(){
            return await mongoose.connection.db.admin().listDatabases(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                }
            })
            
            // .collections(function(error, names) {
            // if (error) {
            //     throw new Error('error');
            // } else {
            //     console.log('on', names, error);
            //     names.map(function(name) {
            //     console.log('found collection %s', name);
            //     });
            // }
            // });
        });
        
        await dbList.find().then((data: any) => {
            console.log(data.length, 'sdsd');
        }).catch((error: any) => {
            logger.error(error);
            reject(error);
        });
    });
}

export function mongoClient() {
    return dbList;
}