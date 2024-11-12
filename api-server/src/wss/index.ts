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

import WebSocket from 'ws';
import http from 'http';
import quertString from 'query-string';
import model from '~/model';
import { Role } from '~/constant/role_access';

export interface CwWebSocket extends WebSocket {
    access?: Role[];
    user_id?: number;
}

export interface PcData {
    id: number;
    community_id: number;
    type: Role;
    urge: boolean;
}

class ws {
    static ws: WebSocket.Server;

    static init(server: http.Server) {
        this.ws = new WebSocket.Server({ server, path: '/cws' });

        this.ws.on('connection', async (ws: CwWebSocket, request: http.IncomingMessage) => {
            const {
                query: { token }
            } = quertString.parseUrl(request.url);

            if (!token) {
                return ws.close();
            }

            const userInfo = await model
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
                .select('ejyy_property_company_user.id', 'ejyy_property_company_access.content')
                .first();

            if (!userInfo) {
                return ws.close();
            }

            ws.user_id = userInfo.id;
            ws.access = userInfo.content;
        });
    }

    static sendToPc(data: PcData) {
        if (!(this.ws instanceof WebSocket.Server)) {
            return;
        }

        this.ws.clients.forEach((client: CwWebSocket) => {
            if (client.readyState === WebSocket.OPEN && client.access.includes(data.type)) {
                client.send(JSON.stringify(data));
            }
        });
    }
}

export default ws;
