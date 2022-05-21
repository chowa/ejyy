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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcContractDetailAction = <Action>{
    router: {
        path: '/contract/detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.HTGL],
        verifyCommunity: true
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
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const info = await ctx.model
            .from('ejyy_contract')
            .leftJoin('ejyy_contract_category', 'ejyy_contract_category.id', 'ejyy_contract.category_id')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_contract.created_by')
            .leftJoin('ejyy_wechat_mp_user', 'ejyy_wechat_mp_user.id', 'ejyy_contract.second_party_wechat_mp_user_id')
            .where('ejyy_contract.id', id)
            .andWhere('ejyy_contract.community_id', community_id)
            .select(
                'ejyy_contract.id',
                'ejyy_contract.title',
                'ejyy_contract.category_id',
                'ejyy_contract.first_party',
                'ejyy_contract.first_party_linkman',
                'ejyy_contract.first_party_phone',
                'ejyy_contract.second_party',
                'ejyy_contract.second_party_linkman',
                'ejyy_contract.second_party_phone',
                'ejyy_contract.begin_time',
                'ejyy_contract.finish_time',
                'ejyy_contract.contract_fee',
                'ejyy_contract.created_at',
                'ejyy_contract_category.name as category',
                'ejyy_property_company_user.id as created_user_id',
                'ejyy_property_company_user.real_name as created_user_real_name',
                'ejyy_wechat_mp_user.id as second_party_user_id',
                'ejyy_wechat_mp_user.real_name as second_party_user_real_name',
                'ejyy_wechat_mp_user.phone as ower_phone'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取合同信息'
            });
        }

        const items = await ctx.model
            .from('ejyy_contract_item')
            .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_contract_item.building_id')
            .where('contract_id', id)
            .select(
                'ejyy_contract_item.id',
                'ejyy_contract_item.title',
                'ejyy_contract_item.descritpion',
                'ejyy_contract_item.building_id',
                'ejyy_contract_item.attachment_url',
                'ejyy_contract_item.attachment_name',
                'ejyy_contract_item.fee',
                'ejyy_contract_item.created_at',
                'ejyy_building_info.type',
                'ejyy_building_info.area',
                'ejyy_building_info.building',
                'ejyy_building_info.unit',
                'ejyy_building_info.number'
            );

        ctx.body = {
            code: SUCCESS,
            data: {
                info,
                items
            }
        };
    }
};

export default PcContractDetailAction;
