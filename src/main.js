import get_yhdm_url from './parser/get_yhdm_url';
import get_danmus from './danmu/danmu';
import { NewPlayer, bilibiliDanmuParseFromJson } from './player/player';
import addDanmu from './danmu/addDanmu';

main()

async function main() {
    let url = window.location.href

    let id = url.split('-').pop().split('.')[0]
    let title = document.querySelector(".stui-player__detail.detail > h1 > a")
    if (title == undefined) {
        title = document.querySelector(".myui-panel__head.active.clearfix > h3 > a")
    }
    title = title.innerText

    console.log(url)

    console.log(id)
    console.log(title)

    let src_url = await get_yhdm_url(url)
    let art = NewPlayer(src_url)

    let danmu = await get_danmus(title, id)
    let danmus = bilibiliDanmuParseFromJson(danmu)
    console.log('总共弹幕数目：')
    console.log(danmus.length)


    addDanmu(art, danmus)
}






