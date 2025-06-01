
import { get_agedm_info, get_agedm_src } from '@/parser/get_agedm_info'

import { interceptor } from '@/interceptor';

// interceptor();

import '@/utils/local.js'
// import '@/anime.js'
import '@/play_url'

// if (document.readyState !== 'loading') {
//     agedm()
// } else {
//     window.addEventListener('DOMContentLoaded', agedm())
// }
// agedm()

async function agedm() {
    let url = window.location.href

    let { episode, title } = get_agedm_info(url)
    let src = get_agedm_src()

    console.log(url)
    console.log(episode)
    console.log(title)

    console.log(src)

    // let src = await get_yhdmjx_url(url)
    // let art = NewPlayer(src)

    // let danmu = await get_danmus(title, episode)
    // let danmus = bilibiliDanmuParseFromJson(danmu)
    // console.log('总共弹幕数目：')
    // console.log(danmus.length)


    // addDanmu(art, danmus)
}









