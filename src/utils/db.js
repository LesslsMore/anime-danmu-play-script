import Dexie from 'dexie'

const db_name = 'anime'

const db_schema = {
    yhdm: '&anime_id', // 主键 索引
}

const db_obj = {
    [db_name]: get_db(db_name, db_schema)
}

const db_yhdm = db_obj[db_name].yhdm

function get_db(db_name, db_schema, db_ver = 1) {
    let db = new Dexie(db_name)
    // 默认版本为从 1 开始
    db.version(db_ver).stores(db_schema)
    return db
}

// 原始的 Dexie put 和 get 方法
const originalPut = db_yhdm.put.bind(db_yhdm);
const originalGet = db_yhdm.get.bind(db_yhdm);

// 封装 put 方法
db_yhdm.put = async function(key, value, expiryInMinutes = 60) {
    const now = new Date();
    const item = {
        anime_id: key,
        value: value,
        expiry: now.getTime() + expiryInMinutes * 60000
    };

    const result = await originalPut(item);

    const event = new Event('db_yhdm_put');
    event.key = key;
    event.value = value;
    document.dispatchEvent(event);

    return result;
};

// 封装 get 方法
db_yhdm.get = async function(key) {
    const item = await originalGet(key);
    console.log(item)
    const event = new Event('db_yhdm_get');
    event.key = key;
    event.value = item ? item.value : null;
    document.dispatchEvent(event);

    if (!item) {
        return null;
    }
    const now = new Date();
    if (now.getTime() > item.expiry) {
        await db_yhdm.delete(key);
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

export {db_yhdm}

