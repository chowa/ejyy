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

import * as crypto from './crypto';
import * as access from './access';
import * as phone from './phone';
import * as community from './community';
import * as building from './building';
import * as sql from './sql';
import * as order from './order';
import * as text from './text';
import * as idcard from './idcard';
import * as mail from './mail';
import * as redis from './redis';

const utils = {
    crypto,
    access,
    phone,
    community,
    building,
    sql,
    order,
    text,
    idcard,
    mail,
    redis
};

export default utils;
