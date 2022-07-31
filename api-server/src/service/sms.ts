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

import * as openApi from '@alicloud/openapi-client';
import dysmsapi, { SendSmsRequest } from '@alicloud/dysmsapi20170525';
import config from '~/config';

function createClient() {
    const apiConfig = new openApi.Config({
        accessKeyId: config.aliyun.accessKeyId,
        accessKeySecret: config.aliyun.accessKeySecret
    });

    apiConfig.endpoint = 'dysmsapi.aliyuncs.com';

    return new dysmsapi(apiConfig);
}

interface SendParams {
    phone: string;
    template_id: string;
    data: {
        [key: string]: any;
    };
}

interface SendResult {
    success: boolean;
    message: string;
}

export async function send(params: SendParams): Promise<SendResult> {
    const client = createClient();
    const { phone, template_id, data } = params;

    const res = await client.sendSms(
        new SendSmsRequest({
            phoneNumbers: phone,
            signName: config.server.name,
            templateCode: template_id,
            templateParam: JSON.stringify(data)
        })
    );

    return {
        success: res.body.code === 'OK',
        message: res.body.message
    };
}
