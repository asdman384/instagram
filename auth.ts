import { Instagram } from "./infrastructure/instagram";

let i = new Instagram("cookies")
i.getNews('/explore/tags/lviv/').then((data) => {

    console.log(data);

})

class Owner {
    id: string;
}
class Media {
    id: string;
    owner: Owner;
}
class Node {
    node: Media;
}
class HashtagMedia {
    count: number;
    edges: Node[];
}
class Hashtag {
    edge_hashtag_to_media: HashtagMedia;
}
class Graphql {
    hashtag: Hashtag;
}