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

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';
import { SYSTEM_NOTICE } from '~/constant/notice';
import { TRUE, BINDING_BUILDING } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpNoticeUnreadAction = <Action>{
    router: {
        path: '/notice/unread',
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
            .from('ejyy_notice_to_user')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_notice_to_user.community_id')
            .where(function() {
                this.whereIn('ejyy_notice_to_user.community_id', function() {
                    this.from('ejyy_user_building')
                        .leftJoin('ejyy_building_info', 'ejyy_building_info.id', 'ejyy_user_building.building_id')
                        .where('status', BINDING_BUILDING)
                        .andWhere('wechat_mp_user_id', ctx.mpUserInfo.id)
                        .select('ejyy_building_info.community_id');
                }).orWhere('ejyy_notice_to_user.refer', SYSTEM_NOTICE);
            })
            .whereNotIn('ejyy_notice_to_user.id', function() {
                this.from('ejyy_notice_to_user_readed')
                    .where('wechat_mp_user_id', ctx.mpUserInfo.id)
                    .select('notice_id');
            })
            .andWhere('ejyy_notice_to_user.created_at', '>=', ctx.mpUserInfo.created_at)
            .andWhere('ejyy_notice_to_user.published', TRUE)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_notice_to_user.id'))
            .select(
                'ejyy_notice_to_user.id',
                'ejyy_notice_to_user.title',
                'ejyy_notice_to_user.overview',
                'ejyy_notice_to_user.refer',
                'ejyy_community_info.name as scope',
                'ejyy_notice_to_user.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_notice_to_user.id', 'desc');

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

export default MpNoticeUnreadAction;
