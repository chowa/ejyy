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
import { SUCCESS, REMOTE_OPEN_DOOR_FAIL } from '~/constant/code';
import * as accessService from '~/service/access';

interface RequestBody {
    id: number;
    community_id: number;
}

const MpAccessDoorAction = <Action>{
    router: {
        path: '/access/door',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'id',
                required: true
            },
            {
                name: 'community_id',
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id, community_id } = <RequestBody>ctx.request.body;

        const res = await accessService.remoteOpen(id, community_id);

        await ctx.model.from('ejyy_community_remote_open_door_log').insert({
            wechat_mp_user_id: ctx.mpUserInfo.id,
            community_id,
            door_id: id,
            success: res.success ? 1 : 0,
            created_at: Date.now()
        });

        ctx.body = {
            code: res.success ? SUCCESS : REMOTE_OPEN_DOOR_FAIL,
            message: res.message
        };
    }
};

export default MpAccessDoorAction;
