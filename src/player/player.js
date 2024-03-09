import Artplayer from 'artplayer';


// 加载 url danmu 播放器
function NewPlayer(src_url) {
    re_render()
    var art = new Artplayer({
        container: '.artplayer-app',
        url: src_url,
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
                html: '上传弹幕',
                click: function () {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "text/xml";
                    input.addEventListener("change", () => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            // console.log(reader)
                            const xml = reader.result;
                            // console.log(xml)
                            let dm = bilibiliDanmuParseFromXml(xml)
                            console.log(dm)
                            art.plugins.artplayerPluginDanmuku.config({
                                danmuku: dm,
                            });
                            art.plugins.artplayerPluginDanmuku.load();
                        };
                        reader.readAsText(input.files[0]);
                    });
                    input.click();


                },
            },
        ],
    });
    return art
}

// 删除元素，添加容器
function re_render() {
    let player = document.querySelector(".stui-player__video.clearfix")
    if (player == undefined) {
        player = document.querySelector("#player-left")
    }
    let div = player.querySelector('div')
    let h = div.offsetHeight
    let w = div.offsetWidth

    player.removeChild(div)

    let app = `<div style="height: ${h}px; width: ${w}px;" class="artplayer-app"></div>`
    player.innerHTML = app
}

function getMode(key) {
    switch (key) {
        case 1:
        case 2:
        case 3:
            return 0;
        case 4:
        case 5:
            return 1;
        default:
            return 0;
    }
}

// 将 danmu xml 字符串转为 bilibili 格式 
function bilibiliDanmuParseFromXml(xmlString) {
    if (typeof xmlString !== 'string') return [];
    const matches = xmlString.matchAll(/<d (?:.*? )??p="(?<p>.+?)"(?: .*?)?>(?<text>.+?)<\/d>/gs);
    return Array.from(matches)
        .map((match) => {
            const attr = match.groups.p.split(',');
            if (attr.length >= 8) {
                const text = match.groups.text
                    .trim()
                    .replaceAll('&quot;', '"')
                    .replaceAll('&apos;', "'")
                    .replaceAll('&lt;', '<')
                    .replaceAll('&gt;', '>')
                    .replaceAll('&amp;', '&');

                return {
                    text,
                    time: Number(attr[0]),
                    mode: getMode(Number(attr[1])),
                    fontSize: Number(attr[2]),
                    color: `#${Number(attr[3]).toString(16)}`,
                    timestamp: Number(attr[4]),
                    pool: Number(attr[5]),
                    userID: attr[6],
                    rowID: Number(attr[7]),
                };
            } else {
                return null;
            }
        })
        .filter(Boolean);
}

// 将 danmu json 转为 bilibili 格式 
function bilibiliDanmuParseFromJson(jsonString) {
    return jsonString.map((comment) => {
        let attr = comment.p.split(',');
        return {
            text: comment.m,
            time: Number(attr[0]),
            mode: getMode(Number(attr[1])),
            fontSize: Number(25),
            color: `#${Number(attr[2]).toString(16)}`,
            timestamp: Number(comment.cid),
            pool: Number(0),
            userID: attr[3],
            rowID: Number(0),
        }
    })
}

export { NewPlayer, bilibiliDanmuParseFromJson };