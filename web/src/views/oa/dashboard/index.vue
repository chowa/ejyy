<template>
    <WaterMark>
        <Header>
            <div slot="description" class="description">
                <Avatar :size="72" :src="userInfo.avatar_url ? ASSET_HOST + userInfo.avatar_url : null" />

                <div class="info">
                    <p class="welcome">
                        {{ time }}，{{ userInfo.real_name }}，不一定每天都很好，但每天都会有些小美好在等你！
                    </p>
                    <p class="job">{{ postInfo.department }}-{{ postInfo.job }}</p>
                </div>
            </div>
        </Header>

        <Row :gutter="18">
            <Col :lg="16" :sm="12" :xs="24">
                <Card dis-hover :bordered="false" title="待办事项" class="todo-card">
                    <ul>
                        <li class="repair">
                            <div class="card-title">
                                <Icon type="maintain" />
                                维修工单
                            </div>

                            <div class="card-description">
                                维修工单指派通知，请及时处理，五分好评才是目标
                            </div>

                            <div class="card-operate">
                                <span v-if="!detail.repair_total">已处理完毕</span>
                                <router-link v-else to="/oa/order/repair">
                                    {{ detail.repair_total }}项待处理
                                </router-link>
                            </div>
                        </li>
                        <li class="complain">
                            <div class="card-title">
                                <Icon type="report" />
                                投诉工单
                            </div>

                            <div class="card-description">
                                投诉工单指派通知，请及时处理，五分好评才是目标
                            </div>

                            <div class="card-operate">
                                <span v-if="!detail.complain_total">已处理完毕</span>
                                <router-link v-else to="/oa/order/complain">
                                    {{ detail.complain_total }}项待处理
                                </router-link>
                            </div>
                        </li>
                        <li class="mission">
                            <div class="card-title">
                                <Icon type="mission" />
                                巡检任务
                            </div>

                            <div class="card-description">
                                今日巡检任务已开始，按照巡检路线开始努力工作吧
                            </div>

                            <div class="card-operate">
                                <span v-if="!detail.mission_total">已处理完毕</span>
                                <router-link v-else to="/oa/mission/">{{ detail.mission_total }}项待处理</router-link>
                            </div>
                        </li>
                        <li class="refound">
                            <div class="card-title">
                                <Icon type="refound" />
                                报销审批
                            </div>

                            <div class="card-description">
                                工作都完成了，快把钱给员工报销了吧，不然下次谁干
                            </div>

                            <div class="card-operate">
                                <span v-if="!detail.refound_total">已处理完毕</span>
                                <router-link v-else to="/oa/refound/flow?tab=approver">
                                    {{ detail.refound_total }}项待处理
                                </router-link>
                            </div>
                        </li>
                        <li class="leave">
                            <div class="card-title">
                                <Icon type="leave" />
                                请假审批
                            </div>

                            <div class="card-description">
                                谁都有点急事，工作能安排开的话就批了吧，大家都不容易
                            </div>

                            <div class="card-operate">
                                <span v-if="!detail.leave_total">已处理完毕</span>
                                <router-link v-else to="/oa/leave/flow?tab=approver">
                                    {{ detail.leave_total }}项待处理
                                </router-link>
                            </div>
                        </li>
                        <li class="purchase">
                            <div class="card-title">
                                <Icon type="warehouse" />
                                采购审批
                            </div>

                            <div class="card-description">
                                你我他都是企业的主人，人机料样样好才能保证质量的稳定
                            </div>

                            <div class="card-operate">
                                <span v-if="!detail.purchase_total">已处理完毕</span>
                                <router-link v-else to="/oa/material/flow?tab=approver">
                                    {{ detail.purchase_total }}项待处理
                                </router-link>
                            </div>
                        </li>
                    </ul>
                </Card>
            </Col>
            <Col :lg="8" :sm="12" :xs="24">
                <Card dis-hover :bordered="false" title="今日会议">
                    <Table stripe :columns="meetingColumns" :data="detail.meeting" />
                </Card>
            </Col>
        </Row>

        <Row :gutter="18" class="mt-16">
            <Col :xxl="8" :xl="12" :lg="12" :sm="12" :xs="24">
                <Card dis-hover :bordered="false" class="carousel-card party-card" ref="carouselWrapper">
                    <p slot="title">
                        <Icon type="party" />
                        党建党讯
                    </p>
                    <div>
                        <Carousel :height="height" loop v-if="height > 0" autoplay :autoplay-speed="6000">
                            <CarouselItem v-for="item in detail.party" :key="item.id">
                                <div class="carousel-item" :style="`height: ${height}px`">
                                    <router-link :to="`/oa/party/detail/${item.id}`">
                                        <img :src="ASSET_HOST + item.cover_img" />
                                        <div class="title" :title="item.title">
                                            {{ item.title }}
                                        </div>
                                    </router-link>
                                </div>
                            </CarouselItem>
                        </Carousel>
                        <div
                            v-if="detail.party.length === 0"
                            class="no-article"
                            :style="`height: ${height}px;line-height:${height}px`"
                        >
                            暂无文章
                        </div>
                    </div>
                </Card>
            </Col>
            <Col :xxl="8" :xl="12" :lg="12" :sm="12" :xs="24">
                <Card dis-hover :bordered="false" class="carousel-card min-mt-16" title="行政通知">
                    <Carousel :height="height" loop v-if="height > 0" autoplay :autoplay-speed="6000">
                        <CarouselItem v-for="item in detail.inform" :key="item.id">
                            <div class="carousel-item" :style="`height: ${height}px`">
                                <router-link :to="`/oa/inform/detail/${item.id}`">
                                    <img :src="ASSET_HOST + item.cover_img" />
                                    <div class="title" :title="item.title">
                                        {{ item.title }}
                                    </div>
                                </router-link>
                            </div>
                        </CarouselItem>
                    </Carousel>
                    <div
                        v-if="detail.inform.length === 0"
                        class="no-article"
                        :style="`height: ${height}px;line-height:${height}px`"
                    >
                        暂无文章
                    </div>
                </Card>
            </Col>
            <Col :xxl="8" :xl="10" :lg="10" :sm="24" :xs="24">
                <Card dis-hover :bordered="false" title="登录日志" class="md-mt-16">
                    <Table stripe :columns="loginColumns" :data="detail.login" />
                </Card>
            </Col>
        </Row>
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
import { Header, WaterMark } from '@/components';
import { Avatar, Row, Col, Card, Icon, Table, Carousel, CarouselItem } from 'view-design';
import { ASSET_HOST } from '@/config';
import moment from 'moment';
import * as utils from '@/utils';

