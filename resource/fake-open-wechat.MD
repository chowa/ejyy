
### 初始化不启用微信开放平台
建议在开发环境和个人学习环境中使用，毕竟生产环境使用微信开放平台扫码登录还是较实用的

```js
// web
路径：web/src/views/user/init/router.js

1.注解掉 26-36行
    ...
//    {
//        path: '',
//        meta: {
//            title: '管理员扫码',
//            authRequired: false,
//            layout: null,
//            nav: false,
//            roles: [ROLES.ANYONE]
//        },
//        component: () => import('./scan')
//    },
...

2.修改38行path

...
path: '',
...


// server

路径：server/src/module/pc/controller/init/run.ts

1.修改142.147行

...
required: false,
...

2.注解掉18行
//import * as wechatService from '~/service/wechat';



3.修改14行

...
import { SUCCESS,SYSTEMT_ALREADY_INIT } from '~/constant/code';
...

4.注解掉175-180行

...
//        if (!ctx.session.initState || ctx.session.initState !== state) {
//            return (ctx.body = {
//                code: WECHAT_STATE_ILLEGAL,
//                message: '授权码错误'
//            });
//        }
...

5.注解掉184-191行

...
//        const webUserInfo = await wechatService.getWebUserInfo(code);

//        if (!webUserInfo.success) {
//            return (ctx.body = {
//                code: WEHCAT_WEB_LOGIN_FAIL,
//                message: webUserInfo.message
//            });
//        }
...

6.注解掉212.213

...
//            open_id: webUserInfo.data.openid,
//            union_id: webUserInfo.data.unionid,
...

// MySQL

表ejyy_property_company_user
字段允许为空

  `open_id` varchar(28) DEFAULT NULL,
  `union_id` varchar(32) DEFAULT NULL,




```
### 初始化不启用OSS
不知道为啥子不能上传照片，先禁用了，到时候解决了再发解决步骤。 OSS好使生产环境可以节约一堆带宽和存储资源

```js
// web
路径：web/src/views/user/init/components/profile.vue
1.修改79行
    ...
required: false,
...

路径：web/rc/views/user/init/components/community.vue

1.修改98行

...
banner: [{ required: true, message: '请上传小区照片' }],
...

// server

路径：server/src/module/pc/controller/init/run.ts

1.修改59.131行

...
required: false,
...


```
