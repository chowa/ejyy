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
import { TRUE } from '~/constant/status';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcRefoundCancelAction = <Action>{
    router: {
        path: '/refound/cancel',
        method: 'post',
        authRequired: true,
        roles: [ROLE.RLZY],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_refound')
            .where('id', id)
            .andWhere('community_id', community_id)
            .andWhere('created_by', ctx.pcUserInfo.id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法取消报销申请'
            });
        }

        if (info.success !== null || info.cancel === TRUE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '状态错误'
            });
        }

        const canceled_at = Date.now();

        await ctx.model
            .from('ejyy_refound')
            .where('id', id)
            .andWhere('community_id', community_id)
            .update({
                cancel: TRUE,
                canceled_at
            });

        ctx.body = {
            code: SUCCESS,
            data: {
                canceled_at
            }
        };
    }
};

export default PcRefoundCancelAction;
