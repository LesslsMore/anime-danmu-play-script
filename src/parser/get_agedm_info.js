export function get_agedm_info(url) {
    let episode = url.split('/').pop()
    let title = document.querySelector(".card-title").textContent
    return {
        episode, title
    }
}

export function get_agedm_src() {
    let src = document.querySelector("#artplayer > div > video")
    return src
}