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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { ALLOT_REPAIR_STEP, CONFIRM_REPAIR_STEP } from '~/constant/repair';
import * as ROLE from '~/constant/role_access';
import * as wechatService from '~/service/wechat';
import { MP_REPAIR_CONFIRM_TPL } from '~/constant/tpl';
import utils from '~/utils';
import moment from 'moment';
import cwlog from 'chowa-log';

interface RequestBody {
    community_id: number;
    id: number;
    dispose_reply?: string;
}

const PcRepairConfirmAction = <Action>{
    router: {
        path: '/repair/confirm',
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
            .from('ejyy_repair')
            .where('id', id)
            .andWhere('community_id', community_id)
            .andWhere('step', ALLOT_REPAIR_STEP)
            .first();

        if (!detail || detail.dispose_user_id !== ctx.pcUserInfo.id) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法维修工单'
            });
        }

        const disposed_at = Date.now();

        if (detail.dispose_subscribed) {
            const { open_id } = await ctx.model
                .from('ejyy_wechat_mp_user')
                .where('id', detail.wechat_mp_user_id)
                .first();

            const res = await wechatService.sendMpSubscribeMessage({
                touser: open_id,
                template_id: MP_REPAIR_CONFIRM_TPL,
                page: `/pages/repair/detail?id=${id}`,
                data: {
                    character_string1: {
                        value: utils.order.num('R', detail.created_at, id)
                    },
                    phrase3: {
                        value: '工程已确认'
                    },
                    thing4: {
                        value:
                            detail.building_id === 0
                                ? '公共设施/区域'
                                : utils.building.name(
                                      await ctx.model
                                          .from('ejyy_building_info')
                                          .where('id', detail.building_id)
                                          .first()
                                  )
                    },
                    time2: {
                        value: moment(disposed_at).format('YYYY-MM-DD HH:mm:ss')
                    }
                }
            });

            if (res.errcode !== 0) {
                cwlog.error(`小程序模板${MP_REPAIR_CONFIRM_TPL}推送失败，${res.errmsg}`);
            }
        }

        await ctx.model
            .from('ejyy_repair')
            .update({
                step: CONFIRM_REPAIR_STEP,
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

export default PcRepairConfirmAction;
