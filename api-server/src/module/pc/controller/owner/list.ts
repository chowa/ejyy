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
import { TRUE, FALSE } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    phone?: string;
    subscribed?: typeof TRUE | typeof FALSE;
}

const PcOwerListAction = <Action>{
    router: {
        path: '/owner/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.YZDA],
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
                name: 'phone',
                regex: /^1\d{10}$/
            },
            {
                name: 'subscribed',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { community_id, page_num, page_size, phone, subscribed } = <RequestBody>ctx.request.body;
        const where = {};

        if (phone) {
            where['ejyy_wechat_mp_user.phone'] = phone;
        }

        const list = await ctx.model
            .from('ejyy_wechat_mp_user')
            .leftJoin(
                'ejyy_wechat_official_accounts_user',
                'ejyy_wechat_official_accounts_user.union_id',
                'ejyy_wechat_mp_user.union_id'
            )
            .where(where)
            .whereIn('ejyy_wechat_mp_user.id', function() {
                this.from('ejyy_building_info')
                    .leftJoin('ejyy_user_building', 'ejyy_user_building.building_id', 'ejyy_building_info.id')
                    .where('ejyy_building_info.community_id', community_id)
                    .select('ejyy_user_building.wechat_mp_user_id');
            })
            .andWhere(function() {
                if (subscribed !== undefined) {
                    if (subscribed) {
                        this.where('ejyy_wechat_official_accounts_user.subscribed', subscribed);
                    } else {
                        this.where('ejyy_wechat_official_accounts_user.subscribed', subscribed).orWhereNull(
                            'ejyy_wechat_official_accounts_user.subscribed'
                        );
                    }
                }
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_wechat_mp_user.id'))
            .select(
                'ejyy_wechat_mp_user.id',
                'ejyy_wechat_mp_user.real_name',
                'ejyy_wechat_mp_user.nick_name',
                'ejyy_wechat_mp_user.gender',
                'ejyy_wechat_mp_user.intact',
                'ejyy_wechat_mp_user.created_at',
                'ejyy_wechat_official_accounts_user.subscribed'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_wechat_mp_user.id', 'desc');

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

export default PcOwerListAction;
