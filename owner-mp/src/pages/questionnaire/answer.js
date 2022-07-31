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
        id: null,
        fetching: true,
        questions: [],
        title: null,
        expire: null,
        answers: [],
        submiting: false
    },
    onLoad(opts) {
        // opts.id = 1;

        utils
            .request({
                url: `/questionnaire/questions/${opts.id}`,
                method: 'get'
            })
            .then(
                res => {
                    wx.setNavigationBarTitle({ title: res.data.title });

                    this.setData({
                        fetching: false,
                        ...res.data,
                        id: parseInt(opts.id, 10)
                    });
                },
                res => {
                    wx.redirectTo({ url: `/pages/questionnaire/detail?id=${opts.id}` });
                }
            );
    },
    onQuestionChange(e) {
        const { index } = e.currentTarget.dataset;
        const { answers } = this.data;

        answers[index] = e.detail;

        this.setData({ answers });
    },
    submit() {
        const { questions, answers, id } = this.data;
        const result = [];
        const validated = questions.every((item, index) => {
            if (item.type === 1) {
                if (!answers[index]) {
                    return false;
                }
                result.push({
                    id: item.id,
                    options: [answers[index]]
                });
            } else if (item.type === 2) {
                if (!Array.isArray(answers[index]) || answers[index].length === 0) {
                    return false;
                }

                result.push({
                    id: item.id,
                    options: answers[index]
                });
            }

            return true;
        });

        if (!validated) {
            return $toast({ message: `请对第${result.length + 1}问题作出选择` });
        }

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '提交中…'
        });

        this.setData({ submiting: true });

        utils
            .request({
                url: '/questionnaire/submit',
                data: {
                    questionnaire_id: id,
                    answers: result
                },
                method: 'post'
            })
            .then(
                res => {
                    this.setData({ submiting: false });
                    $toast.clear();

                    const pages = getCurrentPages();

                    if (pages.length > 2) {
                        const prePage = pages[pages.length - 2];
                        prePage.loadData(1);
                    }

                    wx.redirectTo({ url: `/pages/questionnaire/detail?id=${res.data.id}` });
                },
                res => {
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                    $toast.clear();
                }
            );
    }
});
