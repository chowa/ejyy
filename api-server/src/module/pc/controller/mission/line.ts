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
import { SUCCESS } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import utils from '~/utils';

interface RequestParams {
    complete_id: number;
}

const PcMissionLineAction = <Action>{
    router: {
        path: '/mission/line/:complete_id',
        method: 'get',
        authRequired: true,
        roles: [ROLE.ANYONE]
    },
    validator: {
        params: [
            {
                name: 'complete_id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { complete_id } = <RequestParams>ctx.params;

        const records = await ctx.model
            .from('ejyy_mission_complete_node')
            .leftJoin('ejyy_mission_point', 'ejyy_mission_point.id', 'ejyy_mission_complete_node.point_id')
            .where('ejyy_mission_complete_node.complete_id', complete_id)
            .select(
                'ejyy_mission_complete_node.id',
                'ejyy_mission_complete_node.normal',
                'ejyy_mission_complete_node.remark',
                'ejyy_mission_complete_node.img1',
                'ejyy_mission_complete_node.img2',
                'ejyy_mission_complete_node.img3',
                'ejyy_mission_complete_node.created_at',
                'ejyy_mission_point.local'
            );

        const list = [];

        for (const record of records) {
            const imgs = [record.img1];

            if (record.img2) {
                imgs.push(record.img2);
            }

            if (record.img3) {
                imgs.push(record.img3);
            }

            const like = utils.sql.countReader(
                await ctx.model
                    .from('ejyy_mission_complete_node')
                    .whereNot('id', record.id)
                    .whereIn('img1', imgs)
                    .orWhereIn('img2', imgs)
                    .orWhereIn('img3', imgs)
                    .count()
            );

            list.push({
                imgs,
                like,
                normal: record.normal,
                remark: record.remark,
                local: record.local,
                created_at: record.created_at
            });
        }

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default PcMissionLineAction;
