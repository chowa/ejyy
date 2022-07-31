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

import { CwComponent } from '../common/component';
import { BLUE } from '../common/color';
import { getRect } from '../common/utils';
CwComponent({
    props: {
        inactive: Boolean,
        percentage: {
            type: Number,
            observer: 'setLeft'
        },
        pivotText: String,
        pivotColor: String,
        trackColor: String,
        showPivot: {
            type: Boolean,
            value: true
        },
        color: {
            type: String,
            value: BLUE
        },
        textColor: {
            type: String,
            value: '#fff'
        },
        strokeWidth: {
            type: null,
            value: 4
        }
    },
    data: {
        right: 0
    },
    mounted() {
        this.setLeft();
    },
    methods: {
        setLeft() {
            Promise.all([getRect(this, '.cw-progress'), getRect(this, '.cw-progress__pivot')]).then(
                ([portion, pivot]) => {
                    if (portion && pivot) {
                        this.setData({
                            right: (pivot.width * (this.data.percentage - 100)) / 100
                        });
                    }
                }
            );
        }
    }
});
