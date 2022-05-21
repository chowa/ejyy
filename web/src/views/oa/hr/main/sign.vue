<template>
    <WaterMark>
        <Header back />

        <div class="filter">
            <span>考勤时间范围：</span>
            <DatePicker
                type="daterange"
                style="width:280px"
                format="yyyy年MM月dd日"
                @on-change="onRangeChange"
                :options="{ disabledDate: d => d > Date.now() }"
                :value="[new Date(form.start), new Date(form.end)]"
            />
            <Button type="primary" @click="getDetail">查询</Button>
        </div>

        <Card dis-hover :bordered="false" class="mt-16" title="人事资料">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">姓名</span>
                    <div class="detail-content">{{ detail.info.real_name ? detail.info.real_name : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        性别
                    </span>
                    <div class="detail-content">
                        <Tag :color="sex.color">{{ sex.text }}</Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">身份证号</span>
                    <div class="detail-content">{{ detail.info.idcard ? detail.info.idcard : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">手机号码</span>
                    <div class="detail-content">{{ detail.info.phone ? detail.info.phone : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">部门</span>
                    <div class="detail-content">{{ detail.info.department ? detail.info.department : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">岗位</span>
                    <div class="detail-content">{{ detail.info.job ? detail.info.job : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        头像
                    </span>
                    <div class="detail-content">
                        <Images v-if="!fetching && detail.info.avatar_url" :imgs="[detail.info.avatar_url]" />
                        <span v-else>暂无上传</span>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        是否离职
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.leave_office ? 'error' : 'green'">
                            {{ detail.info.leave_office ? '已离职' : '工作中' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">入职时间</span>
                    <div class="detail-content">{{ detail.info.join_company_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">账号创建时间</span>
                    <div class="detail-content">{{ detail.info.created_at | mom_format }}</div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" class="mt-16" title="考勤信息">
            <Table stripe :columns="columns" :data="detail.list" />
        </Card>

        <Spin size="large" fix v-if="fetching" />
    </WaterMark>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Card, Spin, Row, Col, DatePicker, Button, Tag, Table } from 'view-design';
import { Header, Empty, WaterMark, Images } from '@/components';
import * as utils from '@/utils';
import moment from 'moment';
import HrSignLatlng from './components/latlng';

export default {
    name: 'OaHrSign',
    data() {
        return {
            fetching: true,
            form: {
                start: moment()
                    .startOf('day')
                    .subtract(7, 'day')
                    .valueOf(),
                end: moment()
                    .endOf('day')
                    .valueOf()
            },
            detail: {
                info: {},
                list: []
            },
            columns: [
                {
                    type: 'expand',
                    width: 50,
                    render: (h, params) => {
                        return h(HrSignLatlng, {
                            props: {
                                row: params.row
                            }
                        });
                    }
                },
                {
                    title: '考勤日期',
                    minWidth: 120,
                    render: (h, p) => h('span', moment(p.row.date).format('YYYY年MM月DD日'))
                },
                {
                    title: '考勤记录',
                    minWidth: 90,
                    render: (h, p) => h('span', `${p.row.total}条`)
                },
                {
                    title: '未下班打卡',
                    minWidth: 90,
                    render: (h, p) => h('span', `${p.row.total - p.row.complete}条`)
                }
            ]
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getDetail();
        }
    },
    methods: {
        onRangeChange(e) {
            this.form.start = moment(e[0], 'YYYY年MM月DD日')
                .startOf('day')
                .valueOf();
            this.form.end = moment(e[1], 'YYYY年MM月DD日')
                .endOf('day')
                .valueOf();
        },
        getDetail() {
            const data = {
                ...this.form,
                user_id: this.$route.params.id,
                community_id: this.postInfo.default_community_id
            };
            utils.request
                .post('/sign/record', data)
                .then(res => {
                    const list = [];
                    const map = {};

                    res.data.list.forEach(record => {
                        if (record.date in map) {
                            map[record.date].push(record);
                            map[record.date].total++;
                            map[record.date].complete += record.begin && record.finish ? 1 : 0;
                        } else {
                            map[record.date] = {
                                date: record.date,
                                total: 1,
                                complete: record.begin && record.finish ? 1 : 0,
                                items: [record]
                            };
                        }
                    });

                    for (let date in map) {
                        list.push(map[date]);
                    }

                    this.detail = {
                        info: res.data.info,
                        list
                    };
                    this.fetching = false;
                })
                .catch(() => (this.fetching = false));
        },
        goUpdate() {
            this.$router.push(`/oa/hr/update/${this.$route.params.id}`);
        }
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getDetail();
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        }),
        sex() {
            let color;
            let text;

            if (this.detail.info.gender === 1) {
                color = 'blue';
                text = '男';
            } else if (this.detail.info.gender === 2) {
                color = 'magenta';
                text = '女';
            } else {
                color = 'default';
                text = '未知';
            }

            return { color, text };
        }
    },
    components: {
        Card,
        Spin,
        Header,
        Row,
        Col,
        Empty,
        WaterMark,
        DatePicker,
        Button,
        Tag,
        Images,
        Table
    }
};
</script>

<style lang="less">
.filter {
    font-size: 12px;

    > span {
        margin-right: 4px;
    }

    .ivu-btn {
        margin-left: 8px;
    }
}
</style>
