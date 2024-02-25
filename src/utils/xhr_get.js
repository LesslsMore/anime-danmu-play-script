import { GM_xmlhttpRequest } from '$';

// 封装 xhr 为 promise 同步方法
function xhr_get(url){
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: url,
            method :"GET",
            headers: {
            },
            onload:function(xhr){
                resolve(xhr.responseText)

            }
        });
    })
}

export default xhr_get;