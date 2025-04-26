import { GM_cookie, unsafeWindow, monkeyWindow, GM_addElement } from '$';

function interceptor() {
    'use strict';

    // // 1. 拦截XHR请求
    // const originalXHROpen = XMLHttpRequest.prototype.open;
    // XMLHttpRequest.prototype.open = function(method, url) {
    //     if (url.includes('ads.com')) {
    //         console.log('屏蔽广告请求:', url);
    //         return; // 直接阻断请求
    //     }
    //     originalXHROpen.apply(this, arguments);
    // };

    // // 2. 拦截Fetch请求
    // const originalFetch = unsafeWindow.fetch;
    // unsafeWindow.fetch = async function(input, init) {

    //     const response = await originalFetch(input, init);

    //     const url = typeof input === 'string' ? input : input.url;
    //     // 精准匹配目标接口
    //     console.log(`url: `, url)
    //     return response;
    // };

    // 3. 监听页面内 iframe 的 src 变化，捕获 m3u8.php? 请求
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'IFRAME' && node.src 
                    // && node.src.includes('danmu.yhdmjx.com/m3u8.php?')
                ) {
                    console.log('检测到播放器 iframe 地址:', node.src);
                    // 这里可以进一步处理 node.src
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 页面初始时也检查一次
    document.querySelectorAll('iframe').forEach(iframe => {
        if (iframe.src 
            // && iframe.src.includes('danmu.yhdmjx.com/m3u8.php?')
        ) {
            console.log('初始检测到播放器 iframe 地址:', iframe.src);
        }
    });

    // ... existing code ...

    // 监听 video 元素的 src
    function handleVideoSrc(video) {
        if (video.src) {
            console.log('检测到 video 播放器地址:', video.src);
            // 这里可以进一步处理 video.src
        }
    }

    // 1. 页面初始时检查
    document.querySelectorAll('video').forEach(handleVideoSrc);

    // 2. 动态监听 video 元素插入
    const videoObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'VIDEO') {
                    handleVideoSrc(node);
                } else if (node.querySelectorAll) {
                    node.querySelectorAll('video').forEach(handleVideoSrc);
                }
            });
        });
    });
    videoObserver.observe(document.body, { childList: true, subtree: true });
}

export {
    interceptor 
}