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

import { CwComponent } from '../common/component';
import utils from '../../utils/index';

const app = getApp();

CwComponent({
    props: {
        show: Boolean
    },
    data: {
        map: {}
    },
    beforeCreate() {
        utils
            .request({
                url: '/option/colleague',
                method: 'post',
                data: {
                    community_id: app.data.postInfo.default_community_id
                }
            })
            .then(res => {
                const map = {};

                res.data.list.forEach(item => {
                    if (item.department in map) {
                        map[item.department].users.push(item);
                    } else {
                        map[item.department] = {
                            name: item.department,
                            users: [item]
                        };
                    }
                });

                this.setData({ map });
            });
    },
    methods: {
        onClose() {
            this.$emit('close');
        },
        select(e) {
            const { id, name } = e.currentTarget.dataset;

            this.$emit('select', { id, name });
        }
    }
});
