import get_yhdm_url from './parser/get_yhdm_url';
import get_danmus from './danmu/danmu';
import NewPlayer from './player/player';

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
    let danmu = await get_danmus(title, id)
    
    NewPlayer(src_url, danmu)
}






