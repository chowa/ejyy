/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { OaAction } from '~/types/action';
import crypto from 'crypto';
import config from '~/config';

const OaVerifyAction = <OaAction>{
    router: {
        path: '/',
        method: 'get'
    },
    response: async ctx => {
        const { signature, timestamp, nonce, echostr } = ctx.query;
        const hash = crypto.createHash('sha1');
        const arr = [config.wechat.oa.token, timestamp, nonce].sort();
        hash.update(arr.join(''));
        const shasum = hash.digest('hex');

        if (shasum === signature) {
            return (ctx.body = echostr as string);
        }

        ctx.status = 401;
        ctx.body = 'Invalid signature';
    }
};

export default OaVerifyAction;
