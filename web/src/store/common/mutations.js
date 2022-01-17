/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import * as mutationTypes from '@/constants/mutationTypes';

export default {
    [mutationTypes.UPDATE_USERINFO](state, data) {
        state.userInfo = Object.assign(state.userInfo, data.userInfo);
        state.postInfo = Object.assign(state.postInfo, data.postInfo);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 664;
        canvas.height = 372;

        ctx.translate(0, canvas.height / 3);
        ctx.rotate((-20 * Math.PI) / 180);
        ctx.font = '28px STXihei, "华文细黑", "Microsoft YaHei", "微软雅黑"';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'Middle';

        let name = '';

        data.postInfo.community_list.every(item => {
            if (item.community_id === data.postInfo.default_community_id) {
                name = item.name;
                return false;
            }
            return true;
        });

        ctx.fillText(`${name}小区${data.userInfo.real_name}`, canvas.width / 2, canvas.height / 2);

        state.waterMark = canvas.toDataURL('image/png');
    },
    [mutationTypes.PUSH_UNREAD_NOTICES](state, data) {
        state.unreadNotices = [].concat(data, state.unreadNotices);
    },
    [mutationTypes.CLEAR_UNREAD_NOTICES](state) {
        state.unreadNotices = [];
    },
    [mutationTypes.CLEAR_UNREAD_NOTICE](state, id) {
        const notices = [].concat(state.unreadNotices);

        notices.splice(
            notices.findIndex(item => item.id === id),
            1
        );

        state.unreadNotices = notices;
    }
};
