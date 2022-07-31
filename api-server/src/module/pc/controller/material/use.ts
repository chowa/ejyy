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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    id: number;
    used_by: number;
    total: number;
    reason: string;
}

const PcMaterialUseAction = <Action>{
    router: {
        path: '/material/use',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WLCC],
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
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'used_by',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'total',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'reason',
                max: 128,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id, id, used_by, reason, total } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_material')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法操作'
            });
        }

        if (total > info.total) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '仓储不足'
            });
        }

        await ctx.model.from('ejyy_material_used').insert({
            material_id: id,
            total,
            reason,
            used_by,
            created_by: ctx.pcUserInfo.id,
            created_at: Date.now()
        });

        await ctx.model
            .from('ejyy_material')
            .update('total', info.total - total)
            .where('id', id)
            .andWhere('community_id', community_id);

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcMaterialUseAction;
