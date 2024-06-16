import { defineConfig } from 'vite';
import monkey, { cdn, util } from 'vite-plugin-monkey';
import AutoImport from 'unplugin-auto-import/vite';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    AutoImport({
      imports: [util.unimportPreset],
    }),
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: '樱花动漫、风车动漫弹幕播放',
        namespace: 'https://github.com/LesslsMore/yhdm-danmu-player-ts',
        version: '0.3.1',
        author: 'lesslsmore',
        license: 'MIT',
        description: '自动匹配加载动漫剧集对应弹幕并播放，目前支持樱花动漫、风车动漫',
        match: [
          'https://www.dmla4.com/play/*',
          'https://www.dmla5.com/play/*',
          // 'https://www.agedm.org/play/*',
          // 'https://43.240.156.118:8443/vip/?url=age_*',
        ],
        connect: [
          'https://api.dandanplay.net/*',
          'https://danmu.yhdmjx.com/*',
          'http://v16m-default.akamaized.net/*',
          'self',
          '*',
        ],
        'run-at': 'document-end',
      },
      build: {
        externalGlobals: {
          'crypto-js': cdn.jsdelivr('CryptoJS', 'crypto-js.js'),
          'artplayer': cdn.jsdelivr('Artplayer', 'dist/artplayer.js'),
          'artplayer-plugin-danmuku': cdn.jsdelivr('artplayerPluginDanmuku', 'dist/artplayer-plugin-danmuku.js'),
        },
      },
    }),
  ],
});
