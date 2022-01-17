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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';
import { ALLOT_COMPLAIN_STEP } from '~/constant/complain';
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    id: number;
    community_id: number;
}

const PcComplainMyDetailAction = <Action>{
    router: {
        path: '/complain/my_detail',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'community_id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;
        let allotInfo = null;
        let disposedInfo = null;
        let referInfo = null;

        const info = await ctx.model
            .from('ejyy_complain')
            .where('id', id)
            .andWhere('community_id', community_id)
            .andWhere('dispose_user_id', ctx.pcUserInfo.id)
            .select(
                'id',
                'wechat_mp_user_id',
                'property_company_user_id',
                'type',
                'category',
                'description',
                'complain_imgs',
                'allot_user_id',
                'alloted_at',
                'dispose_user_id',
                'dispose_reply',
                'dispose_content',
                'dispose_imgs',
                'disposed_at',
                'finished_at',
                'dispose_subscribed',
                'confrim_subscribed',
                'finish_subscribed',
                'merge_id',
                'step',
                'created_at'
            )
            .first();

        if (!info) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法获取工单信息'
            });
        }

        if (info.step >= ALLOT_COMPLAIN_STEP) {
            allotInfo = await ctx.model
                .from('ejyy_property_company_user')
                .where('id', info.allot_user_id)
                .select('id', 'real_name')
                .first();

            disposedInfo = {
                id: ctx.pcUserInfo.id,
                real_name: ctx.pcUserInfo.real_name
            };
        }

        if (info.property_company_user_id) {
            referInfo = await ctx.model
                .from('ejyy_property_company_user')
                .where('id', info.property_company_user_id)
                .select('id', 'real_name')
                .first();
        } else {
            referInfo = await ctx.model
                .from('ejyy_wechat_mp_user')
                .where('id', info.wechat_mp_user_id)
                .select('id', 'real_name')
                .first();
        }

        const refer = info.property_company_user_id ? 'colleague' : 'ower';

        delete info.allot_user_id;
        delete info.dispose_user_id;
        delete info.property_company_user_id;
        delete info.wechat_mp_user_id;

        ctx.body = {
            code: SUCCESS,
            data: {
                info: {
                    ...info,
                    refer,
                    complain_imgs: info.complain_imgs ? info.complain_imgs.split('#') : [],
                    dispose_imgs: info.dispose_imgs ? info.dispose_imgs.split('#') : []
                },
                referInfo,
                allotInfo,
                disposedInfo
            }
        };
    }
};

export default PcComplainMyDetailAction;
