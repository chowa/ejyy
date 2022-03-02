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
import { SUCCESS } from '~/constant/code';
import { TRUE, FALSE } from '~/constant/status';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    finish?: boolean;
    have_concat_info?: boolean;
}

const PcMoveCarListAction = <Action>{
    router: {
        path: '/move_car/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XQNC],
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
                name: 'finish',
                regex: /^true|false$/
            },
            {
                name: 'have_concat_info',
                regex: /^true|false$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, finish, have_concat_info } = <RequestBody>ctx.request.body;
        const where = {};

        if (have_concat_info) {
            where['have_concat_info'] = have_concat_info ? TRUE : FALSE;
        }

        const list = await ctx.model
            .from('ejyy_move_car')
            .where('community_id', community_id)
            .andWhere(where)
            .andWhere(function() {
                if (finish !== undefined) {
                    if (finish) {
                        this.whereNotNull('responsed_at');
                    } else {
                        this.whereNull('responsed_at');
                    }
                }
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS id'))
            .select('id', 'car_number', 'move_reason', 'have_concat_info', 'responsed_at', 'created_at')
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

export default PcMoveCarListAction;
