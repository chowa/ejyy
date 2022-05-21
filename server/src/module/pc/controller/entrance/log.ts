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
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
}

const PcEntranceLogAction = <Action>{
    router: {
        path: '/entrance/log',
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
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_iot_entrance_log')
            .leftJoin('ejyy_iot_entrance', 'ejyy_iot_entrance.id', 'ejyy_iot_entrance_log.entrance_id')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_iot_entrance_log.wechat_mp_user_id')
            .leftJoin('ejyy_vistor', 'ejyy_vistor.id', 'ejyy_iot_entrance_log.vistor_id')
            .where('ejyy_iot_entrance.community_id', community_id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_iot_entrance_log.id'))
            .select(
                'ejyy_iot_entrance_log.id',
                'ejyy_iot_entrance_log.method',
                'ejyy_iot_entrance_log.created_at',
                'ejyy_iot_entrance_log.wechat_mp_user_id as ower_id',
                'ejyy_wechat_mp_user.real_name as ower_real_name',
                'ejyy_iot_entrance_log.vistor_id',
                'ejyy_vistor.vistor_name',
                'ejyy_iot_entrance.name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_iot_entrance_log.id', 'desc');

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

export default PcEntranceLogAction;
