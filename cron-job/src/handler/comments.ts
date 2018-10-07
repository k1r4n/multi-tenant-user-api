import Bluebird from 'bluebird';
import fetch from 'node-fetch';

import config from '../config';
import { getClient } from '../services/winston';

Promise = Bluebird as any || Promise;

export default async function getComments (): Promise<any> {
    const logger = getClient();
    return new Promise((resolve, reject) => {
        return fetch(config.apiUrl.comment).then(res => {
            return res.json();
        }).then(data => {
            resolve(data);
        }).catch(error => {
            logger.error(error);
            reject(error);
        });
    });
}