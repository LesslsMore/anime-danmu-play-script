import {db_danmu, db_info} from "@/danmu/db/db.js";
import {get_comment, get_episodeId, get_search_episodes} from "@/danmu/api/api.js";
import {art_msgs, init_danmu, update_danmu} from "@/danmu/player/danmu.js";

let UNSEARCHED = ['未搜索到番剧弹幕', '请按右键菜单', '手动搜索番剧名称',]

let SEARCHED = () => {
    let $danmu_count = document.querySelector("#danmu_count")
    let $anime_list = document.querySelector("#anime_list")
    let $episode_list = document.querySelector("#episode_list")
    try {
        return [`番剧：${$anime_list.options[$anime_list.selectedIndex].text}`, `章节: ${$episode_list.options[$episode_list.selectedIndex].text}`, `已加载 ${$danmu_count.textContent} 条弹幕`,]
    } catch (e) {
        console.log(e)
        return []
    }
}

function init_episode_list(art) {
    let $episode_list = document.querySelector("#episode_list")


    async function update_episode_select(art) {
        // 章节
        let {
            anime_id,
            title,

            url,
            episode,
        } = art.storage.get('info')

        let $episodes = document.querySelector("#episode_list")

        const episode_idx = $episodes.selectedIndex
        console.log('update_episode_select: ', episode_idx)
        let db_anime_info = await db_info.get(anime_id)
        // let db_anime_info = art.storage.get('db_info')
        const {episode_dif} = db_anime_info
        // 存储选择的剧集序号
        let dif = episode_idx + 1 - episode
        if (dif !== episode_dif) {
            db_anime_info['episode_dif'] = dif
            await db_info.put(anime_id, db_anime_info)
            // 更新选择的剧集
            // const event = new Event('db_info_put');
            // event.key = anime_id;
            // event.value = db_anime_info;
            // document.dispatchEvent(event);
            //
            // let db_info = art.storage.get('db_info')
            // let {animes: old_animes} = db_info
            // let {animes: new_animes, idx: new_idx} = e.value
            // if (new_animes !== old_animes) {
            //     // 初始番剧选项与默认选择
            //     db_info.animes = new_animes
            //     db_info.idx = new_idx
            //     art.storage.set('db_info', db_info)
            // }
        }

        // 获取选中的值
        const episode_id = $episodes.value;
        // 在控制台打印选中的值
        let danmu
        try {
            // 优先使用接口数据
            danmu = await get_comment(episode_id)
            await db_danmu.put(episode_id, danmu)
            // art.storage.set(episodeId, danmu)
        } catch (error) {
            console.log('接口请求失败，尝试使用缓存数据: ', error)
            danmu = await db_danmu.get(episode_id)
            // danmu = art.storage.get(episodeId)
            if (!danmu) {
                throw new Error('无法获取弹幕数据')
            }
        }
        update_danmu(art, danmu)
    }


    // 更新 episode select
    // 初始剧集选项与默认选择
    async function update_episode_list(art, anime) {
        console.log('update_episode_list: ', anime)

        let {
            anime_id,
            title,

            url,
            episode,
        } = art.storage.get('info')
        // 章节
        let $episodes = document.querySelector("#episode_list")

        const {animeId, episodes} = anime
        const html = episodes.reduce((html, episode) => html + `<option value="${episode.episodeId}">${episode.episodeTitle}</option>`, '')
        $episodes.innerHTML = html

        let db_anime_info = await db_info.get(anime_id)
        // let db_anime_info = art.storage.get('db_info')
        const {episode_dif} = db_anime_info

        let episodeId = get_episodeId(animeId, episode_dif + episode)

        $episodes.value = episodeId

        const event = new CustomEvent('update_episode_select', {
            detail: {
                art,
            },
        });
        document.dispatchEvent(event);
    }

    // 监听input元素的keypress事件
    $episode_list.addEventListener('change', async function (e) {
        await update_episode_select(art)
    });

    // document.addEventListener('db_info_put', async function (e) {
    //     let {
    //         anime_id,
    //         title,
    //
    //         url,
    //         episode,
    //     } = art.storage.get('info')
    //     let db_anime_info = await db_info.get(anime_id)
    //     let {animes: old_animes} = db_anime_info
    //     // let db_info = art.storage.get('db_info')
    //     // let {animes: old_animes} = db_info
    //     let {animes: new_animes, idx: new_idx} = e.value
    //     if (new_animes !== old_animes) {
    //         // 初始番剧选项与默认选择
    //         db_anime_info.animes = new_animes
    //         db_anime_info.idx = new_idx
    //         // art.storage.set('db_info', db_anime_info)
    //         await db_info.put(anime_id, db_anime_info)
    //         update_animes_list(art, new_animes, new_idx)
    //     }
    // });

    document.addEventListener('update_episode_list', async function (e) {
        let {art, anime} = e.detail
        await update_episode_list(art, anime)
    });

    document.addEventListener('update_episode_select', async function (e) {
        let {art} = e.detail
        await update_episode_select(art)
    });
}

