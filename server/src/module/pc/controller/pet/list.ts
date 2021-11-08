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
import { MALE, FEMALE } from '~/constant/pet';
import * as ROLE from '~/constant/role_access';
import { TRUE, FALSE } from '~/constant/status';
interface RequestBody {
    page_num: number;
    page_size: number;
    community_id: number;
    breed?: string;
    license?: boolean;
    sex?: typeof MALE | typeof FEMALE;
    coat_color?: string;
    remove: typeof TRUE | typeof FALSE;
}

const PcPetListAction = <Action>{
    router: {
        path: '/pet/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.CWDA],
        verifyCommunity: true
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
            },
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'breed',
                max: 8
            },
            {
                name: 'license',
                regex: /^true|false$/
            },
            {
                name: 'sex',
                validator: val => val === FEMALE || val === MALE
            },
            {
                name: 'coat_color',
                max: 5
            },
            {
                name: 'TRUE',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, breed, license, sex, coat_color, remove } = <RequestBody>(
            ctx.request.body
        );
        const where = {};

        if (breed) {
            where['breed'] = breed;
        }
        if (sex !== undefined) {
            where['sex'] = sex;
        }
        if (coat_color) {
            where['coat_color'] = coat_color.indexOf('色') > -1 ? coat_color : `${coat_color}色`;
        }
        if (remove !== undefined) {
            where['remove'] = remove;
        }

        const list = await ctx.model
            .from('ejyy_pet')
            .where('community_id', community_id)
            .andWhere(where)
            .andWhere(function() {
                if (typeof license === 'boolean') {
                    if (license) {
                        this.whereNotNull('pet_license');
                    } else {
                        this.whereNull('pet_license');
                    }
                }
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS id'))
            .select('id', 'name', 'sex', 'pet_type', 'coat_color', 'breed', 'pet_license', 'remove', 'created_at')
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('id', 'desc');

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

export default PcPetListAction;
