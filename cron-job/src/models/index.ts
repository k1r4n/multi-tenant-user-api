export type commentsModel = {
    id: number;
    postId: number;
    name: string;
    email: string;
    body: string;
};

export type postsModel = {
    id: number;
    userId: number;
    title: string;
    body: string;
    comments: commentsModel[];
};

type geoModel = {
    lat: string;
    lng: string;
};

type addressModel = {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: geoModel;
};

type companyModel = {
    name: string;
    catchPhrase: string;
    bs: string;
};

export type userModel = {
    id: number;
    name: string;
    username: string;
    email: string;
    address: addressModel;
    phone: string;
    website: string;
    company: companyModel;
    posts: postsModel[];
};