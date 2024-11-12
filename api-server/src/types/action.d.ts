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
