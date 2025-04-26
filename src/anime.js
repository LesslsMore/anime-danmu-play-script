import {get_anime_info, re_render} from '@/parser/get_anime_info'
import {get_comment, get_episodeId, get_search_episodes} from '@/danmu/api'
import {get_yhdmjx_url} from '@/parser/get_yhdmjx_url.js'
import {add_danmu, update_danmu} from '@/player/danmu.js'
import {NewPlayer, bilibiliDanmuParseFromJson} from '@/player/player'
import {local} from '@/utils/storage'
import {db_info, db_url, db_danmu} from "@/utils/db.js";

// export async function anime() {

let {anime_id, episode, title, url} = get_anime_info()

let db_anime_url = {
    "episodes": {},
}
let db_url_value = await db_url.get(anime_id)

if (db_url_value != null) {
    db_anime_url = db_url_value
}

let src_url
if (!db_anime_url['episodes'].hasOwnProperty(url)) {
    src_url = await get_yhdmjx_url(url)
    if (src_url) {
        db_anime_url['episodes'][url] = src_url
        // 更新解析地址
        db_url.put(anime_id, db_anime_url)
    }
} else {
    src_url = db_anime_url['episodes'][url]
}
// console.log('db_anime_url', db_anime_url)


let db_anime_info = {
    'animes': [{'animeTitle': title}],
    'idx': 0,
    'episode_dif': 0,
}

let db_info_value = await db_info.get(anime_id)
if (db_info_value != null) {
    db_anime_info = db_info_value
} else {
    db_info.put(anime_id, db_anime_info)
}

console.log('db_anime_info', db_anime_info)

console.log('src_url', src_url)

// let src_url = `http://v16m-default.akamaized.net/c79b338a02bcdfb62404a09a37974c78/66534a94/video/tos/alisg/tos-alisg-ve-0051c001-sg/oU42Rof2MAD5TKRPC2LIA2G5GHAbP8hIQPeeg6/?a=2011&bti=MzhALjBg&ch=0&cr=0&dr=0&net=5&cd=0%7C0%7C0%7C0&br=3316&bt=1658&cs=0&ds=4&ft=XE5bCqT0mmjPD12xNBo73wU7C1JcMeF~O5&mime_type=video_mp4&qs=0&rc=Zzw8NTw4ODU8NmhoPDw8PEBpajhreXc5cnF3cjMzODYzNEBgLTUzLjRgXy4xNjBfMjZeYSNhcmRlMmQ0YTRgLS1kMC1zcw%3D%3D&vvpl=1&l=20240526081952FCF254249B5F97C1A570&btag=e000a8000`
re_render('artplayer-app')
let art = NewPlayer(src_url, '.artplayer-app')
add_danmu(art)

let $count = document.querySelector("#count")
let $animeName = document.querySelector("#animeName")
let $animes = document.querySelector("#animes")
let $episodes = document.querySelector("#episodes")

function art_msgs(msgs) {
    art.notice.show = msgs.join(',\n\n')
}

let UNSEARCHED = ['未搜索到番剧弹幕', '请按右键菜单', '手动搜索番剧名称',]

let SEARCHED = () => {
    try {
        return [`番剧：${$animes.options[$animes.selectedIndex].text}`, `章节: ${$episodes.options[$episodes.selectedIndex].text}`, `已加载 ${$count.textContent} 条弹幕`,]
    } catch (e) {
        console.log(e)
        return []
    }
}

init()
get_animes()

async function update_episode_danmu() {

    const new_idx = $episodes.selectedIndex
    const db_anime_info = await db_info.get(anime_id)
    const {episode_dif} = db_anime_info
    // 存储选择的剧集序号
    let dif = new_idx + 1 - episode
    if (dif !== episode_dif) {
        db_anime_info['episode_dif'] = dif
        // 更新选择的剧集
        db_info.put(anime_id, db_anime_info)
    }

    // 获取选中的值
    const episodeId = $episodes.value;
    // 在控制台打印选中的值
    console.log('episodeId: ', episodeId);

    let danmu
    try {
        // 优先使用接口数据
        danmu = await get_comment(episodeId)

        // 缓存新数据，有效期7天
        await db_danmu.put(anime_id, episodeId, danmu)
    } catch (error) {
        console.log('接口请求失败，尝试使用缓存数据')
        // 使用缓存数据
        danmu = await db_danmu.get(anime_id, episodeId)
        if (!danmu) {
            throw new Error('无法获取弹幕数据')
        }
    }

    let danmus = bilibiliDanmuParseFromJson(danmu)
    update_danmu(art, danmus)
}

