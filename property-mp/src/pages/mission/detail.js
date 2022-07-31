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
import $notify from '../../components/notify/notify';

CwPage({
    data: {
        fetching: true,
        id: null,
        detail: {},
        nodes: [],
        now: Date.now()
    },
    onLoad(opt) {
        this.setData({
            id: parseInt(opt.id, 10)
        });
    },
    onGlobalDataUpdate() {
        this.getDetail();
    },
    getDetail() {
        if (!this.data.postInfo.default_community_id) {
            return Promise.reject();
        }

        this.setData({
            fetching: true
        });

        return utils
            .request({
                url: '/mission/detail',
                method: 'post',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(
                res => {
                    const nodes = [];
                    const estamp = this.startOfStamp(res.data.info.end_date) + 1000 * 24 * 60 * 60;
                    const cstamp = Date.now();
                    let stamp = this.startOfStamp(res.data.info.start_date);

                    while (estamp !== stamp) {
                        let status;
                        const index = res.data.complete.findIndex(item => item.date === stamp);
                        const record = index >= 0 ? res.data.complete[index] : undefined;
                        const sf = this.format(stamp);

                        if (res.data.info.cancel && res.data.info.canceled_at < stamp) {
                            // 取消了
                            status = 1;
                        } else if (cstamp < stamp) {
                            // 时间未到
                            status = 2;
                        } else if (record && record.finish) {
                            // 工作完成
                            status = 3;
                        } else if (
                            this.startOfStamp(cstamp) === stamp &&
                            record &&
                            sf.hour >= res.data.info.start_hour &&
                            sf.hour <= res.data.info.end_hour &&
                            record.point_id
                        ) {
                            // 工作中
                            status = 4;
                        } else {
                            // 工作未完成
                            status = 5;
                        }

                        nodes.push({
                            year: `${sf.year}年`,
                            date: `${sf.month}月${sf.date}日`,
                            id: record ? record.id : null,
                            status
                        });

                        stamp += 1000 * 24 * 60 * 60;
                    }

                    this.setData({
                        fetching: false,
                        detail: res.data,
                        nodes
                    });
                },
                res => {
                    this.setData({
                        fetching: false,
                        detail: {},
                        nodes: []
                    });

                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    },
    startOfStamp(stamp) {
        const d = new Date(stamp);

        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);

        return +d;
    },
    format(stamp) {
        const d = new Date(stamp);
        const double = num => {
            return num < 10 ? '0' + num : num;
        };

        return {
            year: d.getFullYear(),
            month: double(d.getMonth() + 1),
            date: double(d.getDate()),
            hour: d.getHours()
        };
    },
    onPullDownRefresh() {
        this.getDetail().then(() => {
            wx.stopPullDownRefresh();
        });
    },
    showDetail(e) {
        const { status, id } = e.currentTarget.dataset;

        if (status === 2) {
            return;
        }
        if (!id) {
            return $notify({
                message: '未查询到任务记录',
                type: 'danger'
            });
        }

        wx.navigateTo({ url: `/pages/mission/report?id=${id}` });
    }
});
