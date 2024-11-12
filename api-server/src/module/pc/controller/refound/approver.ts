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
import { FALSE, TRUE } from '~/constant/status';
import { WORKFLOW_NODE_APPROVER } from '~/constant/workflow';

interface RequestBody {
    page_num: number;
    page_size: number;
    status?: typeof FALSE | typeof TRUE;
    community_id: number;
}

const PcRefoundApproverAction = <Action>{
    router: {
        path: '/refound/approver',
        method: 'post',
        authRequired: true,
        roles: [ROLE.RLZY]
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
                name: 'status',
                regex: /^0|1$/
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size, community_id, status } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_refound')
            .leftJoin('ejyy_property_company_user', 'ejyy_property_company_user.id', 'ejyy_refound.created_by')
            .andWhere('ejyy_refound.community_id', community_id)
            .whereIn('ejyy_refound.id', function() {
                this.from('ejyy_refound_flow')
                    .where('node_type', WORKFLOW_NODE_APPROVER)
                    .andWhere('relation_user_id', ctx.pcUserInfo.id)
                    .andWhere(function() {
                        if (status !== undefined) {
                            this.where('finish', status);
                        }
                    })
                    .select('parent_id');
            })
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_refound.id'))
            .select(
                'ejyy_refound.id',
                'ejyy_refound.created_by',
                'ejyy_property_company_user.real_name',
                'ejyy_refound.begin_date',
                'ejyy_refound.finish_date',
                'ejyy_refound.reason',
                'ejyy_refound.total',
                'ejyy_refound.success',
                'ejyy_refound.cancel',
                'ejyy_refound.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_refound.id', 'desc');

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

export default PcRefoundApproverAction;
