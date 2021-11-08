<template>
    <WaterMark>
        <Header />

        <Button type="primary" @click="showDrawer">添加仪表</Button>

        <Card dis-hover :bordered="false" class="mt-16">
            <Table stripe :columns="columns" :data="list" />

            <ListFooter>
                <Page
                    show-total
                    show-elevator
                    show-sizer
                    :page-size="page_size"
                    :total="total"
                    :current="page_num"
                    @on-change="onPageChange"
                    @on-page-size-change="onPageSizeChange"
                />
            </ListFooter>
        </Card>

        <Spin size="large" fix v-if="fetching" />

        <Drawer
            :value="visible"
            :title="updateInfo ? '修改仪表' : '添加仪表'"
            transfer
            width="460"
            class-name="cw-drawer-width-footer"
            :closable="false"
            :mask-closable="false"
        >
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent>
                <FormItem label="仪表名称：" prop="name">
                    <Input placeholder="请输入仪表名称" v-model="form.name" />
                </FormItem>
                <FormItem label="仪表密码：" prop="password">
                    <Input placeholder="请输入仪表密码" v-model="form.password" />
                </FormItem>
                <FormItem label="设备类型：" prop="category">
                    <Select placeholder="请选择设备类型" v-model="form.category" filterable>
                        <Option v-for="item in options.category" :key="item.value" :value="item.value">
                            {{ item.name }}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="仪表型号：" prop="model">
                    <Input placeholder="请输入仪表型号" v-model="form.model" />
                </FormItem>
                <FormItem label="仪表编号：" prop="no">
                    <Input placeholder="请输入仪表编号" v-model="form.no" />
                </FormItem>
                <FormItem label="imei：" prop="imei">
                    <Input placeholder="请输入仪表imei" v-model="form.imei" />
                </FormItem>
                <FormItem label="关联房产：" prop="building_id">
                    <Select placeholder="请选择关联房产" v-model="form.building_id" filterable>
                        <Option v-for="item in options.building" :key="item.building_id" :value="item.building_id">
                            {{ item | building }}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="关联中继器：" prop="repeater_id">
                    <Select placeholder="请选择关联中继器" v-model="form.repeater_id" filterable>
                        <Option v-for="item in options.repeater" :key="item.id" :value="item.id">
                            {{ item.name }}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="初始值：" prop="init_value">
                    <Input placeholder="请输入仪表初始值" type="number" v-model="form.init_value" />
                </FormItem>
                <FormItem label="当前值：" prop="current_value">
                    <Input placeholder="请输入仪表当前值" type="number" v-model="form.current_value" />
                </FormItem>
                <FormItem label="最大值：" prop="max_value">
                    <Input placeholder="请输入仪表最大值" type="number" v-model="form.max_value" />
                </FormItem>
            </Form>

            <div class="cw-drawer-footer">
                <Button @click="cancel">取消</Button>
                <Button type="primary" :loading="submiting" @click="submit">{{ updateInfo ? '修改' : '添加' }}</Button>
            </div>
        </Drawer>
    </WaterMark>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Header, ListFooter, WaterMark } from '@/components';
import {
    Card,
    Page,
    Spin,
    Table,
    Tag,
    Button,
    Drawer,
    Form,
    Input,
    Select,
    Option,
    FormItem,
    Message
} from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';
import ROLES from '@/constants/role';

