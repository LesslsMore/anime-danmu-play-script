import {interceptor} from '@/interceptor';
import {get_web_iframe} from "@/parser/get_anime_info.js";

// import '@/get_url_test/GM_webRequest_test.js'
// import '@/get_url_test/iframe_test.js'
// import '@/get_url_test/get_video_url_test.js'
// import '@/get_url_test/age_get_url.js'

const playUrls = JSON.parse(import.meta.env.VITE_PLAY_URLS.replace(/'/g, '"'));
console.log('play_urls', playUrls);

if (!localStorage.getItem('play_url')) {
    localStorage.setItem('play_url', playUrls[0]);
}




// await down_danmu()



interceptor(localStorage.getItem('play_url'));
