export class Owner {
    id: String;
}

export class Media {
    id: String;
    owner: Owner;
}

export class Nodee {
    node: Media;
}

export class HashtagMedia {
    count: number;
    edges: Nodee[];
}

export class Hashtag {
    name: String;
    edge_hashtag_to_media: HashtagMedia;
}

export class Graphql {
    hashtag: Hashtag;
}

export class InstaResp {
    graphql: Graphql
}