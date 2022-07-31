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

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';

CwPage({
    data: {
        submiting: false,
        fetching: true,
        info: {},
        id: null,
        // form start
        used_by: undefined,
        total: '',
        reason: '',
        // form end
        show: false,
        used_by_name: ''
    },
    validator: {
        formFields: ['used_by', 'total', 'reason'],
        formRule: {
            used_by: [{ required: true, type: 'number', message: '请选择领用人' }],
            total: [{ required: true, message: '请输入领用数量' }],
            reason: [
                { required: true, message: '请输入领用用途' },
                { max: 128, message: '领用用途最多输入128个字符' }
            ]
        }
    },
    onLoad(opts) {
        this.setData({
            id: parseInt(opts.id, 10)
        });
    },
    onGlobalDataUpdate() {
        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '获取中…'
        });

        utils
            .request({
                url: '/material/detail',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id
                },
                method: 'post'
            })
            .then(
                res => {
                    $toast.clear();
                    this.setData({
                        info: res.data.info,
                        fetching: false
                    });
                },
                res => {
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                    $toast.clear();

                    setTimeout(() => {
                        wx.redirectTo({ url: '/pages/home/index' });
                    }, 2000);
                }
            );
    },
    showColleague() {
        this.setData({ show: true });
    },
    hideColleague() {
        this.setData({ show: false });
    },
    onSelectColleague(e) {
        this.setData({
            show: false,
            used_by: e.detail.id,
            used_by_name: e.detail.name
        });
    },
    submit() {
        this.validate(() => {
            const { used_by, total, reason, postInfo, info, id } = this.data;

            if (info.total < parseInt(total, 10)) {
                return $toast({ message: '领用数量不能大于库存数量' });
            }

            $toast.loading({
                duration: 0,
                forbidClick: true,
                message: '提交中…'
            });

            this.setData({
                submiting: true
            });

            utils
                .request({
                    url: '/material/use',
                    data: {
                        community_id: postInfo.default_community_id,
                        used_by,
                        total,
                        reason,
                        id
                    },
                    method: 'post'
                })
                .then(
                    res => {
                        this.setData({ submiting: false });
                        $toast.clear();
                        $notify({
                            type: 'success',
                            message: '领用成功'
                        });

                        setTimeout(() => {
                            wx.redirectTo({ url: '/pages/home/index' });
                        }, 2000);
                    },
                    res => {
                        $notify({
                            type: 'danger',
                            message: res.message
                        });
                        $toast.clear();
                        this.setData({ submiting: false });
                    }
                );
        });
    }
});
