function get_anime_info(url) {
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

// 删除元素，添加容器
function re_render(container) {
    let player = document.querySelector(".stui-player__video.clearfix")
    if (player == undefined) {
        player = document.querySelector("#player-left")
    }
    let div = player.querySelector('div')
    let h = div.offsetHeight
    let w = div.offsetWidth

    player.removeChild(div)

    let app = `<div style="height: ${h}px; width: ${w}px;" class="${container}"></div>`
    player.innerHTML = app
}

export {get_anime_info, re_render}
