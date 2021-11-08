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

import redis from 'redis';
import Knex from 'knex';
import WebSocket from 'ws';
import http from 'http';
import quertString from 'query-string';
import { CwWebSocket } from '~/types/ws';
import config from '~/config';
import { Role } from '~/constant/role_access';

const pub = process.env.NODE_ENV === 'production' ? redis.createClient(config.redis) : null;
const sub = process.env.NODE_ENV === 'production' ? redis.createClient(config.redis) : null;

let wss = null;

export const WS_NOTICE_TO_PROPERTY_COMPANY = 'WS_NOTICE_TO_PROPERTY_COMPANY';
export const WS_NOTICE_TO_REMOTE_SERVER = 'WS_NOTICE_TO_REMOTE_SERVER';

interface PcData {
    id: number;
    community_id: number;
    type: Role;
    urge: boolean;
}

function sendToPc(data: PcData) {
    if (!(wss instanceof WebSocket.Server)) {
        return;
    }
    wss.clients.forEach((client: CwWebSocket) => {
        if (client.readyState === WebSocket.OPEN && client.access.includes(data.type)) {
            client.send(JSON.stringify(data));
        }
    });
}

interface RsData {
    remote_id: number;
    door_id: number;
}

function sendToRs(data: RsData) {
    console.log(data);
}

function dispatch(channel: string, data: Object) {
    switch (channel) {
        case WS_NOTICE_TO_PROPERTY_COMPANY:
            return sendToPc(data as PcData);

        case WS_NOTICE_TO_REMOTE_SERVER:
            return sendToRs(data as RsData);
    }
}

export function pubish(channel: string, data: Object) {
    if (process.env.NODE_ENV === 'production') {
        pub.publish(channel, JSON.stringify(data));
    } else {
        dispatch(channel, data);
    }
}

export function subscribe(model: Knex, w: WebSocket.Server) {
    wss = w;

    wss.on('connection', async (ws: CwWebSocket, request: http.IncomingMessage) => {
        const {
            query: { token }
        } = quertString.parseUrl(request.url);

        if (!token) {
            return ws.close();
        }

        const pcUserInfo = await model
            .table('ejyy_property_company_auth')
            .leftJoin(
                'ejyy_property_company_user',
                'ejyy_property_company_user.id',
                'ejyy_property_company_auth.property_company_user_id'
            )
            .leftJoin(
                'ejyy_property_company_access',
                'ejyy_property_company_access.id',
                'ejyy_property_company_user.access_id'
            )
            .where('ejyy_property_company_auth.token', token)
            .select('ejyy_property_company_user.id', 'ejyy_property_company_access.content as access')
            .first();

        if (!pcUserInfo) {
            return ws.close();
        }

        ws.user_id = pcUserInfo.id;
        ws.access = pcUserInfo.access;
    });

    if (process.env.NODE_ENV === 'production') {
        sub.subscribe(WS_NOTICE_TO_PROPERTY_COMPANY);
        sub.subscribe(WS_NOTICE_TO_REMOTE_SERVER);

        sub.on('message', (channel: string, message: string) => {
            const data = <PcData | RsData>JSON.parse(message);

            dispatch(channel, data);
        });
    }
}
