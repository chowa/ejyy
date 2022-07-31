/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    subscribed?: typeof TRUE | typeof FALSE;
    replied?: typeof TRUE | typeof FALSE;
    success?: typeof TRUE | typeof FALSE;
}

const PcOwerApplyListAction = <Action>{
    router: {
        path: '/owner/apply_list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.YZDA],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'replied',
                regex: /^0|1$/
            },
            {
                name: 'subscribed',
                regex: /^0|1$/
            },
            {
                name: 'success',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, page_num, page_size, replied, subscribed, success } = <RequestBody>ctx.request.body;
        const where = {};

        if (replied !== undefined) {
            where['ejyy_owner_apply.replied'] = replied;
        }

        if (subscribed !== undefined) {
            where['ejyy_owner_apply.subscribed'] = subscribed;
        }

        if (success !== undefined) {
            where['ejyy_owner_apply.success'] = success;
        }

        const list = await ctx.model
            .from('ejyy_owner_apply')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_owner_apply.wechat_mp_user_id')
            .where(where)
            .andWhere('ejyy_owner_apply.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_owner_apply.id'))
            .select(
                'ejyy_owner_apply.id',
                'ejyy_owner_apply.house',
                'ejyy_owner_apply.carport',
                'ejyy_owner_apply.warehouse',
                'ejyy_owner_apply.subscribed',
                'ejyy_owner_apply.replied',
                'ejyy_owner_apply.success',
                'ejyy_owner_apply.created_at',
                'ejyy_wechat_mp_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_owner_apply.id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size
            }
        };
    }
};

export default PcOwerApplyListAction;
