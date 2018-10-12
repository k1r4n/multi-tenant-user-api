import Bluebird from 'bluebird';

import mongoose from 'mongoose';

import config from '../config';
import getUsers from './user';
import getComments from './comments';
import getPosts from './post';

import { commentsModel, postsModel, userModel } from '../models';

import { getClient } from '../services/winston';
import createDatabase from '../services/mongo';

Promise = Bluebird as any || Promise;

async function mapDatabase(users: any): Promise<any>{
    return new Promise(async (resolve, reject) => {
        const userCount = users.length;
        let savedUserCount = 0;
        const db: any = {};
        if (savedUserCount === 0) {
            await createDatabase(null, 'userlist').then(async (client: any) => {
                db.list = client;
            }).catch((error: any) => {
                reject(error);
            });
        }
        const loopUser = async function(users: any) {
            await createDatabase(users[savedUserCount].id, '').then(async (client: any) => {
                db[`user${users[savedUserCount].id}`] = client;
                if (++savedUserCount < userCount) {
                    await loopUser(users);
                } else {
                    resolve(db);
                }
            }).catch((error) => {
                reject(error);
            });
        }
        await loopUser(users);
    });
}

async function insertData(db: any, users: any): Promise<any> {
    const logger = getClient();
    return new Promise(async (resolve, reject) => {
        const userCount = users.length;
        let savedUserCount = 0;
        let dBase: any = [];
        const loopUser = async function(user: any, client: any) { 
            dBase.push({
                id: user.id,
                name: `user${user.id}`,
            });
            await client.findOne({ id: user.id }).then(async (data: any) => {
                if (data === null) {
                    let userData = new client(user);
                    await userData.save().then(async () => {
                        logger.info(`${user.name} saved!!!`); 
                        let dbData = new db.list(dBase[user.id - 1]);
                        await dbData.save().catch((error: any) => {
                            logger.error(error);
                            reject(error);
                        });
                        savedUserCount++;
                        if (savedUserCount < userCount) {
                            const u = { ...users[savedUserCount] };
                            const c = db[`user${u.id}`];
                            return await loopUser(u, c);
                        } else {
                            resolve();
                        }
                    }).catch((error: any) => {
                        logger.error(error);
                        reject(error);
                    }); 
                } else {
                    savedUserCount++;
                    if (savedUserCount < userCount) {
                        const u = { ...users[savedUserCount] };
                        const c = db[`user${u.id}`];
                        return await loopUser(u, c);
                    } else {
                        resolve();
                    }
                }
            });
        }
        const user = { ...users[savedUserCount] };
        const client = db[`user${users[savedUserCount].id}`];
        await loopUser(user, client);
    });
}

export default async function handleData (): Promise<any> {
    return new Promise(async (resolve, reject) => {

        let comments: commentsModel[] = [];
        await getComments().then((data: commentsModel[]) => {
            comments = data;
        }).catch(error => {
            reject(error);
        });
        
        let posts: postsModel[] = [];
        await getPosts().then((data: any[]) => {
            data.map((d: any) => {
                posts.push({
                    id: d.id,
                    userId: d.userId,
                    title: d.title,
                    body: d.body,
                    comments: [] as commentsModel[],
                });
            });
        }).catch(error => {
            reject(error);
        });

        let users: userModel[] = [];
        await getUsers().then((data: any[]) => {
            data.map((d: any) => {
                users.push({
                    id: d.id,
                    name: d.name,
                    username: d.username,
                    email: d.email,
                    address: {
                        street: d.address.street,
                        suite: d.address.suite,
                        city: d.address.city,
                        zipcode: d.address.zipcode,
                        geo: {
                            lat: d.address.geo.lat,
                            lng: d.address.geo.lng,
                        },
                    },
                    phone: d.phone,
                    website: d.website,
                    company: {
                        name: d.company.name,
                        catchPhrase: d.company.catchPhrase,
                        bs: d.company.catchPhrase,
                    },
                    posts: [] as postsModel[],
                });
            });
        }).catch(error => {
            reject(error);
        });

        comments.map((comment: commentsModel) => {
            posts.map((post: postsModel, pIndex: number) => {
                if (post.id === comment.postId) {
                    posts[pIndex].comments.push(comment);
                }
            });
        });
        
        posts.map((post: postsModel) => {
            users.map((user: userModel, uIndex: number) => {
                if (user.id === post.userId) {
                    users[uIndex].posts.push(post);
                }
            });
        });

        let db: any;
        await mapDatabase(users).then((database: any) => {
            db = database;
        }).catch((error: any) => {
            reject(error);
        });

        await insertData(db, users).then(() => {
            resolve();
        }).catch((error: any) => {
            reject(error);
        });
    });
}