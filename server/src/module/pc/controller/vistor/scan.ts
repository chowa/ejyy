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
import { SUCCESS, VISTOR_QRCODE_ERROR, VISTOR_QRCODE_EXPIRED, VISTOR_QRCODE_USED } from '~/constant/code';
import * as ROLE from '~/constant/role_access';
import utils from '~/utils';
import { VISTOR_ACCESS_CODE } from '~/constant/enter_access';

interface RequestBody {
    community_id: number;
    uid: string;
}

const PcVistorScanAction = <Action>{
    router: {
        path: '/vistor/scan',
        method: 'post',
        authRequired: true,
        roles: [ROLE.FKTX],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'community_id',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'uid',
                regex: /^[0-9a-z]+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { uid, community_id } = <RequestBody>ctx.request.body;
        const { id, building_id, type, success } = utils.access.decrypt(uid);

        if (!success || type !== VISTOR_ACCESS_CODE) {
            return (ctx.body = {
                code: VISTOR_QRCODE_ERROR,
                message: '非法访客二维码'
            });
        }

        const detail = await ctx.model
            .from('ejyy_vistor')
            .where('id', id)
            .andWhere('building_id', building_id)
            .andWhere('community_id', community_id)
            .first();

        if (!detail) {
            return (ctx.body = {
                code: VISTOR_QRCODE_ERROR,
                message: '非法访客二维码'
            });
        }

        if (detail.used_at) {
            return (ctx.body = {
                code: VISTOR_QRCODE_USED,
                message: '二维码已经使用',
                data: {
                    id: detail.id
                }
            });
        }

        if (detail.expire <= Date.now()) {
            return (ctx.body = {
                code: VISTOR_QRCODE_EXPIRED,
                message: '二维码有效期失效',
                data: {
                    id: detail.id
                }
            });
        }

        await ctx.model
            .from('ejyy_vistor')
            .where('id', id)
            .update({
                used_at: Date.now(),
                scan_by: ctx.pcUserInfo.id
            });

        ctx.body = {
            code: SUCCESS,
            message: '访客二维码认证成功',
            data: {
                id: detail.id
            }
        };
    }
};

export default PcVistorScanAction;
