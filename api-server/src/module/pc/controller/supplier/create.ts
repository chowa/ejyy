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
import { SUCCESS, MATERIAL_SUPPLIER_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    title: string;
    linkman: string;
    phone: string;
    business: string;
    bank_name?: string;
    bank_id?: string;
    bank_address?: string;
}

const PcSupplierCreateAction = <Action>{
    router: {
        path: '/supplier/create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WLCC]
    },
    validator: {
        body: [
            {
                name: 'title',
                max: 128,
                required: true
            },
            {
                name: 'linkman',
                max: 12,
                required: true
            },
            {
                name: 'phone',
                max: 11,
                required: true
            },
            {
                name: 'business',
                max: 512,
                required: true
            },
            {
                name: 'bank_name',
                max: 56
            },
            {
                name: 'bank_id',
                max: 56
            },
            {
                name: 'bank_address',
                max: 128
            }
        ]
    },
    response: async ctx => {
        const { title, linkman, phone, business, bank_name, bank_id, bank_address } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_material_supplier')
            .where('title', title)
            .first();

        if (exist) {
            return (ctx.body = {
                code: MATERIAL_SUPPLIER_EXIST,
                message: '供应商已存在'
            });
        }

        const created_at = Date.now();
        const [id] = await ctx.model.from('ejyy_material_supplier').insert({
            title,
            linkman,
            phone,
            business,
            bank_name: bank_name ? bank_name : null,
            bank_id: bank_id ? bank_id : null,
            bank_address: bank_address ? bank_address : null,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                created_at,
                id
            }
        };
    }
};

export default PcSupplierCreateAction;
