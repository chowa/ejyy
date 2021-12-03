## 「e家宜业」服务端

> 开发测试环境可以不配置redis，生产环境必须配置redis。

### 创建配置文件

- 开发环境请在`ejyy/server`目录下创建 `.ejyyrc`文件
- 生产环境请在`ejyy_server.js`同级目录下创建`.ejyyrc`文件

并按照下面格式，修改为对应的配置后保存

```yaml
---
    server:
        # 服务器端口
        port:              6688
        # 服务器名称
        name:              'e家宜业'
    mysql:
        # 数据库地址
        host:              '127.0.0.1'
        # 数据库端口
        port:              3306
        # 数据库用户名
        user:              'root'
        # 数据库密码
        password:          'root'
        # 数据库名
        database:          'ejyy'
    redis:
        # redis 地址
        host:              '127.0.0.1'
        # redis 端口
        port:              3306
        # redis 密码
        password:          'root'
    token:
        # 业主小程序认证字段（修改请修改业主小程序配置）
        mp:                'ejyy-mp-token'
        # 员工网站及APP认证字段（修改请修改web端和物业小程序配置）
        pc:                'ejyy-pc-token'
    wechat:
        # 业主小程序
        ump:
            # 业主小程序 appid
            appid:         ''
            # 业主小程序 秘钥
            secret:        ''
        # 公众号
        oa:
            # 公众号 appid
            appid:         ''
            # 公众号 秘钥
            secret:        ''
            # 公众号 token
            token:         ''
            # 公众号 key
            key:           ''
        # 微信支付
        pay:
            mch_id:        ''
            # 生成环境通知地址
            prodHost:      ''
            # 开发安环境通知地址
            devHost:       ''
            # 支付时效
            payExpire:     1800000
            # 退款时效
            refoundExpire: 1296000000
            # 支付key
            key:           ''
            # 支付证书位置
            certPath:      ''
        # 开放平台
        web:
            # 微信开放平台 appid
            appid:         ''
            # 微信开放平台 秘钥
            secret:        ''
        # 物业员工小程序
        pmp:
            # 物业员工小程序 appid
            appid:         ''
            # 物业员工小程序 秘钥
            secret:        ''
    # 腾讯地图
    map:
        # 腾讯地图 key
        key:               ''
    session:
        # session 名称
        key:               'ejyy:session'
        # session 有效期
        maxAge:            1800000
        # session 是否签名
        signed:            false
    # 小区
    community:
        # 小区认证二维有效期
        expire:            30000
    # 阿里云
    aliyun:
        # 阿里云 key
        accessKeyId:       ''
        # 阿里云秘钥
        accessKeySecret:   ''
        # 对象存库
        oss:
            # 篮子名称
            bucket:        ''
            # 域，在阿里云OSS中台中找“地域节点”
            region:        ''
            # 你的bucket的访问域名，如：https://ejyy.qingdao.aliyuncs.com
            host:          ''
    # 各类可以解密加密
    crypto:
        # aes128 秘钥
        key:               ''
        # aes128 偏移常量
        iv:                ''
    # 发信配置（主要接收生产环境异常报警）
    smtp:
        # 发信地址
        host:              ''
        # 发现端口
        port:              465
        # 开启ssl加密
        secure:            true
        # 发信账号
        user:              ''
        # 发信密码
        password:          ''
        # 收件人
        to:                ''

```

### 安装依赖

> 请使用node v12.1.0

`npm install`

### 启动

#### 测试环境

`npm run dev`

#### 生产环境

> 建议使用pm2守护进程

- `npm run dist && node dist/ejyy_server.js`


### nginx代理

```
location / {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host  $http_host;
    proxy_set_header X-Nginx-Proxy true;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_pass http://localhost:6688;
}
```

### windows 下开发常见问题

#### server目录下执行`npm run dev`报错

> 这个问题是因为windows下没有export命令导致的，按照如下方法解决

安装依赖
```
npm install -g ts-node typescript cross-env
```

修改 `server/package.json`中的`scripts.dev`为`cross-env NODE_ENV=development nodemon -e ts --exec 'ts-node' src/app.ts`
