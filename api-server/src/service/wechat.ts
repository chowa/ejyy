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

import axios from 'axios';
import crypto from 'crypto';
import xml2js from 'xml2js';
import config from '~/config';

interface WechatMpSessionInfo {
    openid: string;
    session_key: string;
    unionid: string;
}

interface WechatMpPhoneInfo {
    phoneNumber: string;
    purePhoneNumber: string;
    countryCode: string;
    openid: string;
    unionid: string;
}

export interface WechatMpSessionInfoResponse {
    success?: boolean;
    message?: string;
    data?: WechatMpSessionInfo;
}

export interface WechatMpPhoneInfoResponse {
    success?: boolean;
    message?: string;
    data?: WechatMpPhoneInfo;
}

export interface TemplateData {
    [key: string]: {
        value: string;
    };
}

export interface SendSubscribeMessageParams {
    // openid
    touser: string;
    template_id: string;
    page: string;
    data: TemplateData;
    lang?: 'zh_CN';
}

export interface SendOaTemplateMessageParams {
    touser: string;
    template_id: string;
    url?: string;
    miniprogram?: {
        appid: string;
        pagepath: string;
    };
    data: TemplateData;
}

interface SendSubscribeMessageResponse {
    errcode: number;
    errmsg?: string;
}

export interface WechatOaUserInfo {
    subscribe: 0 | 1;
    openid: string;
    nickname: string;
    unionid: string;
}

function decode(session_key: string, iv: string, encryptedData: string) {
    const sessionKeyBuffer = Buffer.from(session_key, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');
    const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);

    decipher.setAutoPadding(true);

    try {
        let decoded = decipher.update(encryptedData, 'base64', 'utf8');

        decoded += decipher.final('utf8');

        return {
            success: true,
            data: JSON.parse(decoded)
        };
    } catch (e) {
        return { success: false };
    }
}

export async function getUserMpSession(js_code: string): Promise<WechatMpSessionInfoResponse> {
    const res = await axios.request({
        url: 'https://api.weixin.qq.com/sns/jscode2session',
        method: 'GET',
        params: {
            ...config.wechat.ump,
            js_code,
            grant_type: 'authorization_code'
        }
    });

    if (res.data.errcode) {
        return {
            success: false,
            message: res.data.errmsg
        };
    }

    return {
        success: true,
        data: res.data
    };
}

export async function getPcMpSession(js_code: string): Promise<WechatMpSessionInfoResponse> {
    const res = await axios.request({
        url: 'https://api.weixin.qq.com/sns/jscode2session',
        method: 'GET',
        params: {
            ...config.wechat.pmp,
            js_code,
            grant_type: 'authorization_code'
        }
    });

    if (res.data.errcode) {
        return {
            success: false,
            message: res.data.errmsg
        };
    }

    return {
        success: true,
        data: res.data
    };
}

// 小程序用户信息
export async function getUserMpPhone(
    js_code: string,
    iv: string,
    encryptedData: string
): Promise<WechatMpPhoneInfoResponse> {
    const mpSessionInfo = await getUserMpSession(js_code);

    if (!mpSessionInfo.success) {
        return {
            success: false,
            message: mpSessionInfo.message
        };
    }

    const ret = decode(mpSessionInfo.data.session_key, iv, encryptedData);

    return {
        success: ret.success,
        data: {
            ...ret.data,
            openid: mpSessionInfo.data.openid,
            unionid: mpSessionInfo.data.unionid
        }
    };
}

// 用户小程序接口凭证
let userMpAccessToken = null;
let userMpAccessTokenExpire = 0;
let userMpAccessTokenStartAt = 0;

export async function getUserMpAccessToken(): Promise<string> {
    if (userMpAccessToken === null || Date.now() - userMpAccessTokenStartAt >= userMpAccessTokenExpire) {
        userMpAccessTokenStartAt = Date.now();

        const res = await axios.request({
            url: 'https://api.weixin.qq.com/cgi-bin/token',
            method: 'GET',
            params: {
                ...config.wechat.ump,
                grant_type: 'client_credential'
            }
        });

        if (!res.data.access_token) {
            return await getUserMpAccessToken();
        }

        userMpAccessToken = res.data.access_token;
        userMpAccessTokenExpire = res.data.expires_in * 1000;
    }

    return userMpAccessToken;
}