export default {
    name: 'IotEnergyMeter',
    data() {
        return {
            fetching: true,
            options: {
                building: [],
                repeater: [],
                category: [
                    {
                        name: '水表',
                        value: 1
                    },
                    {
                        name: '电表',
                        value: 2
                    },
                    {
                        name: '燃气表',
                        value: 3
                    }
                ]
            },
            columns: [
                {
                    title: '仪表名称',
                    minWidth: 120,
                    key: 'name'
                },
                {
                    title: '仪表密码',
                    minWidth: 120,
                    render: (h, p) => h('span', p.row.password ? p.row.password : '-')
                },
                {
                    title: '仪表型号',
                    minWidth: 120,
                    key: 'model'
                },
                {
                    title: '设备类型',
                    minWidth: 120,
                    render: (h, p) => {
                        const index = this.options.category.findIndex(item => item.value === p.row.category);

                        return h('span', index >= 0 ? this.options.category[index].name : '-');
                    }
                },
                {
                    title: '仪表编号',
                    minWidth: 120,
                    render: (h, p) => h('span', p.row.no ? p.row.no : '-')
                },
                {
                    title: 'imei',
                    minWidth: 120,
                    render: (h, p) => h('span', p.row.imei ? p.row.imei : '-')
                },
                {
                    title: '关联房产',
                    minWidth: 120,
                    render: (h, p) => {
                        if (this.userInfo.access.includes(ROLES.FCDA) && p.row.building_id) {
                            return h(
                                'a',
                                {
                                    on: {
                                        click: () => this.$router.push(`/basic/building/detail/${p.row.building_id}`)
                                    }
                                },
                                utils.building.text(p.row)
                            );
                        }

                        return h('span', p.row.building_id ? utils.building.text(p.row) : '-');
                    }
                },
                {
                    title: '关联中继器',
                    minWidth: 120,
                    render: (h, p) => {
                        const index = this.options.repeater.findIndex(item => item.id === p.row.repeater_id);

                        return h('span', index >= 0 ? this.options.repeater[index].name : '-');
                    }
                },
                {
                    title: '设备状态',
                    minWidth: 100,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.online ? 'success' : 'warning' } },
                            p.row.online ? '在线' : '离线'
                        )
                },
                {
                    title: '初始读数',
                    minWidth: 120,
                    key: 'init_value'
                },
                {
                    title: '当前读数',
                    minWidth: 120,
                    key: 'current_value'
                },
                {
                    title: '最大读数',
                    minWidth: 120,
                    key: 'max_value'
                },
                {
                    title: '创建人',
                    minWidth: 120,
                    render: (h, p) =>
                        h(
                            'a',
                            {
                                on: {
                                    click: () => this.$router.push(`/oa/hr/colleague/detail/${p.row.created_by}`)
                                }
                            },
                            p.row.real_name
                        )
                },
                {
                    title: '添加时间',
                    minWidth: 160,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                },
                {
                    title: '操作',
                    key: 'id',
                    minWidth: 180,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            h('a', { on: { click: () => this.goUpdate(p.row) } }, '修改配置'),
                            h('a', { on: { click: () => this.printQrcode(p.row) } }, '打印二维码')
                        ])
                }
            ],
            visible: false,
            form: {
                name: '',
                password: '',
                model: '',
                category: '',
                no: '',
                imei: '',
                repeater_id: '',
                building_id: '',
                init_value: '',
                current_value: '',
                max_value: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入仪表名称' },
                    { max: 32, message: '仪表名称不能超过32个字符' }
                ],
                password: [{ max: 32, message: '仪表密码不能超过32个字符' }],
                model: [
                    { required: true, message: '请输入仪表型号' },
                    { max: 32, message: '仪表型号不能超过32个字符' }
                ],
                category: [{ required: true, type: 'number', message: '请选择仪表类型' }],
                no: [{ max: 32, message: '仪表编号长度应小于32个字符' }],
                imei: [{ max: 32, message: 'imei长度应小于32个字符' }],
                repeater_id: [{ type: 'number', message: '请选择所属中继器' }],
                building_id: [{ type: 'number', message: '请选择所属房产' }],
                init_value: [{ required: true, message: '请输入仪表初始读数' }],
                current_value: [{ required: true, message: '请输入仪表当前读数' }],
                max_value: [{ required: true, message: '请输入仪表最大读数' }]
            },
            updateInfo: null,
            submiting: false
        };
    },
    mixins: [pageMixin],
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getListData();
        }
    },
    methods: {
        getListData() {
            const { page_num, page_size, postInfo, options } = this;
            this.fetching = true;

            const run = () => {
                const data = {
                    page_num,
                    page_size,
                    community_id: postInfo.default_community_id
                };

                utils.request
                    .post('/energy/meter', data)
                    .then(res => {
                        this.fetching = false;
                        this.page_num = res.data.page_num;
                        this.page_size = res.data.page_size;
                        this.list = res.data.list;
                        this.total = res.data.total;
                    })
                    .catch(() => (this.fetching = false));
            };

            if (options.building.length === 0) {
                const data = { community_id: postInfo.default_community_id };

                Promise.all([
                    utils.request.post('/energy/repeater_option', data),
                    utils.request.post('/option/building', data)
                ]).then(([r, b]) => {
                    this.options.building = b.data.list;
                    this.options.repeater = r.data.list;

                    run();
                });
            } else {
                run();
            }
        },
        showDrawer() {
            this.form = {
                model: '',
                name: '',
                password: '',
                category: '',
                no: '',
                imei: '',
                repeater_id: '',
                building_id: '',
                init_value: '',
                current_value: '',
                max_value: ''
            };
            this.$refs.form.resetFields();
            this.updateInfo = null;
            this.visible = true;
        },
        goUpdate(info) {
            this.form = {
                name: info.name ? info.name : '',
                password: info.password ? info.password : '',
                model: info.model ? info.model : '',
                category: info.category ? info.category : '',
                no: info.no ? info.no : '',
                imei: info.imei ? info.imei : '',
                repeater_id: info.repeater_id ? info.repeater_id : '',
                building_id: info.building_id ? info.building_id : '',
                init_value: info.init_value ? info.init_value : '',
                current_value: info.current_value ? info.current_value : '',
                max_value: info.max_value ? info.max_value : ''
            };
            this.$refs.form.resetFields();
            this.updateInfo = info;
            this.visible = true;
        },
        cancel() {
            this.visible = false;
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                this.submiting = true;

                if (!this.updateInfo) {
                    utils.request
                        .post('/energy/meter_create', {
                            ...this.form,
                            community_id: this.postInfo.default_community_id
                        })
                        .then(res => {
                            const list = [].concat(this.list);

                            list.unshift({
                                ...this.form,
                                ...res.data,
                                community_id: this.postInfo.default_community_id,
                                created_at: res.data.created_at,
                                created_by: this.userInfo.id,
                                real_name: this.userInfo.real_name
                            });
                            this.list = list;
                            this.submiting = false;
                            this.visible = false;
                            Message.success('添加仪表成功');
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    utils.request
                        .post('/energy/meter_update', {
                            ...this.form,
                            id: this.updateInfo.id,
                            community_id: this.postInfo.default_community_id
                        })
                        .then(res => {
                            const list = [].concat(this.list);
                            const sign = list.findIndex(item => item.id === this.updateInfo.id);
                            list[sign] = {
                                ...list[sign],
                                ...this.form,
                                ...res.data
                            };
                            this.list = list;
                            this.submiting = false;
                            this.visible = false;
                            Message.success('修改仪表成功');
                        })
                        .catch(() => (this.submiting = false));
                }
            });
        },
        printQrcode(info) {
            this.$router.push(
                `/print/meter?code=${utils.order.num('IM', info.created_at, info.id)}&title=${
                    info.building_id ? utils.building.text(info, false) : '公摊仪表'
                }`
            );
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        })
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getListData();
        }
    },
    components: {
        Header,
        ListFooter,
        Card,
        Page,
        Spin,
        Table,
        WaterMark,
        Button,
        Drawer,
        Form,
        Input,
        Select,
        Option,
        FormItem
    }
};
</script>
