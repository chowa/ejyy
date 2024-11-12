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

import WebSocket from 'ws';
import { Role } from '~/constant/role_access';

export interface CwWebSocket extends WebSocket {
    access?: Role[];
    user_id?: number;
    // 远程门禁服务的
    remote_id: number;
}
