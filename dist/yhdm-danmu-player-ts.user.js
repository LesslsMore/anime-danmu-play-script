// ==UserScript==
// @name         动漫网站弹幕播放
// @namespace    https://github.com/LesslsMore/yhdm-danmu-player-ts
// @version      0.3.2
// @author       lesslsmore
// @description  自动匹配加载动漫剧集对应弹幕并播放，目前支持樱花动漫、风车动漫
// @license      MIT
// @match        https://www.dmla4.com/play/*
// @match        https://www.dmla5.com/play/*
// @require      https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.js
// @require      https://cdn.jsdelivr.net/npm/artplayer@5.1.1/dist/artplayer.js
// @require      https://cdn.jsdelivr.net/npm/artplayer-plugin-danmuku@5.0.1/dist/artplayer-plugin-danmuku.js
// @connect      https://api.dandanplay.net/*
// @connect      https://danmu.yhdmjx.com/*
// @connect      http://v16m-default.akamaized.net/*
// @connect      self
// @connect      *
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(async function (CryptoJS, artplayerPluginDanmuku, Artplayer) {
  'use strict';

  function get_yhdm_info(url2) {
    let episode2 = url2.split("-").pop().split(".")[0];
    let title2 = document.querySelector(".stui-player__detail.detail > h1 > a");
    if (title2 == void 0) {
      title2 = document.querySelector(".myui-panel__head.active.clearfix > h3 > a");
    }
    title2 = title2.innerText;
    return {
      episode: episode2,
      title: title2
    };
  }
  var _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  function xhr_get(url2) {
    return new Promise((resolve, reject) => {
      _GM_xmlhttpRequest({
        url: url2,
        method: "GET",
        headers: {},
        onload: function(xhr) {
          resolve(xhr.responseText);
        }
      });
    });
  }
  function request(opts) {
    let { url: url2, method, params } = opts;
    if (params) {
      let u = new URL(url2);
      Object.keys(params).forEach((key2) => {
        const value = params[key2];
        if (value !== void 0 && value !== null) {
          u.searchParams.set(key2, params[key2]);
        }
      });
      url2 = u.toString();
    }
    console.log("请求地址: ", url2);
    return new Promise((resolve, reject) => {
      _GM_xmlhttpRequest({
        url: url2,
        method: method || "GET",
        responseType: "json",
        onload: (res) => {
          resolve(res.response);
        },
        onerror: reject
      });
    });
  }
  let end_point = "https://api.dandanplay.net";
  let API_comment = "/api/v2/comment/";
  let API_search_episodes = `/api/v2/search/episodes`;
  function get_episodeId(animeId, id) {
    id = id.padStart(4, "0");
    let episodeId = `${animeId}${id}`;
    return episodeId;
  }
  async function get_search_episodes(anime, episode2) {
    const res = await request({
      url: `${end_point}${API_search_episodes}`,
      params: { anime, episode: episode2 }
    });
    return res.animes;
  }
  async function get_comment(episodeId) {
    const res = await request({
      url: `${end_point}${API_comment}${episodeId}?withRelated=true&chConvert=1`
    });
    return res.comments;
  }
  const key = CryptoJS.enc.Utf8.parse("57A891D97E332A9D");
  const iv = CryptoJS.enc.Utf8.parse("844182a9dfe9c5ca");
  async function get_yhdm_url(url2) {
    let body = await xhr_get(url2);
    let m3u8 = get_m3u8_url(body);
    if (m3u8) {
      let body2 = await xhr_get(m3u8);
      let aes_data = get_encode_url(body2);
      if (aes_data) {
        let url3 = Decrypt(aes_data);
        let src = url3.split(".net/")[1];
        let src_url2 = `http://v16m-default.akamaized.net/${src}`;
        console.log("原始地址：");
        console.log(src_url2);
        return src_url2;
      }
    }
  }
  function get_m3u8_url(data) {
    let regex = /"url":"([^"]+)","url_next":"([^"]+)"/g;
    const matches = data.match(regex);
    if (matches) {
      let play = JSON.parse(`{${matches[0]}}`);
      let m3u8 = `https://danmu.yhdmjx.com/m3u8.php?url=${play.url}`;
      console.log(m3u8);
      return m3u8;
    } else {
      console.log("No matches found.");
    }
  }
  function get_encode_url(data) {
    let regex = /getVideoInfo\("([^"]+)"/;
    const matches = data.match(regex);
    if (matches) {
      return matches[1];
    } else {
      console.log("No matches found.");
    }
  }
  function Decrypt(srcs) {
    let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
  }
  function update_danmu(art2, danmus) {
    art2.plugins.artplayerPluginDanmuku.config({
      danmuku: danmus
    });
    art2.plugins.artplayerPluginDanmuku.load();
  }
  function add_danmu(art2) {
    let plug = artplayerPluginDanmuku({
      danmuku: [],
      speed: 5,
      // 弹幕持续时间，单位秒，范围在[1 ~ 10]
      opacity: 1,
      // 弹幕透明度，范围在[0 ~ 1]
      fontSize: 25,
      // 字体大小，支持数字和百分比
      color: "#FFFFFF",
      // 默认字体颜色
      mode: 0,
      // 默认模式，0-滚动，1-静止
      margin: [10, "25%"],
      // 弹幕上下边距，支持数字和百分比
      antiOverlap: true,
      // 是否防重叠
      useWorker: true,
      // 是否使用 web worker
      synchronousPlayback: false,
      // 是否同步到播放速度
      filter: (danmu) => danmu.text.length < 50,
      // 弹幕过滤函数，返回 true 则可以发送
      lockTime: 5,
      // 输入框锁定时间，单位秒，范围在[1 ~ 60]
      maxLength: 100,
      // 输入框最大可输入的字数，范围在[0 ~ 500]
      minWidth: 200,
      // 输入框最小宽度，范围在[0 ~ 500]，填 0 则为无限制
      maxWidth: 600,
      // 输入框最大宽度，范围在[0 ~ Infinity]，填 0 则为 100% 宽度
      theme: "light",
      // 输入框自定义挂载时的主题色，默认为 dark，可以选填亮色 light
      heatmap: true,
      // 是否开启弹幕热度图, 默认为 false
      beforeEmit: (danmu) => !!danmu.text.trim()
      // 发送弹幕前的自定义校验，返回 true 则可以发送
      // 通过 mount 选项可以自定义输入框挂载的位置，默认挂载于播放器底部，仅在当宽度小于最小值时生效
      // mount: document.querySelector('.artplayer-danmuku'),
    });
    art2.plugins.add(plug);
    art2.on("artplayerPluginDanmuku:emit", (danmu) => {
      console.info("新增弹幕", danmu);
    });
    art2.on("artplayerPluginDanmuku:error", (error) => {
      console.info("加载错误", error);
    });
    art2.on("artplayerPluginDanmuku:config", (option) => {
    });
  }
  function NewPlayer(src_url2) {
    re_render();
    var art2 = new Artplayer({
      container: ".artplayer-app",
      url: src_url2,
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
          position: "right",
          html: "上传弹幕",
          click: function() {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "text/xml";
            input.addEventListener("change", () => {
              const reader = new FileReader();
              reader.onload = () => {
                const xml = reader.result;
                let dm = bilibiliDanmuParseFromXml(xml);
                console.log(dm);
                art2.plugins.artplayerPluginDanmuku.config({
                  danmuku: dm
                });
                art2.plugins.artplayerPluginDanmuku.load();
              };
              reader.readAsText(input.files[0]);
            });
            input.click();
          }
        }
      ],
      contextmenu: [
        {
          name: "搜索",
          html: `<div id="k-player-danmaku-search-form">
                <label>
                  <span>搜索番剧名称</span>
                  <input type="text" id="animeName" class="k-input" />
                </label>
                <div style="min-height:24px; padding-top:4px">
                  <span id="tips"></span>
                </div>
                <label>
                  <span>番剧名称</span>
                  <select id="animes" class="k-select"></select>
                </label>
                <label>
                  <span>章节</span>
                  <select id="episodes" class="k-select"></select>
                </label>
                <label>
                  <span class="open-danmaku-list">
                    <span>弹幕列表</span><small id="count"></small>
                  </span>
                </label>
                
                <span class="specific-thanks">弹幕服务由 弹弹play 提供</span>
              </div>`
        }
      ]
    });
    return art2;
  }
  function re_render() {
    let player = document.querySelector(".stui-player__video.clearfix");
    if (player == void 0) {
      player = document.querySelector("#player-left");
    }
    let div = player.querySelector("div");
    let h = div.offsetHeight;
    let w = div.offsetWidth;
    player.removeChild(div);
    let app = `<div style="height: ${h}px; width: ${w}px;" class="artplayer-app"></div>`;
    player.innerHTML = app;
  }
  function getMode(key2) {
    switch (key2) {
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
  function bilibiliDanmuParseFromXml(xmlString) {
    if (typeof xmlString !== "string")
      return [];
    const matches = xmlString.matchAll(/<d (?:.*? )??p="(?<p>.+?)"(?: .*?)?>(?<text>.+?)<\/d>/gs);
    return Array.from(matches).map((match) => {
      const attr = match.groups.p.split(",");
      if (attr.length >= 8) {
        const text = match.groups.text.trim().replaceAll("&quot;", '"').replaceAll("&apos;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
        return {
          text,
          time: Number(attr[0]),
          mode: getMode(Number(attr[1])),
          fontSize: Number(attr[2]),
          color: `#${Number(attr[3]).toString(16)}`,
          timestamp: Number(attr[4]),
          pool: Number(attr[5]),
          userID: attr[6],
          rowID: Number(attr[7])
        };
      } else {
        return null;
      }
    }).filter(Boolean);
  }
  function bilibiliDanmuParseFromJson(jsonString) {
    return jsonString.map((comment) => {
      let attr = comment.p.split(",");
      return {
        text: comment.m,
        time: Number(attr[0]),
        mode: getMode(Number(attr[1])),
        fontSize: Number(25),
        color: `#${Number(attr[2]).toString(16)}`,
        timestamp: Number(comment.cid),
        pool: Number(0),
        userID: attr[3],
        rowID: Number(0)
      };
    });
  }
  function createStorage(storage) {
    function getItem(key2, defaultValue) {
      try {
        const value = storage.getItem(key2);
        if (value)
          return JSON.parse(value);
        return defaultValue;
      } catch (error) {
        return defaultValue;
      }
    }
    return {
      getItem,
      setItem(key2, value) {
        storage.setItem(key2, JSON.stringify(value));
      },
      removeItem: storage.removeItem.bind(storage),
      clear: storage.clear.bind(storage)
    };
  }
  createStorage(window.sessionStorage);
  const local = createStorage(window.localStorage);
  let gm;
  try {
    gm = { getItem: _GM_getValue, setItem: _GM_setValue };
  } catch (error) {
    gm = local;
  }
  let url = window.location.href;
  let { episode, title } = get_yhdm_info(url);
  let yhdmId = url.split("-")[0];
  console.log(url);
  console.log(episode);
  console.log(title);
  let info = local.getItem(yhdmId);
  if (info === void 0) {
    info = {
      "animeTitle": title,
      "episodes": {}
    };
  }
  let src_url;
  if (!info["episodes"].hasOwnProperty(url)) {
    src_url = await( get_yhdm_url(url));
    info["episodes"][url] = src_url;
    local.setItem(yhdmId, info);
  } else {
    src_url = info["episodes"][url];
  }
  let art = NewPlayer(src_url);
  add_danmu(art);
  let $count = document.querySelector("#count");
  let $animeName = document.querySelector("#animeName");
  let $animes = document.querySelector("#animes");
  let $episodes = document.querySelector("#episodes");
  function msgs() {
    if ($count.textContent === "") {
      let msgs2 = [
        "未搜索到番剧弹幕",
        "请按右键菜单",
        "手动搜索番剧名称"
      ];
      art.notice.show = msgs2.join(",\n\n");
    } else {
      let msgs2 = [
        `番剧：${$animes.options[$animes.selectedIndex].text}`,
        `章节: ${$episodes.options[$episodes.selectedIndex].text}`,
        `已加载 ${$count.textContent} 条弹幕`
      ];
      art.notice.show = msgs2.join("\n\n");
    }
  }
  art.on("artplayerPluginDanmuku:loaded", (danmus) => {
    console.info("加载弹幕", danmus.length);
    $count.textContent = danmus.length;
    msgs();
  });
  art.on("ready", () => {
    msgs();
  });
  art.on("pause", () => {
    msgs();
  });
  init_animeName();
  init_animes();
  init_episodes();
  update_anime_episode(info["animeTitle"]);
  function handleKeypressEvent(e) {
    if (e.key === "Enter") {
      update_anime_episode($animeName.value);
    }
  }
  function handleBlurEvent() {
    update_anime_episode($animeName.value);
  }
  async function update_episode_danmu() {
    const episodeId = $episodes.value;
    console.log("episodeId: ", episodeId);
    let danmu = await get_comment(episodeId);
    let danmus = bilibiliDanmuParseFromJson(danmu);
    update_danmu(art, danmus);
  }
  async function update_anime_episode(title2) {
    let animes = await get_animes(title2);
    updateAnimes(animes);
    updateEpisodes(animes[0].episodes);
    let episodeId = get_episodeId(animes[0].animeId, episode);
    $episodes.value = episodeId;
    update_episode_danmu();
  }
  async function get_animes(title2) {
    try {
      let animes = info["animes"];
      if (animes === void 0) {
        console.log("没有缓存，请求接口");
        animes = await get_search_episodes(title2);
        if (animes.length === 0) {
          console.log("未搜索到番剧");
        } else {
          info["animes"] = animes;
          local.setItem(yhdmId, info);
        }
      }
      if (info["animeTitle"] !== animes[0]["animeTitle"]) {
        info["animeTitle"] = animes[0]["animeTitle"];
        local.setItem(yhdmId, info);
      }
      return animes;
    } catch (error) {
      console.log("弹幕服务异常，稍后再试");
    }
  }
  function init_animeName() {
    $animeName.addEventListener("keypress", handleKeypressEvent);
    $animeName.addEventListener("blur", handleBlurEvent);
    $animeName.value = title;
  }
  function init_animes() {
    $animes.addEventListener("change", async () => {
      $animes.value;
      const animeTitle = $animes.options[$animes.selectedIndex].text;
      console.log("animeTitle: ", animeTitle);
      update_anime_episode(animeTitle);
    });
  }
  function init_episodes() {
    $episodes.addEventListener("change", update_episode_danmu);
  }
  function updateAnimes(animes) {
    const html = animes.reduce(
      (html2, anime) => html2 + `<option value="${anime.animeId}">${anime.animeTitle}</option>`,
      ""
    );
    $animes.innerHTML = html;
  }
  function updateEpisodes(episodes) {
    const html = episodes.reduce(
      (html2, episode2) => html2 + `<option value="${episode2.episodeId}">${episode2.episodeTitle}</option>`,
      ""
    );
    $episodes.innerHTML = html;
  }

})(CryptoJS, artplayerPluginDanmuku, Artplayer);