// ==UserScript==
// @name         动漫弹幕播放
// @namespace    https://github.com/LesslsMore/anime-danmu-play
// @version      0.5.0
// @author       lesslsmore
// @description  自动匹配加载动漫剧集对应弹幕并播放，目前支持樱花动漫、风车动漫
// @license      MIT
// @icon         https://cdn.yinghuazy.xyz/webjs/stui_tpl/statics/img/favicon.ico
// @include      /^https:\/\/www\.dmla.*\.com\/play\/.*$/
// @include      https://danmu.yhdmjx.com/*
// @include      https://www.tt776b.com/play/*
// @include      https://www.dm539.com/play/*
// @require      https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.js
// @require      https://cdn.jsdelivr.net/npm/dexie@4.0.8/dist/dexie.min.js
// @connect      https://api.dandanplay.net/*
// @connect      https://danmu.yhdmjx.com/*
// @connect      http://v16m-default.akamaized.net/*
// @connect      self
// @connect      *
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(async function (Dexie, CryptoJS) {
  'use strict';

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
    let src_url2 = "";
    let player = document.querySelector("#lelevideo");
    if (player) {
      src_url2 = player.src;
    }
    let web_video_info2 = {
      anime_id: anime_id2,
      episode: episode2,
      title: title2,
      url: url2,
      src_url: src_url2
    };
    console.log(web_video_info2);
    return web_video_info2;
  }
  const db_name = "anime";
  const db_schema = {
    info: "&anime_id",
    // 主键 索引
    url: "&anime_id",
    // 主键 索引
    danmu: "&episode_id"
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
  function createDbMethods(dbInstance, pk, expiryInMinutes = 60) {
    const old_put = dbInstance.put.bind(dbInstance);
    const old_get = dbInstance.get.bind(dbInstance);
    const put = async function(key2, value) {
      const now = /* @__PURE__ */ new Date();
      const item = {
        [pk]: key2,
        value,
        expiry: now.getTime() + expiryInMinutes * 6e4
      };
      const result = await old_put(item);
      const event = new Event(old_put.name);
      event.key = key2;
      event.value = value;
      document.dispatchEvent(event);
      return result;
    };
    const get = async function(key2) {
      const item = await old_get(key2);
      const event = new Event(old_get.name);
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
    dbInstance.put = put;
    dbInstance.get = get;
    return {
      put,
      get
    };
  }
  createDbMethods(db_url, "anime_id", 60);
  createDbMethods(db_info, "anime_id", 60 * 24 * 7);
  createDbMethods(db_danmu, "episode_id", 60 * 24 * 7);
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
  const key = CryptoJS.enc.Utf8.parse("57A891D97E332A9D");
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
        let url3 = Decrypt(aes_data, key, iv);
        console.log(`url: ${url3}`);
        let src = url3.split(".net/")[1];
        let mp4 = `https://sf16-sg-default.akamaized.net/${src}`;
        console.log(`url: ${mp4}`);
        return { mp4, m3u8 };
      }
    }
  }
  function get_m3u8_url(data) {
    let regex = /"url":"([^"]+)","url_next":"([^"]+)"/g;
    const matches = data.match(regex);
    if (matches) {
      let play2 = JSON.parse(`{${matches[0]}}`);
      let m3u8 = `https://danmu.yhdmjx.com/m3u8.php?url=${play2.url}`;
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
  async function set_db_url_info(web_video_info2) {
    let { anime_id: anime_id2, title: title2, url: url2, src_url: src_url2 } = web_video_info2;
    let var_anime_url = {
      "episodes": {}
    };
    let db_anime_url = await db_url.get(anime_id2);
    if (db_anime_url != null) {
      var_anime_url = db_anime_url;
    }
    if (!var_anime_url["episodes"].hasOwnProperty(url2)) {
      let { mp4, m3u8 } = await get_yhdmjx_url(url2);
      src_url2 = mp4;
      if (src_url2) {
        var_anime_url["episodes"][url2] = src_url2;
        await db_url.put(anime_id2, var_anime_url);
      }
    } else {
      src_url2 = var_anime_url["episodes"][url2];
    }
    console.log("src_url", src_url2);
    web_video_info2["src_url"] = src_url2;
    return {
      var_anime_url
    };
  }
  let web_video_info = get_anime_info();
  let {
    anime_id,
    episode,
    title,
    url,
    src_url
  } = web_video_info;
  await( set_db_url_info(web_video_info));
  function get_param_url(animeId, episode2, title2, videoUrl) {
    const queryParams = new URLSearchParams();
    if (animeId)
      queryParams.append("anime_id", animeId);
    if (episode2)
      queryParams.append("episode", episode2);
    if (title2)
      queryParams.append("title", title2);
    if (videoUrl)
      queryParams.append("url", videoUrl);
    return queryParams.toString();
  }
  let play = "https://anime-danmu-play.vercel.app";
  let play_url = `${play}/play?${get_param_url(anime_id, episode, title, web_video_info.src_url)}`;
  document.querySelector("#playleft > iframe").src = play_url;

})(Dexie, CryptoJS);