function init_anime_list(art) {
    let $anime_list = document.querySelector("#anime_list")

    $anime_list.addEventListener('change', async () => {
        // let db_anime_info = art.storage.get('db_info')
        let {
            anime_id,
            title,

            url,
            episode,
        } = art.storage.get('info')
        let db_anime_info = await db_info.get(anime_id)
        // 获取选中的值
        const new_idx = $anime_list.selectedIndex
        const {anime_idx, animes} = db_anime_info
        // 存储选择的番剧序号
        if (new_idx !== anime_idx) {
            db_anime_info['anime_idx'] = new_idx
            // 更新选择的剧集
            // art.storage.set('db_info', db_anime_info)
            await db_info.put(anime_id, db_anime_info)
            await set_anime_name(art)
            await get_anime_list(art)

            // 番剧选项变化
            // await update_episode_list(art, animes[new_idx])

            // $animeName.value = anime_info['animes'][anime_info['idx']]['animeTitle']
        }
    });

    let $anime_name = document.querySelector("#anime_name")
// 监听input元素的keypress事件
    $anime_name.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            await update_anime_list_req($anime_name.value, art)
        }
    });
// 监听input元素的blur事件
    $anime_name.addEventListener('blur', async () => {
        await update_anime_list_req($anime_name.value, art)
    });
}

function init_danmu_player(art) {
    // let $danmu_count = document.querySelector("#danmu_count")
    // let $anime_list = document.querySelector("#anime_list")
    // let $episode_list = document.querySelector("#episode_list")
    // let $anime_name = document.querySelector("#anime_name")

    init_danmu(art)
    init_anime_list(art)
    init_episode_list(art)
}

async function set_anime_name(art) {

    let {
        anime_id,
        title,

        url,
        episode,
    } = art.storage.get('info')

    let db_anime_info = await db_info.get(anime_id)
    console.log('set_anime_name: ', db_anime_info)
    let {animes, anime_idx} = db_anime_info
    // let {anime_idx} = db_anime_info
    let new_idx
    if (anime_idx <= animes.length - 1) {
        new_idx = anime_idx
    } else {
        new_idx = 0
        db_anime_info.anime_idx = new_idx
        await db_info.put(anime_id, db_anime_info)
    }
    let animeTitle = animes[new_idx].animeTitle
    let $anime_name = document.querySelector("#anime_name")
    // 初始搜索番剧默认名称
    // console.log('set_anime_name: ', animeTitle, title)
    if (animeTitle) {
        $anime_name.value = animeTitle
    } else {
        $anime_name.value = title
    }
}


// 请求接口，搜索番剧
async function update_anime_list_req(animeTitle, art) {
    let {
        anime_id,
        title,

        url,
        episode,
    } = art.storage.get('info')

    let db_anime_info = await db_info.get(anime_id)
    // let db_anime_info = art.storage.get('db_info')
    let animes
    try {
        animes = await get_search_episodes(animeTitle)
    } catch (error) {
        console.log('弹幕服务异常，稍后再试: ', error)
    }
    if (animes.length > 0) {
        db_anime_info.animes = animes
        // db_anime_info.anime_idx = new_idx
        await db_info.put(anime_id, db_anime_info)
        // art.storage.set('db_info', db_anime_info)
        await set_anime_name(art)
        await get_anime_list(art)
        // update_anime_list_dom(art, animes, db_anime_info.anime_idx)
    } else {
        art_msgs(art, UNSEARCHED)
    }
}

// 初始番剧选项与默认选择
function update_anime_list_dom(art, animes, anime_idx) {
    console.log('update_anime_list: ', animes, anime_idx)
    // 番剧名称列表
    let $anime_list = document.querySelector("#anime_list")

    const html = animes.reduce((html, anime) => html + `<option value="${anime.animeId}">${anime.animeTitle}</option>`, '')
    $anime_list.innerHTML = html

    let anime = animes[anime_idx]
    $anime_list.value = anime['animeId']

    // const event = new Event('update_episodes')
    // event.value = animes[idx]
    // console.log(animes[idx])

    const event = new CustomEvent('update_episode_list', {
        detail: {
            art,
            anime,
        },
    });
    document.dispatchEvent(event);
}

async function get_anime_list(art) {
    let {
        anime_id,
        title,

        url,
        episode,
    } = art.storage.get('info')

    let db_anime_info = await db_info.get(anime_id)
    // let db_anime_info = art.storage.get('db_info')

    let {animes, anime_idx} = db_anime_info
    let anime = animes[anime_idx]
    const {animeTitle} = anime
    if (!anime.hasOwnProperty('animeId')) {
        console.log('没有缓存，请求接口')
        await update_anime_list_req(animeTitle, art)
    } else {
        console.log('有缓存，请求弹幕')
        update_anime_list_dom(art, animes, anime_idx)
    }
}

export {
    init_danmu_player,
    get_anime_list,
    set_anime_name,
    SEARCHED,
    UNSEARCHED,
}
