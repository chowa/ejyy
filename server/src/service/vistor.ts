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

import Knex from 'knex';
import { EjyyWechatMpUser } from '~/types/model';
import * as wechatService from '~/service/wechat';
import { OA_NOTICE_TO_VISTOR } from '~/constant/tpl';
import moment from 'moment';
import config from '~/config';

export async function pushAccessToVistor(model: Knex, vistorInfo: EjyyWechatMpUser, id: number, expire: number) {
    const record = await model
        .from('ejyy_wechat_official_accounts_user')
        .where('union_id', vistorInfo.union_id)
        .first();

    if (!record || !record.subscribed) {
        return;
    }

    await wechatService.sendOaTemplateMessage({
        touser: vistorInfo.open_id,
        template_id: OA_NOTICE_TO_VISTOR,
        url: '',
        miniprogram: {
            appid: config.wechat.ump.appid,
            pagepath: `/pages/vistor/use?id=${id}`
        },
        data: {
            first: {
                value: '您的访客码已生成'
            },
            keyword1: {
                value: vistorInfo.real_name
            },
            keyword2: {
                value: vistorInfo.phone
            },
            keyword3: {
                value: moment(expire).format('YYYY-MM-DD')
            },
            remark: {
                value: '感谢您对我们工作的支持，祝您生活愉快'
            }
        }
    });
}
