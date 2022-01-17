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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR, DATA_MODEL_UPDATE_FAIL } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import { FALSE } from '~/constant/status';
import utils from '~/utils';

interface RequestParams {
    id: number;
}

const PcHrRecoverAction = <Action>{
    router: {
        path: '/hr/recover/:id',
        method: 'get',
        authRequired: true,
        roles: [ROLE.RLZY]
    },
    validator: {
        params: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const info = await ctx.model
            .from('ejyy_property_company_user')
            .where('id', id)
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取人事信息'
            });
        }

        if (info.leave_office === FALSE) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '人事状态错误'
            });
        }

        // 是否有其他公司入职记录
        const joinTotal = utils.sql.countReader(
            await ctx.model
                .from('ejyy_property_company_user')
                .where('open_id', info.open_id)
                .count()
        );

        if (joinTotal > 1) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '当前员工入职过其他公司，请重新建立员工档案'
            });
        }

        const affect = await ctx.model
            .from('ejyy_property_company_user')
            .update('leave_office', FALSE)
            .where('id', id);

        if (affect !== 1) {
            return (ctx.body = {
                code: DATA_MODEL_UPDATE_FAIL,
                message: '人事恢复入职失败'
            });
        }

        const created_at = Date.now();

        await ctx.model.from('ejyy_property_company_user_join_record').insert({
            property_company_user_id: id,
            status: FALSE,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        ctx.body = {
            code: SUCCESS,
            message: '人事恢复入职成功',
            data: {
                created_at
            }
        };
    }
};

export default PcHrRecoverAction;
