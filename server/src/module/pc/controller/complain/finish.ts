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
import { CONFIRM_COMPLAIN_STEP, FINISH_COMPLAIN_STEP } from '~/constant/complain';
import * as ROLE from '~/constant/role_access';
import * as wechatService from '~/service/wechat';
import { MP_COMPLAIN_FINISH_TPL } from '~/constant/tpl';
import utils from '~/utils';
import moment from 'moment';
import cwlog from 'chowa-log';

interface RequestBody {
    community_id: number;
    id: number;
    dispose_content?: string;
    dispose_imgs: string[];
}

const PcComplainFinishAction = <Action>{
    router: {
        path: '/complain/finish',
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
                name: 'dispose_content',
                max: 200,
                required: true
            },
            {
                name: 'dispose_imgs',
                validator: val =>
                    Array.isArray(val) && val.every(item => /^\/complain\/[a-z0-9]{32}\.(jpg|jpeg|png)$/.test(item))
            }
        ]
    },
    response: async ctx => {
        const { id, community_id, dispose_imgs, dispose_content } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_complain')
            .where('id', id)
            .andWhere('community_id', community_id)
            .andWhere('step', CONFIRM_COMPLAIN_STEP)
            .first();

        if (!detail || detail.dispose_user_id !== ctx.pcUserInfo.id) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法维修工单'
            });
        }

        const finished_at = Date.now();

        if (detail.dispose_subscribed) {
            const { open_id } = await ctx.model
                .from('ejyy_wechat_mp_user')
                .where('id', detail.wechat_mp_user_id)
                .first();

            const res = await wechatService.sendMpSubscribeMessage({
                touser: open_id,
                template_id: MP_COMPLAIN_FINISH_TPL,
                page: `/pages/complain/detail?id=${id}`,
                data: {
                    character_string1: {
                        value: utils.order.num('C', detail.created_at, id)
                    },
                    thing2: {
                        value: utils.text.omit(dispose_content, 16)
                    },
                    time3: {
                        value: moment(finished_at).format('YYYY-MM-DD HH:mm:ss')
                    }
                }
            });

            if (res.errcode !== 0) {
                cwlog.error(`小程序模板${MP_COMPLAIN_FINISH_TPL}推送失败，${res.errmsg}`);
            }
        }

        await ctx.model
            .from('ejyy_complain')
            .update({
                step: FINISH_COMPLAIN_STEP,
                finished_at,
                dispose_content: dispose_content ? dispose_content : null,
                dispose_imgs: dispose_imgs ? dispose_imgs.join('#') : null
            })
            .where('id', id);

        ctx.body = {
            code: SUCCESS,
            data: {
                finished_at
            }
        };
    }
};

export default PcComplainFinishAction;
