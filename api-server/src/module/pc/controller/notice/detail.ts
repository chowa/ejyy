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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { OA_NOTICE_COMMUNITY_USER_STOP_WATER, OA_NOTICE_COMMUNITY_USER_STOP_ELECTRICITY } from '~/constant/tpl';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcNoticeDetailAction = <Action>{
    router: {
        path: '/notice/detail',
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
            .leftJoin('ejyy_notice_tpl', 'ejyy_notice_tpl.id', 'ejyy_notice_to_user.notice_tpl_id')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_notice_to_user.created_by')
            .where('ejyy_notice_to_user.id', id)
            .andWhere('ejyy_notice_to_user.community_id', community_id)
            .select(
                'ejyy_notice_to_user.id',
                'ejyy_notice_to_user.title',
                'ejyy_notice_to_user.overview',
                'ejyy_notice_to_user.content',
                'ejyy_notice_to_user.created_at',
                'ejyy_notice_to_user.notice_tpl_id',
                'ejyy_notice_to_user.published',
                'ejyy_notice_to_user.published_at',
                'ejyy_notice_to_user.created_by',
                'ejyy_notice_to_user.published_by',
                'ejyy_notice_tpl.tpl',
                'ejyy_notice_tpl.content as tpl_content',
                'ejyy_property_company_user.real_name'
            )
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '不存在的通知'
            });
        }

        detail.tpl_content = JSON.parse(detail.tpl_content);

        let tpl_title = '非法模板';

        switch (detail.tpl) {
            case OA_NOTICE_COMMUNITY_USER_STOP_WATER:
                tpl_title = '停水通知';
                break;

            case OA_NOTICE_COMMUNITY_USER_STOP_ELECTRICITY:
                tpl_title = '停电通知';
                break;
        }

        let published_real_name = null;

        if (detail.published_by) {
            const pInfo = await ctx.model
                .from('ejyy_property_company_user')
                .where('id', detail.published_by)
                .first();

            published_real_name = pInfo.real_name;
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                ...detail,
                tpl_title,
                published_real_name
            }
        };
    }
};

export default PcNoticeDetailAction;
