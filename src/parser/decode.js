import CryptoJS from "crypto-js";

const key = CryptoJS.enc.Utf8.parse("57A891D97E332A9D");  //十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse('8d312e8d3cde6cbb');   //十六位十六进制数作为密钥偏移量

// 解密
function Decrypt(srcs, key, iv) {
    let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}

export {
    Decrypt,
    key,
    iv,
};
