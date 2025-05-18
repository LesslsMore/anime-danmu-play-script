import {get_anime_info, re_render} from '@/parser/get_anime_info'
import {set_db_url_info} from "@/danmu/db/db_url.js";
import {get_anime_list, init_danmu_player, set_anime_name} from "@/danmu/player/search.js";
import {init_player} from "@/danmu/player/player.js";
import {db_info} from "@/danmu/db/db.js";

re_render('artplayer-app')

let web_video_info = get_anime_info()
let {
    anime_id, episode, title, url
} = web_video_info

await set_db_url_info(web_video_info)
// let src_url = `http://v16m-default.akamaized.net/c79b338a02bcdfb62404a09a37974c78/66534a94/video/tos/alisg/tos-alisg-ve-0051c001-sg/oU42Rof2MAD5TKRPC2LIA2G5GHAbP8hIQPeeg6/?a=2011&bti=MzhALjBg&ch=0&cr=0&dr=0&net=5&cd=0%7C0%7C0%7C0&br=3316&bt=1658&cs=0&ds=4&ft=XE5bCqT0mmjPD12xNBo73wU7C1JcMeF~O5&mime_type=video_mp4&qs=0&rc=Zzw8NTw4ODU8NmhoPDw8PEBpajhreXc5cnF3cjMzODYzNEBgLTUzLjRgXy4xNjBfMjZeYSNhcmRlMmQ0YTRgLS1kMC1zcw%3D%3D&vvpl=1&l=20240526081952FCF254249B5F97C1A570&btag=e000a8000`

let art = init_player(web_video_info.src_url, '.artplayer-app','')

init_danmu_player(art)

// 获取播放信息
let info = {
    anime_id,
    title,
    src_url: web_video_info.src_url,
    url,
    episode,
}
art.storage.set('info', info)
console.log('info: ', info)
let db_anime_info = await db_info.get(anime_id)
if (db_anime_info) {

} else {
    db_anime_info = {
        animes: [{ animeTitle: title }],
        anime_idx: 0,
        episode_dif: 0,
    }
    await db_info.put(anime_id, db_anime_info)
}
console.log('db_anime_info: ', db_anime_info)

// await art.switchUrl(url)
await set_anime_name(art)
await get_anime_list(art)
