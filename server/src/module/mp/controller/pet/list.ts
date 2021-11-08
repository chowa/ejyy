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
import { SUCCESS } from '~/constant/code';
import { FALSE } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpPetListAction = <Action>{
    router: {
        path: '/pet/list',
        method: 'post',
        authRequired: true,
        verifyIntact: true
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
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_pet')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_pet.community_id')
            .where('wechat_mp_user_id', ctx.mpUserInfo.id)
            .andWhere('ejyy_pet.remove', FALSE)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_pet.id'))
            .select(
                'ejyy_pet.id',
                'ejyy_pet.name',
                'ejyy_pet.sex',
                'ejyy_pet.pet_type',
                'ejyy_pet.coat_color',
                'ejyy_pet.breed',
                'ejyy_pet.photo',
                'ejyy_pet.pet_license',
                'ejyy_pet.created_at',
                'ejyy_community_info.name as community_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_pet.id', 'desc');

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

export default MpPetListAction;
