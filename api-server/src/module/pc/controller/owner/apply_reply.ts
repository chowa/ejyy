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
import { SUCCESS, STATUS_ERROR, NOT_FOUND_BINDING_BUILDING, PARAMS_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { TRUE, FALSE } from '~/constant/status';
import * as wechatService from '~/service/wechat';
import { MP_OWNER_APPROVE } from '~/constant/tpl';
import { AUTHENTICTED_BY_PROPERTY_COMPANY } from '~/constant/authenticated_type';
import utils from '~/utils';
import cwlog from 'chowa-log';
import moment from 'moment';

interface RequestBody {
    id: number;
    community_id: number;
    reply_content: string;
    success: typeof TRUE | typeof FALSE;
    building_ids: number[];
}

const PcOwerApplyReplyAction = <Action>{
    router: {
        path: '/owner/apply_reply',
        method: 'post',
        authRequired: true,
        roles: [ROLE.YZDA],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'reply_content',
                max: 128,
                required: true
            },
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
                name: 'success',
                required: true,
                regex: /^0|1$/
            },
            {
                name: 'building_ids',
                validator: val => {
                    if (Array.isArray(val) && val.length > 0) {
                        return val.every(item => /^\d+$/.test(item));
                    }

                    return true;
                }
            }
        ]
    },
    response: async ctx => {
        const { community_id, id, success, reply_content, building_ids } = <RequestBody>ctx.request.body;

        const detail = await ctx.model
            .from('ejyy_owner_apply')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!detail || detail.replied === TRUE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '非法操作业主认证'
            });
        }

        const bids = [];
        const replied_at = Date.now();

        if (success && !Array.isArray(building_ids)) {
            return (ctx.body = {
                code: PARAMS_ERROR,
                message: '参数错误'
            });
        }

        if (success) {
            const buildingsInfo = await ctx.model
                .from('ejyy_building_info')
                .leftJoin('ejyy_user_building', 'ejyy_user_building.building_id', 'ejyy_building_info.id')
                .whereIn('ejyy_building_info.id', building_ids)
                .whereNull('ejyy_user_building.building_id')
                .select('ejyy_building_info.id');

            if (buildingsInfo.length === 0) {
                return (ctx.body = {
                    code: NOT_FOUND_BINDING_BUILDING,
                    message: '未检索到需要关联绑定的住宅信息'
                });
            }

            const bindingData = [];

            for (const buildindInfo of buildingsInfo) {
                bindingData.push({
                    building_id: buildindInfo.id,
                    wechat_mp_user_id: detail.wechat_mp_user_id,
                    authenticated: 1,
                    authenticated_type: AUTHENTICTED_BY_PROPERTY_COMPANY,
                    authenticated_user_id: ctx.pcUserInfo.id,
                    created_at: Date.now()
                });

                bids.push(buildindInfo.id);
            }

            await ctx.model.from('ejyy_user_building').insert(bindingData);
        }

        await ctx.model
            .from('ejyy_owner_apply')
            .where('id', id)
            .andWhere('community_id', community_id)
            .update({
                reply_content,
                replied: TRUE,
                replied_at,
                content: JSON.stringify(bids),
                replied_by: ctx.pcUserInfo.id,
                success
            });

        if (success && detail.subscribed) {
            const { open_id, real_name } = await ctx.model
                .from('ejyy_wechat_mp_user')
                .where('id', detail.wechat_mp_user_id)
                .first();
            const ret = [];

            if (detail.house) {
                ret.push(detail.house);
            }

            if (detail.carport) {
                ret.push(detail.carport);
            }

            if (detail.warehouse) {
                ret.push(detail.warehouse);
            }

            const res = await wechatService.sendMpSubscribeMessage({
                touser: open_id,
                template_id: MP_OWNER_APPROVE,
                page: '/pages/community/index',
                data: {
                    name2: {
                        value: real_name
                    },
                    thing1: {
                        value: utils.text.omit(ret.join('，'), 16)
                    },
                    time3: {
                        value: moment(replied_at).format('YYYY-MM-DD HH:mm:ss')
                    }
                }
            });

            if (res.errcode !== 0) {
                cwlog.error(`小程序模板${MP_OWNER_APPROVE}推送失败，${res.errmsg}`);
            }
        }

        let buildings = [];
        if (bids.length > 0) {
            buildings = await ctx.model
                .from('ejyy_building_info')
                .leftJoin('ejyy_user_building', 'ejyy_user_building.building_id', 'ejyy_building_info.id')
                .where('ejyy_building_info.community_id', community_id)
                .andWhere('ejyy_user_building.wechat_mp_user_id', detail.wechat_mp_user_id)
                .whereIn('ejyy_building_info.id', bids)
                .select(
                    'ejyy_user_building.id',
                    'ejyy_user_building.building_id',
                    'ejyy_building_info.type',
                    'ejyy_building_info.area',
                    'ejyy_building_info.building',
                    'ejyy_building_info.unit',
                    'ejyy_building_info.number',
                    'ejyy_building_info.construction_area',
                    'ejyy_building_info.created_at',
                    'ejyy_user_building.authenticated',
                    'ejyy_user_building.authenticated_type',
                    'ejyy_user_building.status'
                );
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                replied_at,
                buildings
            }
        };
    }
};

export default PcOwerApplyReplyAction;
