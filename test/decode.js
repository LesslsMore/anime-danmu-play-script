import {get_yhdmjx_url} from "../src/parser/get_yhdmjx_url.js";

let url = 'https://www.dmla7.com/play/9173-1-1.html'

let src_url = await get_yhdmjx_url(url)

console.log(src_url)
