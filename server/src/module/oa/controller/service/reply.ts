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

import { OaAction } from '~/types/action';
import RawBody from 'raw-body';
import * as wechatService from '~/service/wechat';
import * as msg from '../../msg';
import { FALSE } from '~/constant/status';

const OaReplyAction = <OaAction>{
    router: {
        path: '/',
        method: 'post'
    },
    response: async ctx => {
        const bodyXml = ctx.request.body
            ? ctx.request.body
            : await RawBody(ctx.req, {
                  length: ctx.request.length,
                  limit: '1mb',
                  encoding: ctx.request.charset && 'utf-8'
              });

        const xml = await wechatService.parseXML(bodyXml);
        const decrypted = wechatService.oaDecrypt(xml.Encrypt);
        const message = <msg.Message>await wechatService.parseXML(decrypted);

        const fillModel = async (openid: string): Promise<wechatService.WechatOaUserInfo> => {
            const userInfo = await wechatService.getOaUserInfo(openid);

            if (userInfo.subscribe) {
                const exist = await ctx.model
                    .from('ejyy_wechat_official_accounts_user')
                    .where('open_id', openid)
                    .first();

                if (!exist) {
                    await ctx.model.from('ejyy_wechat_official_accounts_user').insert({
                        open_id: userInfo.openid,
                        union_id: userInfo.unionid,
                        subscribed: userInfo.subscribe,
                        created_at: Date.now()
                    });
                } else {
                    await ctx.model
                        .from('ejyy_wechat_official_accounts_user')
                        .update({
                            subscribed: userInfo.subscribe,
                            created_at: Date.now()
                        })
                        .where('open_id', openid);
                }
            } else {
                await ctx.model
                    .from('ejyy_wechat_official_accounts_user')
                    .update({
                        subscribed: FALSE
                    })
                    .where('open_id', openid);
            }

            return userInfo;
        };

        let reply = '';

        if (message.MsgType === 'event') {
            switch (message.Event) {
                // 有延迟
                case 'subscribe':
                case 'unsubscribe':
                    const { unionid, subscribe } = await fillModel(message.FromUserName);

                    if (subscribe && unionid) {
                        const registered = await ctx.model
                            .from('ejyy_wechat_mp_user')
                            .where('union_id', unionid)
                            .first();

                        if (registered) {
                            reply = msg.text(`「助力物业服务升级，用心服务万千业主」，感谢您关注「e家宜业」`, message);
                        } else {
                            reply = msg.text(
                                `「助力物业服务升级，用心服务万千业主」，感谢您关注「e家宜业」，您还不是注册业主，赶快点击「我是业主」中的任一菜单完善您的身份信息吧`,
                                message
                            );
                        }
                    }
                    break;
            }
        } else {
            switch (message.Content) {
                default:
                    reply = msg.text('公众号客服功能暂未启用，敬请期待/:rose/:rose/:rose/:rose/:rose/:rose', message);
            }
        }

        ctx.body = reply;
    }
};

export default OaReplyAction;
