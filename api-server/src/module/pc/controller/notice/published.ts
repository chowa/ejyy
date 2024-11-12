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
import { SUCCESS, DATA_MODEL_UPDATE_FAIL, QUERY_ILLEFAL, STATUS_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TRUE } from '~/constant/status';
import * as noticeService from '~/service/notice';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcNoticePublishedAction = <Action>{
    router: {
        path: '/notice/published',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XQTZ],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_notice_to_user')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的小区通知'
            });
        }

        if (detail.published === TRUE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '通知已发布'
            });
        }

        const published_at = Date.now();

        const affect = await ctx.model
            .from('ejyy_notice_to_user')
            .update({
                published: TRUE,
                published_by: ctx.pcUserInfo.id,
                published_at
            })
            .where('id', id)
            .andWhere('community_id', community_id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '发布通知失败'
            });
        }

        noticeService.broadcast(ctx.model, id);

        ctx.body = {
            code: SUCCESS,
            message: '修改小区通知成功',
            data: {
                published_at
            }
        };
    }
};

export default PcNoticePublishedAction;
