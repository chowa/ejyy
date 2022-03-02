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
import { TRUE } from '~/constant/status';
import * as wechatService from '~/service/wechat';
import config from '~/config';
import { TemplateMessage } from '~/types/content';
import cwlog from 'chowa-log';
import utils from '~/utils';

export async function broadcast(model: Knex, id: number) {
    const detail = await model
        .from('ejyy_notice_to_user')
        .leftJoin('ejyy_notice_tpl', 'ejyy_notice_tpl.id', 'ejyy_notice_to_user.notice_tpl_id')
        .where('ejyy_notice_to_user.id', id)
        .select(
            'ejyy_notice_to_user.community_id',
            'ejyy_notice_to_user.notice_tpl_id',
            'ejyy_notice_to_user.published',
            'ejyy_notice_tpl.tpl',
            'ejyy_notice_tpl.content'
        )
        .first();

    if (detail.published !== TRUE || !detail.tpl) {
        return;
    }

    const users = await model
        .from('ejyy_wechat_mp_user')
        .leftJoin(
            'ejyy_wechat_official_accounts_user',
            'ejyy_wechat_official_accounts_user.union_id',
            'ejyy_wechat_mp_user.union_id'
        )
        .whereIn('ejyy_wechat_mp_user.id', function() {
            this.from('ejyy_building_info')
                .leftJoin('ejyy_user_building', 'ejyy_user_building.building_id', 'ejyy_building_info.id')
                .where('ejyy_building_info.community_id', detail.community_id)
                .select('ejyy_user_building.wechat_mp_user_id');
        })
        .andWhere('ejyy_wechat_official_accounts_user.subscribed', TRUE)
        .select('ejyy_wechat_official_accounts_user.open_id');

    const tplData = <wechatService.TemplateData>{};

    (<TemplateMessage>detail.content).forEach(item => {
        tplData[item.key] = {
            value: utils.text.omit(item.value, 22)
        };
    });

    for (const user of users) {
        const { open_id } = user;

        const res = await wechatService.sendOaTemplateMessage({
            touser: open_id,
            template_id: detail.tpl,
            miniprogram: {
                appid: config.wechat.ump.appid,
                pagepath: `/pages/notification/detail?id=${id}`
            },
            data: tplData
        });
        console.log(res);
        if (res.errcode !== 0) {
            cwlog.error(`公众号广播小区通知失败，通知id：${id}，错误原因：${res.errmsg}`);
        }
    }
}
