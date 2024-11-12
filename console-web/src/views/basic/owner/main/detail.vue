<template>
    <WaterMark class="owner-detail">
        <Header back />

        <Alert show-icon type="warning">
            请保护业主隐私，非法泄露业主隐私信息属于违法行为
            <div slot="desc">
                <p slot="content">
                    《中华人民共和国刑法修正案（九）》：十七、将刑法第二百五十三条之一修改为：“违反国家有关规定，向他人出售或者提供公民个人信息，情节严重的，处三年以下有期徒刑或者拘役，并处或者单处罚金；情节特别严重的，处三年以上七年以下有期徒刑，并处罚金。
                </p>
            </div>
        </Alert>

        <Card dis-hover :bordered="false" title="业主信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">小区名称</span>
                    <div class="detail-content">{{ community_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">业主姓名</span>
                    <div class="detail-content">{{ detail.info.real_name ? detail.info.real_name : '-' }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">联系电话</span>
                    <div class="detail-content">{{ detail.info.phone }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">身份证号码</span>
                    <div class="detail-content">{{ detail.info.idcard ? detail.info.idcard : '-' }}</div>
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
                        身份信息是否完善
                    </span>
                    <div class="detail-content">
                        <Tag :color="detail.info.intact ? 'success' : 'default'">
                            {{ detail.info.intact ? '已完善' : '未完善' }}
                        </Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">昵称</span>
                    <div class="detail-content">{{ detail.info.nick_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">签名</span>
                    <div class="detail-content">{{ detail.info.signature }}</div>
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
                    <span class="detail-label">创建账号时间</span>
                    <div class="detail-content">{{ detail.info.created_at | mom_format }}</div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" title="业主房产" class="mt-16">
            <Table :data="detail.buildings" :columns="buildings" />
        </Card>

        <Card dis-hover :bordered="false" title="业主车辆" class="mt-16">
            <Table :data="detail.cars" :columns="cars" />
        </Card>
        <Spin size="large" fix v-if="fetching" />
    </WaterMark>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Card, Spin, Row, Col, Tag, Alert, Table, Modal, Message } from 'view-design';
import { Header, Images, WaterMark } from '@/components';
import * as utils from '@/utils';
import ROLES from '@/constants/role';

export default {
    name: 'BasicOwerDetail',
    data() {
        return {
            ROLES,
            fetching: true,
            detail: {
                info: {},
                buildings: [],
                cars: []
            },
            buildings: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('B', p.row.created_at, p.row.building_id))
                },
                {
                    title: '详细',
                    minWidth: 120,
                    render: (h, p) => {
                        if (this.userInfo.access.includes(ROLES.FCDA)) {
                            return h(
                                'a',
                                {
                                    on: {
                                        click: () => this.$router.push(`/basic/building/detail/${p.row.building_id}`)
                                    }
                                },
                                utils.building.text(p.row)
                            );
                        } else {
                            return h('span', utils.building.text(p.row));
                        }
                    }
                },
                {
                    title: '建筑面积(㎡)',
                    minWidth: 120,
                    key: 'construction_area'
                },
                {
                    title: '首次认证类型',
                    minWidth: 60,
                    render: (h, p) => {
                        let color;
                        let text;

                        if (p.row.authenticated_type === 1) {
                            color = 'volcano';
                            text = '实名信息自行关联';
                        } else if (p.row.authenticated_type === 2) {
                            color = 'orange';
                            text = '物业公司现场认证';
                        } else {
                            color = 'red';
                            text = '家人APP认证关联';
                        }

                        return h(Tag, { props: { color } }, text);
                    }
                },
                {
                    title: '状态',
                    minWidth: 80,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.status ? 'green' : 'purple' } },
                            p.row.status ? '绑定中' : '已解绑'
                        )
                },
                {
                    title: '操作',
                    minWidth: 80,
                    fixed: 'right',
                    render: (h, p) => {
                        if (this.userInfo.access.includes(ROLES.FCDA)) {
                            return h(
                                'a',
                                { on: { click: () => this.buildingOperate(p.row, p.index) } },
                                p.row.status ? '解除绑定' : '恢复绑定'
                            );
                        } else {
                            return h('span', { class: 'lighter' }, '没有操作权限');
                        }
                    }
                }
            ],
            cars: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('P', p.row.created_at, p.row.id))
                },
                {
                    title: '车牌号码',
                    minWidth: 120,
                    render: (h, p) => {
                        if (this.userInfo.access.includes(ROLES.CLGL)) {
                            return h(
                                'a',
                                { on: { click: () => this.$router.push(`/basic/car/detail/${p.row.id}`) } },
                                p.row.car_number
                            );
                        } else {
                            return h('span', p.row.car_number);
                        }
                    }
                },
                {
                    title: '车位',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.building.text(p.row))
                },
                {
                    title: '状态',
                    minWidth: 80,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.status ? 'green' : 'purple' } },
                            p.row.status ? '绑定中' : '已解绑'
                        )
                },
                {
                    title: '操作',
                    minWidth: 80,
                    fixed: 'right',
                    render: (h, p) => {
                        if (this.userInfo.access.includes(ROLES.CLGL)) {
                            return h(
                                'a',
                                { on: { click: () => this.carOperate(p.row, p.index) } },
                                p.row.status ? '解除绑定' : '恢复绑定'
                            );
                        } else {
                            return h('span', { class: 'lighter' }, '没有操作权限');
                        }
                    }
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
        getDetail() {
            const data = {
                id: this.$route.params.id,
                community_id: this.postInfo.default_community_id
            };

            utils.request
                .post('/owner/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        buildingOperate(detail, index) {
            Modal.confirm({
                title: '请确认',
                content: `是否要「${detail.status ? '解绑' : '恢复绑定'}」${utils.building.text(detail)}`,
                onOk: () => {
                    const data = {
                        id: detail.id,
                        community_id: this.postInfo.default_community_id,
                        building_id: detail.building_id
                    };
                    const status = detail.status ? 0 : 1;
                    const url = detail.status ? '/building/unbinding' : '/building/binding';

                    utils.request
                        .post(url, data)
                        .then(() => {
                            const buildings = [].concat(this.detail.buildings);
                            buildings[index] = {
                                ...buildings[index],
                                status
                            };
                            this.detail.buildings = buildings;
                            Message.success('操作成功');
                        })
                        .catch(() => {});
                }
            });
        },
        carOperate(detail, index) {
            Modal.confirm({
                title: '请确认',
                content: `是否要「${detail.status ? '解绑车辆' : '恢复绑定'}」${detail.car_number}`,
                onOk: () => {
                    const data = {
                        id: detail.id,
                        community_id: this.postInfo.default_community_id,
                        building_id: detail.building_id
                    };
                    const status = detail.status ? 0 : 1;
                    const url = detail.status ? '/car/unbinding' : '/car/binding';

                    utils.request
                        .post(url, data)
                        .then(() => {
                            const cars = [].concat(this.detail.cars);
                            cars[index] = {
                                ...cars[index],
                                status
                            };
                            this.detail.cars = cars;
                            Message.success('操作成功');
                        })
                        .catch(() => {});
                }
            });
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        community_name() {
            if (!this.postInfo.default_community_id) {
                return '';
            }

            const index = this.postInfo.community_list.findIndex(
                item => item.community_id === this.postInfo.default_community_id
            );

            return this.postInfo.community_list[index].name;
        },
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
        Images,
        Alert,
        Table,
        WaterMark
    }
};
</script>

<style lang="less">
.owner-detail {
    .lighter {
        color: #999;
    }
}
</style>
