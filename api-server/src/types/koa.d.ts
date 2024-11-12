/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */
import { MpUserInfo, PcUserInfo, OaUserInfo } from './user-info';

interface InterfaceBody {
    code: number;
    message?: string;
    data?: Object;
}

declare module 'koa' {
    interface BaseContext {
        mpUserInfo: MpUserInfo;
        pcUserInfo: PcUserInfo;
        OaUserInfo: OaUserInfo;
    }

    interface ContextDelegatedResponse {
        body: InterfaceBody | string;
    }
}
