import Dexie from 'dexie'

const db_name = 'anime'

const db_schema = {
    info: '&anime_id', // 主键 索引
    url: '&anime_id', // 主键 索引
}

const db_obj = {
    [db_name]: get_db(db_name, db_schema)
}

const db_url = db_obj[db_name].url
const db_info = db_obj[db_name].info

function get_db(db_name, db_schema, db_ver = 1) {
    let db = new Dexie(db_name)
    // 默认版本为从 1 开始
    db.version(db_ver).stores(db_schema)
    return db
}

// 原始的 Dexie put 和 get 方法
const db_url_put = db_url.put.bind(db_url);
const db_url_get = db_url.get.bind(db_url);

// 封装 put 方法
db_url.put = async function(key, value, expiryInMinutes = 60) {
    const now = new Date();
    const item = {
        anime_id: key,
        value: value,
        expiry: now.getTime() + expiryInMinutes * 60000
    };

    const result = await db_url_put(item);

    const event = new Event('db_yhdm_put');
    event.key = key;
    event.value = value;
    document.dispatchEvent(event);

    return result;
};

// 封装 get 方法
db_url.get = async function(key) {
    const item = await db_url_get(key);
    // console.log(item)
    const event = new Event('db_yhdm_get');
    event.key = key;
    event.value = item ? item.value : null;
    document.dispatchEvent(event);

    if (!item) {
        return null;
    }
    const now = new Date();
    if (now.getTime() > item.expiry) {
        await db_url.delete(key);
        return null;
    }
    return item.value;
};

// 原始的 Dexie put 和 get 方法
const db_info_put = db_info.put.bind(db_info);
const db_info_get = db_info.get.bind(db_info);

// 封装 put 方法
db_info.put = async function(key, value) {
    const item = {
        anime_id: key,
        value: value,
    };

    const result = await db_info_put(item);

    const event = new Event('db_info_put');
    event.key = key;
    event.value = value;
    document.dispatchEvent(event);

    return result;
};

// 封装 get 方法
db_info.get = async function(key) {
    const item = await db_info_get(key);
    // console.log(item)
    const event = new Event('db_info_get');
    event.key = key;
    event.value = item ? item.value : null;
    document.dispatchEvent(event);

    if (!item) {
        return null;
    }
    return item.value;
};

// 示例
// (async () => {
//     document.addEventListener('db_yhdm_put', function(event) {
//         console.log(`put: ${event.key} = ${event.value}`);
//     });
//
//     document.addEventListener('db_yhdm_get', function(event) {
//         console.log(`get: ${event.key} = ${event.value}`);
//     });
//
//     await db.myStore.put('myData', 'someValue', 5); // 5分钟过期
//     const value = await db.myStore.get('myData'); // 过期前获取数据
//     console.log(value);
// })();

export {db_url, db_info}

