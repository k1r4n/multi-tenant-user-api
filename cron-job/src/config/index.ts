const config = {
    log: {
        logLevel: 'debug',
        logFile: '',
    },
    mongoUrl: 'mongodb://127.0.0.1:27017/local',
    apiUrl: {
        user: 'https://jsonplaceholder.typicode.com/users',
        post: 'https://jsonplaceholder.typicode.com/posts',
        comment: 'https://jsonplaceholder.typicode.com/comments',
    },
};

export default config;