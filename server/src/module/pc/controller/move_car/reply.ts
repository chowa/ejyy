/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import * as wechatService from '~/service/wechat';
import { MP_MOVE_CAR_TPL } from '~/constant/tpl';
import moment from 'moment';
import cwlog from 'chowa-log';

interface RequestBody {
    community_id: number;
    id: number;
    response_content?: string;
}

const PcMoveCarReplyAction = <Action>{
    router: {
        path: '/move_car/reply',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XQNC],
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
                name: 'response_content',
                max: 128,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id, response_content } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_move_car')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!detail || detail.responsed_at) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法挪车工单'
            });
        }

        const responsed_at = Date.now();

        if (detail.subscribed) {
            const { open_id } = await ctx.model
                .from('ejyy_wechat_mp_user')
                .where('id', detail.wechat_mp_user_id)
                .first();

            const res = await wechatService.sendMpSubscribeMessage({
                touser: open_id,
                template_id: MP_MOVE_CAR_TPL,
                page: `/pages/move_car/detail?id=${id}`,
                data: {
                    phrase1: {
                        value: '已处理'
                    },
                    thing2: {
                        value: ctx.pcUserInfo.real_name
                    },
                    time3: {
                        value: moment(responsed_at).format('YYYY-MM-DD HH:mm:ss')
                    }
                }
            });

            if (res.errcode !== 0) {
                cwlog.error(`小程序模板${MP_MOVE_CAR_TPL}推送失败，${res.errmsg}`);
            }
        }

        await ctx.model
            .from('ejyy_move_car')
            .update({
                responsed_at,
                response_content,
                response_user_id: ctx.pcUserInfo.id
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS,
            data: {
                responsed_at
            }
        };
    }
};

export default PcMoveCarReplyAction;
