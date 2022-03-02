/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import Mysql from 'mysql';
import Knex from 'knex';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import cwlog from 'chowa-log';

interface Config {
    name: string;
    debug: boolean;
    server: {
        port: number;
        name: string;
    };
    mysqlConfig: Mysql.ConnectionConfig & Knex.ConnectionConfig;
    redis: {
        host: string;
        port: number;
        password: string;
    };
    token: {
        mp: string;
        pc: string;
    };
    wechat: {
        ump: {
            appid: string;
            secret: string;
        };
        oa: {
            appid: string;
            secret: string;
            token: string;
            key: string;
        };
        pay: {
            mch_id: string;
            prodHost: string;
            devHost: string;
            payExpire: number;
            refoundExpire: number;
            key: string;
            certPath: string;
        };
        web: {
            appid: string;
            secret: string;
        };
        pmp: {
            appid: string;
            secret: string;
        };
    };
    map: {
        key: string;
    };
    session: {
        key: string;
        maxAge: number;
        signed: boolean;
    };
    community: {
        expire: number;
    };
    aliyun: {
        accessKeyId: string;
        accessKeySecret: string;
        oss: {
            bucket: string;
            region: string;
            host?: string;
        };
    };
    crypto: {
        key: string;
        iv: string;
    };
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        user?: string;
        password?: string;
        to?: string;
    };
    inited: boolean;
}

interface CustomConfig {
    [key: string]: any;
}

function generateConfig(): Config {
    let customConfig = <CustomConfig>{};

    try {
        customConfig = yaml.load(fs.readFileSync(path.join(process.cwd(), '.ejyyrc'), 'utf-8'));
    } catch (e) {
        cwlog.error('未检测到配置文件，程序退出');
        process.exit();
    }

    const mysqlConfig: Mysql.ConnectionConfig & Knex.ConnectionConfig = {
        host: '',
        port: 3306,
        user: 'root',
        password: '',
        database: '',
        ...customConfig.mysql,
        supportBigNumbers: true,
        typeCast: (field, next) => {
            // 数据库内所有字段只要是content的都是json内容
            if (field.type === 'BLOB' && field.name === 'content') {
                return JSON.parse(field.string());
            }

            return next();
        }
    };

    return {
        name: 'ejyy',
        debug: process.env.NODE_ENV !== 'production',
        server: {
            port: 6688,
            name: 'e家宜业',
            ...customConfig.server
        },
        mysqlConfig,
        redis: {
            host: '',
            port: 6379,
            password: '',
            ...customConfig.redis
        },
        token: {
            mp: 'ejyy-mp-token',
            pc: 'ejyy-pc-token',
            ...customConfig.token
        },
        wechat: {
            // 小程序
            ump: {
                appid: '',
                secret: '',
                ...(customConfig.wechat ? customConfig.wechat.ump : {})
            },
            // 公众号
            oa: {
                appid: '',
                secret: '',
                token: '',
                key: '',
                ...(customConfig.wechat ? customConfig.wechat.oa : {})
            },
            // 支付
            pay: {
                mch_id: '',
                prodHost: '',
                devHost: '',
                // 支付时效
                payExpire: 30 * 60 * 1000,
                // 退款时效
                refoundExpire: 15 * 1000 * 24 * 60 * 60,
                key: '',
                certPath: '',
                ...(customConfig.wechat ? customConfig.wechat.pay : {})
            },
            // 物业web
            web: {
                appid: '',
                secret: '',
                ...(customConfig.wechat ? customConfig.wechat.web : {})
            },
            // 物业端小程序
            pmp: {
                appid: '',
                secret: '',
                ...(customConfig.wechat ? customConfig.wechat.pmp : {})
            }
        },
        // 地图
        map: {
            key: '',
            ...customConfig.map
        },
        session: {
            key: 'ejyy:session',
            maxAge: 1000 * 60 * 30,
            signed: false,
            ...customConfig.session
        },
        // 二维码
        community: {
            expire: 5 * 60 * 1000,
            ...customConfig.community
        },
        aliyun: {
            accessKeyId: '',
            accessKeySecret: '',
            // 对象存储
            oss: {
                bucket: '',
                region: '',
                host: ''
            },
            ...customConfig.aliyun
        },
        // 各类可以解密加密
        crypto: {
            key: '',
            iv: '',
            ...customConfig.crypto
        },
        smtp: {
            host: '',
            port: 465,
            secure: true,
            user: '',
            password: '',
            to: '',
            ...customConfig.smtp
        },
        inited: false
    };
}

export default generateConfig();
