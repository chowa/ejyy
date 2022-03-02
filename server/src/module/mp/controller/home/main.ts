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
import { SYSTEM_NOTICE } from '~/constant/notice';
import { TRUE, BINDING_BUILDING } from '~/constant/status';
import utils from '~/utils';

interface RequestParams {
    community_id: number;
}

const MpHomeMainAction = <Action>{
    router: {
        path: '/home/main/:community_id',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    response: async ctx => {
        const { community_id } = <RequestParams>ctx.params;

        const topic = await ctx.model
            .from('ejyy_topic')
            .where('published', TRUE)
            .andWhere('community_id', community_id)
            .select('id', 'banner_img', 'title')
            .orderBy('id', 'desc');

        const virus = await ctx.model
            .from('ejyy_virus')
            .where('success', TRUE)
            .orderBy('id', 'desc')
            .first();

        const unread_amount = utils.sql.countReader(
            await ctx.model
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
                .count()
        );

        const notice = await ctx.model
            .from('ejyy_notice_to_user')
            .where('community_id', community_id)
            .andWhere('published', TRUE)
            .limit(3)
            .offset(0)
            .select('id', 'title', 'overview', 'created_at')
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                topic,
                virus: virus.content,
                unread_amount,
                notice
            }
        };
    }
};

export default MpHomeMainAction;
