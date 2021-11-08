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
import { SUBMIT_REPAIR_STEP } from '~/constant/repair';
import * as ROLE from '~/constant/role_access';
import * as wechatService from '~/service/wechat';
import { MP_REPAIR_FINISH_TPL } from '~/constant/tpl';
import utils from '~/utils';
import moment from 'moment';
import cwlog from 'chowa-log';

interface RequestBody {
    community_id: number;
    id: number;
    merge_id: number;
}

const PcRepairMergeAction = <Action>{
    router: {
        path: '/repair/merge',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WXWF],
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
                name: 'merge_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id, merge_id } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_repair')
            .where('id', id)
            .andWhere('community_id', community_id)
            .andWhere('step', SUBMIT_REPAIR_STEP)
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法维修工单'
            });
        }

        if (detail.dispose_subscribed) {
            const { open_id } = await ctx.model
                .from('ejyy_wechat_mp_user')
                .where('id', detail.wechat_mp_user_id)
                .first();

            const res = await wechatService.sendMpSubscribeMessage({
                touser: open_id,
                template_id: MP_REPAIR_FINISH_TPL,
                page: `/pages/repair/detail?id=${id}`,
                data: {
                    thing2: {
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
                    thing4: {
                        value: '您的工单已合并处理'
                    },
                    date1: {
                        value: moment(detail.created_at).format('YYYY-MM-DD HH:mm:ss')
                    }
                }
            });

            if (res.errcode !== 0) {
                cwlog.error(`小程序模板${MP_REPAIR_FINISH_TPL}推送失败，${res.errmsg}`);
            }
        }

        await ctx.model
            .from('ejyy_repair')
            .update({ merge_id })
            .where('id', id);

        ctx.body = {
            code: SUCCESS,
            data: {
                merge_id
            }
        };
    }
};

export default PcRepairMergeAction;
