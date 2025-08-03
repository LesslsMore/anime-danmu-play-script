import {get_agedm_info} from "@/parser/get_agedm_info.js";
import {set_db_url_info} from "@/danmu/db/db_url.js";
import {get_yhdm_info} from "@/parser/get_yhdm_info.js";


// 定义 iframe 获取策略
const iframeStrategies = [
    {
        match(url) {
            return url.startsWith('https://www.dmla') ||
                url.startsWith('https://www.dm539.com/play') ||
                url.startsWith('https://www.tt776b.com/play');
        },
        getIframe() {
            return document.querySelector("#playleft > iframe");
        },
        get_info(web_video_info) {
            return get_yhdm_info(web_video_info)
        }
    },
    {
        match(url) {
            return url.startsWith('https://www.age');
        },
        getIframe() {
            return document.querySelector("#iframeForVideo");
        },
        get_info(web_video_info) {
            return get_agedm_info(web_video_info)
        }
    }
];

// 获取 iframe 的统一接口
function get_web_iframe() {
    let url = window.location.href
    for (const strategy of iframeStrategies) {
        if (strategy.match(url)) {
            return strategy.getIframe();
        }
    }
    console.warn("未匹配到 iframe 获取策略");
    return null;
}

function get_info_ByUrl(web_video_info) {
    let url = window.location.href
    for (const strategy of iframeStrategies) {
        if (strategy.match(url)) {
            return strategy.get_info(web_video_info);
        }
    }
    console.warn("未匹配到 iframe 获取策略");
    return null;
}


async function get_web_info(src_url) {
    let url = window.location.href
    let info
    let web_video_info = {
        src_url,
    }
    info = get_info_ByUrl(web_video_info)
    console.log('get_web_info', web_video_info)

    await set_db_url_info(web_video_info)
    return web_video_info
}

function get_src_url() {
    let url = window.location.href
    let src_url = ''
    let video
    // console.log(window)
    // console.log(unsafeWindow)
    try {
        if (url.startsWith('https://danmu.yhdmjx.com/')) {
            src_url = unsafeWindow.v_decrypt(unsafeWindow.config.url, unsafeWindow._token_key, unsafeWindow.key_token)
            video = document.querySelector("#lelevideo")

        } else if (url.startsWith('https://43.240.156.118:8443/')) {
            video = document.querySelector("video")
            // console.log('document', document)
            // console.log('video', video)

            src_url = unsafeWindow.info.url

            // const observer = new MutationObserver(function (mutationsList, observer) {
            //     // 判断某个特定元素是否已经存在
            //     console.log('mutationsList', mutationsList)
            //     console.log('observer', observer)
            //     if (document.querySelector("video")) {
            //         console.log("目标元素已加载");
            //         src_url = unsafeWindow.info.url
            //         console.log('src_url', src_url)
            //         observer.disconnect(); // 停止观察
            //     }
            // });
            //
            // observer.observe(document.body, {
            //     childList: true, // 观察目标子节点的变化，添加或删除
            //     attributes: true, // 观察属性变动
            //     subtree: true, //默认是false，设置为true后可观察后代节点
            // });
            //
            // function init() {
            //     console.log("DOM 加载完成");
            //     src_url = unsafeWindow.info.url
            //     console.log('src_url', src_url)
            // }
            //
            // if (document.readyState !== 'loading') {
            //     init()
            // } else {
            //     window.addEventListener('DOMContentLoaded', init)
            // }


            // document.addEventListener("DOMContentLoaded", function () {
            //     console.log("DOM 加载完成");
            //     src_url = unsafeWindow.info.url
            //     console.log('src_url', src_url)
            // });
            //
            //
            // if (document.readyState === "complete") {
            //     console.log("文档和所有资源已加载完成");
            // } else {
            //     window.addEventListener("load", function () {
            //         console.log("最终所有资源加载完成");
            //         src_url = unsafeWindow.info.url
            //         console.log('src_url', src_url)
            //     });
            // }
            // window.onload = function () {
            //     console.log("页面所有资源加载完成");
            //     src_url = unsafeWindow.info.url
            //     console.log('src_url', src_url)
            // };

        }

        src_url = video ? video.src : src_url
    } catch (e) {
        console.log('get_src_url error', e)
    }
    return src_url
}

export {
    get_web_iframe,
    get_web_info,
    get_src_url
};
