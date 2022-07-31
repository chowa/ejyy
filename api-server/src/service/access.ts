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

interface RemoteOenResponse {
    success: boolean;
    message: string;
}

export async function remoteOpen(id: number, community_id: number): Promise<RemoteOenResponse> {
    return {
        success: true,
        message: '开门成功'
    };
}
