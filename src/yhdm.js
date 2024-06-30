import { get_yhdm_info } from './parser/get_yhdm_info'
import {get_comment, get_episodeId, get_search_episodes} from './danmu/api'
import get_yhdm_url from './parser/get_yhdm_url'
import { add_danmu, update_danmu } from './danmu/danmu'
import { NewPlayer, bilibiliDanmuParseFromJson } from './player/player'
import { local } from './utils/storage'

// export async function yhdm() {
let url = window.location.href

let { episode, title } = get_yhdm_info(url)

let yhdmId = url.split('-')[0]
console.log(url)
console.log(episode)
console.log(title)

let info = local.getItem(yhdmId)
if (info === undefined) {
    info = {
        "animeTitle": title,
        "episodes": {},
    }
}
let src_url
if(!info['episodes'].hasOwnProperty(url)) {
    src_url = await get_yhdm_url(url)
    info['episodes'][url] = src_url
    local.setItem(yhdmId, info)
} else {
    src_url = info['episodes'][url]
}

// let src_url = `http://v16m-default.akamaized.net/c79b338a02bcdfb62404a09a37974c78/66534a94/video/tos/alisg/tos-alisg-ve-0051c001-sg/oU42Rof2MAD5TKRPC2LIA2G5GHAbP8hIQPeeg6/?a=2011&bti=MzhALjBg&ch=0&cr=0&dr=0&net=5&cd=0%7C0%7C0%7C0&br=3316&bt=1658&cs=0&ds=4&ft=XE5bCqT0mmjPD12xNBo73wU7C1JcMeF~O5&mime_type=video_mp4&qs=0&rc=Zzw8NTw4ODU8NmhoPDw8PEBpajhreXc5cnF3cjMzODYzNEBgLTUzLjRgXy4xNjBfMjZeYSNhcmRlMmQ0YTRgLS1kMC1zcw%3D%3D&vvpl=1&l=20240526081952FCF254249B5F97C1A570&btag=e000a8000`
let art = NewPlayer(src_url)
add_danmu(art)

let $count = document.querySelector("#count")
let $animeName = document.querySelector("#animeName")
let $animes = document.querySelector("#animes")
let $episodes = document.querySelector("#episodes")

function msgs() {
    if ($count.textContent === '') {
        let msgs = [
            '未搜索到番剧弹幕',
            '请按右键菜单',
            '手动搜索番剧名称',
        ]
        art.notice.show = msgs.join(',\n\n')
    } else {
        let msgs = [
            `番剧：${$animes.options[$animes.selectedIndex].text}`,
            `章节: ${$episodes.options[$episodes.selectedIndex].text}`,
            `已加载 ${$count.textContent} 条弹幕`,
        ]
        art.notice.show = msgs.join('\n\n')
    }
}
// 监听加载到的弹幕数组
art.on('artplayerPluginDanmuku:loaded', (danmus) => {
    console.info('加载弹幕', danmus.length);
    $count.textContent = danmus.length
    msgs()
});

art.on('ready', () => {
    msgs()
})

art.on('pause', () => {
    msgs()
});

init_animeName()
init_animes()
init_episodes()

update_anime_episode(info['animeTitle'])

function handleKeypressEvent(e) {
    if (e.key === 'Enter') {
        update_anime_episode($animeName.value)
    }
}

function handleBlurEvent() {
    update_anime_episode($animeName.value)
}

async function update_episode_danmu() {
    // 获取选中的值
    const episodeId = $episodes.value;
    // 在控制台打印选中的值
    console.log('episodeId: ', episodeId);

    let danmu = await get_comment(episodeId)

    let danmus = bilibiliDanmuParseFromJson(danmu)
    // console.log('总共弹幕数目: ', danmus.length)
    update_danmu(art, danmus)
}

async function update_anime_episode(title) {
    let animes = await get_animes(title)

    updateAnimes(animes)
    updateEpisodes(animes[0].episodes)

    let episodeId = get_episodeId(animes[0].animeId, episode)
    $episodes.value = episodeId
    update_episode_danmu()
}

async function get_animes(title) {
    try {
        let animes = info['animes']
        // console.log(animes)
        if (animes === undefined) {
            console.log('没有缓存，请求接口')
            animes = await get_search_episodes(title)
            if (animes.length === 0) {
                console.log('未搜索到番剧')
                // return showTips('未搜索到番剧')
            } else {
                info['animes'] = animes
                local.setItem(yhdmId, info)
            }
        }
        if (info['animeTitle'] !== animes[0]['animeTitle']) {
            info['animeTitle'] = animes[0]['animeTitle']
            local.setItem(yhdmId, info)
        }
        // console.log(animes)
        return animes

    } catch (error) {
        console.log('弹幕服务异常，稍后再试')
        // showTips('弹幕服务异常，稍后再试', 3000)
    }
}

function init_animeName() {
    // 监听input元素的keypress事件
    $animeName.addEventListener('keypress', handleKeypressEvent);
    // 监听input元素的blur事件
    $animeName.addEventListener('blur', handleBlurEvent);

    $animeName.value = title
}

function init_animes() {
    $animes.addEventListener('change', async () => {
        // 获取选中的值
        const animeId = $animes.value;
        const animeTitle = $animes.options[$animes.selectedIndex].text;
        // 在控制台打印选中的值
        console.log('animeTitle: ', animeTitle);
        update_anime_episode(animeTitle)
    });
}

function init_episodes() {
    // 监听input元素的keypress事件
    $episodes.addEventListener('change', update_episode_danmu);
}

function updateAnimes(animes) {
    const html = animes.reduce(
        (html, anime) =>
            html + `<option value="${anime.animeId}">${anime.animeTitle}</option>`,
        ''
    )
    $animes.innerHTML = html
}

// 更新 episode select
function updateEpisodes(episodes) {
    const html = episodes.reduce(
        (html, episode) =>
            html +
            `<option value="${episode.episodeId}">${episode.episodeTitle}</option>`,
        ''
    )
    $episodes.innerHTML = html
}
