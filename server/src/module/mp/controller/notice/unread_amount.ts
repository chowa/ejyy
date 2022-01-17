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
import { SUCCESS } from '~/constant/code';
import { SYSTEM_NOTICE } from '~/constant/notice';
import { TRUE, BINDING_BUILDING } from '~/constant/status';

// 新版废弃，移动到home main下
const MpNoticeUnreadAmountAction = <Action>{
    router: {
        path: '/notice/unread_amount',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    response: async ctx => {
        const [res] = await ctx.model
            .from('ejyy_notice_to_user')
            .where(function() {
                this.whereIn('community_id', function() {
                    this.from('ejyy_user_building')
                        .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_building.building_id')
                        .where('status', BINDING_BUILDING)
                        .andWhere('wechat_mp_user_id', ctx.mpUserInfo.id)
                        .select('ejyy_building_info.community_id');
                }).orWhere('refer', SYSTEM_NOTICE);
            })
            .whereNotIn('id', function() {
                this.from('ejyy_notice_to_user_readed')
                    .where('wechat_mp_user_id', ctx.mpUserInfo.id)
                    .select('notice_id');
            })
            .andWhere('published', TRUE)
            .andWhere('created_at', '>=', ctx.mpUserInfo.created_at)
            .count({ count: 'id' });

        ctx.body = {
            code: SUCCESS,
            data: {
                unread_amount: res.count
            }
        };
    }
};

export default MpNoticeUnreadAmountAction;
