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

// @ts-nocheck
export const openType = Behavior({
    properties: {
        openType: String
    },
    methods: {
        bindGetUserInfo(event) {
            this.$emit('getuserinfo', event.detail);
        },
        bindContact(event) {
            this.$emit('contact', event.detail);
        },
        bindGetPhoneNumber(event) {
            this.$emit('getphonenumber', event.detail);
        },
        bindError(event) {
            this.$emit('error', event.detail);
        },
        bindLaunchApp(event) {
            this.$emit('launchapp', event.detail);
        },
        bindOpenSetting(event) {
            this.$emit('opensetting', event.detail);
        }
    }
});
