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
import { SUCCESS, DATA_MODEL_UPDATE_FAIL, MODEL_FIELD_VALUE_EXIST } from '~/constant/code';

interface RequestBody {
    name: string;
    id: number;
}

const PcJobUpdateAction = <Action>{
    router: {
        path: '/job/update',
        method: 'post',
        authRequired: true,
        roles: []
    },
    validator: {
        body: [
            {
                name: 'name',
                required: true,
                max: 12
            },
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { name, id } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_property_company_job')
            .where('name', name)
            .andWhere('id', '<>', id)
            .first();

        if (exist) {
            return (ctx.body = {
                code: MODEL_FIELD_VALUE_EXIST,
                message: '岗位已存在'
            });
        }

        const affect = await ctx.model
            .from('ejyy_property_company_job')
            .update({ name })
            .where('id', id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '更新部门信息失败'
            });
        }

        ctx.body = {
            code: SUCCESS,
            message: '更新部门信息成功'
        };
    }
};

export default PcJobUpdateAction;
