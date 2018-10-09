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
        // for (let user of users) {
        //     await createDatabase(user.id, '').then(async (client: any) => {
        //         db[`user${user.id}`] = client;
        //         savedUserCount++;
        //         if (userCount === savedUserCount) {
        //             resolve(db);
        //         }
        //     }).catch((error) => {
        //         reject(error);
        //     });
        // }
        // users.map(async (user: any) => {
        //     await createDatabase(user.id, '').then(async (client: any) => {
        //         db[`user${user.id}`] = client;
        //         savedUserCount++;
        //         if (userCount === savedUserCount) {
        //             resolve(db);
        //         }
        //     }).catch((error) => {
        //         reject(error);
        //     });
        // });
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
            let userData = new client(user);
            await userData.save().then(async () => {
                logger.info(`${user.name} saved!!!`); 
                let dbData = new db.list(dBase[user.id - 1]);
                await dbData.save().then(async () => {
                }).catch((error: any) => {
                    logger.error(error);
                    reject(error);
                });
                if (++savedUserCount < userCount) {
                    const u = { ...users[savedUserCount] };
                    const c = db[`user${user.id}`];
                    await loopUser(u, c);
                } else {
                    resolve();
                }
            }).catch((error: any) => {
                logger.error(error);
                reject(error);
            });
        }
        const user = { ...users[savedUserCount] };
        const client = db[`user${users[savedUserCount].id}`];
        await loopUser(user, client);

        // for (let user of users) {
        //     dBase.push({
        //         id: user.id,
        //         name: `user${user.id}`,
        //     });
        //     let userData = new db[`user${user.id}`](user);
        //     await userData.save().then(async () => {
        //         logger.info(`${user.name} saved!!!`);
        //         let dbData = new db.list(dBase[user.id - 1]);
        //         await dbData.save().then(async () => {
        //         }).catch((error: any) => {
        //             logger.error(error);
        //             reject(error);
        //         });
        //         savedUserCount ++;
        //         if (savedUserCount === userCount) {
        //             resolve();
        //         }
        //     }).catch((error: any) => {
        //         logger.error(error);
        //         reject(error);
        //     });
        // }
        // users.map(async (user: userModel, index: number) => {
        //     dBase.push({
        //         id: user.id,
        //         name: `user${user.id}`,
        //     });
        //     let userData = new db[`user${user.id}`](user);
        //     await userData.save().then(async () => {
        //         logger.info(`${user.name} saved!!!`);
        //         let dbData = new db.list(dBase[user.id - 1]);
        //         await dbData.save().then(async () => {
        //         }).catch((error: any) => {
        //             logger.error(error);
        //             reject(error);
        //         });
        //         savedUserCount ++;
        //         if (savedUserCount === userCount) {
        //             resolve();
        //         }
        //     }).catch((error: any) => {
        //         logger.error(error);
        //         reject(error);
        //     });
        // });
    });
}

async function listDatase(id: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
        mongoose.connect(`${config.mongoUrl}/test${id}`, {useNewUrlParser: true});
        mongoose.connection.on('open', async function(){
            return mongoose.connection.db.admin().listDatabases(function (err, result) {
                if (err) {
                    console.log(err);
                    reject();
                } else {
                    console.log(result);
                    resolve();
                }
            }) 
        });
    });
}

export default async function handleData (): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const logger = getClient();

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
        // console.log(db);
        await mapDatabase(users).then((database: any) => {
            db = database;
        }).catch((error: any) => {
            reject(error);
        });
        // console.log(db);
        // await insertData(db, users).then(async () => {
        //     console.log('completed');
        //     // resolve();
        // }).catch((error: any) => {
        //     reject(error);
        // });

        users.map(async (user: any, index: any) => {
            const client =  db[`user${index + 1}`];
            await loopInsert(user, client );
        }); 
        
        for (let item of Object.keys(db)) {
            await db[item].find().then((data: any) => {
               console.log(data.length); 
            }).error((error: any) => {
                console.log(error);
            });
        }
    });
}

async function loopInsert(user: any, client: any) { 
    // console.log(user);
    // const userData = client(JSON.parse(user));
    // await userData.inserOne();  
    await client.create(user);
}