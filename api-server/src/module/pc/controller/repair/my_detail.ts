/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { ALLOT_REPAIR_STEP } from '~/constant/repair';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcRepairMyDetailAction = <Action>{
    router: {
        path: '/repair/my_detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
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
        let allotInfo = null;
        let disposedInfo = null;
        let referInfo = null;

        const info = await ctx.model
            .from('ejyy_repair')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_repair.building_id')
            .where('ejyy_repair.id', id)
            .andWhere('ejyy_repair.community_id', community_id)
            .andWhere('dispose_user_id', ctx.pcUserInfo.id)
            .select(
                'ejyy_repair.id',
                'ejyy_repair.wechat_mp_user_id',
                'ejyy_repair.property_company_user_id',
                'ejyy_repair.repair_type',
                'ejyy_repair.building_id',
                'ejyy_repair.description',
                'ejyy_repair.repair_imgs',
                'ejyy_repair.allot_user_id',
                'ejyy_repair.alloted_at',
                'ejyy_repair.dispose_user_id',
                'ejyy_repair.dispose_reply',
                'ejyy_repair.dispose_content',
                'ejyy_repair.dispose_imgs',
                'ejyy_repair.disposed_at',
                'ejyy_repair.finished_at',
                'ejyy_repair.dispose_subscribed',
                'ejyy_repair.confrim_subscribed',
                'ejyy_repair.finish_subscribed',
                'ejyy_repair.merge_id',
                'ejyy_repair.step',
                'ejyy_repair.created_at',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取工单信息'
            });
        }

        if (info.step >= ALLOT_REPAIR_STEP) {
            allotInfo = await ctx.model
                .from('ejyy_property_company_user')
                .where('id', info.allot_user_id)
                .select('id', 'real_name')
                .first();

            disposedInfo = {
                id: ctx.pcUserInfo.id,
                real_name: ctx.pcUserInfo.real_name
            };
        }

        if (info.property_company_user_id) {
            referInfo = await ctx.model
                .from('ejyy_property_company_user')
                .where('id', info.property_company_user_id)
                .select('id', 'real_name')
                .first();
        } else {
            referInfo = await ctx.model
                .from('ejyy_wechat_mp_user')
                .where('id', info.wechat_mp_user_id)
                .select('id', 'real_name')
                .first();
        }

        info.refer = info.property_company_user_id ? 'colleague' : 'owner';

        delete info.allot_user_id;
        delete info.dispose_user_id;
        delete info.property_company_user_id;
        delete info.wechat_mp_user_id;

        ctx.body = {
            code: SUCCESS,
            data: {
                info: {
                    ...info,
                    repair_imgs: info.repair_imgs ? info.repair_imgs.split('#') : [],
                    dispose_imgs: info.dispose_imgs ? info.dispose_imgs.split('#') : []
                },
                referInfo,
                allotInfo,
                disposedInfo
            }
        };
    }
};

export default PcRepairMyDetailAction;
