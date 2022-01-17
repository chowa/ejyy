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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import utils from '~/utils';

interface RequestBody {
    id: number;
    community_id: number;
    name: string;
    idcard: string;
    phone: string;
}

const PcBuildingRegisteredAction = <Action>{
    router: {
        path: '/building/registered',
        method: 'post',
        authRequired: true,
        verifyCommunity: true,
        roles: [ROLE.FCDA]
    },
    validator: {
        body: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'name',
                max: 8,
                required: true
            },
            {
                name: 'idcard',
                validator: val => utils.idcard.verify(val),
                required: true
            },
            {
                name: 'phone',
                regex: /^1\d{10}$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { community_id, id, name, idcard, phone } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_building_info')
            .where('community_id', community_id)
            .andWhere('id', id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法更新初始业主信息'
            });
        }

        const gender = utils.idcard.gender(idcard);

        const [insertId] = await ctx.model.from('ejyy_property_company_building_registered').insert({
            building_id: id,
            name,
            idcard,
            phone,
            gender,
            created_by: ctx.pcUserInfo.id,
            created_at: Date.now()
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id: insertId,
                gender
            }
        };
    }
};

export default PcBuildingRegisteredAction;
