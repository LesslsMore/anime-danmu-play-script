// ==UserScript==
// @name         动漫弹幕播放
// @namespace    https://github.com/LesslsMore/anime-danmu-play
// @version      0.5.1
// @author       lesslsmore
// @description  自动匹配加载动漫剧集对应弹幕并播放，目前支持樱花动漫、风车动漫
// @license      MIT
// @icon         https://cdn.yinghuazy.xyz/webjs/stui_tpl/statics/img/favicon.ico
// @include      /^https:\/\/www\.dmla.*\.com\/play\/.*$/
// @include      https://danmu.yhdmjx.com/*
// @include      https://www.tt776b.com/play/*
// @include      https://www.dm539.com/play/*
// @match        /^https:\/\/www\.dmla.*\.com\/play\/.*$/
// @match        https://www.tt776b.com/play/*
// @match        https://www.dm539.com/play/*
// @require      https://cdn.jsdelivr.net/npm/dexie@4.0.8/dist/dexie.min.js
// @connect      https://api.dandanplay.net/*
// @connect      https://danmu.yhdmjx.com/*
// @connect      http://v16m-default.akamaized.net/*
// @connect      self
// @connect      *
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (Dexie) {
  'use strict';

  function get_anime_info(web_video_info) {
    let url = window.location.href;
    if (url.startsWith("https://www.dmla")) {
      let episode = parseInt(url.split("-").pop().split(".")[0]);
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
      let title;
      for (let i = 0; i < include.length; i++) {
        if (url.match(include[i])) {
          el = els[i];
        }
      }
      if (el != void 0) {
        title = el.text;
      } else {
        title = "";
        console.log("没有自动匹配到动漫名称");
      }
      let anime_url = url.split("-")[0];
      let anime_id = parseInt(anime_url.split("/")[4]);
      web_video_info["anime_id"] = anime_id;
      web_video_info["episode"] = episode;
      web_video_info["title"] = title;
      web_video_info["url"] = url;
      web_video_info["src_url"] = window.src_url;
    }
    return web_video_info;
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
    const put = async function(key, value) {
      const now = /* @__PURE__ */ new Date();
      const item = {
        [pk]: key,
        value,
        expiry: now.getTime() + expiryInMinutes * 6e4
      };
      const result = await old_put(item);
      const event = new Event(old_put.name);
      event.key = key;
      event.value = value;
      document.dispatchEvent(event);
      return result;
    };
    const get = async function(key) {
      const item = await old_get(key);
      const event = new Event(old_get.name);
      event.key = key;
      event.value = item ? item.value : null;
      document.dispatchEvent(event);
      if (!item) {
        return null;
      }
      const now = /* @__PURE__ */ new Date();
      if (now.getTime() > item.expiry) {
        await db_url.delete(key);
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
  async function set_db_url_info(web_video_info) {
    let { anime_id, title, url, src_url } = web_video_info;
    let var_anime_url = {
      "episodes": {}
    };
    let db_anime_url = await db_url.get(anime_id);
    if (db_anime_url != null) {
      var_anime_url = db_anime_url;
    }
    if (!var_anime_url["episodes"].hasOwnProperty(url)) {
      if (src_url) {
        var_anime_url["episodes"][url] = src_url;
        await db_url.put(anime_id, var_anime_url);
      }
    } else {
      src_url = var_anime_url["episodes"][url];
    }
    console.log("src_url", src_url);
    web_video_info["src_url"] = src_url;
    return {
      var_anime_url
    };
  }
  var _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
  function interceptor() {
    if (window.self != window.top) {
      console.log("当前页面位于iframe子页面");
      console.log(window.location.href);
      window.addEventListener("message", async function(event) {
        let data = event.data;
        console.log("message", data);
        if (data.msg === "get_url") {
          let url_decode = _unsafeWindow.v_decrypt(_unsafeWindow.config.url, _unsafeWindow._token_key, _unsafeWindow.key_token);
          let message = { msg: "send_url", url: url_decode, href: location.href };
          console.log("向父页面发送消息：", message);
          _unsafeWindow.parent.postMessage(message, "*");
        }
      });
    } else if (window === window.top) {
      console.log("当前页面位于主页面");
      console.log(window.location.href);
      window.addEventListener("message", async function(event) {
        let data = event.data;
        console.log("message", data);
        if (data.msg === "send_url") {
          window.src_url = data.url;
          let iframe = document.querySelector("#playleft > iframe");
          let play = "https://anime-danmu-play.vercel.app";
          if (!iframe.src.startsWith(play)) {
            let get_param_url = function(animeId, episode2, title2, videoUrl) {
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
            };
            let web_video_info = {};
            get_anime_info(web_video_info);
            let {
              anime_id,
              episode,
              title,
              url,
              src_url
            } = web_video_info;
            await set_db_url_info(web_video_info);
            let play_url = `${play}/play?${get_param_url(anime_id, episode, title, web_video_info.src_url)}`;
            iframe.src = play_url;
          }
        }
      }, true);
    }
    document.querySelectorAll("#playleft > iframe").forEach((iframe) => {
      if (iframe.src) {
        iframe.addEventListener("load", async () => {
          console.log("跨域 iframe 加载完成");
          let message = { msg: "get_url" };
          window[2].postMessage(message, "*");
        });
      }
    });
  }
  interceptor();

})(Dexie);