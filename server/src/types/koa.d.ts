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
