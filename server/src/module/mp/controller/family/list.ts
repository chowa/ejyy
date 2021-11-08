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
import { BINDING_BUILDING } from '~/constant/status';

const MpFamilyListAction = <Action>{
    router: {
        path: '/family/list',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    response: async ctx => {
        const list = await ctx.model
            .from('ejyy_wechat_mp_user')
            .whereIn('id', function() {
                this.from('ejyy_user_building')
                    .whereIn('building_id', function() {
                        this.from('ejyy_user_building')
                            .where('wechat_mp_user_id', ctx.mpUserInfo.id)
                            .where('status', BINDING_BUILDING)
                            .select('building_id');
                    })
                    .where('status', BINDING_BUILDING)
                    .andWhereNot('wechat_mp_user_id', ctx.mpUserInfo.id)
                    .select('wechat_mp_user_id');
            })
            .select('id', 'nick_name', 'avatar_url', 'signature');

        ctx.body = {
            code: SUCCESS,
            data: {
                list
            }
        };
    }
};

export default MpFamilyListAction;
