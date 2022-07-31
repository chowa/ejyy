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
import { SUCCESS, PARAMS_ERROR, QUERY_ILLEFAL, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface ContractItem {
    id?: number;
    title: string;
    descritpion?: string;
    building_id?: string;
    attachment_name?: string;
    attachment_url?: string;
    fee: number;
}

interface RequestBody {
    id: number;
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

const PcContractUpdateAction = <Action>{
    router: {
        path: '/contract/update',
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
                regex: /^1\d{10}$/,
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

                    return val.every(
                        ({ id, title, descritpion, building_id, attachment_url, attachment_name, fee }) => {
                            if (id && !/^\d+$/.test(id)) return false;
                            if (!title || title.length > 56) return false;
                            if (descritpion && descritpion.length > 128) return false;
                            if (building_id && !/^\d+$/.test(building_id)) return false;
                            if ((attachment_url && !attachment_name) || (!attachment_url && attachment_name))
                                return false;
                            if (
                                attachment_url &&
                                !/^\/contract\/[a-z0-9]{32}\.(doc|docx|pdf|xlsx|xls)/.test(attachment_url)
                            )
                                return false;
                            if (attachment_name && attachment_name.length > 128) return false;
                            if (!/^\d+(\.\d+)?$/.test(fee)) return false;

                            return true;
                        }
                    );
                }
            }
        ]
    },
    response: async ctx => {
        const {
            id,
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
        const detail = await ctx.model
            .from('ejyy_contract')
            .where('id', id)
            .andWhere('community_id', community_id)
            .first();

        if (!detail) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改合同'
            });
        }

        if (ctx.pcUserInfo.id !== detail.created_by) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非本人不可修改合同'
            });
        }

        if (detail.finish_time + 7000 * 24 * 60 * 60 < Date.now()) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '合同已经结束一周，不可修改'
            });
        }

        const affect = await ctx.model
            .from('ejyy_contract')
            .update({
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
                contract_fee
            })
            .where('id', id)
            .andWhere('community_id', community_id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '合同修改失败'
            });
        }

        const dbItems = await ctx.model
            .from('ejyy_contract_item')
            .where('contract_id', id)
            .select();
        const hasChange = (saved: ContractItem, changed: ContractItem) => {
            if (saved.title !== changed.title) {
                return true;
            }

            if (saved.descritpion !== changed.descritpion) {
                return true;
            }

            if (saved.building_id !== changed.building_id) {
                return true;
            }

            if (saved.attachment_url !== changed.attachment_url) {
                return true;
            }

            if (saved.attachment_name !== changed.attachment_name) {
                return true;
            }

            if (saved.fee !== changed.fee) {
                return true;
            }

            return false;
        };
        const created_at = Date.now();
        const insertData = [];

        // 删除
        for (let record of dbItems) {
            const index = items.findIndex(item => item.id === record.id);
            const item = items[index];

            if (index > -1) {
                if (hasChange(record, item)) {
                    await ctx.model
                        .from('ejyy_contract_item')
                        .update({
                            title: item.title,
                            descritpion: item.descritpion ? item.descritpion : null,
                            building_id: item.building_id ? item.building_id : null,
                            attachment_name: item.attachment_name ? item.attachment_name : null,
                            attachment_url: item.attachment_url ? item.attachment_url : null,
                            fee: item.fee
                        })
                        .where('id', record.id);
                }
            } else {
                await ctx.model
                    .from('ejyy_contract_item')
                    .where('id', id)
                    .delete();
            }
        }

        items.forEach(item => {
            if (!item.id) {
                insertData.push({
                    contract_id: id,
                    title: item.title,
                    descritpion: item.descritpion ? item.descritpion : null,
                    building_id: item.building_id ? item.building_id : null,
                    attachment_name: item.attachment_name ? item.attachment_name : null,
                    attachment_url: item.attachment_url ? item.attachment_url : null,
                    fee: item.fee,
                    created_at
                });
            }
        });

        if (insertData.length > 0) {
            await ctx.model.from('ejyy_contract_item').insert(insertData);
        }

        ctx.body = {
            code: SUCCESS,
            message: '修改合成成功'
        };
    }
};

export default PcContractUpdateAction;
