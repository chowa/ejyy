/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import {
    WATER_AND_HEATING,
    ELECTRICITY,
    DOOR_AND_WINDOW,
    PUBLIC_FACILITY,
    ALLOT_REPAIR_STEP,
    CONFIRM_REPAIR_STEP,
    FINISH_REPAIR_STEP
} from '~/constant/repair';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    repair_type: typeof WATER_AND_HEATING | typeof ELECTRICITY | typeof DOOR_AND_WINDOW | typeof PUBLIC_FACILITY;
    step: typeof ALLOT_REPAIR_STEP | typeof CONFIRM_REPAIR_STEP | typeof FINISH_REPAIR_STEP;
    refer: 'owner' | 'colleague';
}

const PcRepairMyListAction = <Action>{
    router: {
        path: '/repair/my_list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'repair_type',
                regex: /^1|2|3|4$/
            },
            {
                name: 'step',
                regex: /^2|3|4$/
            },
            {
                name: 'refer',
                regex: /^owner|colleague$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, repair_type, step, refer } = <RequestBody>ctx.request.body;
        const where = {};

        if (repair_type) {
            where['repair_type'] = repair_type;
        }
        if (step) {
            where['step'] = step;
        }

        const list = await ctx.model
            .from('ejyy_repair')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_repair.building_id')
            .where('ejyy_repair.community_id', community_id)
            .andWhere(where)
            .where(function() {
                if (step) {
                    if (step === FINISH_REPAIR_STEP) {
                        this.where('ejyy_repair.step', step).orWhereNotNull('ejyy_repair.merge_id');
                    } else {
                        this.where('ejyy_repair.step', step);
                    }
                }
            })
            .andWhere('ejyy_repair.dispose_user_id', ctx.pcUserInfo.id)
            .andWhere(function() {
                if (refer) {
                    if (refer === 'owner') {
                        this.whereNotNull('ejyy_repair.wechat_mp_user_id');
                    } else {
                        this.whereNotNull('ejyy_repair.property_company_user_id');
                    }
                }
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_repair.id'))
            .select(
                'ejyy_repair.id',
                'ejyy_repair.repair_type',
                'ejyy_repair.description',
                'ejyy_repair.building_id',
                'ejyy_repair.step',
                'ejyy_repair.merge_id',
                'ejyy_repair.created_at',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size
            }
        };
    }
};

export default PcRepairMyListAction;
