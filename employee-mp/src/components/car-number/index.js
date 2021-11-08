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

CwComponent({
    props: {
        isNewEnergy: Boolean
    },
    data: {
        // 省份简写
        provinces: [
            ['京', '沪', '粤', '津', '冀', '晋', '蒙', '辽', '吉', '黑'],
            ['苏', '浙', '皖', '闽', '赣', '鲁', '豫', '鄂', '湘'],
            ['桂', '琼', '渝', '川', '贵', '云', '藏'],
            ['陕', '甘', '青', '宁', '新']
        ],
        // 车牌输入
        numbers: [
            ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'],
            ['L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'],
            ['W', 'X', 'Y', 'Z', '港', '澳', '学']
        ],
        carNumber: [],
        keyboardVisible: false
    },
    methods: {
        // 选中点击设置
        bindChoose(e) {
            const { carNumber, isNewEnergy } = this.data;

            if ((carNumber.length === 7 && !isNewEnergy) || (carNumber.length === 8 && isNewEnergy)) {
                return;
            }

            this.setData(
                {
                    carNumber: carNumber.concat(e.target.dataset.val)
                },
                () => {
                    if (
                        (this.data.carNumber.length === 7 && !isNewEnergy) ||
                        (this.data.carNumber.length === 8 && isNewEnergy)
                    ) {
                        this.$emit('change', this.data.carNumber.join(''));
                    } else {
                        this.$emit('change', '');
                    }
                }
            );
        },
        bindDelChoose() {
            const { carNumber } = this.data;

            if (carNumber.length > 0) {
                carNumber.pop();
                this.setData({
                    carNumber
                });
            }
        },
        closeKeyboard() {
            this.setData({
                keyboardVisible: false
            });
        },
        openKeyboard() {
            const query = this.createSelectorQuery();

            query.select('.cw-car-number-items').boundingClientRect();
            query.exec(res => {
                wx.pageScrollTo({
                    scrollTop: res[0].top,
                    duration: 500
                });
            });

            this.setData({
                keyboardVisible: true
            });
        },
        clear() {
            this.setData(
                {
                    carNumber: []
                },
                () => {
                    this.$emit('change', '');
                }
            );
        }
    }
});
