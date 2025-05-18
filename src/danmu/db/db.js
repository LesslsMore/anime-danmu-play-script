import Dexie from 'dexie'

const db_name = 'anime'

const db_schema = {
    info: '&anime_id', // 主键 索引
    url: '&anime_id', // 主键 索引
    danmu: '&episode_id' // 组合键 索引
}

const db_obj = {
    [db_name]: get_db(db_name, db_schema)
}

const db_url = db_obj[db_name].url
const db_info = db_obj[db_name].info
const db_danmu = db_obj[db_name].danmu

function get_db(db_name, db_schema, db_ver = 1) {
    let db = new Dexie(db_name)
    // 默认版本为从 1 开始
    db.version(db_ver).stores(db_schema)
    return db
}

function createDbMethods(dbInstance, pk, expiryInMinutes = 60) {
    // 原始的 Dexie put 和 get 方法
    const old_put = dbInstance.put.bind(dbInstance);
    const old_get = dbInstance.get.bind(dbInstance);

    const put = async function(key, value) {
        const now = new Date();
        const item = {
            [pk]: key,
            value: value,
            expiry: now.getTime() + expiryInMinutes * 60000
        };

        const result = await old_put(item);

        const event = new Event(old_put.name);
        event.key = key;
        event.value = value;
        document.dispatchEvent(event);

        return result;
    };
    const get = async function(key) {
        const item = await old_get(key);
        // console.log(item)
        const event = new Event(old_get.name);
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

    dbInstance.put = put;
    dbInstance.get = get;
    return {
        put,
        get,
    }
}

createDbMethods(db_url, 'anime_id',60)
createDbMethods(db_info, 'anime_id',60 * 24 * 7)
createDbMethods(db_danmu, 'episode_id',60 * 24 * 7)
// db_url.put = put
// db_url.get = get

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
export {
    db_url,
    db_info,
    db_danmu,
}
