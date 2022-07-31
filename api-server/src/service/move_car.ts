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

import Knex from 'knex';
import * as redisService from './redis';
import * as ROLE from '~/constant/role_access';

export async function noticePropertyCompany(model: Knex, id: number) {
    const { community_id } = await model
        .from('ejyy_community_info')
        .leftJoin('ejyy_move_car', 'ejyy_move_car.community_id', 'ejyy_community_info.id')
        .where('ejyy_move_car.id', id)
        .select('ejyy_community_info.id as community_id')
        .first();

    redisService.pubish(redisService.WS_NOTICE_TO_PROPERTY_COMPANY, {
        id,
        type: ROLE.XQNC,
        urge: false,
        community_id
    });
}
