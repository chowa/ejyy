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

export function isFunction(val) {
    return typeof val === 'function';
}
export function isPlainObject(val) {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
}
export function isPromise(val) {
    return isPlainObject(val) && isFunction(val.then) && isFunction(val.catch);
}
export function isDef(value) {
    return value !== undefined && value !== null;
}
export function isObj(x) {
    const type = typeof x;
    return x !== null && (type === 'object' || type === 'function');
}
export function isNumber(value) {
    return /^\d+(\.\d+)?$/.test(value);
}
export function isBoolean(value) {
    return typeof value === 'boolean';
}
const IMAGE_REGEXP = /\.(jpeg|jpg|gif|png|svg|webp|jfif|bmp|dpg)/i;
const VIDEO_REGEXP = /\.(mp4|mpg|mpeg|dat|asf|avi|rm|rmvb|mov|wmv|flv|mkv)/i;
export function isImageUrl(url) {
    return IMAGE_REGEXP.test(url);
}
export function isVideoUrl(url) {
    return VIDEO_REGEXP.test(url);
}
