import { defineConfig } from 'vite';
import monkey, { cdn, util } from 'vite-plugin-monkey';
import AutoImport from 'unplugin-auto-import/vite';
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5174,
  },
  plugins: [
    AutoImport({
      imports: [util.unimportPreset],
    }),
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: '动漫弹幕播放',
        namespace: 'https://github.com/LesslsMore/anime-danmu-play-script',
        version: '0.5.7',
        author: 'lesslsmore',
        license: 'MIT',
        description: '自动匹配加载动漫剧集对应弹幕并播放，目前支持樱花动漫、风车动漫、AGE 动漫',
        icon: 'https://cdn.yinghuazy.xyz/webjs/stui_tpl/statics/img/favicon.ico',
        match: [
          /^https:\/\/www\.dmla.*\.com\/play\/.*$/,
          // 'https://danmu.yhdmjx.com/*',
          'https://www.tt776b.com/play/*', // 风车动漫
          'https://www.dm539.com/play/*', // 樱花动漫
            // '*',
        ],
        include: [
          // 'https://www.dmla*.com/play/*', // 风车动漫
          /^https:\/\/www\.dmla.*\.com\/play\/.*$/,
          'https://danmu.yhdmjx.com/*',

          /^https:\/\/www.age.*\/play\/.*$/, // agefans
          // https://43.240.156.118:8443/m3u8/?url=age_138cSkt7sWH3Jtc6ylHD50CBzkIQK%2BVd%2BP5PCM4I6747rVDftWswrGVJ3CPlOe90Qyogh1UEmyhYEvKet2uZs3%2BBkvyDQsjP%2Fh%2F9d1hJnGC3VGB20QdPFQEYQQ6Fs%2BoBNw
          // https://43.240.156.118:8443/vip/?url=age_5821qcuDVPb%2F4U1T5qtRn1z5V1OwBnKmowfYZQlwIhX0%2BaZqtGEuxjaadXc%2FOh5rivuNxh1%2Fi0d7HzM59xIU5wCY
          'https://43.240.156.118:8443/*',

          'https://www.tt776b.com/play/*', // 风车动漫
          'https://www.dm539.com/play/*', // 樱花动漫
          // 'https://www.agedm.org/play/*',
          // 'https://43.240.156.118:8443/vip/?url=age_*',
          //   '*',

        ],
        connect: [
          'https://api.dandanplay.net/*',
          'https://danmu.yhdmjx.com/*',
          'http://v16m-default.akamaized.net/*',
          'self',
          '*',
        ],
        'noframes': false,
        'run-at': 'document-end',
        // 'run-at': 'document-idle',
        // 'run-at': 'document-start',
        // 'inject-into': 'content',
        // @grant        GM_webRequest
        // @grant        GM_xmlhttpRequest
      },
      build: {
        externalGlobals: {
          axios: cdn.jsdelivr('axios', 'dist/axios.min.js'),
          'crypto-js': cdn.jsdelivr('CryptoJS', 'crypto-js.js'),
          'artplayer': cdn.jsdelivr('Artplayer', 'dist/artplayer.js'),
          'artplayer-plugin-danmuku': cdn.jsdelivr('artplayerPluginDanmuku', 'dist/artplayer-plugin-danmuku.js'),
          'dexie': cdn.jsdelivr('Dexie', 'dist/dexie.min.js'),
          'file-saver': cdn.jsdelivr('saveAs', 'dist/FileSaver.min.js'),
        },
        // @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
});
