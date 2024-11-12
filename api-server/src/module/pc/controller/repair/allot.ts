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
import { SUBMIT_REPAIR_STEP, ALLOT_REPAIR_STEP } from '~/constant/repair';
import * as ROLE from '~/constant/role_access';
import * as wechatService from '~/service/wechat';
import { MP_REPAIR_ALLOT_TPL, OA_NOTICE_TO_PROPERTY_COMPANY_USER } from '~/constant/tpl';
import utils from '~/utils';
import moment from 'moment';
import cwlog from 'chowa-log';
import config from '~/config';

interface RequestBody {
    community_id: number;
    id: number;
    dispose_user_id: number;
}

const PcRepairAllotAction = <Action>{
    router: {
        path: '/repair/allot',
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
                name: 'dispose_user_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id, dispose_user_id } = <RequestBody>ctx.request.body;

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

        const disposedInfo = await ctx.model
            .from('ejyy_property_company_user')
            .leftJoin(
                'ejyy_wechat_official_accounts_user',
                'ejyy_wechat_official_accounts_user.union_id',
                'ejyy_property_company_user.union_id'
            )
            .where('ejyy_property_company_user.id', dispose_user_id)
            .select(
                'ejyy_property_company_user.id',
                'ejyy_property_company_user.real_name',
                'ejyy_wechat_official_accounts_user.open_id',
                'ejyy_wechat_official_accounts_user.subscribed'
            )
            .first();

        if (!disposedInfo) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法维修工单'
            });
        }

        const alloted_at = Date.now();

        if (detail.dispose_subscribed) {
            const { open_id } = await ctx.model
                .from('ejyy_wechat_mp_user')
                .where('id', detail.wechat_mp_user_id)
                .first();

            const res = await wechatService.sendMpSubscribeMessage({
                touser: open_id,
                template_id: MP_REPAIR_ALLOT_TPL,
                page: `/pages/repair/detail?id=${id}`,
                data: {
                    character_string1: {
                        value: utils.order.num('R', detail.created_at, id)
                    },
                    phrase2: {
                        value: '已派单维修'
                    },
                    thing5: {
                        value: '维修人员会电话联系您，请注意接听。'
                    },
                    time3: {
                        value: moment(alloted_at).format('YYYY-MM-DD HH:mm:ss')
                    }
                }
            });

            if (res.errcode !== 0) {
                cwlog.error(`小程序模板${MP_REPAIR_ALLOT_TPL}推送失败，${res.errmsg}`);
            }
        }

        if (disposedInfo.subscribed && disposedInfo.open_id) {
            const res = await wechatService.sendOaTemplateMessage({
                touser: disposedInfo.open_id,
                template_id: OA_NOTICE_TO_PROPERTY_COMPANY_USER,
                miniprogram: {
                    appid: config.wechat.pmp.appid,
                    pagepath: `/pages/repair/detail?id=${id}`
                },
                data: {
                    first: {
                        value: '维修工单提醒'
                    },
                    keyword1: {
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
                    keyword2: {
                        value: utils.order.num('R', detail.created_at, id)
                    },
                    keyword3: {
                        value: utils.text.omit(detail.description, 22)
                    },
                    keyword4: {
                        value: ctx.pcUserInfo.real_name
                    },
                    keyword5: {
                        value: moment(alloted_at).format('YYYY-MM-DD HH:mm:ss')
                    },
                    remark: {
                        value: '请尽快与业主联系前往处理'
                    }
                }
            });

            if (res.errcode !== 0) {
                cwlog.error(`公众号推送${OA_NOTICE_TO_PROPERTY_COMPANY_USER}推送失败，${res.errmsg}`);
            }
        }

        await ctx.model
            .from('ejyy_repair')
            .update({
                step: ALLOT_REPAIR_STEP,
                allot_user_id: ctx.pcUserInfo.id,
                alloted_at,
                dispose_user_id
            })
            .where('id', id);

        delete disposedInfo.open_id;
        delete disposedInfo.subscribed;

        ctx.body = {
            code: SUCCESS,
            data: {
                alloted_at,
                allotInfo: {
                    id: ctx.pcUserInfo.id,
                    real_name: ctx.pcUserInfo.real_name
                },
                disposedInfo
            }
        };
    }
};

export default PcRepairAllotAction;
