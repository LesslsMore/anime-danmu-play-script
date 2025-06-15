async function get_agedm_info(web_video_info) {
    // https://www.agefans.la/play/20250029/2/2
    let url = window.location.href
    let urls = url.split('/')
    let len = urls.length
    let episode = urls[len - 1]
    let anime_id = urls[len - 3]
    let title = document.querySelector(".card-title").textContent

    web_video_info['anime_id'] = anime_id
    web_video_info['episode'] = episode
    web_video_info['title'] = title
    web_video_info['url'] = url
    return web_video_info
}

function get_agedm_src() {
    let src = document.querySelector("#artplayer > div > video")
    return src
}

export {
    get_agedm_info,
    get_agedm_src
}
