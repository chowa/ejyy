## 「e家宜业」业主端小程序

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

// 服务端权限认证字段（修改请修改服务端配置 token.mp）
export const AUTH_HEADER_NAME = 'ejyy-mp-token';

// 微信最低版本
export const WECHAT_VERSION = '7.0.0';

// 微信sdk最低版本
export const SDK_VERSION = '2.16.0';

// 小程序版本
export const VERSION = '1.1.8';

```


### 模板消息配置

> 模板id请在`server/src/constant/tpl.ts`中更新

#### 报修工单分配通知

字段名称`MP_REPAIR_ALLOT_TPL`

```
订单号 {{character_string1.DATA}}
订单状态 {{phrase2.DATA}}
温馨提示 {{thing5.DATA}}
订单时间 {{time3.DATA}}
```

#### 报修工单接单通知

字段名称`MP_REPAIR_CONFIRM_TPL`

```
订单号 {{character_string1.DATA}}
订单状态 {{phrase3.DATA}}
地址信息 {{thing4.DATA}}
订单时间 {{time2.DATA}}
```

#### 报修工单完成通知

字段名称`MP_REPAIR_CONFIRM_TPL`

```
报修位置 {{thing2.DATA}}
备注 {{thing4.DATA}}
报修时间 {{date1.DATA}}
```

#### 投诉工单受理通知

字段名称`MP_COMPLAIN_ALLOT_TPL`

```
园区名称 {{thing1.DATA}}
受理状态 {{thing4.DATA}}
回复时间 {{time7.DATA}}
```

#### 投诉工单处理通知

字段名称`MP_COMPLAIN_CONFRIM_TPL`

```
小区 {{thing4.DATA}}
处理内容 {{thing2.DATA}}
处理状态 {{phrase1.DATA}}
```

#### 挪车状态通知

字段名称`MP_MOVE_CAR_TPL`

```
请求状态 {{phrase1.DATA}}
处理人员 {{thing2.DATA}}
处理时间 {{time3.DATA}}
```

#### 业主认证通知

字段名称`MP_OWER_APPROVE`

```
认证户主 {{name2.DATA}}
认证户室 {{thing1.DATA}}
认证时间 {{time3.DATA}}
```
