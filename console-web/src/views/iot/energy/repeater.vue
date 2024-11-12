<template>
    <WaterMark>
        <Header />

        <Button type="primary" @click="showDrawer">添加中继器</Button>

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
            :title="updateInfo ? '修改中继器' : '添加中继器'"
            transfer
            width="460"
            class-name="cw-drawer-width-footer"
            :closable="false"
            :mask-closable="false"
        >
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent>
                <FormItem label="中继器名称：" prop="name">
                    <Input placeholder="请输入中继器名称" v-model="form.name" />
                </FormItem>
                <FormItem label="设备类型：" prop="category">
                    <Select placeholder="请选择设备类型" v-model="form.category" filterable>
                        <Option v-for="item in options" :key="item.value" :value="item.value">
                            {{ item.name }}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="识别码：" prop="sign">
                    <Input placeholder="请输入中继器识别码" v-model="form.sign" />
                </FormItem>
                <FormItem label="用户名：" prop="username">
                    <Input placeholder="请输入中继器用户名" v-model="form.username" />
                </FormItem>
                <FormItem prop="password" label="密码：">
                    <Input v-model="form.password" placeholder="请输入中继器密码" />
                </FormItem>
                <FormItem prop="latlng" label="安装位置：">
                    <LocationPicker v-model="form.latlng" />
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
import { Header, ListFooter, WaterMark, LocationPicker } from '@/components';
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

export default {
    name: 'IotEnergyRepeater',
    data() {
        return {
            fetching: true,
            options: [
                {
                    name: '旋坤',
                    value: 1
                },
                {
                    name: '有人',
                    value: 2
                }
            ],
            columns: [
                {
                    title: '中继器名称',
                    minWidth: 120,
                    key: 'name'
                },
                {
                    title: '设备类型',
                    minWidth: 120,
                    render: (h, p) => {
                        const index = this.options.findIndex(item => item.value === p.row.category);

                        return h('span', index >= 0 ? this.options[index].name : '-');
                    }
                },
                {
                    title: '识别码',
                    minWidth: 120,
                    key: 'sign'
                },
                {
                    title: '用户名',
                    minWidth: 120,
                    key: 'username'
                },
                {
                    title: '密码',
                    minWidth: 120,
                    key: 'password'
                },
                {
                    title: '接口形参',
                    minWidth: 120,
                    render: (h, p) => h('span', `${p.row.id}，${p.row.community_id}`)
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
                    minWidth: 100,
                    fixed: 'right',
                    render: (h, p) => h('a', { on: { click: () => this.goUpdate(p.row) } }, '修改配置')
                }
            ],
            visible: false,
            form: {
                sign: '',
                name: '',
                category: '',
                username: '',
                password: '',
                latlng: []
            },
            rules: {
                name: [
                    { required: true, message: '请输入中继器名称' },
                    { max: 56, message: '中继器名称不能超过56个字符' }
                ],
                sign: [
                    { required: true, message: '请输入设备识别码' },
                    { max: 32, message: '设备识别码长度应小于32个字符' }
                ],
                category: [{ required: true, type: 'number', message: '请选择中继器类型' }],
                username: [
                    { required: true, message: '请输入中继器用户名' },
                    { max: 56, message: '中继器用户名长度应小于56个字符' }
                ],
                password: [
                    { required: true, message: '请输入中继器密码' },
                    { max: 56, message: '中继器密码不能超过56个字符' }
                ],
                latlng: [{ required: true, type: 'array', message: '请选择设备安装位置' }]
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
            const { page_num, page_size, postInfo } = this;

            this.fetching = true;

            const data = {
                page_num,
                page_size,
                community_id: postInfo.default_community_id
            };

            utils.request
                .post('/energy/repeater', data)
                .then(res => {
                    this.fetching = false;
                    this.page_num = res.data.page_num;
                    this.page_size = res.data.page_size;
                    this.list = res.data.list;
                    this.total = res.data.total;
                })
                .catch(() => (this.fetching = false));
        },
        showDrawer() {
            this.form = {
                sign: '',
                name: '',
                category: '',
                username: '',
                password: '',
                latlng: []
            };
            this.$refs.form.resetFields();
            this.updateInfo = null;
            this.visible = true;
        },
        goUpdate(info) {
            this.form = {
                sign: info.sign ? info.sign : '',
                name: info.name ? info.name : '',
                category: info.category ? info.category : '',
                username: info.username ? info.username : '',
                password: info.password ? info.password : '',
                latlng: info.lat ? [info.lat, info.lng] : []
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

                const data = {
                    ...this.form,
                    community_id: this.postInfo.default_community_id
                };

                data.lat = data.latlng[0];
                data.lng = data.latlng[1];

                delete data.latlng;

                if (!this.updateInfo) {
                    utils.request
                        .post('/energy/repeater_create', data)
                        .then(res => {
                            const list = [].concat(this.list);

                            list.unshift({
                                ...data,
                                id: res.data.id,
                                community_id: this.postInfo.default_community_id,
                                created_at: res.data.created_at,
                                created_by: this.userInfo.id,
                                real_name: this.userInfo.real_name
                            });
                            this.list = list;
                            this.submiting = false;
                            this.visible = false;
                            Message.success('添加中继器成功');
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    data.id = this.updateInfo.id;

                    utils.request
                        .post('/energy/repeater_update', data)
                        .then(() => {
                            const list = [].concat(this.list);
                            const index = list.findIndex(item => item.id === this.updateInfo.id);
                            list[index] = {
                                ...list[index],
                                ...data
                            };
                            this.list = list;
                            this.submiting = false;
                            this.visible = false;
                            Message.success('修改中继器成功');
                        })
                        .catch(() => (this.submiting = false));
                }
            });
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
        FormItem,
        LocationPicker
    }
};
</script>
