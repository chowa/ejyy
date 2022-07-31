/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

export interface Message {
    ToUserName: string;
    FromUserName: string;
    CreateTime: string;
    MsgType: 'event' | 'text' | 'video';
    Event?: string;
    Content?: string;
    MediaId?: string;
    Format?: string;
    MsgId?: string;
    EventKey: string;
}

export function text(content: string, message: Message): string {
    return `<xml>
    <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
    <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
    <CreateTime>${Date.now()}</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[${content}]]></Content>
</xml>`;
}

export function event(content: string, message: Message): string {
    return `<xml>
    <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
    <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
    <CreateTime>${Date.now()}</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[${content}]]></Content>
    <Event><![CDATA[${message.Event}]]></Event>
    <EventKey><![CDATA[${message.EventKey}]]></EventKey>
</xml>`;
}
