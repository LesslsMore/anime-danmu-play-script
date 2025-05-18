import Artplayer from 'artplayer';
import Hls from 'hls.js';
import {down_danmu, html_danmu, upload_danmu} from "@/danmu/player/danmu.js";

function playM3u8(video, url, art) {
    if (Hls.isSupported()) {
        if (art.hls) art.hls.destroy();
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        art.hls = hls;
        art.on('destroy', () => hls.destroy());
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
    } else {
        art.notice.show = 'Unsupported playback format: m3u8';
    }
}

// 加载 url danmu 播放器
function init_player(url, container, poster, data) {
    let opt = {
        container,
        url,
        poster,
        // autoplay: true,
        // muted: true,
        autoSize: true,
        fullscreen: true,
        fullscreenWeb: true,
        autoOrientation: true,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        setting: true,
        controls: [
            {
                position: 'right',
                html: '上传',
                click: () => upload_danmu(art),
            },
            {
                position: 'right',
                html: '下载',
                click: () => down_danmu(art),
            },
        ],
        contextmenu: [
            {
                name: '搜索',
                html: html_danmu,
            },
        ],
    }

    if (opt.url.endsWith('.m3u8')) {
        Object.assign(opt, {
            type: 'm3u8',
            customType: {
                m3u8: playM3u8,
            },
        })
    }
    if (data) {
        Object.assign(opt, {
            volume: data.options.volume,
            // autoplay: data.autoplay
        })
    }
    let art = new Artplayer(opt);
    return art
}



export { init_player };
