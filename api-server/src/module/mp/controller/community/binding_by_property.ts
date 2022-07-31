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
import { EjyyUserBuilding } from '~/types/model';
import { SUCCESS, QRCODE_ILLEGAL, QRCODE_EXPIRED, NOT_FOUND_BINDING_BUILDING } from '~/constant/code';
import { AUTHENTICTED_BY_PROPERTY_COMPANY } from '~/constant/authenticated_type';
import utils from '~/utils';
import communityService from '~/service/community';
import config from '~/config';

interface RequestBody {
    qrcontent: string;
}

const MpCommunityBindingByPropertyAction = <Action>{
    router: {
        path: '/community/binding_by_property',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'qrcontent',
                required: true
            }
        ]
    },
    response: async ctx => {
        const { qrcontent } = <RequestBody>ctx.request.body;
        const qrInfo = utils.community.decrypt(qrcontent);

        if (!qrInfo.success || qrInfo.authenticated_type !== AUTHENTICTED_BY_PROPERTY_COMPANY) {
            return (ctx.body = {
                code: QRCODE_ILLEGAL,
                message: '非法二维码，系统已拒绝'
            });
        }

        if (Date.now() - qrInfo.stamp > config.community.expire) {
            return (ctx.body = {
                code: QRCODE_EXPIRED,
                message: '二维码已过期，请重新扫描'
            });
        }

        const buildingsInfo = await ctx.model
            .from('ejyy_building_info')
            .leftJoin('ejyy_user_building', 'ejyy_user_building.building_id', 'ejyy_building_info.id')
            .whereIn('ejyy_building_info.id', qrInfo.building_ids)
            .where('ejyy_user_building.building_id', null)
            .select('ejyy_building_info.id');

        if (buildingsInfo.length === 0) {
            return (ctx.body = {
                code: NOT_FOUND_BINDING_BUILDING,
                message: '未检索到需要关联绑定的住宅信息'
            });
        }

        const bindingData: EjyyUserBuilding[] = [];

        for (const buildindInfo of buildingsInfo) {
            bindingData.push({
                building_id: buildindInfo.id,
                wechat_mp_user_id: ctx.mpUserInfo.id,
                authenticated: 1,
                authenticated_type: qrInfo.authenticated_type,
                authenticated_user_id: qrInfo.user_id,
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

export default MpCommunityBindingByPropertyAction;
