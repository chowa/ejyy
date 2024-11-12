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

const app = getApp();
import $toast from '../../components/toast/toast';
import Validator from '../../libs/validator/index';

function CwPage(cwOptions = {}) {
    const options = Object.assign({}, cwOptions, {
        data: {
            ...cwOptions.data,
            ...app.data
        },
        // 表单验证
        // validator: {
        //     formFields: [],
        //     formRule: {}
        // },
        bridge: {
            updateData: app.updateData,
            getUserInfo: app.getUserInfo,
            on: app.on,
            off: app.off
        },
        // 用户信息和住宅信息更新时调用
        // onGlobalDataUpdate: () => {},
        onReady() {
            if (cwOptions.validator && cwOptions.validator.formFields && cwOptions.validator.formRule) {
                this.formValidator = new Validator(this.validator.formRule);
            }

            if (typeof cwOptions.onReady === 'function') {
                cwOptions.onReady.call(this);
            }
        },
        onShow() {
            this.onGlobalDataUpdateCb = this.onGlobalDataUpdate;

            app.on('data', this.onAppUpdateData);

            if (typeof cwOptions.onShow === 'function') {
                cwOptions.onShow.call(this);
            }
        },
        onHide() {
            app.off('data', this.onAppUpdateData);
            this.onGlobalDataUpdateCb = undefined;

            if (typeof cwOptions.onHide === 'function') {
                cwOptions.onHide.call(this);
            }
        },
        onLoad(opts) {
            if (typeof cwOptions.onLoad === 'function') {
                cwOptions.onLoad.call(this, opts);
            }
        },
        onUnload() {
            if (typeof cwOptions.onUnload === 'function') {
                cwOptions.onUnload.call(this);
            }
        },
        onAppUpdateData(data) {
            this.setData(
                {
                    ...data
                },
                () => {
                    if (typeof this.onGlobalDataUpdateCb === 'function') {
                        this.onGlobalDataUpdateCb();
                    }
                }
            );
        },
        validate(cb) {
            if (!this.formValidator) {
                console.warn('未初始化表单 validator');
            }

            const vdata = {};

            this.validator.formFields.forEach(field => {
                vdata[field] = this.data[field];
            });

            this.formValidator.validate(vdata, (errors, fields) => {
                if (!errors) {
                    cb();
                } else {
                    $toast({ message: errors[0].message });
                }
            });
        }
    });

    Page(options);
}

export { CwPage };
