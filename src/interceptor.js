import {get_anime_info} from '@/parser/get_anime_info'
import {set_db_url_info} from "@/danmu/db/db_url.js";

function interceptor() {
    'use strict';

    if (window.self != window.top) {
        console.log("当前页面位于iframe子页面");
        console.log(window.location.href)

        window.addEventListener('message', async function (event) {
            let data = event.data
            console.log('message', data)
            if (data.msg === 'get_url') {
                // console.log(window)
                // console.log(unsafeWindow)
                let url_decode = unsafeWindow.v_decrypt(unsafeWindow.config.url, unsafeWindow._token_key, unsafeWindow.key_token)
                let message = {msg:'send_url', url: url_decode, href: location.href}; // 要传递的消息
                console.log("向父页面发送消息：", message);
                unsafeWindow.parent.postMessage(message, "*");
            }
        })
    } else if (window === window.top) {
        console.log("当前页面位于主页面");
        console.log(window.location.href)

        window.addEventListener('message', async function (event) {
            let data = event.data
            console.log('message', data)
            if (data.msg === 'send_url') {
                window.src_url = data.url

                let iframe = document.querySelector("#playleft > iframe")

                let play = import.meta.env.VITE_baseURL
                if (!iframe.src.startsWith(play)) {
                    let web_video_info = {}

                    get_anime_info(web_video_info)

                    let {
                        anime_id, episode, title, url, src_url
                    } = web_video_info

                    await set_db_url_info(web_video_info)

                    function get_param_url(animeId, episode, title, videoUrl) {
                        const queryParams = new URLSearchParams();
                        if (animeId) queryParams.append('anime_id', animeId);
                        if (episode) queryParams.append('episode', episode);
                        if (title) queryParams.append('title', title);
                        if (videoUrl) queryParams.append('url', videoUrl);
                        return queryParams.toString();
                    }

                    let play_url = `${play}/play?${get_param_url(anime_id, episode, title, web_video_info.src_url)}`
                    // play_url = `https://jx.nnsvip.cn/?url=${web_video_info.src_url}`

                    iframe.src = play_url
                    // document.querySelector("#playleft > iframe").src = play_url
                }
            }
        }, true)
    }

    // 页面初始时也检查一次
    document.querySelectorAll("#playleft > iframe").forEach(iframe => {
        if (iframe.src) {
            // console.log('初始检测到播放器 iframe 地址:', iframe.src);
            // document.querySelectorAll('#lelevideo').forEach(handleVideoSrc);
            // console.log(iframe)

            iframe.addEventListener('load', async () => {
                console.log('跨域 iframe 加载完成');
                let message = {msg: 'get_url'}; // 要传递的消息
                window[2].postMessage(message, "*");
            });
        }
    });
}

export {
    interceptor,
}
