/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { EjyyUserBuilding } from '~/types/model';
import { SUCCESS, QRCODE_ILLEGAL, QRCODE_EXPIRED, NOT_FOUND_BINDING_BUILDING } from '~/constant/code';
import { NORMAL_STATUS } from '~/constant/status';
import { AUTHENTICTED_BY_FAMILY } from '~/constant/authenticated_type';
import utils from '~/utils';
import communityService from '~/service/community';
import config from '~/config';

interface RequestBody {
    qrcontent: string;
}

const MpCommunityBindingByFamliyAction = <Action>{
    router: {
        path: '/community/binding_by_family',
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

        if (
            !qrInfo.success ||
            qrInfo.authenticated_type !== AUTHENTICTED_BY_FAMILY ||
            qrInfo.user_id === ctx.mpUserInfo.id
        ) {
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

        const familyList = await ctx.model
            .from('ejyy_user_building')
            .whereIn('building_id', qrInfo.building_ids)
            .where({ wechat_mp_user_id: qrInfo.user_id })
            .andWhere('status', NORMAL_STATUS)
            .select('building_id');

        const selfList = await ctx.model
            .from('ejyy_user_building')
            .whereIn('building_id', qrInfo.building_ids)
            .where({ wechat_mp_user_id: ctx.mpUserInfo.id })
            .andWhere('status', NORMAL_STATUS)
            .select('building_id');

        const buildings = [];

        familyList.forEach(({ building_id }) => {
            const inexistence = selfList.every(record => {
                if (record.building_id === building_id) {
                    return false;
                }

                return true;
            });

            if (inexistence || selfList.length === 0) {
                buildings.push(building_id);
            }
        });

        if (buildings.length === 0) {
            return (ctx.body = {
                code: NOT_FOUND_BINDING_BUILDING,
                message: '未检索到需要关联绑定的住宅信息'
            });
        }

        const bindingData: EjyyUserBuilding[] = [];

        for (const building_id of buildings) {
            bindingData.push({
                building_id,
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

export default MpCommunityBindingByFamliyAction;
