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
import { SUCCESS, QUERY_ILLEFAL, STATUS_ERROR, LAMP_LINE_NAME_EXIST } from '~/constant/code';
import * as ROLE from '~/constant/role_access';

interface Mode {
    start_time: string;
    end_time: string;
    name: string;
}

interface RequestBody {
    id: number;
    community_id: number;
    name: string;
    port: number;
    lamp_id: number;
    work_mode: Mode[];
}

const PcLampLineUpdateAction = <Action>{
    router: {
        path: '/lamp/line_update',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ZHZM],
        verifyCommunity: true
    },
    validator: {
        body: [
            {
                name: 'id',
                regex: /^\d+$/,
                required: true
            },
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
        const { id, community_id, name, port, lamp_id, work_mode } = <RequestBody>ctx.request.body;
        const record = await ctx.model
            .from('ejyy_iot_lamp_line')
            .where('id', id)
            .first();

        if (!record) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '非法修改灯光线路'
            });
        }

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
            .andWhereNot('id', id)
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
            .andWhereNot('id', id)
            .first();

        if (exist) {
            return (ctx.body = {
                code: LAMP_LINE_NAME_EXIST,
                message: '线路名称已存在'
            });
        }

        await ctx.model
            .from('ejyy_iot_lamp_line')
            .update({
                name,
                port,
                lamp_id
            })
            .where('id', id);

        await ctx.model
            .from('ejyy_iot_lamp_work_mode')
            .where('lamp_line_id', id)
            .delete();

        const created_at = Date.now();
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
            message: '修改灯光线路信息成功'
        };
    }
};

export default PcLampLineUpdateAction;
