import CryptoJS from "crypto-js";

import xhr_get from "../utils/xhr_get";

const key = CryptoJS.enc.Utf8.parse("57A891D97E332A9D");  //十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse('844182a9dfe9c5ca');   //十六位十六进制数作为密钥偏移量

// 获取原始 url
async function get_yhdmjx_url(url){
    let body = await xhr_get(url)
 //    console.log(body)
    let m3u8 = get_m3u8_url(body)
 //    console.log(m3u8)
    if (m3u8) {
         let body = await xhr_get(m3u8)
         let aes_data = get_encode_url(body)
         if (aes_data) {

             let url = Decrypt(aes_data)
             // console.log(url)
             let src = url.split('.net/')[1]
             let src_url = `http://v16m-default.akamaized.net/${src}`
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
      console.log('m3u8', m3u8)
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

// 解密
function Decrypt(srcs) {
    // let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    // let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}

export default get_yhdmjx_url;
