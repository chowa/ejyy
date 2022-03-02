<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="任务信息">
            <span slot="extra">
                <a @click="cancel" v-if="!detail.info.cancel && userInfo.id === detail.info.created_by">
                    <Icon type="md-return-left" />
                    取消任务
                </a>
            </span>

            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">任务编号</span>
                    <div class="detail-content">{{ num }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="userInfo.id !== detail.info.user_id">
                    <span class="detail-label">任务执行人</span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.info.user_id}`">
                            {{ detail.info.real_name }}
                        </router-link>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">任务开始日期</span>
                    <div class="detail-content">{{ detail.info.start_date | mom_format(false) }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">任务结束日期</span>
                    <div class="detail-content">{{ detail.info.end_date | mom_format(false) }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">上报开始时间</span>
                    <div class="detail-content">{{ start_hour }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">上报结束时间</span>
                    <div class="detail-content">{{ end_hour }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">任务分类</span>
                    <div class="detail-content">{{ detail.info.category }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">巡检路线</span>
                    <div class="detail-content">{{ detail.info.line }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">任务状态</span>
                    <div class="detail-content">
                        <Tag :color="status.color">{{ status.text }}</Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.cancel">
                    <span class="detail-label">任务取消时间</span>
                    <div class="detail-content">{{ detail.info.canceled_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">任务创建时间</span>
                    <div class="detail-content">{{ detail.info.created_at | mom_format }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">任务指派人</span>
                    <div class="detail-content">
                        <router-link :to="`/oa/hr/colleague/detail/${detail.disposeInfo.id}`">
                            {{ detail.disposeInfo.real_name }}
                        </router-link>
                    </div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" title="执行情况" class="mt-16">
            <ul class="nodes">
                <li v-for="(item, key) in nodes" :key="key" :class="`status${item.status}`" @click="showComplete(item)">
                    <div class="status">
                        {{ statusText(item.status) }}
                    </div>
                    <div class="year">
                        {{ item.year }}
                    </div>
                    <div class="date">
                        {{ item.date }}
                    </div>
                </li>
            </ul>
        </Card>

        <Drawer v-model="visible" :title="`「${nodeStatus.year}${nodeStatus.date}」巡检任务详情`" transfer width="560">
            <Spin size="large" fix v-if="nodeFetching" />

            <Timeline class="node-list" v-if="nodeList.length > 0">
                <TimelineItem v-for="(item, key) in nodeList" :key="key">
                    <h4>{{ item.local }}</h4>
                    <Row class="detail-row">
                        <Col :span="24">
                            <span class="detail-label">是否正常</span>
                            <div class="detail-content">
                                <Tag :color="item.normal ? 'success' : 'error'">{{ item.normal ? '是' : '否' }}</Tag>
                            </div>
                        </Col>
                        <Col :span="24">
                            <span class="detail-label">巡检备注</span>
                            <div class="detail-content">{{ item.remark ? item.remark : '-' }}</div>
                        </Col>
                        <Col :span="24">
                            <span class="detail-label">现场图片</span>
                            <div class="detail-content">
                                <Images :imgs="item.imgs" />
                            </div>
                        </Col>
                        <Col :span="24">
                            <span class="detail-label">图片相似度</span>
                            <div class="detail-content">{{ Math.round((item.like / item.imgs.length) * 100) }}%</div>
                        </Col>
                        <Col :span="24">
                            <span class="detail-label">巡检时间</span>
                            <div class="detail-content">{{ item.created_at | mom_format }}</div>
                        </Col>
                    </Row>
                </TimelineItem>
            </Timeline>
            <Empty v-else label="未提交巡检记录" />
        </Drawer>
        <Spin size="large" fix v-if="fetching" />
    </WaterMark>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Card, Spin, Row, Col, Tag, Icon, Modal, Message, Drawer, Timeline, TimelineItem } from 'view-design';
import { Header, WaterMark, Images, Empty } from '@/components';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'OaMissionDetail',
    data() {
        return {
            fetching: true,
            detail: {
                info: {},
                disposeInfo: {},
                complete: []
            },
            visible: false,
            nodeStatus: {},
            nodeList: [],
            nodeFetching: false
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getDetail();
        }
    },
    methods: {
        getDetail() {
            const data = {
                id: this.$route.params.id,
                community_id: this.postInfo.default_community_id
            };

            utils.request
                .post('/mission/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        cancel() {
            Modal.confirm({
                title: '请确认',
                content: '确认要取消本次巡检任务吗？此操作不可恢复',
                onOk: () => {
                    const data = {
                        id: this.$route.params.id,
                        community_id: this.postInfo.default_community_id
                    };

                    utils.request
                        .post('/mission/cancel', data)
                        .then(res => {
                            this.detail.info.cancel = 1;
                            this.detail.info.canceled_at = res.data.canceled_at;
                            Message.success('取消任务成功');
                        })
                        .catch(() => {});
                }
            });
        },
        statusText(num) {
            switch (num) {
                case 1:
                    return '任务取消';

                case 2:
                    return '日期未到';

                case 3:
                    return '已完成';

                case 4:
                    return '巡检中';

                case 5:
                    return '未完成';
            }
        },
        showComplete(record) {
            if (record.status === 2) {
                return;
            }
            if (!record.id) {
                return Message.warning('未查询到任务记录');
            }

            this.nodeFetching = true;
            this.nodeStatus = record;
            this.visible = true;

            utils.request
                .get(`/mission/line/${record.id}`)
                .then(res => {
                    this.nodeList = res.data.list;
                    this.nodeFetching = false;
                })
                .catch(() => (this.nodeFetching = false));
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        num() {
            return utils.order.num('MN', this.detail.info.created_at, this.detail.info.id);
        },
        start_hour() {
            if (this.detail.info.start_hour === undefined) return '';
            return moment()
                .hour(this.detail.info.start_hour)
                .minute(0)
                .format('HH:mm');
        },
        end_hour() {
            if (!this.detail.info.end_hour) return '';
            return moment()
                .hour(this.detail.info.end_hour)
                .minute(0)
                .format('HH:mm');
        },
        status() {
            let color = '';
            let text = '';

            if (this.detail.info.cancel) {
                color = 'magenta';
                text = '已取消';
            } else if (this.detail.info.start_date > Date.now()) {
                color = 'default';
                text = '未开始';
            } else if (this.detail.info.end_date < Date.now()) {
                color = 'blue';
                text = '已结束';
            } else {
                color = 'cyan';
                text = '进行中';
            }

            return { color, text };
        },
        nodes() {
            if (!this.detail.info.start_date) return [];

            const ret = [];
            let mom = moment(this.detail.info.start_date).startOf('day');
            const emom = moment(this.detail.info.end_date).add(1, 'day');
            const cmom = moment();

            while (!emom.isSame(mom, 'day')) {
                let status;
                const index = this.detail.complete.findIndex(item => item.date === mom.valueOf());
                const record = index >= 0 ? this.detail.complete[index] : undefined;

                if (this.detail.info.cancel && this.detail.info.canceled_at < mom.valueOf()) {
                    // 取消了
                    status = 1;
                } else if (cmom.isBefore(mom)) {
                    // 时间未到
                    status = 2;
                } else if (record && record.finish) {
                    // 工作完成
                    status = 3;
                } else if (
                    cmom.isSame(mom, 'day') &&
                    record &&
                    mom.hour() >= this.detail.info.start_hour &&
                    mom.hour() <= this.detail.info.end_hour &&
                    record.point_id
                ) {
                    // 工作中
                    status = 4;
                } else {
                    // 工作未完成
                    status = 5;
                }

                ret.push({
                    year: mom.format('YYYY年'),
                    date: mom.format('MM月DD日'),
                    id: record ? record.id : null,
                    status
                });

                mom.add(1, 'day');
            }

            return ret;
        }
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getDetail();
        }
    },
    components: {
        Card,
        Spin,
        Header,
        Row,
        Col,
        Tag,
        WaterMark,
        Images,
        Icon,
        Drawer,
        Timeline,
        TimelineItem,
        Empty
    }
};
</script>

<style lang="less">
.nodes {
    list-style: none;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 8px 0;
    text-align: center;

    li {
        margin: 18px 12px;
        width: 80px;
        border: 1px solid transparent;
        height: 120px;
        border-radius: 4px;
        cursor: not-allowed;
        padding: 10px 6px;
        transition: all 0.2s ease-in-out;

        .status {
            height: 60px;
            line-height: 60px;
            font-size: 14px;
        }

        .date,
        .year {
            font-size: 12px;
        }

        &.status1 {
            color: #eb2f96;
            background-color: #fff0f6;
            border-color: #ffadd2;
        }

        &.status2 {
            color: #2b2b2b;
            background-color: #f7f7f7;
            border-color: #e8eaec;
        }

        &.status3 {
            cursor: pointer;
            color: #52c41a;
            background-color: #f6ffed;
            border-color: #b7eb8f;
        }

        &.status4 {
            cursor: pointer;
            color: #13c2c2;
            background-color: #e6fffb;
            border-color: #87e8de;
        }

        &.status5 {
            color: #f5222d;
            background-color: #fff1f0;
            border-color: #ffa39e;
        }
    }
}

.node-list {
    h4 {
        margin-bottom: 12px;
    }
}
</style>
