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
import { SUCCESS, URGE_FAIL_ON_FINISH_REPAIR, QUERY_ILLEFAL, EXCED_ALLOW_FREQUENCY } from '~/constant/code';
import { FINISH_REPAIR_STEP, SUBMIT_REPAIR_STEP } from '~/constant/repair';
import * as repairService from '~/service/repair';

interface RequestParams {
    id: number;
}

const MpRepairUrgeAction = <Action>{
    router: {
        path: '/repair/urge/:id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        params: [
            {
                name: 'id',
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const record = await ctx.model
            .from('ejyy_repair')
            .where('id', id)
            .andWhere('wechat_mp_user_id', ctx.mpUserInfo.id)
            .first();

        if (!record) {
            return (ctx.body = {
                code: QUERY_ILLEFAL
            });
        }

        if (record.step === FINISH_REPAIR_STEP) {
            return (ctx.body = {
                code: URGE_FAIL_ON_FINISH_REPAIR,
                message: '工单已完成，催促功能禁用'
            });
        }

        let last_urged_at = record.created_at;

        if (record.step !== SUBMIT_REPAIR_STEP) {
            const urgeRow = await ctx.model
                .from('ejyy_repair_urge')
                .where('repair_id', id)
                .orderBy('id', 'desc')
                .first();

            last_urged_at = !urgeRow ? last_urged_at : urgeRow.created_at;
        }

        if (Date.now() - last_urged_at < 5 * 60 * 1000) {
            return (ctx.body = {
                code: EXCED_ALLOW_FREQUENCY,
                message: '距上次催促时间不足5分钟'
            });
        }

        await ctx.model.from('ejyy_repair_urge').insert({
            repair_id: id,
            step: record.step,
            created_at: Date.now()
        });

        repairService.userUrge(ctx.model, id);

        ctx.body = {
            code: SUCCESS,
            message: '工单催促成功'
        };
    }
};

export default MpRepairUrgeAction;
