export function get_anime_info(url) {
    let episode = parseInt(url.split('-').pop().split('.')[0])
    let include = [
            /^https:\/\/www\.dmla.*\.com\/play\/.*$/, // 风车动漫
            'https://www.tt776b.com/play/*', // 风车动漫
            'https://www.dm539.com/play/*', // 樱花动漫
        ]
    let els = [
        document.querySelector(".stui-player__detail.detail > h1 > a"),
        document.querySelector("body > div.myui-player.clearfix > div > div > div.myui-player__data.hidden-xs.clearfix > h3 > a"),
        document.querySelector(".myui-panel__head.active.clearfix > h3 > a"),
    ]
    let el
    let title
    for (let i = 0; i < include.length; i++) {
        if (url.match(include[i])) {
            el = els[i];
        }
    }
    if (el != undefined) {
        title = el.text

    } else {
        title = ''
        console.log('没有自动匹配到动漫名称')
    }
    return {
        episode, title
    }
}
