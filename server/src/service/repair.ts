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

import Knex from 'knex';
import * as redisService from './redis';
import * as ROLE from '~/constant/role_access';

async function send(model: Knex, id: number, urge = false) {
    const { community_id } = await model
        .from('ejyy_community_info')
        .leftJoin('ejyy_repair', 'ejyy_repair.community_id', 'ejyy_community_info.id')
        .where('ejyy_repair.id', id)
        .select('ejyy_community_info.id as community_id')
        .first();

    redisService.pubish(redisService.WS_NOTICE_TO_PROPERTY_COMPANY, {
        id,
        type: ROLE.WXWF,
        urge,
        community_id
    });
}

export async function noticePropertyCompany(model: Knex, id: number) {
    send(model, id);
}

// 用户催促工单
export function userUrge(model: Knex, id: number) {
    send(model, id, true);
}
