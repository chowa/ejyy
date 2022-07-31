<template>
    <WaterMark>
        <Header />

        <Button type="primary" @click="showDrawer">添加灯控</Button>

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
            :title="updateInfo ? '修改灯控' : '添加灯控'"
            transfer
            width="460"
            class-name="cw-drawer-width-footer"
            :closable="false"
            :mask-closable="false"
        >
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent>
                <FormItem label="灯控名称：" prop="name">
                    <Input placeholder="请输入灯控名称" v-model="form.name" />
                </FormItem>
                <FormItem label="SN码：" prop="sn">
                    <Input placeholder="请输入SN码" v-model="form.sn" />
                </FormItem>
                <FormItem label="aes秘钥：" prop="secret">
                    <Input placeholder="请输入密码" v-model="form.secret" />
                </FormItem>
                <FormItem prop="port_total" label="端口数量：">
                    <Input v-model="form.port_total" type="number" placeholder="请输入端口数量" />
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
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Header, ListFooter, WaterMark, LocationPicker } from '@/components';
import { Card, Page, Spin, Table, Tag, Button, Drawer, Form, Input, FormItem, Message } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'IotLampManage',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    title: '灯控名称',
                    minWidth: 120,
                    key: 'name'
                },
                {
                    title: 'aes秘钥',
                    minWidth: 120,
                    key: 'secret'
                },
                {
                    title: 'SN码',
                    minWidth: 120,
                    key: 'sn'
                },
                {
                    title: '端口数量',
                    minWidth: 120,
                    key: 'port_total'
                },
                {
                    title: '设备状态',
                    minWidth: 80,
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
                    minWidth: 140,
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
                secret: '',
                name: '',
                sn: '',
                port_total: '',
                latlng: []
            },
            rules: {
                secret: [
                    { required: true, message: '请输入aes秘钥' },
                    { max: 128, message: 'aes秘钥长度应小于128个字符' }
                ],
                name: [
                    { required: true, message: '请输入灯控名称' },
                    { max: 56, message: '灯控名称不能超过56个字符' }
                ],
                sn: [
                    { required: true, message: '请输入SN码' },
                    { max: 56, message: 'SN码不能超过56个字符' }
                ],
                port_total: [{ required: true, message: '请输入端口数量' }],
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
                .post('/lamp/list', data)
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
                secret: '',
                name: '',
                sn: '',
                port_total: '',
                latlng: []
            };
            this.$refs.form.resetFields();
            this.updateInfo = null;
            this.visible = true;
        },
        goUpdate(info) {
            this.form = {
                secret: info.secret ? info.secret : '',
                name: info.name ? info.name : '',
                sn: info.sn ? info.sn : '',
                port_total: info.port_total ? info.port_total : '',
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
                        .post('/lamp/create', data)
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
                            Message.success('添加灯控成功');
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    data.id = this.updateInfo.id;

                    utils.request
                        .post('/lamp/update', data)
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
                            Message.success('修改灯控成功');
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
        FormItem,
        LocationPicker
    }
};
</script>
