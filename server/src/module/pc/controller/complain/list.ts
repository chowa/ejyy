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
import { SUCCESS } from '~/constant/code';
import {
    COMPLAIN,
    SUGGEST,
    COMPLAIN_HEALTH,
    COMPLAIN_NOISE,
    COMPLAIN_SERVICE,
    COMPLAIN_BUILDING,
    COMPLAIN_FIRE_ACCESS,
    COMPLAIN_COMMUNITY_FACILITY,
    COMPLAIN_OTHER,
    SUBMIT_COMPLAIN_STEP,
    ALLOT_COMPLAIN_STEP,
    CONFIRM_COMPLAIN_STEP,
    FINISH_COMPLAIN_STEP
} from '~/constant/complain';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    type: typeof COMPLAIN | typeof SUGGEST;
    category:
        | typeof COMPLAIN_HEALTH
        | typeof COMPLAIN_NOISE
        | typeof COMPLAIN_SERVICE
        | typeof COMPLAIN_BUILDING
        | typeof COMPLAIN_FIRE_ACCESS
        | typeof COMPLAIN_COMMUNITY_FACILITY
        | typeof COMPLAIN_OTHER;
    step:
        | typeof SUBMIT_COMPLAIN_STEP
        | typeof ALLOT_COMPLAIN_STEP
        | typeof CONFIRM_COMPLAIN_STEP
        | typeof FINISH_COMPLAIN_STEP;
    refer: 'ower' | 'colleague';
}

const PcComplainListAction = <Action>{
    router: {
        path: '/complain/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.TSJY],
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
                name: 'type',
                regex: /^1|2$/
            },
            {
                name: 'category',
                regex: /^1|2|3|4|5|6|7$/
            },
            {
                name: 'step',
                regex: /^1|2|3|4$/
            },
            {
                name: 'refer',
                regex: /^ower|colleague$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, type, category, step, refer } = <RequestBody>ctx.request.body;
        const where = {};

        if (type) {
            where['type'] = type;
        }
        if (category) {
            where['category'] = category;
        }

        const list = await ctx.model
            .from('ejyy_complain')
            .where('community_id', community_id)
            .andWhere(where)
            .andWhere(function() {
                if (refer) {
                    if (refer === 'ower') {
                        this.whereNotNull('wechat_mp_user_id');
                    } else {
                        this.whereNotNull('property_company_user_id');
                    }
                }
            })
            .andWhere(function() {
                if (step) {
                    if (step === FINISH_COMPLAIN_STEP) {
                        this.where('step', step).orWhereNotNull('merge_id');
                    } else {
                        this.where('step', step);
                    }
                }
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS id'))
            .select('id', 'type', 'category', 'description', 'step', 'merge_id', 'created_at')
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

export default PcComplainListAction;
