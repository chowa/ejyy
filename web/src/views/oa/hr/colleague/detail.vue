<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="基础信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">姓名</span>
                    <div class="detail-content">{{ detail.info.real_name ? detail.info.real_name : '-' }}</div>
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
                        性别
                    </span>
                    <div class="detail-content">
                        <Tag :color="sex.color">{{ sex.text }}</Tag>
                    </div>
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
                        是否关注公众号
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.subscribed ? 'success' : 'warning'">
                            {{ detail.info.subscribed ? '已关注' : '未关注' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">入职时间</span>
                    <div class="detail-content">{{ detail.info.join_company_at | mom_format }}</div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" title="他的工作" class="mt-16">
            <Tabs value="他分配的工单">
                <TabPane label="他分配的工单" name="他分配的工单">
                    <Empty label="暂未开启，敬请期待" />
                </TabPane>
                <TabPane label="他创建的工单" name="他创建的工单">
                    <Empty label="暂未开启，敬请期待" />
                </TabPane>
                <TabPane label="他完成的工单" name="他完成的工单">
                    <Empty label="暂未开启，敬请期待" />
                </TabPane>
            </Tabs>
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
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Card, Spin, Row, Col, Tag, Tabs, TabPane } from 'view-design';
import { Header, Images, Empty, WaterMark } from '@/components';
import * as utils from '@/utils';

export default {
    name: 'OaHrColleagueDetail',
    data() {
        return {
            fetching: true,
            detail: {
                info: {}
            }
        };
    },
    mounted() {
        this.getDetail();
    },
    methods: {
        getDetail() {
            utils.request
                .get(`/colleague/detail/${this.$route.params.id}`)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        }
    },
    computed: {
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
        Tag,
        Images,
        Tabs,
        TabPane,
        Empty,
        WaterMark
    }
};
</script>
