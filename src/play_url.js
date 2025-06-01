import {get_anime_info} from '@/parser/get_anime_info'
import {set_db_url_info} from "@/danmu/db/db_url.js";

let web_video_info = get_anime_info()
let {
    anime_id, episode, title, url, src_url
} = web_video_info

await set_db_url_info(web_video_info)

function get_param_url(animeId, episode, title, videoUrl) {
    const queryParams = new URLSearchParams();
    if (animeId) queryParams.append('anime_id', animeId);
    if (episode) queryParams.append('episode', episode);
    if (title) queryParams.append('title', title);
    if (videoUrl) queryParams.append('url', videoUrl);
    return queryParams.toString();
}
let play = import.meta.env.VITE_baseURL
let play_url = `${play}/play?${get_param_url(anime_id, episode, title, web_video_info.src_url)}`
// play_url = `https://jx.nnsvip.cn/?url=${web_video_info.src_url}`
document.querySelector("#playleft > iframe").src = play_url

