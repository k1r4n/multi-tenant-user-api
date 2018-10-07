import express from "express";
import bodyParser from 'body-parser';

import config from './config';
import handler from './handler';

import * as winston from './services/winston';
import initializeMongo from './services/mongo';

export default async function initializeServer() {
    winston.intialize();
    const logger = winston.getClient();

    logger.info('Starting mongo service');
    await initializeMongo().catch((error: any) => {
        process.exit(1);
    });

    const app = express();

    

    app.use(bodyParser.json());

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        }
        next();
    });

    app.get('/user', await handler.getUserList);
    app.get('/user/:id', await handler.getUser);
    app.get('/user/:id/post', await handler.getPostList);
    app.get('/user/:userId/post/:postId', await handler.getPost);
    app.put('/user/:id/update_avatar', await handler.updateAvatar);

    app.listen(config.server.port, () => {
        logger.info(`App is running on http://localhost:${config.server.port}`)
    });
}