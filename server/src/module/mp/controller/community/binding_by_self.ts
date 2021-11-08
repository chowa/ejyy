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
import { EjyyUserBuilding } from '~/types/model';
import { SUCCESS, NOT_FOUND_BINDING_BUILDING } from '~/constant/code';
import { AUTHENTICTED_BY_SELF } from '~/constant/authenticated_type';
import communityService from '~/service/community';

// 通过物业后台录入手机号业主自动绑定
const MpCommunityBindingBySlefAction = <Action>{
    router: {
        path: '/community/binding_by_self',
        method: 'get',
        authRequired: true,
        verifyIntact: true
    },
    response: async ctx => {
        const unbindingList = await ctx.model
            .from('ejyy_property_company_building_registered')
            .where(function() {
                this.where('idcard', ctx.mpUserInfo.idcard).orWhere('phone', ctx.mpUserInfo.phone);
            })
            .andWhere('name', ctx.mpUserInfo.real_name)
            .whereNotIn('building_id', function() {
                this.from('ejyy_user_building')
                    .where('wechat_mp_user_id', ctx.mpUserInfo.id)
                    .select('building_id');
            })
            .select('id', 'building_id', 'name');

        if (unbindingList.length === 0) {
            return (ctx.body = {
                code: NOT_FOUND_BINDING_BUILDING,
                message: '未检索到可以关联绑定的住宅信息'
            });
        }

        const bindingData: EjyyUserBuilding[] = [];

        for (const record of unbindingList) {
            bindingData.push({
                building_id: record.building_id,
                wechat_mp_user_id: ctx.mpUserInfo.id,
                authenticated: 1,
                authenticated_type: AUTHENTICTED_BY_SELF,
                authenticated_user_id: ctx.mpUserInfo.id,
                created_at: Date.now()
            });
        }

        await ctx.model.from('ejyy_user_building').insert(bindingData);

        const communityInfo = await communityService(ctx.model, ctx.mpUserInfo.id);

        ctx.body = {
            code: SUCCESS,
            data: {
                communityInfo
            }
        };
    }
};

export default MpCommunityBindingBySlefAction;
