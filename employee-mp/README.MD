## 「e家宜业」员工端小程序

> 请将本目录下`project.config.json`中的appid修改为对应的appid后发布，发布前记得前往小程序控制台配置api、上传下载白名单

### 配置文件

详见本目录下`src/config.js`

```js
// 服务端域名
export const API_HOST = '';

// 对象存储域名
export const ASSETS_HOST = '';

// 本地存储 token 字段名
export const TOKEN_NAME = 'EJYY-TOKEN';

// 本地存储 用户id 字段名
export const USER_ID = 'USER_ID';

// 服务端权限认证字段（修改请修改服务端配置 token.pc）
export const AUTH_HEADER_NAME = 'ejyy-pc-token';

// 微信最低版本
export const WECHAT_VERSION = '7.0.0';

// 微信sdk最低版本
export const SDK_VERSION = '2.16.0';

// 小程序版本
export const VERSION = '1.1.7';

```
