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

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';
import { ASSETS_HOST } from '../../config';

CwPage({
    data: {
        reason: '',
        code: '',
        num: '',
        date: '',
        attachment_url: '',
        fee: '',
        //
        index: null,
        show: false,
        now: Date.now(),
        uploadImgList: [],
        ASSETS_HOST
    },
    validator: {
        formFields: ['reason', 'code', 'num', 'date', 'attachment_url', 'fee'],
        formRule: {
            reason: [
                { required: true, message: '请输入花销用途' },
                { max: 56, message: '花销用途不能超过56个字' }
            ],
            code: [
                { required: true, message: '请输入发票代码' },
                { max: 56, message: '发票代码不能超过56个字' }
            ],
            num: [
                { required: true, message: '请输入发票号码' },
                { max: 56, message: '发票号码不能超过56个字' }
            ],
            date: [{ required: true, type: 'number', message: '请选择开票日期' }],
            attachment_url: [{ required: true, max: 128, message: '请上传电子发票' }],
            fee: [
                { message: '请输入报销金额', required: true },
                { message: '请输入正确的金额', pattern: /^\d+(\.\d+)?$/ }
            ]
        }
    },
    onLoad(opt) {
        if (!opt.info) {
            wx.redirectTo({ url: '/pages/refound/index' });
        }

        try {
            const info = JSON.parse(opt.info);

            this.setData({
                reason: info.reason ? info.reason : '',
                code: info.code ? info.code : '',
                num: info.num ? info.num : '',
                date: info.date ? info.date : '',
                attachment_url: info.attachment_url ? info.attachment_url : '',
                uploadImgList: info.attachment_url ? [`${ASSETS_HOST}${info.attachment_url}`] : [],
                fee: info.fee ? info.fee : '',
                index: opt.index ? parseInt(opt.index) : null
            });
        } catch (e) {
            wx.redirectTo({ url: '/pages/refound/index' });
        }

        wx.setNavigationBarTitle({
            title: opt.index ? '修改报销项目' : '添加报销项目'
        });
    },
    showCalendar() {
        this.setData({ show: true });
    },
    hideCalendar() {
        this.setData({ show: false });
    },
    onDateChange(e) {
        this.setData({
            date: +e.detail,
            show: false
        });
    },
    deleteImg(e) {
        const { index } = e.detail;
        const { uploadImgList } = this.data;

        uploadImgList.splice(index, 1);

        this.setData({
            attachment_url: '',
            uploadImgList
        });
    },
    afterRead(e) {
        const { file } = e.detail;
        const { ASSETS_HOST } = this.data;

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '上传中…'
        });

        utils.file.md5(file.url).then(hash => {
            const fileName = `refound/${hash}${utils.file.ext(file.url)}`;

            utils.oss(fileName).then(sign => {
                wx.uploadFile({
                    url: sign.host,
                    filePath: file.url,
                    name: 'file',
                    formData: sign,
                    success: () => {
                        $toast.clear();
                        this.setData({
                            uploadImgList: [{ url: `${ASSETS_HOST}/${sign.key}` }],
                            attachment_url: `/${sign.key}`
                        });
                    },
                    fail: () => {
                        $toast.clear();
                        $notify({
                            type: 'danger',
                            message: '上传图片失败，请重试'
                        });
                    }
                });
            });
        });
    },
    cancel() {
        const pages = getCurrentPages();

        if (pages.length === 1) {
            wx.redirectTo({ url: '/pages/refound/index' });
        } else {
            wx.navigateBack({ delta: 1 });
        }
    },
    submit() {
        const pages = getCurrentPages();
        //获取所需页面
        const prePage = pages[pages.length - 2];

        this.validate(() => {
            const item = {
                reason: this.data.reason,
                code: this.data.code,
                num: this.data.num,
                date: this.data.date,
                attachment_url: this.data.attachment_url,
                fee: this.data.fee
            };

            const { items } = prePage.data;

            if (this.data.index !== null) {
                items[this.data.index] = item;
            } else {
                items.push(item);
            }

            prePage.setData({ items });
            prePage.computedTotal();
            wx.navigateBack({ delta: 1 });
        });
    }
});
