import { Request, Response } from 'express';
import { mongoClient } from '../services/mongo';


import { postsModel } from '../models';

const handler = {
    getUserList: async function (req: Request, res: Response) {
        const client = mongoClient();
        client.find().then((data: any) => {
            res.status(200).send(data);
        }).catch((error: any) => {
            res.status(500).send(error);
        })
    },
    getUser: async function (req: Request, res: Response) {
        if (req.params.id) {
            const client = mongoClient();
            client.findOne({id: req.params.id}).then((data: any) => {
                if (data !== null) {
                    res.status(200).send(data);
                }
                res.status(404).send('User Not Found');
            }).catch((error: any) => {
                res.status(500).send(error);
            });
        } else {
            res.status(400).send('Bad Request');
        }
    },
    getPostList: async function (req: Request, res: Response) {
        if (req.params.id) {
            const client = mongoClient();
            client.findOne({id: req.params.id}).then((data: any) => {
                if (data !== null) {
                    res.status(200).send(data.posts);
                } else {
                    res.status(404).send('User Not Found');
                }
            }).catch((error: any) => {
                res.status(500).send(error);
            });
        } else {
            res.status(400).send('Bad Request');
        }
    },
    getPost: async function (req: Request, res: Response) {
        if (req.params.userId && req.params.postId) {
            const client = mongoClient();
            client.findOne({id: req.params.userId}).then((data: any) => {
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
            })
        } else {
            res.status(400).send('Bad Request');
        }
    },
    updateAvatar: async function (req: Request, res: Response) {
        if (req.params.id && req.body.avatarLink) {
            const client = mongoClient();
            client.findOne({id: req.params.id }).then((data: any) => {
                if (data !== null) {
                    client.findOneAndUpdate({id: req.params.id}, { avatar: req.body.avatarLink }).then((uData: any) => {
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
            res.status(400).send('Bad Request');
        }
    },
};

export default handler;