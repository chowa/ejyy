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

import moment from 'moment';
import { EjyyIotEntrance } from '~/types/model';
import utils from '~/utils';

interface StatusParams {
    Serial: string;
    Status: string;
    Input: string;
    Ver: string;
    ID: string;
    IP: string;
    MAC: string;
    Now: string;
    Crc: string;
    T1: string;
    H1: string;
    T2: string;
    H2: string;
    NextNum: string;
    Key: string;
}

interface StatusResponse {
    Key: string;
    Now: string;
}

async function statusMethod(params: StatusParams, entranceInfo: EjyyIotEntrance): Promise<StatusResponse> {
    const mom = moment();

    await utils.redis.set(`entrance${entranceInfo.id}`, mom.valueOf().toString());

    return {
        Key: params.Key,
        Now: `${mom.format('YYYYMMDDHHmmss')}${mom.day()}`
    };
}

export default statusMethod;
