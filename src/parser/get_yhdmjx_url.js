import xhr_get from "@/utils/xhr_get";
import {Decrypt, iv, key} from "@/parser/decode.js";



// 获取原始 url
async function get_yhdmjx_url(url){
    let body = await xhr_get(url)
 //    console.log(body)
    let m3u8 = get_m3u8_url(body)
    console.log(`m3u8: ${m3u8}`)
    if (m3u8) {
         let body = await xhr_get(m3u8)
        // console.log(`body: ${body}`)
         let aes_data = get_encode_url(body)
         if (aes_data) {
             console.log(`aes: ${aes_data}`)
             let url = Decrypt(aes_data, key, iv)
             console.log(`url: ${url}`)
            //  let src = url.split('.app/')[1]
            //  let src_url = `https://v16.resso.app/${src}`
            let src = url.split('.com/')[1]
             let src_url = `https://v16.muscdn.com/${src}`
             console.log(`url: ${src_url}`)
             return src_url
         }
     }
 }

 // 匹配 m3u8 地址
function get_m3u8_url(data) {
    let regex = /"url":"([^"]+)","url_next":"([^"]+)"/g;

    const matches = data.match(regex);

    if (matches) {
      let play = JSON.parse(`{${matches[0]}}`)

      let m3u8 = `https://danmu.yhdmjx.com/m3u8.php?url=${play.url}`
      // console.log('m3u8', m3u8)
      return m3u8
    } else {
      console.log('No matches found.');
    }
}

// 匹配加密 url
function get_encode_url(data) {
    let regex = /getVideoInfo\("([^"]+)"/;

    const matches = data.match(regex);

    if (matches) {
        return matches[1]
    } else {
      console.log('No matches found.');
    }
}

export {
    get_yhdmjx_url,
};
