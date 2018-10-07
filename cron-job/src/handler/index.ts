import Bluebird, { resolve, reject } from 'bluebird';
import { getClient } from '../services/winston';

import getUsers from './user';
import getComments from './comments';
import getPosts from './post';

import { commentsModel, postsModel, userModel } from '../models';

Promise = Bluebird as any || Promise;

export default async function handleData (mongoClient: any): Promise<any> {
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
        const userCount = users.length;
        let savedUserCount = 0;
        users.map(async (user: userModel, index: number) => {
            let userData = new mongoClient((user));
            await userData.save().then(() => {
                logger.info(`${user.name} saved!!!`);
                savedUserCount ++;
                if (savedUserCount === userCount) {
                    resolve();
                }
            }).catch((error: any) => {
                logger.error(error);
                reject(error);
            });
        });
    });
}