function get_animes() {
    const {animes, idx} = db_anime_info
    const {animeTitle} = animes[idx]
    if (!animes[idx].hasOwnProperty('animeId')) {
        console.log('没有缓存，请求接口')
        get_animes_new(animeTitle)
    } else {
        console.log('有缓存，请求弹幕')
        updateAnimes(animes, idx)
    }
}

// 请求接口，搜索番剧
async function get_animes_new(title) {
    try {
        const animes = await get_search_episodes(title)
        if (animes.length === 0) {
            art_msgs(UNSEARCHED)
        } else {
            db_anime_info['animes'] = animes
            // 更新搜索剧集
            db_info.put(anime_id, db_anime_info)
        }
        return animes
    } catch (error) {
        console.log('弹幕服务异常，稍后再试')
    }
}

function init() {
    // 监听加载到的弹幕数组
    art.on('artplayerPluginDanmuku:loaded', (danmus) => {
        console.info('加载弹幕', danmus.length);
        $count.textContent = danmus.length
        if ($count.textContent === '') {
            art_msgs(UNSEARCHED)
        } else {
            art_msgs(SEARCHED())
        }
    });

    art.on('pause', () => {
        if ($count.textContent === '') {
            art_msgs(UNSEARCHED)
        } else {
            art_msgs(SEARCHED())
        }
    });

    // 监听input元素的keypress事件
    $animeName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            get_animes_new($animeName.value)
        }
    });
    // 监听input元素的blur事件
    $animeName.addEventListener('blur', () => {
        get_animes_new($animeName.value)
    });
    // 初始搜索番剧默认名称
    $animeName.value = db_anime_info['animes'][db_anime_info['idx']]['animeTitle']

    $animes.addEventListener('change', async () => {
        // 获取选中的值
        const new_idx = $animes.selectedIndex
        const {idx, animes} = db_anime_info
        // 存储选择的番剧序号
        if (new_idx !== idx) {
            db_anime_info['idx'] = new_idx
            // 更新选择的剧集
            db_info.put(anime_id, db_anime_info)
            // 番剧选项变化
            updateEpisodes(animes[new_idx])

            // $animeName.value = anime_info['animes'][anime_info['idx']]['animeTitle']
        }
    });

    // 监听input元素的keypress事件
    $episodes.addEventListener('change', update_episode_danmu);

    document.addEventListener('db_info_put', async function (e) {
        let {animes: old_animes} = await db_info.get(anime_id)
        let {animes: new_animes, idx: new_idx} = e.value
        if (new_animes !== old_animes) {
            // 初始番剧选项与默认选择
            updateAnimes(new_animes, new_idx)
        }
    });

    document.addEventListener('updateAnimes', function (e) {
        console.log('updateAnimes 事件')
        updateEpisodes(e.value)
    });

    document.addEventListener('updateEpisodes', function (e) {
        console.log('updateEpisodes 事件')
        update_episode_danmu()
    });
}

// 初始番剧选项与默认选择
function updateAnimes(animes, idx) {
    const html = animes.reduce((html, anime) => html + `<option value="${anime.animeId}">${anime.animeTitle}</option>`, '')
    $animes.innerHTML = html

    $animes.value = animes[idx]['animeId']

    const event = new Event('updateAnimes')
    event.value = animes[idx]
    console.log(animes[idx])
    document.dispatchEvent(event);
}


// 更新 episode select
// 初始剧集选项与默认选择
async function updateEpisodes(anime) {
    const {animeId, episodes} = anime
    const html = episodes.reduce((html, episode) => html + `<option value="${episode.episodeId}">${episode.episodeTitle}</option>`, '')
    $episodes.innerHTML = html

    const db_anime_info = await db_info.get(anime_id)
    const {episode_dif} = db_anime_info

    let episodeId = get_episodeId(animeId, episode_dif + episode)
    $episodes.value = episodeId

    const event = new Event('updateEpisodes');
    document.dispatchEvent(event);
}
