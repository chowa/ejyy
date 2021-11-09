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

import { Context, Next } from 'koa';
import { Role } from '~/constant/role_access';

declare namespace Action {
    interface RouterDeclare {
        path: string;
        method: 'get' | 'post' | 'delete' | 'put' | 'patch';
        authRequired: boolean;
        // 此处针对mp模块
        verifyIntact?: boolean;
        // 此处针对pc模块
        roles?: Role[];
        verifyCommunity?: boolean;
    }

    interface FieldVerifyDeclare {
        name: string;
        required?: boolean;
        length?: number;
        min?: number;
        max?: number;
        regex?: RegExp;
        message?: string;
        validator?: (value: any) => boolean;
    }

    interface ValidatorDeclare {
        body?: FieldVerifyDeclare[];
        params?: FieldVerifyDeclare[];
        query?: FieldVerifyDeclare[];
        files?: FieldVerifyDeclare[];
    }

    interface Action {
        router: RouterDeclare;
        validator?: ValidatorDeclare;
        response: (ctx?: Context, next?: Next) => Promise<any>;
    }

    interface NotifyAction {
        router: RouterDeclare;
        response: (ctx?: Context, next?: Next) => Promise<any>;
    }

    interface OaAction {
        router: RouterDeclare;
        response: (ctx?: Context, next?: Next) => Promise<any>;
    }
}

export = Action;
