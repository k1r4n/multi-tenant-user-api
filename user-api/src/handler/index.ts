import { Request, Response } from 'express';
import { mongoClient } from '../services/mongo';


import { postsModel, userModel } from '../models';

const handler = {
    getUserList: async function (req: Request, res: Response) {
        const client = mongoClient();
        const userList: any = [];
        const totalCount = Object.keys(client).length;
        let savedCount: number = 0;
        Object.keys(client).map(async (db: any) => {
            await client[db].find().then((data: any) => {
                data.map((d: any) => {
                    userList.push(d);
                });
                savedCount++;
                if(savedCount === totalCount) {
                    res.status(200).send(userList);
                }
            }).catch((error: any) => {
                res.status(500).send(error);
            });
        });
    },
    getUser: async function (req: Request, res: Response) {
        const client = mongoClient();
        if (req.params.id) {
            if (Object.keys(client).indexOf(`user${req.params.id}`) !== -1) {
                client[`user${req.params.id}`].findOne({id: req.params.id}).then((data: any) => {
                    if (data !== null) {
                        res.status(200).send(data);
                    } else {
                        res.status(404).send('User Not Found');
                    }
                }).catch((error: any) => {
                    res.status(500).send(error);
                });
            } else {
                res.status(404).send('User Not Found');
            }
        } else {
            res.status(400).send('Bad Request');
        }
    },
    getPostList: async function (req: Request, res: Response) {
        const client = mongoClient();
        if (req.params.id) {
            if (Object.keys(client).indexOf(`user${req.params.id}`) !== -1) {
                client[`user${req.params.id}`].findOne({id: req.params.id}).then((data: any) => {
                    if (data !== null) {
                        res.status(200).send(data.posts);
                    } else {
                        res.status(404).send('User Not Found');
                    }
                }).catch((error: any) => {
                    res.status(500).send(error);
                });
            } else {
                res.status(404).send('User Not Found');
            }
        } else {
            res.status(400).send('Bad Request');
        }
    },
    getPost: async function (req: Request, res: Response) {
        const client = mongoClient();
        if (req.params.userId && req.params.postId) {
            if (Object.keys(client).indexOf(`user${req.params.userId}`) !== -1) {
                client[`user${req.params.userId}`].findOne({id: req.params.userId}).then((data: any) => {
                    if (data !== null) {
                        let post: postsModel;
                        data.posts.map((d: postsModel) => {
                            if (d.id === parseInt(req.params.postId, 10)) {
                                post = d;
                            }
                        });
                        if (post) {
                            res.status(200).send(post);
                        } else {
                            res.status(404).send('Post Not Found');
                        }
                    } else {
                        res.status(404).send('User Not Found');
                    }
                });
            } else {
                res.status(404).send('User Not Found');
            }
        } else {
            res.status(400).send('Bad Request');
        }
    },
    updateAvatar: async function (req: Request, res: Response) {
        const client = mongoClient();
        if (req.params.id && req.body.avatarLink) {
            if (Object.keys(client).indexOf(`user${req.params.id}`) !== -1) {
                client[`user${req.params.id}`].findOne({id: req.params.id }).then((data: any) => {
                    if (data !== null) {
                        client[`user${req.params.id}`].findOneAndUpdate({id: req.params.id}, { avatar: req.body.avatarLink }).then(() => {
                            res.status(200).send('Updated Successfully');
                        }).catch((error: any) => {
                            res.status(500).send(error);
                        });
                    } else {
                        res.status(404).send('User Not Found');
                    }
                }).catch((error: any) => {
                    res.status(500).send(error);
                });
            } else {
                res.status(404).send('User Not Found');
            }
        } else {
            res.status(400).send('Bad Request');
        }
    },
};

export default handler;