// 公众号
let oaAccessToken = null;
let oaAccessTokenExpire = 0;
let oaAccessTokenStartAt = 0;

export async function getOaAccessToken(): Promise<string> {
    if (oaAccessToken === null || Date.now() - oaAccessTokenStartAt >= oaAccessTokenExpire) {
        oaAccessTokenStartAt = Date.now();

        const res = await axios.request({
            url: 'https://api.weixin.qq.com/cgi-bin/token',
            method: 'GET',
            params: {
                ...config.wechat.oa,
                grant_type: 'client_credential'
            }
        });

        if (!res.data.access_token) {
            return await getOaAccessToken();
        }

        oaAccessToken = res.data.access_token;
        oaAccessTokenExpire = res.data.expires_in * 1000;
    }

    return oaAccessToken;
}

// 小程序模板信息
export async function sendMpSubscribeMessage({
    touser,
    template_id,
    page,
    data,
    lang
}: SendSubscribeMessageParams): Promise<SendSubscribeMessageResponse> {
    const access_token = await getUserMpAccessToken();

    const res = await axios.request({
        url: `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`,
        method: 'POST',
        data: {
            touser,
            template_id,
            page,
            data,
            miniprogram_state: config.debug ? 'developer' : 'formal',
            lang: lang ? lang : 'zh_CN'
        }
    });

    return res.data;
}

// 公众号消息推送
export async function sendOaTemplateMessage({
    touser,
    template_id,
    miniprogram,
    url,
    data
}: SendOaTemplateMessageParams): Promise<SendSubscribeMessageResponse> {
    const access_token = await getOaAccessToken();

    const res = await axios.request({
        url: `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`,
        method: 'POST',
        data: {
            touser,
            template_id,
            miniprogram,
            url,
            data
        }
    });

    return res.data;
}

export interface XmlData {
    [key: string]: any;
}

export function buildXML(data: XmlData, rootName = 'xml'): string {
    return new xml2js.Builder({ xmldec: null, rootName, allowSurrogateChars: true, cdata: true }).buildObject(data);
}

export async function parseXML(xml: string): Promise<XmlData> {
    return await xml2js.parseStringPromise(xml, { trim: true, explicitArray: false, explicitRoot: false });
}

function PKCS7Decoder(buff: Buffer) {
    let pad = buff[buff.length - 1];

    if (pad < 1 || pad > 32) {
        pad = 0;
    }

    return buff.slice(0, buff.length - pad);
}

export function oaDecrypt(encrypted: string): string {
    const aesKey = Buffer.from(config.wechat.oa.key + '=', 'base64');
    const iv = aesKey.slice(0, 16);
    const aesCipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);

    aesCipher.setAutoPadding(false);

    let decipheredBuff = Buffer.concat([aesCipher.update(encrypted, 'base64'), aesCipher.final()]);

    decipheredBuff = PKCS7Decoder(decipheredBuff);

    const len_netOrder_corpid = decipheredBuff.slice(16);
    const msg_len = len_netOrder_corpid.slice(0, 4).readUInt32BE(0);
    const result = len_netOrder_corpid.slice(4, msg_len + 4).toString();
    const appId = len_netOrder_corpid.slice(msg_len + 4).toString();

    if (appId != config.wechat.oa.appid) {
        return '';
    }

    return result;
}

export async function getOaUserInfo(openid: string): Promise<WechatOaUserInfo> {
    const access_token = await getOaAccessToken();

    const res = await axios.request({
        url: `https://api.weixin.qq.com/cgi-bin/user/info`,
        method: 'get',
        params: {
            openid,
            access_token
        }
    });

    return res.data;
}

export async function createOaMenu(data: object): Promise<SendSubscribeMessageResponse> {
    const access_token = await getOaAccessToken();

    const res = await axios.request({
        url: `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${access_token}`,
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    });

    return res.data;
}

export async function getOaTplList(): Promise<any> {
    const access_token = await getOaAccessToken();

    const res = await axios.request({
        url: `https://api.weixin.qq.com/cgi-bin/template/get_all_private_template?access_token=${access_token}`,
        method: 'get'
    });

    return res.data;
}
