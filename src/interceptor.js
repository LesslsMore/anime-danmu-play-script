import {get_src_url, get_web_iframe, get_web_info} from '@/parser/get_anime_info.js'

async function interceptor() {
    'use strict';

    if (window.self != window.top) {
        console.log("当前页面位于iframe子页面");
        console.log(window.location.href)

        const observer = new MutationObserver(function (mutationsList, observer) {
            // 判断某个特定元素是否已经存在
            console.log('mutationsList', mutationsList)
            console.log('observer', observer)

            let video = document.querySelector("video")
            if (video) {
                console.log("目标元素已加载");
                let src_url = video.src
                console.log('src_url', src_url)
                // src_url = unsafeWindow.info.url
                // console.log('src_url', src_url)

                let message = {msg: 'send_url', url: src_url, href: location.href}; // 要传递的消息
                console.log("向父页面发送消息：", message);
                unsafeWindow.parent.postMessage(message, "*");

                observer.disconnect(); // 停止观察
            }
        });

        observer.observe(document.body, {
            childList: true, // 观察目标子节点的变化，添加或删除
            // attributes: true, // 观察属性变动
            // subtree: true, //默认是false，设置为true后可观察后代节点
        });

        // const observer = new MutationObserver((mutationsList) => {
        //     for (let mutation of mutationsList) {
        //         if (mutation.type === 'childList') {
        //             // 检查新增的节点中是否有 video 元素
        //             mutation.addedNodes.forEach(node => {
        //                 if (node instanceof HTMLElement && node.tagName.toLowerCase() === 'video') {
        //                     console.log('检测到 <video> 标签:', node);
        //                     // 添加 src 属性变化监听器
        //                     node.addEventListener('loadedmetadata', () => {
        //                         console.log('视频地址:', node.src);
        //                     });
        //                 }
        //             });
        //         }
        //     }
        // });
        //
        // // 开始观察 document.body
        // observer.observe(document.body, {
        //     childList: true,
        //     subtree: true
        // });

        // get_src_url()
        // console.log(window)
        // console.log(unsafeWindow)

        unsafeWindow.addEventListener('message', async function (event) {
            let data = event.data
            if (data.msg === 'get_url') {
                console.log('message', data)
                // console.log(window)
                // console.log(unsafeWindow)

                let url_decode = get_src_url()

                let message = {msg: 'send_url', url: url_decode, href: location.href}; // 要传递的消息
                console.log("向父页面发送消息：", message);
                unsafeWindow.parent.postMessage(message, "*");
            }
        })
    } else if (window === window.top) {
        console.log("当前页面位于主页面");
        console.log(window.location.href)

        // await get_web_info()

        window.addEventListener('message', async function (event) {
            let data = event.data
            if (data.msg === 'send_url') {
                console.log('message', data)
                let src_url = data.url
                let iframe = get_web_iframe()

                let play = import.meta.env.VITE_baseURL
                if (!iframe.src.startsWith(play)) {

                    let {anime_id, episode, title, url} = await get_web_info(src_url)

                    function get_param_url(animeId, episode, title, videoUrl) {
                        const queryParams = new URLSearchParams();
                        if (animeId) queryParams.append('anime_id', animeId);
                        if (episode) queryParams.append('episode', episode);
                        if (title) queryParams.append('title', title);
                        if (videoUrl) queryParams.append('url', videoUrl);
                        return queryParams.toString();
                    }

                    let play_url = `${play}/play?${get_param_url(anime_id, episode, title, src_url)}`
                    // play_url = `https://jx.nnsvip.cn/?url=${web_video_info.src_url}`

                    iframe.src = play_url
                }
            }
        }, true)

        let iframe = get_web_iframe()
        if (iframe.src) {
            console.log('初始检测到播放器 iframe 地址:', iframe.src);
            // document.querySelectorAll('#lelevideo').forEach(handleVideoSrc);
            // console.log(iframe)

            iframe.addEventListener('load', async () => {
                console.log('跨域 iframe 加载完成');
                let message = {msg: 'get_url'}; // 要传递的消息
                let len = window.length
                let win = window[len - 1]
                // console.log('win', win)
                win.postMessage(message, "*");
            });
        }
    }
}

export {
    interceptor,
}
