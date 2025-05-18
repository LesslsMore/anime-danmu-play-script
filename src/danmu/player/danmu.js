import artplayerPluginDanmuku from 'artplayer-plugin-danmuku';
import {SEARCHED, UNSEARCHED} from "@/danmu/player/search.js";
import {db_danmu} from "@/danmu/db/db.js";

const html_danmu = `<div id="k-player-danmaku-search-form">
                <label>
                  <span>搜索番剧名称</span>
                  <input type="text" id="anime_name" class="k-input" />
                </label>
                <div style="min-height:24px; padding-top:4px">
                  <span id="tips"></span>
                </div>
                <label>
                  <span>番剧名称</span>
                  <select id="anime_list" class="k-select"></select>
                </label>
                <label>
                  <span>章节</span>
                  <select id="episode_list" class="k-select"></select>
                </label>
                <label>
                  <span class="open-danmaku-list">
                    <span>弹幕列表</span>
                    <small id="danmu_count"></small>
                  </span>
                </label>
                
                <span class="specific-thanks">弹幕服务由 弹弹play 提供</span>
              </div>`

function art_msgs(art, msgs) {
    art.notice.show = msgs.join(',\n\n')
}

function update_danmu(art, danmu) {
    let danmus = bilibiliDanmuParseFromJson(danmu)
    art.plugins.artplayerPluginDanmuku.config({
        danmuku: danmus,
    });
    art.plugins.artplayerPluginDanmuku.load();
}

// 加载 url danmu 播放器
function upload_danmu(art) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json, .xml"; // 支持上传 JSON 和 XML 文件
    input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const content = reader.result;
            // 根据文件后缀名区分处理逻辑
            if (file.name.endsWith(".json")) {
                let json = JSON.parse(content);
                let comments;
                if (json.length === 1) {
                    comments = json[0].comments;
                } else {
                    comments = json;
                }
                const dm = bilibiliDanmuParseFromJson(comments);
                console.log("Parsed JSON danmaku:", dm);
                art.plugins.artplayerPluginDanmuku.config({
                    danmuku: dm,
                });
                art.plugins.artplayerPluginDanmuku.load();
            } else if (file.name.endsWith(".xml")) {
                const dm = bilibiliDanmuParseFromXml(content);
                console.log("Parsed XML danmaku:", dm);
                art.plugins.artplayerPluginDanmuku.config({
                    danmuku: dm,
                });
                art.plugins.artplayerPluginDanmuku.load();
            } else {
                console.error("Unsupported file format. Please upload a .json or .xml file.");
            }
        };
        reader.readAsText(file);
    });
    input.click();
}

async function down_danmu(art) {
    let $episode_list = document.querySelector("#episode_list")
    const episode_id = $episode_list.value
    // let {anime_id, episode, title, url} = info
    let danmu = await db_danmu.get(episode_id)
    // let danmu = art.storage.get(episodeId)

    let info = art.storage.get('info')
    const {title, episode} = info
    const blob = new Blob([JSON.stringify(danmu)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, `${title} - ${episode}.json`);
}

function init_danmu(art) {
    let plug = artplayerPluginDanmuku({
        danmuku: [],
        speed: 5, // 弹幕持续时间，单位秒，范围在[1 ~ 10]
        opacity: 1, // 弹幕透明度，范围在[0 ~ 1]
        fontSize: 25, // 字体大小，支持数字和百分比
        color: '#FFFFFF', // 默认字体颜色
        mode: 0, // 默认模式，0-滚动，1-静止
        margin: [10, '25%'], // 弹幕上下边距，支持数字和百分比
        antiOverlap: true, // 是否防重叠
        useWorker: true, // 是否使用 web worker
        synchronousPlayback: false, // 是否同步到播放速度
        filter: (danmu) => danmu.text.length < 50, // 弹幕过滤函数，返回 true 则可以发送
        lockTime: 5, // 输入框锁定时间，单位秒，范围在[1 ~ 60]
        maxLength: 100, // 输入框最大可输入的字数，范围在[0 ~ 500]
        minWidth: 200, // 输入框最小宽度，范围在[0 ~ 500]，填 0 则为无限制
        maxWidth: 600, // 输入框最大宽度，范围在[0 ~ Infinity]，填 0 则为 100% 宽度
        theme: 'light', // 输入框自定义挂载时的主题色，默认为 dark，可以选填亮色 light
        heatmap: true, // 是否开启弹幕热度图, 默认为 false
        beforeEmit: (danmu) => !!danmu.text.trim(), // 发送弹幕前的自定义校验，返回 true 则可以发送

        // 通过 mount 选项可以自定义输入框挂载的位置，默认挂载于播放器底部，仅在当宽度小于最小值时生效
        // mount: document.querySelector('.artplayer-danmuku'),
    })

    art.plugins.add(plug);

    // 监听手动输入的弹幕，保存到数据库
    art.on('artplayerPluginDanmuku:emit', (danmu) => {
        console.info('新增弹幕', danmu);
    });

    // 监听加载到弹幕的错误
    art.on('artplayerPluginDanmuku:error', (error) => {
        console.info('加载错误', error);
    });

    // 监听弹幕配置变化
    art.on('artplayerPluginDanmuku:config', (option) => {
        // console.info('配置变化', option);
    });

    let $danmu_count = document.querySelector("#danmu_count")
    // 监听加载到的弹幕数组
    art.on('artplayerPluginDanmuku:loaded', (danmus) => {
        console.info('加载弹幕', danmus.length);
        $danmu_count.textContent = danmus.length
        if ($danmu_count.textContent === '') {
            art_msgs(art, UNSEARCHED)
        } else {
            art_msgs(art, SEARCHED())
        }
    });

    art.on('pause', () => {
        if ($danmu_count.textContent === '') {
            art_msgs(art, UNSEARCHED)
        } else {
            art_msgs(art, SEARCHED())
        }
    });

    // // 监听弹幕停止
    // art.on('artplayerPluginDanmuku:stop', () => {
    //     console.info('弹幕停止');
    // });
    //
    // // 监听弹幕开始
    // art.on('artplayerPluginDanmuku:start', () => {
    //     console.info('弹幕开始');
    // });
    //
    // // 监听弹幕隐藏
    // art.on('artplayerPluginDanmuku:hide', () => {
    //     console.info('弹幕隐藏');
    // });
    //
    // // 监听弹幕显示
    // art.on('artplayerPluginDanmuku:show', () => {
    //     console.info('弹幕显示');
    // });
    //
    // // 监听弹幕销毁
    // art.on('artplayerPluginDanmuku:destroy', () => {
    //     console.info('弹幕销毁');
    // });
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


export {
    update_danmu,
    init_danmu,
    html_danmu,
    upload_danmu,
    down_danmu,
    art_msgs,
}
