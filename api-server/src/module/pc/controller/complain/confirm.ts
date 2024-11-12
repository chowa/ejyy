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
import { ALLOT_COMPLAIN_STEP, CONFIRM_COMPLAIN_STEP } from '~/constant/complain';
import * as ROLE from '~/constant/role_access';
import * as wechatService from '~/service/wechat';
import { MP_COMPLAIN_CONFRIM_TPL } from '~/constant/tpl';
import utils from '~/utils';
import cwlog from 'chowa-log';

interface RequestBody {
    community_id: number;
    id: number;
    dispose_reply?: string;
}

const PcComplainConfirmAction = <Action>{
    router: {
        path: '/complain/confirm',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
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
                name: 'dispose_reply',
                max: 200
            }
        ]
    },
    response: async ctx => {
        const { id, community_id, dispose_reply } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_complain')
            .where('id', id)
            .andWhere('community_id', community_id)
            .andWhere('step', ALLOT_COMPLAIN_STEP)
            .first();

        if (!detail || detail.dispose_user_id !== ctx.pcUserInfo.id) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法维修工单'
            });
        }

        const disposed_at = Date.now();
        const { name: community_name } = await ctx.model
            .from('ejyy_community_info')
            .where('id', community_id)
            .first();

        if (detail.dispose_subscribed) {
            const { open_id } = await ctx.model
                .from('ejyy_wechat_mp_user')
                .where('id', detail.wechat_mp_user_id)
                .first();

            const res = await wechatService.sendMpSubscribeMessage({
                touser: open_id,
                template_id: MP_COMPLAIN_CONFRIM_TPL,
                page: `/pages/complain/detail?id=${id}`,
                data: {
                    thing4: {
                        value: community_name
                    },
                    thing2: {
                        value: utils.text.omit(detail.description, 16)
                    },
                    phrase1: {
                        value: '工单已确认'
                    }
                }
            });

            if (res.errcode !== 0) {
                cwlog.error(`小程序模板${MP_COMPLAIN_CONFRIM_TPL}推送失败，${res.errmsg}`);
            }
        }

        await ctx.model
            .from('ejyy_complain')
            .update({
                step: CONFIRM_COMPLAIN_STEP,
                disposed_at,
                dispose_reply: dispose_reply ? dispose_reply : null
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS,
            data: {
                disposed_at
            }
        };
    }
};

export default PcComplainConfirmAction;
