## 「e家宜业」web中台

### 配置文件

详见本目录下`src/config.js`

```js
// 服务端权限认证字段（修改请修改服务端配置 token.pc）
export const AUTH_HEADER_NAME = 'ejyy-pc-token';

// 本地存储 token 字段名
export const TOKEN_ID = 'EJYY_PC_TOKEN';

// 本地存储 用户id 字段名
export const USER_ID = 'EJYY_PC_USER_ID';

// 网站标题
export const SITE_TITLE = 'e家宜业';

// 开放平台绑定的web应用的 appid（对应服务端配置wechat.web.appid）
export const WECHAT_WEB_APPID = '';

// 访问域名（必须带protocol，结尾不要带斜线）
export const HOST_NAME = '';

// 默认分页取多少条数据
export const DEGAULT_PAGE_SIZE = 10;

// 对象存储域名
export const ASSET_HOST = '';

// 表单label响应宽度
export const FORM_ADAPT_WIDTH = 992;

// 腾讯地址 key （对应服务端配置map.key）
export const MAP_KEY = '';

```

### 安装依赖

> 请使用node v12.1.0

`npm install`

### 启动

#### 本地开发

`npm run dev`

#### 编译打包

> 生产环境请自行在nginx设置代理到服务端

`npm run dist`
