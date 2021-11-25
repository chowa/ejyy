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
import Knex from 'knex';
import { EjyyIotEntrance } from '~/types/model';
import { SELF_ACCESS_CODE, VISTOR_ACCESS_CODE } from '~/constant/enter_access';
import utils from '~/utils';
import { IOT_METHOD_QRCODE, IOT_METHOD_NFC, IOT_METHOD_ICCARD } from '~/constant/iot';

const TYPE_CARD = '0';
const TYPE_SERIAL = '1';
const TYPE_PASSWORD = '2';
const TYPE_BUTTON = '3';
const TYPE_ID_CARD = '6';
const TYPE_QRCODE = '9';
const TYPE_FINGERPRINT = '10';
const TYPE_PULSE = '11';
const TYPE_RFID = '12';
const TYPE_FACE = '13';

const OPEN = '1';
const CLOSE = '3';

const ENTER = '0';
const LEAVE = '1';

interface AccessParams {
    type:
        | typeof TYPE_CARD
        | typeof TYPE_SERIAL
        | typeof TYPE_PASSWORD
        | typeof TYPE_BUTTON
        | typeof TYPE_ID_CARD
        | typeof TYPE_QRCODE
        | typeof TYPE_FINGERPRINT
        | typeof TYPE_PULSE
        | typeof TYPE_RFID
        | typeof TYPE_FACE;
    Reader: string;
    DataLen: string;
    Index: string;
    Serial: string;
    Status: string;
    Input: string;
    Ver: string;
    ID: string;
    IP: string;
    MAC: string;
    Card: string;
}

interface AccessResponse {
    AcsRes: typeof OPEN | typeof CLOSE;
    ActIndex?: typeof ENTER | typeof LEAVE;
    Time?: string;
}

async function accessMethod(params: AccessParams, entranceInfo: EjyyIotEntrance, model: Knex): Promise<AccessResponse> {
    const mom = moment();
    await utils.redis.set(`entrance${entranceInfo.id}`, mom.valueOf().toString());

    // 卡  二维码
    if (
        params.type === TYPE_CARD ||
        params.type === TYPE_RFID ||
        params.type === TYPE_SERIAL ||
        params.type === TYPE_QRCODE
    ) {
        const reuslt =
            params.type === TYPE_SERIAL || params.type === TYPE_QRCODE
                ? utils.access.decrypt(Buffer.from(params.Card, 'base64').toString())
                : utils.access.decrypt(params.Card);

        if (!reuslt.success) {
            return { AcsRes: CLOSE };
        }

        const existBuilding = await model
            .from('ejyy_building_info')
            .where('id', reuslt.building_id)
            .andWhere('community_id', entranceInfo.community_id)
            .first();

        if (!existBuilding) {
            return { AcsRes: CLOSE };
        }

        if (reuslt.type === VISTOR_ACCESS_CODE) {
            const vistorInfo = await model
                .from('ejyy_vistor')
                .where('id', reuslt.id)
                .first();

            if (!vistorInfo || vistorInfo.expire < Date.now()) {
                return { AcsRes: CLOSE };
            }
        }

        let method: typeof IOT_METHOD_NFC | typeof IOT_METHOD_ICCARD | typeof IOT_METHOD_QRCODE = IOT_METHOD_QRCODE;

        if (params.type === TYPE_CARD) {
            method = IOT_METHOD_NFC;
        } else if (params.type === TYPE_RFID) {
            method = IOT_METHOD_ICCARD;
        }

        await model.from('ejyy_iot_entrance_log').insert({
            wechat_mp_user_id: reuslt.type === SELF_ACCESS_CODE ? reuslt.id : null,
            vistor_id: reuslt.type === VISTOR_ACCESS_CODE ? reuslt.id : null,
            entrance_id: entranceInfo.id,
            method,
            created_at: mom.valueOf()
        });

        return { AcsRes: OPEN, ActIndex: ENTER, Time: '5' };
    }
    // 按钮
    else if (params.type === TYPE_BUTTON) {
        return { AcsRes: OPEN, ActIndex: LEAVE };
    } else {
        return { AcsRes: CLOSE };
    }
}

export default accessMethod;
