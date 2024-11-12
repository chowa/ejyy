<template>
    <WaterMark>
        <Header back />

        <Card dis-hover :bordered="false" title="房产信息">
            <Row class="detail-row">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">小区名称</span>
                    <div class="detail-content">{{ community_name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">房产详情</span>
                    <div class="detail-content">{{ detail.info | building(false) }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">
                        房产类型
                    </span>
                    <div class="detail-content">
                        <Tag :color="building_type.color">{{ building_type.text }}</Tag>
                    </div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">建筑面积</span>
                    <div class="detail-content">{{ detail.info.construction_area }}㎡</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24" v-if="detail.info.step >= 3">
                    <span class="detail-label">
                        导入时间
                    </span>
                    <div class="detail-content">{{ detail.info.finished_at | mom_format }}</div>
                </Col>
            </Row>
        </Card>

        <Card dis-hover :bordered="false" title="初始业主信息" class="mt-16">
            <span slot="extra">
                <a @click="showModal" v-if="!detail.registered">
                    <Icon type="ios-add-circle-outline" />
                    添加
                </a>
            </span>
            <Row class="detail-row" v-if="detail.registered">
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">业主姓名</span>
                    <div class="detail-content">{{ detail.registered.name }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">身份证号</span>
                    <div class="detail-content">{{ detail.registered.idcard }}</div>
                </Col>
                <Col :lg="8" :sm="12" :xs="24">
                    <span class="detail-label">手机号码</span>
                    <div class="detail-content">{{ detail.registered.phone }}</div>
                </Col>
            </Row>
            <Empty label="暂无初始业主信息" v-else />
        </Card>

        <Card
            dis-hover
            :bordered="false"
            title="关联业主信息"
            v-if="userInfo.access.includes(ROLES.YZDA)"
            class="mt-16"
        >
            <Table :columns="owners" :data="detail.owners" />
        </Card>

        <Card
            dis-hover
            :bordered="false"
            title="关联车辆信息"
            v-if="userInfo.access.includes(ROLES.CLGL) && (detail.info.type === 2 || detail.info.type === 5)"
            class="mt-16"
        >
            <Table :columns="cars" :data="detail.cars" />
        </Card>

        <Modal title="更新初始业主信息" v-model="visible">
            <Form ref="form" :rules="rules" :model="form" @submit.native.prevent label-position="top">
                <FormItem prop="name" label="业主姓名：">
                    <Input v-model="form.name" placeholder="请输入业主姓名" />
                </FormItem>
                <FormItem prop="idcard" label="身份证号码：">
                    <Input v-model="form.idcard" placeholder="请输入身份证号码" />
                </FormItem>
                <FormItem prop="phone" label="手机号码：">
                    <Input v-model="form.phone" placeholder="请输入手机号码" />
                </FormItem>
            </Form>

            <div slot="footer">
                <Button @click="hideModal">取消</Button>
                <Button type="primary" @click="submit" :loading="submiting">更新</Button>
            </div>
        </Modal>

        <Drawer :title="ownerDrawerTitle" v-model="showOwerDrawer" placement="left" width="70">
            <Table :columns="historyColumn" :data="ownerHistoryData" />
            <Spin size="large" fix v-if="ownerFetching" />
        </Drawer>

        <Drawer :title="carDrawerTitle" v-model="showCarDrawer" placement="right" width="70">
            <Table :columns="historyColumn" :data="carHistoryData" />
            <Spin size="large" fix v-if="carFetching" />
        </Drawer>
        <Spin size="large" fix v-if="fetching" />
    </WaterMark>
</template>

<script>
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

import { mapGetters } from 'vuex';
import {
    Card,
    Spin,
    Row,
    Col,
    Tag,
    Form,
    FormItem,
    Button,
    Input,
    Message,
    Modal,
    Icon,
    Table,
    Drawer
} from 'view-design';
import { Header, Empty, WaterMark } from '@/components';
import * as utils from '@/utils';
import ROLES from '@/constants/role';
import formMixin from '@/mixins/form';
import moment from 'moment';

export default {
    name: 'BasicBuildingDetail',
    data() {
        return {
            ROLES,
            fetching: true,
            detail: {
                info: {},
                registered: null,
                owners: [],
                cars: []
            },
            visible: false,
            submiting: false,
            form: {
                name: '',
                idcard: '',
                phone: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入业主姓名' },
                    { max: 12, message: '业主姓名最多输入12个字' }
                ],
                idcard: [
                    { required: true, message: '请输入身份证号码' },
                    { pattern: /^\d{17}(x|X|\d){1}$/, message: '请输入正确的身份证号码' }
                ],
                phone: [
                    { required: true, message: '请输入手机号码' },
                    { pattern: /^1\d{10}$/, message: '请输入正确的手机号码' }
                ]
            },
            owners: [
                {
                    title: '业主姓名',
                    minWidth: 120,
                    render: (h, p) => {
                        if (this.userInfo.access.includes(ROLES.YZDA)) {
                            return h(
                                'a',
                                { on: { click: () => this.$router.push(`/basic/owner/detail/${p.row.user_id}`) } },
                                p.row.real_name
                            );
                        } else {
                            return h('span', p.row.real_name);
                        }
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
                    render: (h, p) =>
                        h('span', [
                            h(
                                'a',
                                { on: { click: () => this.buildingOperate(p.row, p.index) } },
                                p.row.status ? '解除绑定' : '恢复绑定'
                            ),
                            h('a', { on: { click: () => this.getOwerHistory(p.row, p.index) } }, '操作历史')
                        ])
                }
            ],
            cars: [
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
                    render: (h, p) =>
                        h('span', [
                            h(
                                'a',
                                { on: { click: () => this.carOperate(p.row, p.index) } },
                                p.row.status ? '解除绑定' : '恢复绑定'
                            ),
                            h('a', { on: { click: () => this.getCarHistory(p.row, p.index) } }, '操作历史')
                        ])
                }
            ],
            showCarDrawer: false,
            carDrawerTitle: '',
            carFetching: false,
            showOwerDrawer: false,
            carHistoryMap: {},
            carHistoryData: [],
            ownerDrawerTitle: '',
            ownerFetching: false,
            ownerHistoryMap: {},
            ownerHistoryData: [],
            historyColumn: [
                {
                    title: '操作类型',
                    minWidth: 100,
                    render: (h, p) => h('span', p.row.status ? '恢复绑定' : '解除绑定')
                },
                {
                    title: '操作身份',
                    minWidth: 100,
                    render: (h, p) => {
                        let text;

                        switch (p.row.operate_by) {
                            case 1:
                                text = '自己';
                                break;

                            case 2:
                                text = '家人';
                                break;

                            case 3:
                                text = '物业';
                                break;
                        }
                        return h('span', text);
                    }
                },
                {
                    title: '操作人',
                    minWidth: 100,
                    render: (h, p) => {
                        if (p.row.operate_by === 3) {
                            return h(
                                'a',
                                {
                                    on: {
                                        click: () => {
                                            this.$router.push(
                                                `/oa/hr/colleague/detail/${p.row.property_company_user_id}`
                                            );
                                        }
                                    }
                                },
                                p.row.property_company_user_real_name
                            );
                        }

                        if (this.userInfo.access.includes(ROLES.YZDA)) {
                            return h(
                                'a',
                                {
                                    on: {
                                        click: () => {
                                            this.$router.push(`/basic/owner/detail/${p.row.ejyy_wechat_mp_user_id}`);
                                        }
                                    }
                                },
                                p.row.ejyy_wechat_mp_user_real_name
                            );
                        }

                        return h('span', p.row.ejyy_wechat_mp_user_real_name);
                    }
                },
                {
                    title: '操作时间',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                }
            ]
        };
    },
    mixins: [formMixin],
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
                .post('/building/detail', data)
                .then(res => {
                    this.fetching = false;
                    this.detail = res.data;
                })
                .catch(() => (this.fetching = false));
        },
        hideModal() {
            this.visible = false;
        },
        showModal() {
            this.visible = true;
            this.form = {
                name: '',
                idcard: '',
                phone: ''
            };
            this.$refs.form.resetFields();
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                this.submiting = true;

                const data = {
                    id: this.detail.info.id,
                    community_id: this.postInfo.default_community_id,
                    ...this.form
                };

                utils.request
                    .post('/building/registered', data)
                    .then(() => {
                        this.detail.registered = data;
                        this.submiting = false;
                        this.hideModal();
                        Message.success('更新初始业主信息成功');
                    })
                    .catch(() => (this.submiting = false));
            });
        },
        buildingOperate(detail, index) {
            Modal.confirm({
                title: '请确认',
                content: `是否要「${detail.status ? '解绑' : '恢复绑定'}」业主${
                    detail.real_name
                }与${utils.building.text(this.detail.info)}的关联吗`,
                onOk: () => {
                    const data = {
                        id: detail.id,
                        community_id: this.postInfo.default_community_id,
                        building_id: this.detail.info.id
                    };
                    const status = detail.status ? 0 : 1;
                    const url = detail.status ? '/building/unbinding' : '/building/binding';

                    utils.request
                        .post(url, data)
                        .then(res => {
                            const owners = [].concat(this.detail.owners);
                            owners[index] = {
                                ...owners[index],
                                status
                            };
                            this.detail.owners = owners;

                            if (index in this.ownerHistoryMap) {
                                this.ownerHistoryMap[index].unshift({
                                    status,
                                    created_at: res.created_at,
                                    operate_by: 3,
                                    property_company_user_id: this.userInfo.id,
                                    property_company_user_real_name: this.userInfo.real_name
                                });
                            }

                            Message.success('操作成功');
                        })
                        .catch(() => {});
                }
            });
        },
        getOwerHistory(info, index) {
            this.ownerDrawerTitle = `业主${info.real_name}与${utils.building.text(
                this.detail.info,
                false
            )}绑定关系操作历史`;
            this.showOwerDrawer = true;

            if (index in this.ownerHistoryMap) {
                this.ownerHistoryData = this.ownerHistoryMap[index];
            } else {
                const data = {
                    id: info.id,
                    community_id: this.postInfo.default_community_id
                };

                this.ownerFetching = true;

                utils.request
                    .post('/building/history', data)
                    .then(res => {
                        this.ownerFetching = false;
                        this.ownerHistoryMap[index] = res.data.list;
                        this.ownerHistoryData = res.data.list;
                    })
                    .catch(() => (this.ownerFetching = false));
            }
        },
        carOperate(detail, index) {
            Modal.confirm({
                title: '请确认',
                content: `是否要「${detail.status ? '解绑' : '恢复绑定'}」车辆${
                    detail.car_number
                }与${utils.building.text(this.detail.info)}的关联吗`,
                onOk: () => {
                    const data = {
                        id: detail.id,
                        community_id: this.postInfo.default_community_id,
                        building_id: this.detail.info.id
                    };
                    const status = detail.status ? 0 : 1;
                    const url = detail.status ? '/car/unbinding' : '/car/binding';

                    utils.request
                        .post(url, data)
                        .then(res => {
                            const cars = [].concat(this.detail.cars);
                            cars[index] = {
                                ...cars[index],
                                status
                            };
                            this.detail.cars = cars;

                            if (index in this.carHistoryMap) {
                                this.carHistoryMap[index].unshift({
                                    status,
                                    created_at: res.created_at,
                                    operate_by: 3,
                                    property_company_user_id: this.userInfo.id,
                                    property_company_user_real_name: this.userInfo.real_name
                                });
                            }

                            Message.success('操作成功');
                        })
                        .catch(() => {});
                }
            });
        },
        getCarHistory(info, index) {
            this.carDrawerTitle = `车辆${info.car_number}与${utils.building.text(
                this.detail.info,
                false
            )}绑定关系操作历史`;
            this.showCarDrawer = true;

            if (index in this.carHistoryMap) {
                this.carHistoryData = this.carHistoryMap[index];
            } else {
                const data = {
                    id: info.id,
                    community_id: this.postInfo.default_community_id
                };

                this.carFetching = true;

                utils.request
                    .post('/car/history', data)
                    .then(res => {
                        this.carFetching = false;
                        this.carHistoryMap[index] = res.data.list;
                        this.carHistoryData = res.data.list;
                    })
                    .catch(() => (this.carFetching = false));
            }
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        }),
        building_type() {
            let text = '';
            let color = '';

            switch (this.detail.info.type) {
                case 1:
                    text = '住宅';
                    color = 'geekblue';
                    break;

                case 2:
                    text = '车位';
                    color = 'purple';
                    break;

                case 3:
                    text = '仓房';
                    color = 'orange';
                    break;

                case 4:
                    text = '商户';
                    color = 'cyan';
                    break;

                case 5:
                    text = '车库';
                    color = 'blue';
                    break;
            }

            return { text, color };
        },
        community_name() {
            if (!this.postInfo.default_community_id) {
                return '';
            }

            const index = this.postInfo.community_list.findIndex(
                item => item.community_id === this.postInfo.default_community_id
            );

            return this.postInfo.community_list[index].name;
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
        FormItem,
        Form,
        Button,
        Input,
        Empty,
        Modal,
        Icon,
        Table,
        Drawer,
        WaterMark
    }
};
</script>
