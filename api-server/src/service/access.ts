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