export default {
    name: 'DashboardWorkPlace',
    data() {
        return {
            ASSET_HOST,
            height: 0,
            detail: {
                meeting: [],
                party: [],
                inform: [],
                login: []
            },
            meetingColumns: [
                {
                    title: '会议时间',
                    minWidth: 120,
                    render: (h, p) =>
                        h(
                            'span',
                            `${moment(p.row.start_time).format('HH:mm')} 至 ${moment(p.row.end_time).format('HH:mm')}`
                        )
                },
                {
                    title: '会议室名称',
                    minWidth: 120,
                    key: 'name'
                },
                {
                    title: '会议室位置',
                    minWidth: 120,
                    key: 'local'
                },
                {
                    title: '查看',
                    key: 'id',
                    minWidth: 60,
                    render: (h, p) =>
                        h(
                            'a',
                            {
                                on: {
                                    click: () => {
                                        this.$router.push(`/oa/meeting/detail/${p.row.id}`);
                                    }
                                }
                            },
                            '查看'
                        )
                }
            ],
            loginColumns: [
                {
                    title: '登录地址',
                    key: 'ip',
                    minWidth: 120
                },
                {
                    title: '终端类型',
                    key: 'user_agent',
                    minWidth: 220
                },
                {
                    title: '登录时间',
                    minWidth: 240,
                    render: (h, p) => h('span', moment(p.row.login_at).format('YYYY-MM-DD HH:mm:ss'))
                }
            ]
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getDetail();
        }

        window.addEventListener('resize', this.computedHeight, false);
        this.computedHeight();
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.computedHeight);
    },
    methods: {
        computedHeight() {
            this.$nextTick(() => {
                const { width } = this.$refs.carouselWrapper.$el.getBoundingClientRect();

                this.height = Math.ceil((width * 712) / 1200);
            });
        },
        getDetail() {
            const data = {
                community_id: this.postInfo.default_community_id
            };

            utils.request.post('/statistic/work', data).then(res => {
                this.fetching = false;
                this.detail = res.data;
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        time() {
            const hour = new Date().getHours();
            // 设置默认文字
            let text;

            if (hour >= 0 && hour < 5) {
                text = '凌晨好';
            } else if (hour >= 5 && hour <= 8) {
                text = '早上好';
            } else if (hour > 8 && hour <= 12) {
                text = '上午好';
            } else if (hour > 12 && hour <= 14) {
                text = '中午好';
            } else if (hour > 14 && hour <= 18) {
                text = '下午好';
            } else if (hour > 18 && hour < 24) {
                text = '晚上好';
            }

            return text;
        }
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getDetail();
        }
    },
    components: {
        Header,
        WaterMark,
        Avatar,
        Row,
        Col,
        Card,
        Icon,
        Table,
        Carousel,
        CarouselItem
    }
};
</script>

<style lang="less">
.description {
    display: flex;
    flex-direction: row;
    align-items: center;

    .ivu-avatar {
        flex: none;
    }

    .info {
        padding-left: 24px;

        .welcome {
            font-size: 20px;
            line-height: 28px;
            margin-bottom: 12px;
            font-weight: 600;
        }

        .job {
            font-size: 14px;
            line-height: 20px;
            color: #999;
        }
    }
}

.todo-card {
    .ivu-card-body {
        padding: 0 !important;
    }

    .ivu-card-head {
        border-bottom: none !important;
    }

    ul {
        list-style: none;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        li {
            width: 33.33%;
            padding: 24px;
            border: 0;
            border-radius: 0;
            box-shadow: 1px 0 0 0 #f0f0f0, 0 1px 0 0 #f0f0f0, 1px 1px 0 0 #f0f0f0, inset 1px 0 0 0 #f0f0f0,
                inset 0 1px 0 0 #f0f0f0;
            transition: all 0.3s;

            &:hover {
                box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12),
                    0 5px 12px 4px rgba(0, 0, 0, 0.09);
            }

            .card-title {
                margin-bottom: 8px;
                overflow: hidden;
                font-weight: 500;
                font-size: 16px;
                white-space: nowrap;
                text-overflow: ellipsis;

                .ivu-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    line-height: 28px;
                    text-align: center;
                    margin-right: 8px;
                    color: #fff;
                }
            }

            .card-description {
                font-size: 14px;
                color: #999;
                line-height: 20px;
                margin-bottom: 12px;
            }

            .card-operate {
                font-size: 12px;
                color: #999;
            }

            &.repair .ivu-icon {
                background: #66cccc;
            }

            &.complain .ivu-icon {
                background: #ff6666;
            }

            &.mission .ivu-icon {
                background: #339933;
            }

            &.refound .ivu-icon {
                background: #cc3399;
            }

            &.leave .ivu-icon {
                background: #99ccff;
            }

            &.purchase .ivu-icon {
                background: #9933cc;
            }
        }
    }
}

.carousel-card {
    .ivu-card-body {
        padding: 0 !important;
    }

    .no-article {
        font-size: 12px;
        color: #999;
        text-align: center;
    }
}

.party-card {
    background: #ae0001 !important;

    .ivu-card-head {
        border-bottom: none !important;

        p {
            color: #ffff01 !important;
        }
    }
}

.carousel-item {
    position: relative;

    .title {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.65);
        color: #fff;
        font-size: 16px;
        height: 40px;
        line-height: 40px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 16px;
    }
}

@media screen and (max-width: 1600px) {
    .md-mt-16 {
        margin-top: 16px;
    }
}

@media screen and (max-width: 576px) {
    .todo-card {
        margin-bottom: 16px;

        ul li {
            width: 50%;
        }
    }

    .min-mt-16 {
        margin-top: 16px;
    }
}
</style>
