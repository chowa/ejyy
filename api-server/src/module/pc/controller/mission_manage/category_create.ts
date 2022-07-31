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
import { SUCCESS, MISSION_CATEGORY_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    name: string;
    description: string;
}

const PcMissionManageCategoryCreateAction = <Action>{
    router: {
        path: '/mission_manage/category_create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.XJRW]
    },
    validator: {
        body: [
            {
                name: 'name',
                max: 56,
                required: true
            },
            {
                name: 'description',
                max: 128
            }
        ]
    },
    response: async ctx => {
        const { name, description } = <RequestBody>ctx.request.body;

        const exist = await ctx.model
            .from('ejyy_mission_category')
            .andWhere('name', name)
            .first();

        if (exist) {
            return (ctx.body = {
                code: MISSION_CATEGORY_EXIST,
                message: '任务分类已存在'
            });
        }

        const created_at = Date.now();

        const [id] = await ctx.model.from('ejyy_mission_category').insert({
            name,
            description: description ? description : null,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        ctx.body = {
            code: SUCCESS,
            data: {
                id,
                created_at
            }
        };
    }
};

export default PcMissionManageCategoryCreateAction;
