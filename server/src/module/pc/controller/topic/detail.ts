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

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    community_id: number;
    id: number;
}

const PcTopicDetailAction = <Action>{
    router: {
        path: '/topic/detail',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.ZTGL]
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
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_topic')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_topic.created_by')
            .where('ejyy_topic.id', id)
            .andWhere('ejyy_topic.community_id', community_id)
            .select(
                'ejyy_topic.id',
                'ejyy_topic.banner_img',
                'ejyy_topic.title',
                'ejyy_topic.content',
                'ejyy_topic.published',
                'ejyy_topic.created_at',
                'ejyy_topic.created_by',
                'ejyy_property_company_user.real_name'
            )
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '不存在的专题'
            });
        }

        ctx.body = {
            code: SUCCESS,
            data: detail
        };
    }
};

export default PcTopicDetailAction;
