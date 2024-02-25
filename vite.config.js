import { defineConfig } from 'vite';
import monkey, {cdn} from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: '樱花动漫、风车动漫弹幕播放',
        namespace: 'https://github.com/LesslsMore/',
        version: '0.2.0',
        author: 'lesslsmore',
        license: 'MIT',
        description: '自动匹配加载动漫剧集对应弹幕并播放，目前支持樱花动漫、风车动漫',
        match: ['https://www.dmla4.com/play/*'],
        connect: [
          'https://api.dandanplay.net/*',
          'https://danmu.yhdmjx.com/*',
          'http://v16m-default.akamaized.net/*',
          'self',
          '*',
        ],
      },
      build: {
        externalGlobals: {
          'crypto-js': cdn.jsdelivr('CryptoJS','crypto-js.js'),
          'artplayer': cdn.unpkg('Artplayer','dist/artplayer.js'),
          'artplayer-plugin-danmuku': cdn.unpkg('artplayerPluginDanmuku','dist/artplayer-plugin-danmuku.js'),
        },
      },
    }),
  ],
});
