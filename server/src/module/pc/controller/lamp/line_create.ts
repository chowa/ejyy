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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR, LAMP_LINE_NAME_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface Mode {
    start_time: string;
    end_time: string;
    name: string;
}

interface RequestBody {
    community_id: number;
    name: string;
    port: number;
    lamp_id: number;
    work_mode: Mode[];
}

const PcLampLineCreateAction = <Action>{
    router: {
        path: '/lamp/line_create',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZHZM],
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
                name: 'name',
                max: 56,
                required: true
            },
            {
                name: 'port',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'lamp_id',
                required: true,
                regex: /^\d+$/
            },
            {
                name: 'work_mode',
                min: 1,
                required: true,
                validator: val =>
                    Array.isArray(val) &&
                    val.every(item => {
                        return (
                            /^\d{2}:\d{2}:\d{2}$/.test(item.start_time) &&
                            /^\d{2}:\d{2}:\d{2}$/.test(item.end_time) &&
                            item.name &&
                            item.name.length < 56
                        );
                    })
            }
        ]
    },
    response: async ctx => {
        const { community_id, name, port, lamp_id, work_mode } = <RequestBody>ctx.request.body;
        const lampInfo = await ctx.model
            .from('ejyy_iot_lamp')
            .where('community_id', community_id)
            .andWhere('id', lamp_id)
            .first();

        if (!lampInfo) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法的灯控'
            });
        }

        if (port < 0 || port > lampInfo.port_total) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '端口号错误'
            });
        }

        const portUsed = await ctx.model
            .from('ejyy_iot_lamp_line')
            .where('lamp_id', lamp_id)
            .andWhere('port', port)
            .first();

        if (portUsed) {
            return (ctx.body = {
                code: STATUS_ERROR,
                message: '端口已被占用'
            });
        }

        const exist = await ctx.model
            .from('ejyy_iot_lamp_line')
            .where('lamp_id', lamp_id)
            .andWhere('name', name)
            .first();

        if (exist) {
            return (ctx.body = {
                code: LAMP_LINE_NAME_EXIST,
                message: '线路名称已存在'
            });
        }

        const created_at = Date.now();
        const [id] = await ctx.model.from('ejyy_iot_lamp_line').insert({
            name,
            port,
            lamp_id,
            created_by: ctx.pcUserInfo.id,
            created_at
        });

        await ctx.model.from('ejyy_iot_lamp_work_mode').insert(
            work_mode.map(mode => {
                return {
                    ...mode,
                    lamp_line_id: id,
                    created_by: ctx.pcUserInfo.id,
                    created_at
                };
            })
        );

        ctx.body = {
            code: SUCCESS,
            data: {
                id,
                created_at
            }
        };
    }
};

export default PcLampLineCreateAction;
