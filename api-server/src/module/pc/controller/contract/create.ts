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
import { SUCCESS, PARAMS_ERROR } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface ContractItem {
    title: string;
    descritpion?: string;
    building_id?: string;
    attachment_name?: string;
    attachment_url?: string;
    fee: number;
}

interface RequestBody {
    community_id: number;
    title: string;
    category_id: number;
    first_party: string;
    first_party_linkman: string;
    first_party_phone: string;
    second_party?: string;
    second_party_linkman?: string;
    second_party_phone?: string;
    second_party_wechat_mp_user_id?: number;
    begin_time: number;
    finish_time: number;
    contract_fee: number;
    items: ContractItem[];
}

const PcContractCreateAction = <Action>{
    router: {
        path: '/contract/create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.HTGL],
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
                name: 'title',
                max: 56,
                required: true
            },
            {
                name: 'category_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'first_party',
                max: 56,
                required: true
            },
            {
                name: 'first_party_linkman',
                max: 8,
                required: true
            },
            {
                name: 'first_party_phone',
                regex: /^\d{11}$/,
                required: true
            },
            {
                name: 'second_party',
                max: 56
            },
            {
                name: 'second_party_linkman',
                max: 8
            },
            {
                name: 'second_party_phone',
                regex: /^\d{11}$/
            },
            {
                name: 'second_party_wechat_mp_user_id',
                regex: /^\d+$/
            },
            {
                name: 'begin_time',
                regex: /^\d{13}$/,
                required: true
            },
            {
                name: 'finish_time',
                regex: /^\d{13}$/,
                required: true
            },
            {
                name: 'contract_fee',
                regex: /^\d+(\.\d+)?$/,
                required: true
            },
            {
                name: 'items',
                required: true,
                min: 1,
                validator: val => {
                    if (!Array.isArray(val)) return false;

                    return val.every(({ title, descritpion, building_id, attachment_url, attachment_name, fee }) => {
                        if (!title || title.length > 56) return false;
                        if (descritpion && descritpion.length > 128) return false;
                        if (building_id && !/^\d+$/.test(building_id)) return false;
                        if ((attachment_url && !attachment_name) || (!attachment_url && attachment_name)) return false;
                        if (
                            attachment_url &&
                            !/^\/contract\/[a-z0-9]{32}\.(doc|docx|pdf|xlsx|xls)/.test(attachment_url)
                        )
                            return false;
                        if (attachment_name && attachment_name.length > 128) return false;
                        if (!/^\d+(\.\d+)?$/.test(fee)) return false;

                        return true;
                    });
                }
            }
        ]
    },
    response: async ctx => {
        const {
            community_id,
            title,
            category_id,
            first_party,
            first_party_linkman,
            first_party_phone,
            second_party,
            second_party_linkman,
            second_party_phone,
            second_party_wechat_mp_user_id,
            begin_time,
            finish_time,
            contract_fee,
            items
        } = <RequestBody>ctx.request.body;

        if (!second_party_wechat_mp_user_id && (!second_party || !second_party_linkman || !second_party_phone)) {
            return (ctx.body = {
                code: PARAMS_ERROR,
                message: '参数错误'
            });
        }
        const created_at = Date.now();

        const [id] = await ctx.model.from('ejyy_contract').insert({
            community_id,
            title,
            category_id,
            first_party,
            first_party_linkman,
            first_party_phone,
            second_party: second_party ? second_party : null,
            second_party_linkman: second_party_linkman ? second_party_linkman : null,
            second_party_phone: second_party_phone ? second_party_phone : null,
            second_party_wechat_mp_user_id: second_party_wechat_mp_user_id ? second_party_wechat_mp_user_id : null,
            begin_time,
            finish_time,
            contract_fee,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        const insertData = [];
        items.forEach(({ title, descritpion, building_id, attachment_name, attachment_url, fee }) => {
            insertData.push({
                contract_id: id,
                title,
                descritpion: descritpion ? descritpion : null,
                building_id: building_id ? building_id : null,
                attachment_name: attachment_name ? attachment_name : null,
                attachment_url: attachment_url ? attachment_url : null,
                fee,
                created_at
            });
        });

        await ctx.model.from('ejyy_contract_item').insert(insertData);

        ctx.body = {
            code: SUCCESS,
            data: {
                id
            }
        };
    }
};

export default PcContractCreateAction;
