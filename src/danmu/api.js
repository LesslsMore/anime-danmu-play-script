import xhr_get from "../utils/xhr_get";
import { request } from '../utils/request'

let end_point = 'https://api.dandanplay.net'
let Comment_GetAsync = '/api/v2/comment/'

let API_comment = '/api/v2/comment/'
let API_search_episodes = `/api/v2/search/episodes`

let Search_SearchAnimeAsync = `/api/v2/search/anime?keyword=`
let Related_GetRealtedAsync = `/api/v2/related/`
let Comment_GetExtCommentAsync = `/api/v2/extcomment?url=`




export async function get_danmus(title, id) {

    // let animeId = await get_animeId(title)

    id = id.padStart(4, "0");
    let episodeId = `${animeId}${id}`
    console.log(episodeId)

    let danmu = await get_danmu(episodeId)
    let urls = await get_related_url(episodeId)
    // console.log(urls)
    if (urls.length > 0) {
        for (let i = 0; i < urls.length; i++) {
            let danmu_ext = await get_danmu_ext(urls[i].url)
            danmu = [...danmu, ...danmu_ext]
        }
    }
    return danmu
}

export async function get_comments(animeId, id) {
    id = id.padStart(4, "0");
    let episodeId = `${animeId}${id}`
    console.log(episodeId)

    let danmu = await get_comment(episodeId)
    return danmu
}

// 获取 danmu 中 animeId
async function get_animeId(title) {
    let url = `${end_point}${Search_SearchAnimeAsync}${title}`
    let data = await xhr_get(url)
    data = JSON.parse(data)
    // console.log(data)
    let { animeId, animeTitle } = data.animes[0]
    console.log(animeId)
    console.log(animeTitle)
    return animeId
}

// 获取 anime, episode
export async function get_search_episodes(anime, episode) {
    const res = await request({
        url: `${end_point}${API_search_episodes}`,
        params: { anime, episode },
    })
    return res.animes
}

// 获取原始 danmu 
export async function get_comment(episodeId) {
    const res = await request({
        url: `${end_point}${API_comment}${episodeId}?withRelated=true&chConvert=1`,
    })
    return res.comments
}


// 获取原始 danmu 
async function get_danmu(episodeId) {
    let url = `${end_point}${Comment_GetAsync}${episodeId}`
    console.log('获取原始 danmu')
    console.log(url)
    let data = await xhr_get(url)
    data = JSON.parse(data)
    // let animeId = data.animes[0].animeId
    // console.log('获取原始 danmu 数目：')
    // console.log(data.count)
    return data.comments
}

// 获取视频相关 url
async function get_related_url(episodeId) {
    let url = `${end_point}${Related_GetRealtedAsync}${episodeId}`
    console.log('获取视频相关 url')
    console.log(url)
    let data = await xhr_get(url)
    data = JSON.parse(data)
    // let animeId = data.animes[0].animeId
    // console.log(data)
    return data.relateds
}

// 获取扩展 danmu 
async function get_danmu_ext(related_url) {
    let url = `${end_point}${Comment_GetExtCommentAsync}${related_url}`
    console.log('获取扩展 danmu')
    console.log(url)
    let data = await xhr_get(url)
    data = JSON.parse(data)

    // let animeId = data.animes[0].animeId
    // console.log('获取扩展 danmu 数目：')
    // console.log(data.count)
    return data.comments
}