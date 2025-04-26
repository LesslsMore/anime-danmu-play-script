// ==UserScript==
// @name         动漫弹幕播放
// @namespace    https://github.com/LesslsMore/anime-danmu-play
// @version      0.3.11
// @author       lesslsmore
// @description  自动匹配加载动漫剧集对应弹幕并播放，目前支持樱花动漫、风车动漫
// @license      MIT
// @icon         https://cdn.yinghuazy.xyz/webjs/stui_tpl/statics/img/favicon.ico
// @include      /^https:\/\/www\.dmla.*\.com\/play\/.*$/
// @include      https://danmu.yhdmjx.com/*
// @include      https://www.tt776b.com/play/*
// @include      https://www.dm539.com/play/*
// @require      https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.js
// @require      https://cdn.jsdelivr.net/npm/artplayer@5.1.1/dist/artplayer.js
// @require      https://cdn.jsdelivr.net/npm/artplayer-plugin-danmuku@5.0.1/dist/artplayer-plugin-danmuku.js
// @require      https://cdn.jsdelivr.net/npm/dexie@4.0.8/dist/dexie.min.js
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js
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

(async function (CryptoJS, artplayerPluginDanmuku, Artplayer, saveAs, Dexie) {
  'use strict';

  var _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  (function() {
    var originalSetItem = localStorage.setItem;
    var originalRemoveItem = localStorage.removeItem;
    localStorage.setItem = function(key2, value) {
      var event = new Event("itemInserted");
      event.key = key2;
      event.value = value;
      document.dispatchEvent(event);
      originalSetItem.apply(this, arguments);
    };
    localStorage.removeItem = function(key2) {
      var event = new Event("itemRemoved");
      event.key = key2;
      document.dispatchEvent(event);
      originalRemoveItem.apply(this, arguments);
    };
  })();
  function get_anime_info() {
    let url2 = window.location.href;
    let episode2 = parseInt(url2.split("-").pop().split(".")[0]);
    let include = [
      /^https:\/\/www\.dmla.*\.com\/play\/.*$/,
      // 风车动漫
      "https://www.tt776b.com/play/*",
      // 风车动漫
      "https://www.dm539.com/play/*"
      // 樱花动漫
    ];
    let els = [
      document.querySelector(".stui-player__detail.detail > h1 > a"),
      document.querySelector("body > div.myui-player.clearfix > div > div > div.myui-player__data.hidden-xs.clearfix > h3 > a"),
      document.querySelector(".myui-panel__head.active.clearfix > h3 > a")
    ];
    let el;
    let title2;
    for (let i = 0; i < include.length; i++) {
      if (url2.match(include[i])) {
        el = els[i];
      }
    }
    if (el != void 0) {
      title2 = el.text;
    } else {
      title2 = "";
      console.log("没有自动匹配到动漫名称");
    }
    let anime_url = url2.split("-")[0];
    let anime_id2 = parseInt(anime_url.split("/")[4]);
    console.log({
      anime_id: anime_id2,
      episode: episode2,
      title: title2,
      url: url2
    });
    return {
      anime_id: anime_id2,
      episode: episode2,
      title: title2,
      url: url2
    };
  }
  function re_render(container) {
    let player = document.querySelector(".stui-player__video.clearfix");
    if (player == void 0) {
      player = document.querySelector("#player-left");
    }
    let div = player.querySelector("div");
    let h = div.offsetHeight;
    let w = div.offsetWidth;
    player.removeChild(div);
    let app = `<div style="height: ${h}px; width: ${w}px;" class="${container}"></div>`;
    player.innerHTML = app;
  }
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
  let end_point = "https://lesslsmore-api.vercel.app/proxy";
  let API_comment = "/api/v2/comment/";
  let API_search_episodes = `/api/v2/search/episodes`;
  function get_episodeId(animeId, id) {
    id = id.toString().padStart(4, "0");
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
  const key$1 = CryptoJS.enc.Utf8.parse("57A891D97E332A9D");
  const iv = CryptoJS.enc.Utf8.parse("8d312e8d3cde6cbb");
  function Decrypt(srcs, key2, iv2) {
    let decrypt = CryptoJS.AES.decrypt(srcs, key2, { iv: iv2, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
  }
  async function get_yhdmjx_url(url2) {
    let body = await xhr_get(url2);
    let m3u8 = get_m3u8_url(body);
    console.log(`m3u8: ${m3u8}`);
    if (m3u8) {
      let body2 = await xhr_get(m3u8);
      let aes_data = get_encode_url(body2);
      if (aes_data) {
        console.log(`aes: ${aes_data}`);
        let url3 = Decrypt(aes_data, key$1, iv);
        console.log(`url: ${url3}`);
        let src = url3.split(".com/")[1];
        let src_url2 = `https://v16.muscdn.com/${src}`;
        console.log(`url: ${src_url2}`);
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
  const db_name = "anime";
  const db_schema = {
    info: "&anime_id",
    // 主键 索引
    url: "&anime_id",
    // 主键 索引
    danmu: "[anime_id+episode_id]"
    // 组合键 索引
  };
  const db_obj = {
    [db_name]: get_db(db_name, db_schema)
  };
  const db_url = db_obj[db_name].url;
  const db_info = db_obj[db_name].info;
  const db_danmu = db_obj[db_name].danmu;
  function get_db(db_name2, db_schema2, db_ver = 1) {
    let db = new Dexie(db_name2);
    db.version(db_ver).stores(db_schema2);
    return db;
  }
  const db_url_put = db_url.put.bind(db_url);
  const db_url_get = db_url.get.bind(db_url);
  db_url.put = async function(key2, value, expiryInMinutes = 60) {
    const now = /* @__PURE__ */ new Date();
    const item = {
      anime_id: key2,
      value,
      expiry: now.getTime() + expiryInMinutes * 6e4
    };
    const result = await db_url_put(item);
    const event = new Event("db_yhdm_put");
    event.key = key2;
    event.value = value;
    document.dispatchEvent(event);
    return result;
  };
  db_url.get = async function(key2) {
    const item = await db_url_get(key2);
    const event = new Event("db_yhdm_get");
    event.key = key2;
    event.value = item ? item.value : null;
    document.dispatchEvent(event);
    if (!item) {
      return null;
    }
    const now = /* @__PURE__ */ new Date();
    if (now.getTime() > item.expiry) {
      await db_url.delete(key2);
      return null;
    }
    return item.value;
  };
  const db_info_put = db_info.put.bind(db_info);
  const db_info_get = db_info.get.bind(db_info);
  db_info.put = async function(key2, value, expiryInMinutes = 60 * 24 * 7) {
    const now = /* @__PURE__ */ new Date();
    const item = {
      anime_id: key2,
      value,
      expiry: now.getTime() + expiryInMinutes * 6e4
    };
    const result = await db_info_put(item);
    const event = new Event("db_info_put");
    event.key = key2;
    event.value = value;
    document.dispatchEvent(event);
    return result;
  };
  db_info.get = async function(key2) {
    const item = await db_info_get(key2);
    const event = new Event("db_info_get");
    event.key = key2;
    event.value = item ? item.value : null;
    document.dispatchEvent(event);
    if (!item) {
      return null;
    }
    const now = /* @__PURE__ */ new Date();
    if (now.getTime() > item.expiry) {
      await db_info.delete(key2);
      return null;
    }
    return item.value;
  };
  const db_danmu_put = db_danmu.put.bind(db_danmu);
  const db_danmu_get = db_danmu.get.bind(db_danmu);
  db_danmu.put = async function(anime_id2, episode_id, value, expiryInMinutes = 60 * 24 * 7) {
    const now = /* @__PURE__ */ new Date();
    const item = {
      anime_id: anime_id2,
      episode_id,
      value,
      expiry: now.getTime() + expiryInMinutes * 6e4
    };
    const result = await db_danmu_put(item);
    const event = new Event("db_danmu_put");
    event.key = key;
    event.value = value;
    document.dispatchEvent(event);
    return result;
  };
  db_danmu.get = async function(anime_id2, episode_id) {
    const key2 = { anime_id: anime_id2, episode_id };
    const item = await db_danmu_get(key2);
    const event = new Event("db_danmu_get");
    event.key = key2;
    event.value = item ? item.value : null;
    document.dispatchEvent(event);
    if (!item) {
      return null;
    }
    const now = /* @__PURE__ */ new Date();
    if (now.getTime() > item.expiry) {
      await db_danmu.delete(key2);
      return null;
    }
    return item.value;
  };
  function NewPlayer(src_url2, container) {
    var art2 = new Artplayer({
      container,
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
          html: "上传",
          click: function() {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json, .xml";
            input.addEventListener("change", () => {
              const file = input.files[0];
              if (!file)
                return;
              const reader = new FileReader();
              reader.onload = () => {
                const content = reader.result;
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
                  art2.plugins.artplayerPluginDanmuku.config({
                    danmuku: dm
                  });
                  art2.plugins.artplayerPluginDanmuku.load();
                } else if (file.name.endsWith(".xml")) {
                  const dm = bilibiliDanmuParseFromXml(content);
                  console.log("Parsed XML danmaku:", dm);
                  art2.plugins.artplayerPluginDanmuku.config({
                    danmuku: dm
                  });
                  art2.plugins.artplayerPluginDanmuku.load();
                } else {
                  console.error("Unsupported file format. Please upload a .json or .xml file.");
                }
              };
              reader.readAsText(file);
            });
            input.click();
          }
        },
        {
          position: "right",
          html: "下载",
          click: async function() {
            let $episodes2 = document.querySelector("#episodes");
            const episodeId = $episodes2.value;
            let { anime_id: anime_id2, episode: episode2, title: title2, url: url2 } = get_anime_info();
            let danmu = await db_danmu.get(anime_id2, episodeId);
            const blob = new Blob([JSON.stringify(danmu)], { type: "text/plain;charset=utf-8" });
            saveAs(blob, `${title2} - ${episode2}.json`);
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
  let { anime_id, episode, title, url } = get_anime_info();
  let db_anime_url = {
    "episodes": {}
  };
  let db_url_value = await( db_url.get(anime_id));
  if (db_url_value != null) {
    db_anime_url = db_url_value;
  }
  let src_url;
  if (!db_anime_url["episodes"].hasOwnProperty(url)) {
    src_url = await( get_yhdmjx_url(url));
    if (src_url) {
      db_anime_url["episodes"][url] = src_url;
      db_url.put(anime_id, db_anime_url);
    }
  } else {
    src_url = db_anime_url["episodes"][url];
  }
  let db_anime_info = {
    "animes": [{ "animeTitle": title }],
    "idx": 0,
    "episode_dif": 0
  };
  let db_info_value = await( db_info.get(anime_id));
  if (db_info_value != null) {
    db_anime_info = db_info_value;
  } else {
    db_info.put(anime_id, db_anime_info);
  }
  console.log("db_anime_info", db_anime_info);
  console.log("src_url", src_url);
  re_render("artplayer-app");
  let art = NewPlayer(src_url, ".artplayer-app");
  add_danmu(art);
  let $count = document.querySelector("#count");
  let $animeName = document.querySelector("#animeName");
  let $animes = document.querySelector("#animes");
  let $episodes = document.querySelector("#episodes");
  function art_msgs(msgs) {
    art.notice.show = msgs.join(",\n\n");
  }
  let UNSEARCHED = ["未搜索到番剧弹幕", "请按右键菜单", "手动搜索番剧名称"];
  let SEARCHED = () => {
    try {
      return [`番剧：${$animes.options[$animes.selectedIndex].text}`, `章节: ${$episodes.options[$episodes.selectedIndex].text}`, `已加载 ${$count.textContent} 条弹幕`];
    } catch (e) {
      console.log(e);
      return [];
    }
  };
  init();
  get_animes();
  async function update_episode_danmu() {
    const new_idx = $episodes.selectedIndex;
    const db_anime_info2 = await db_info.get(anime_id);
    const { episode_dif } = db_anime_info2;
    let dif = new_idx + 1 - episode;
    if (dif !== episode_dif) {
      db_anime_info2["episode_dif"] = dif;
      db_info.put(anime_id, db_anime_info2);
    }
    const episodeId = $episodes.value;
    console.log("episodeId: ", episodeId);
    let danmu;
    try {
      danmu = await get_comment(episodeId);
      await db_danmu.put(anime_id, episodeId, danmu);
    } catch (error) {
      console.log("接口请求失败，尝试使用缓存数据");
      danmu = await db_danmu.get(anime_id, episodeId);
      if (!danmu) {
        throw new Error("无法获取弹幕数据");
      }
    }
    let danmus = bilibiliDanmuParseFromJson(danmu);
    update_danmu(art, danmus);
  }
  function get_animes() {
    const { animes, idx } = db_anime_info;
    const { animeTitle } = animes[idx];
    if (!animes[idx].hasOwnProperty("animeId")) {
      console.log("没有缓存，请求接口");
      get_animes_new(animeTitle);
    } else {
      console.log("有缓存，请求弹幕");
      updateAnimes(animes, idx);
    }
  }
  async function get_animes_new(title2) {
    try {
      const animes = await get_search_episodes(title2);
      if (animes.length === 0) {
        art_msgs(UNSEARCHED);
      } else {
        db_anime_info["animes"] = animes;
        db_info.put(anime_id, db_anime_info);
      }
      return animes;
    } catch (error) {
      console.log("弹幕服务异常，稍后再试");
    }
  }
  function init() {
    art.on("artplayerPluginDanmuku:loaded", (danmus) => {
      console.info("加载弹幕", danmus.length);
      $count.textContent = danmus.length;
      if ($count.textContent === "") {
        art_msgs(UNSEARCHED);
      } else {
        art_msgs(SEARCHED());
      }
    });
    art.on("pause", () => {
      if ($count.textContent === "") {
        art_msgs(UNSEARCHED);
      } else {
        art_msgs(SEARCHED());
      }
    });
    $animeName.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        get_animes_new($animeName.value);
      }
    });
    $animeName.addEventListener("blur", () => {
      get_animes_new($animeName.value);
    });
    $animeName.value = db_anime_info["animes"][db_anime_info["idx"]]["animeTitle"];
    $animes.addEventListener("change", async () => {
      const new_idx = $animes.selectedIndex;
      const { idx, animes } = db_anime_info;
      if (new_idx !== idx) {
        db_anime_info["idx"] = new_idx;
        db_info.put(anime_id, db_anime_info);
        updateEpisodes(animes[new_idx]);
      }
    });
    $episodes.addEventListener("change", update_episode_danmu);
    document.addEventListener("db_info_put", async function(e) {
      let { animes: old_animes } = await db_info.get(anime_id);
      let { animes: new_animes, idx: new_idx } = e.value;
      if (new_animes !== old_animes) {
        updateAnimes(new_animes, new_idx);
      }
    });
    document.addEventListener("updateAnimes", function(e) {
      console.log("updateAnimes 事件");
      updateEpisodes(e.value);
    });
    document.addEventListener("updateEpisodes", function(e) {
      console.log("updateEpisodes 事件");
      update_episode_danmu();
    });
  }
  function updateAnimes(animes, idx) {
    const html = animes.reduce((html2, anime) => html2 + `<option value="${anime.animeId}">${anime.animeTitle}</option>`, "");
    $animes.innerHTML = html;
    $animes.value = animes[idx]["animeId"];
    const event = new Event("updateAnimes");
    event.value = animes[idx];
    console.log(animes[idx]);
    document.dispatchEvent(event);
  }
  async function updateEpisodes(anime) {
    const { animeId, episodes } = anime;
    const html = episodes.reduce((html2, episode2) => html2 + `<option value="${episode2.episodeId}">${episode2.episodeTitle}</option>`, "");
    $episodes.innerHTML = html;
    const db_anime_info2 = await db_info.get(anime_id);
    const { episode_dif } = db_anime_info2;
    let episodeId = get_episodeId(animeId, episode_dif + episode);
    $episodes.value = episodeId;
    const event = new Event("updateEpisodes");
    document.dispatchEvent(event);
  }

})(CryptoJS, artplayerPluginDanmuku, Artplayer, saveAs, Dexie);