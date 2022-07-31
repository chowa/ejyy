/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

// 各类数据表状态

// 正常和冻结
export const NORMAL_STATUS = 1;
export const FREEZE_STATUS = 0;

// 与非
export const TRUE = 1;
export const FALSE = 0;

// 用户住宅
export const BINDING_BUILDING = 1;
export const UNBINDING_BUILDING = 0;

// 车辆
export const BINDING_CAR = 1;
export const UNBINDING_CAR = 0;

// 完善用户信息
export const INTACT_USER_INFO = 1;
export const INCOMPLETE_USER_INFO = 0;

// 小区门禁
export const ACCESS_NFC_AVAILABLE = 1;
export const ACCESS_NFC_DISABLED = 0;

// 小区二维码
export const ACCESS_QRCODE_AVAILABLE = 1;
export const ACCESS_QRCODE_DISABLED = 0;

// 小区远程开门
export const ACCESS_REMOTE_DISABLED = 0;
export const ACCESS_REMOTE_AVAILABLE = 1;

// 装修保证经
export const FIXMENT_PLEDGE_DISABLED = 0;
export const FIXMENT_PLEDGE_AVAILABLE = 1;
