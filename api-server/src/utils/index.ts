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
