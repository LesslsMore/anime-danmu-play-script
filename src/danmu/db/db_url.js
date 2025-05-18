import {db_url} from "@/danmu/db/db.js";

import {get_yhdmjx_url} from '@/parser/get_yhdmjx_url.js'

async function set_db_url_info(web_video_info) {

    let {anime_id, title, url} = web_video_info

    let var_anime_url = {
        "episodes": {},
    }
    let db_anime_url = await db_url.get(anime_id)

    if (db_anime_url != null) {
        var_anime_url = db_anime_url
    }

    let src_url
    if (!var_anime_url['episodes'].hasOwnProperty(url)) {
        let { mp4, m3u8 } = await get_yhdmjx_url(url)
        src_url = mp4
        // src_url = m3u8
        if (src_url) {
            var_anime_url['episodes'][url] = src_url
            // 更新解析地址
            await db_url.put(anime_id, var_anime_url)
        }
    } else {
        src_url = var_anime_url['episodes'][url]
    }
    console.log('src_url', src_url)
    web_video_info['src_url'] = src_url
    return {
        var_anime_url,
    }
}

export {
    set_db_url_info
}
