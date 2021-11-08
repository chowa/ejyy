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

import * as utils from '@/utils';
import * as mutationTypes from '@/constants/mutationTypes';
import router from '@/router';

export default {
    fetchUserInfo(context) {
        utils.request
            .get('/user/info')
            .then(res => {
                if (
                    !res.data.postInfo.job &&
                    !res.data.postInfo.is_admin &&
                    router.history.current.meta.accessRequired
                ) {
                    utils.auth.logout();
                    return router.replace('/login');
                }

                context.commit(mutationTypes.UPDATE_USERINFO, res.data);
            })
            .catch(() => {});
    },
    updateUserInfo(context, data) {
        context.commit(mutationTypes.UPDATE_USERINFO, data);
    },
    clearUnreadNotices(context) {
        context.commit(mutationTypes.CLEAR_UNREAD_NOTICES);
    },
    clearUnreadNotice(context, id) {
        context.commit(mutationTypes.CLEAR_UNREAD_NOTICE, id);
    },
    pushUnreadNotices(context, data) {
        context.commit(mutationTypes.PUSH_UNREAD_NOTICES, data);
    }
};
