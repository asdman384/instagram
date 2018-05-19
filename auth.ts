import { Instagram } from "./infrastructure/instagram";

let i = new Instagram("cookies")
i.getNews('/explore/tags/lviv/').then((data) => {

    console.log(data);

})