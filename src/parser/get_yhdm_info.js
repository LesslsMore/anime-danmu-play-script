export function get_yhdm_info(url) {
    let episode = url.split('-').pop().split('.')[0]
    let title = document.querySelector(".stui-player__detail.detail > h1 > a")
    if (title == undefined) {
        title = document.querySelector(".myui-panel__head.active.clearfix > h3 > a")
    }
    title = title.innerText
    return {
        episode, title
    }
}