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

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { UNBINDING_BUILDING } from '~/constant/status';
import { OPEARTE_BY_SELF } from '~/constant/operate_type';
import communityService from '~/service/community';

interface RequestBody {
    user_building_ids: number[];
    community_id: number;
}

const MpCommunityRemoveAction = <Action>{
    router: {
        path: '/community/remove',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'user_building_ids',
                validator: val => {
                    return Array.isArray(val) && val.every(num => /^\d+$/.test(num));
                },
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
        const { user_building_ids, community_id } = <RequestBody>ctx.request.body;

        await ctx.model
            .from('ejyy_user_building')
            .update({ status: UNBINDING_BUILDING })
            .where({ wechat_mp_user_id: ctx.mpUserInfo.id })
            .whereIn('id', user_building_ids);

        // 操作记录
        const history = [];
        const created_at = Date.now();

        user_building_ids.forEach(user_building_id => {
            history.push({
                user_building_id,
                wechat_mp_user_id: ctx.mpUserInfo.id,
                status: UNBINDING_BUILDING,
                operate_by: OPEARTE_BY_SELF,
                created_at
            });
        });
        await ctx.model.from('ejyy_user_building_operate_log').insert(history);

        // 默认社区
        const defaultInfo = await ctx.model.from('ejyy_user_default_community').where({
            wechat_mp_user_id: ctx.mpUserInfo.id,
            community_id
        });

        if (defaultInfo) {
            await ctx.model
                .from('ejyy_user_default_community')
                .update({ community_id: null })
                .where({ wechat_mp_user_id: ctx.mpUserInfo.id });
        }

        const communityInfo = await communityService(ctx.model, ctx.mpUserInfo.id);

        ctx.body = {
            code: SUCCESS,
            message: '删除社区住宅成功',
            data: {
                communityInfo
            }
        };
    }
};

export default MpCommunityRemoveAction;
