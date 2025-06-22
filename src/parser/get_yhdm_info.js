// 定义解析策略集合
const titleStrategies = [
    {
        match(url) {
            return url.startsWith('https://www.dmla');
        },
        getTitle() {
            return document.querySelector(".stui-player__detail.detail > h1 > a")?.text || '';
        }
    },
    {
        match(url) {
            return url.startsWith('https://www.tt776b.com/play');
        },
        getTitle() {
            return document.querySelector("body > div.myui-player.clearfix > div > div > div.myui-player__data.hidden-xs.clearfix > h3 > a")?.text || '';
        }
    },
    {
        match(url) {
            return url.startsWith('https://www.dm539.com/play');
        },
        getTitle() {
            return document.querySelector(".myui-panel__head.active.clearfix > h3 > a")?.text || '';
        }
    }
];

// 统一获取标题的方法
function get_title(url) {
    for (const strategy of titleStrategies) {
        if (strategy.match(url)) {
            return strategy.getTitle();
        }
    }

    console.warn('没有自动匹配到动漫名称');
    return '';
}


function get_yhdm_info(web_video_info) {
    let url = window.location.href

    let title = get_title(url);

    let episode = parseInt(url.split('-').pop().split('.')[0])
    let anime_url = url.split('-')[0]
    let anime_id = parseInt(anime_url.split('/')[4])


    web_video_info['anime_id'] = anime_id
    web_video_info['episode'] = episode
    web_video_info['title'] = title
    web_video_info['url'] = url
    return web_video_info
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


export {
    get_yhdm_info,
    re_render,
}
