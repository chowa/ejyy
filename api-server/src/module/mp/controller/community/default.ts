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
import { SUCCESS, COMMUNITY_ID_NOT_EXIST, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';

interface RequestBody {
    community_id: number;
}

const MpCommunityDefaultAction = <Action>{
    router: {
        path: '/community/default',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_community_info')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.community_id', 'ejyy_community_info.id')
            .leftJoin('ejyy_user_building', 'ejyy_user_building.building_id', 'ejyy_building_info.id')
            .where('ejyy_community_info.id', community_id)
            .andWhere('ejyy_user_building.wechat_mp_user_id', ctx.mpUserInfo.id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: COMMUNITY_ID_NOT_EXIST,
                message: '社区不存在'
            });
        }

        const affect = await ctx.model
            .from('ejyy_user_default_community')
            .update({ community_id })
            .where({ wechat_mp_user_id: ctx.mpUserInfo.id });

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '设置默认社区失败'
            });
        }

        ctx.body = {
            code: SUCCESS,
            message: '设置默认社区成功'
        };
    }
};

export default MpCommunityDefaultAction;
