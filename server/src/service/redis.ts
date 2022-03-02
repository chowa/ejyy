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

import redis from 'redis';
import wss, { PcData } from '~/wss';
import config from '~/config';

const pub = config.debug ? null : redis.createClient(config.redis);
const sub = config.debug ? null : redis.createClient(config.redis);

export const WS_NOTICE_TO_PROPERTY_COMPANY = 'WS_NOTICE_TO_PROPERTY_COMPANY';
export const WS_NOTICE_TO_REMOTE_SERVER = 'WS_NOTICE_TO_REMOTE_SERVER';

// todo
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
            return wss.sendToPc(data as PcData);

        case WS_NOTICE_TO_REMOTE_SERVER:
            return sendToRs(data as RsData);
    }
}

export function pubish(channel: string, data: Object) {
    if (!config.debug) {
        pub.publish(channel, JSON.stringify(data));
    } else {
        dispatch(channel, data);
    }
}

export async function subscribe() {
    if (!config.debug) {
        sub.subscribe(WS_NOTICE_TO_PROPERTY_COMPANY);
        sub.subscribe(WS_NOTICE_TO_REMOTE_SERVER);

        sub.on('message', (channel: string, message: string) => {
            const data = <PcData | RsData>JSON.parse(message);

            dispatch(channel, data);
        });
    }
}
