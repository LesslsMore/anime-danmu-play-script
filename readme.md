# 动漫弹幕播放

自动匹配加载动漫剧集对应弹幕并播放, 目前支持风车动漫、樱花动漫、AGE动漫

### 支持网站
- 风车动漫 https://www.dmla7.com/ https://www.tt776b.com/
- 樱花动漫 https://www.dm539.com/
- AGE 动漫 https://www.agefans.la/

风车动漫地址永久发布页 https://www.dmla.fans/

樱花动漫地址永久发布页 http://dm519.fans/

AGE 动漫地址永久发布页 https://github.com/agefanscom/website

## 主要功能

- 自动加载弹幕
- 手动搜索弹幕
- 手动上传弹幕

## 效果演示

### 自动加载弹幕

自动匹配加载动漫剧集对应弹幕并播放, 弹幕加载和播放暂停时会显示番剧弹幕信息

![](https://raw.githubusercontent.com/LesslsMore/anime-danmu-play-script/master/doc/img1.png)

### 手动搜索弹幕

比如[哭泣少女乐队](https://www.dmla5.com/play/8703-1-7.html)不能自动加载弹幕, 会在视频加载和播放暂停时进行提示

在视频任意位置右键, 打开菜单, 将搜索番剧名称改为 girls band cry 后, 按下回车键, 会重新加载当前集数的弹幕

![](https://raw.githubusercontent.com/LesslsMore/anime-danmu-play-script/master/doc/img3.png)

又例如 无职转生第二季 part2 未搜索到番剧弹幕, 按照上面同样的方式, 

将搜索名称改为 无职转生 后, 按下回车键, 选择 无职转生第二季 part2 后, 会自动加载当前集数的弹幕

![](https://raw.githubusercontent.com/LesslsMore/anime-danmu-play-script/master/doc/img5.png)

又例如 魔法科高校的劣等生第三季 未搜索到番剧弹幕, 按照上面同样的方式, 

将搜索名称改为 魔法科高校的劣等生 后, 按下回车键, 依然没有, 

换成 魔法科高校 后, 选择下拉列表中的 魔法科高校の劣等生 (続編), 会自动加载当前集数的弹幕

(弹弹 play 数据库没有收录中文名称)

### 手动上传弹幕

如果有本地下载好的弹幕, 可以点击上传弹幕, 添加 xml、json 格式本地弹幕

例如 我的三体第四季 弹弹 play 没有收录, 可以手动下载对应 bilibili 对应弹幕, 手动上传弹幕观看

![](https://raw.githubusercontent.com/LesslsMore/anime-danmu-play-script/master/doc/img6.png)

### 主要原理

根据页面获取动漫名称, 通过 url 确定播放剧集, 重新渲染播放器, 

### 安装提示

出现如下界面, 请点击总是允许此域名, 该操作获取弹幕相关数据

![](https://raw.githubusercontent.com/LesslsMore/anime-danmu-play-script/master/doc/img4.png)

### 特别鸣谢

[弹弹 play](https://www.dandanplay.com/) 提供弹幕服务

### 油猴脚本地址

https://greasyfork.org/zh-CN/scripts/485364

### 更新记录

0.5.2 支持 AGE 动漫, 目前仅支持 VIP 西瓜的线路, 其余线路暂不支持, 如影响播放, 请关闭脚本

0.5.1 优化地址解析由逆向到 iframe 获取, 修复解析地址经常失效的问题

0.5.0 优化解耦分离播放器、地址解析

0.4.0 优化完善播放器初始化、弹幕搜索、数据缓存

0.3.11 更新视频解析地址

0.3.10 适配网站最新视频地址解析方式

0.3.9 缓存弹幕, 支持上传 json 格式弹幕, 支持当前弹幕下载

0.3.8 弹弹play接口加入用户权限验证

0.3.7 缓存 info 优化, 设置过期时间为一周, 避免新番更新后没有对应弹幕信息

0.3.6 缓存 info url 分离, 加入剧集偏移, 调整剧集和弹幕不一致的情况

0.3.5 优化手动上传弹幕, 修改缓存为 IndexedDB, 设置过期时间

0.3.4 优化支持更多网站, 添加网站及发布地址说明

0.3.3 优化完善手动搜索番剧选择功能, 代码优化为事件驱动

0.3.2 显示弹幕信息, 添加缓存, 优化性能, 记录选择的番剧

0.3.1 优化完善手动搜索剧集选择功能

### todo
- 观看时间, 历史记录 
- 弹幕发送
- 支持搜索 bilibili 弹幕

### 最后

欢迎提交问题与反馈！

[issue](https://github.com/LesslsMore/anime-danmu-play-script/issues)

[feedback](https://greasyfork.org/zh-CN/scripts/485364/feedback)

如果觉得有用, 请转发和收藏, 这就是对优化和更新的支持！


