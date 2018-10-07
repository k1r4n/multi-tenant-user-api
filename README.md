### USER DATABASE

## Setting up MongoDB

```
docker run --rm --name user_mongo -d -p 127.0.0.1:27017:27017 mongo
```

## Setting up cron-job

From project root folder

```
cd cron-job

npm install

npm run build

npm run start
```

This will set up a MongoDB collection and store data from the given links to collection.


## Setting up user-api

From project root folder

```
cd user-api

npm install

npm run build

npm run start
```

This set up user-api that will fetch user details, user posts and update avatar.

## API Documentation

### Fetch user list

```
Method: Get

Port: 3000

Host: http://localhost

URL: /user

Example: http://localhost:3000/user

Output: Array of user details || Error.
```

### Fetch Single User details

```
Method: Get

Port: 3000

Host: http://localhost

URL: /user/:id

Params: id

Example: http://localhost:3000/user/1

Output: User details object || Error.
```

### Fetch post list of a single User

```
Method: Get

Port: 3000

Host: http://localhost

URL: /user/:id/post

Params: id

Example: http://localhost:3000/user/1/post

Output: Array of posts by a single User || Error.
```

### Fetch Single Post Details

```
Method: Get

Port: 3000

Host: http://localhost

URL: /user/:userId/post/:postId

Params: { userId, postId }

Example: http://localhost:3000/user/1/post/1

Output: post details object || Error.
```

### Update User Avatar

```
Method: Get

Port: 3000

Host: http://localhost

URL: /user/:userId/update_avatar

Params: { userId }

Body: { avatarLink: String }

BodyType: x-www-form-urlencoded

Example: http://localhost:3000/user/1/update_avatar

Output: Success || Error.
```