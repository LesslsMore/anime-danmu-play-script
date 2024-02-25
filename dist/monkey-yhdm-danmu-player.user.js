// ==UserScript==
// @name         樱花动漫、风车动漫弹幕播放
// @namespace    https://github.com/LesslsMore/
// @version      0.2.0
// @author       lesslsmore
// @description  自动匹配加载动漫剧集对应弹幕并播放，目前支持樱花动漫、风车动漫
// @license      MIT
// @match        https://www.dmla4.com/play/*
// @require      https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.js
// @require      https://unpkg.com/artplayer@5.1.1/dist/artplayer.js
// @require      https://unpkg.com/artplayer-plugin-danmuku@5.0.1/dist/artplayer-plugin-danmuku.js
// @connect      https://api.dandanplay.net/*
// @connect      https://danmu.yhdmjx.com/*
// @connect      http://v16m-default.akamaized.net/*
// @connect      self
// @connect      *
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function (CryptoJS, Artplayer, artplayerPluginDanmuku) {
  'use strict';

  var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  function xhr_get(url) {
    return new Promise((resolve, reject) => {
      _GM_xmlhttpRequest({
        url,
        method: "GET",
        headers: {},
        onload: function(xhr) {
          resolve(xhr.responseText);
        }
      });
    });
  }
  const key = CryptoJS.enc.Utf8.parse("57A891D97E332A9D");
  const iv = CryptoJS.enc.Utf8.parse("844182a9dfe9c5ca");
  async function get_yhdm_url(url) {
    let body = await xhr_get(url);
    let m3u8 = get_m3u8_url(body);
    if (m3u8) {
      let body2 = await xhr_get(m3u8);
      let aes_data = get_encode_url(body2);
      if (aes_data) {
        let url2 = Decrypt(aes_data);
        let src = url2.split(".net/")[1];
        let src_url = `http://v16m-default.akamaized.net/${src}`;
        console.log("原始地址：");
        console.log(src_url);
        return src_url;
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
  let end_point = "https://api.dandanplay.net";
  let Comment_GetAsync = "/api/v2/comment/";
  let Search_SearchAnimeAsync = `/api/v2/search/anime?keyword=`;
  let Related_GetRealtedAsync = `/api/v2/related/`;
  let Comment_GetExtCommentAsync = `/api/v2/extcomment?url=`;
  async function get_danmus(title, id) {
    let animeId = await get_animeId(title);
    id = id.padStart(4, "0");
    let episodeId = `${animeId}${id}`;
    console.log(episodeId);
    let danmu = await get_danmu(episodeId);
    let urls = await get_related_url(episodeId);
    if (urls.length > 0) {
      for (let i = 0; i < urls.length; i++) {
        let danmu_ext = await get_danmu_ext(urls[i].url);
        danmu = [...danmu, ...danmu_ext];
      }
    }
    return danmu;
  }
  async function get_animeId(title) {
    let url = `${end_point}${Search_SearchAnimeAsync}${title}`;
    let data = await xhr_get(url);
    data = JSON.parse(data);
    let { animeId, animeTitle } = data.animes[0];
    console.log(animeId);
    console.log(animeTitle);
    return animeId;
  }
  async function get_danmu(episodeId) {
    let url = `${end_point}${Comment_GetAsync}${episodeId}`;
    console.log("获取原始 danmu");
    console.log(url);
    let data = await xhr_get(url);
    data = JSON.parse(data);
    return data.comments;
  }
  async function get_related_url(episodeId) {
    let url = `${end_point}${Related_GetRealtedAsync}${episodeId}`;
    console.log("获取视频相关 url");
    console.log(url);
    let data = await xhr_get(url);
    data = JSON.parse(data);
    return data.relateds;
  }
  async function get_danmu_ext(related_url) {
    let url = `${end_point}${Comment_GetExtCommentAsync}${related_url}`;
    console.log("获取扩展 danmu");
    console.log(url);
    let data = await xhr_get(url);
    data = JSON.parse(data);
    return data.comments;
  }
  function NewPlayer(src_url, danmu) {
    re_render();
    let danmus = bilibiliDanmuParseFromJson(danmu);
    console.log("总共弹幕数目：");
    console.log(danmus.length);
    Artplayer_build(src_url, danmus);
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
  function Artplayer_build(src_url, danmus) {
    var art = new Artplayer({
      container: ".artplayer-app",
      url: src_url,
      autoSize: true,
      fullscreen: true,
      fullscreenWeb: true,
      autoOrientation: true,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      setting: true,
      plugins: [
        artplayerPluginDanmuku({
          danmuku: danmus,
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
        })
      ],
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
                art.plugins.artplayerPluginDanmuku.config({
                  danmuku: dm
                });
                art.plugins.artplayerPluginDanmuku.load();
              };
              reader.readAsText(input.files[0]);
            });
            input.click();
          }
        }
      ]
    });
    art.on("artplayerPluginDanmuku:emit", (danmu) => {
      console.info("新增弹幕", danmu);
    });
    art.on("artplayerPluginDanmuku:loaded", (danmus2) => {
      console.info("加载弹幕", danmus2.length);
    });
    art.on("artplayerPluginDanmuku:error", (error) => {
      console.info("加载错误", error);
    });
    art.on("artplayerPluginDanmuku:config", (option) => {
      console.info("配置变化", option);
    });
    art.on("artplayerPluginDanmuku:stop", () => {
      console.info("弹幕停止");
    });
    art.on("artplayerPluginDanmuku:start", () => {
      console.info("弹幕开始");
    });
    art.on("artplayerPluginDanmuku:hide", () => {
      console.info("弹幕隐藏");
    });
    art.on("artplayerPluginDanmuku:show", () => {
      console.info("弹幕显示");
    });
    art.on("artplayerPluginDanmuku:destroy", () => {
      console.info("弹幕销毁");
    });
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
  main();
  async function main() {
    let url = window.location.href;
    let id = url.split("-").pop().split(".")[0];
    let title = document.querySelector(".stui-player__detail.detail > h1 > a");
    if (title == void 0) {
      title = document.querySelector(".myui-panel__head.active.clearfix > h3 > a");
    }
    title = title.innerText;
    console.log(url);
    console.log(id);
    console.log(title);
    let src_url = await get_yhdm_url(url);
    let danmu = await get_danmus(title, id);
    NewPlayer(src_url, danmu);
  }

})(CryptoJS, Artplayer, artplayerPluginDanmuku);