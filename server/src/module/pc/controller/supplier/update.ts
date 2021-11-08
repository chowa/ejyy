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
import { SUCCESS, MATERIAL_SUPPLIER_EXIST, QUERY_ILLEFAL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    title: string;
    linkman: string;
    phone: string;
    business: string;
    bank_name?: string;
    bank_id?: string;
    bank_address?: string;
}

const PcSupplierUpdateAction = <Action>{
    router: {
        path: '/supplier/update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.WLCC]
    },
    validator: {
        body: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
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
        const { id, title, linkman, phone, business, bank_name, bank_id, bank_address } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_material_supplier')
            .where('id', id)
            .first();

        if (!exist) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法操作'
            });
        }

        const repeat = await ctx.model
            .from('ejyy_material_supplier')
            .where('title', title)
            .andWhereNot('id', id)
            .first();

        if (repeat) {
            return (ctx.body = {
                code: MATERIAL_SUPPLIER_EXIST,
                message: '供货商已存在'
            });
        }

        await ctx.model
            .from('ejyy_material_supplier')
            .update({
                title,
                linkman,
                phone,
                business,
                bank_name: bank_name ? bank_name : null,
                bank_id: bank_id ? bank_id : null,
                bank_address: bank_address ? bank_address : null
            })
            .andWhere('id', id);

        ctx.body = {
            code: SUCCESS
        };
    }
};

export default PcSupplierUpdateAction;
