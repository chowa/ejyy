<template>
    <WaterMark>
        <Header />

        <Button type="primary" @click="showDrawer">添加黑名单</Button>

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
            :title="updateInfo ? '修改黑名单' : '添加黑名单'"
            transfer
            width="460"
            class-name="cw-drawer-width-footer"
            :closable="false"
            :mask-closable="false"
        >
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent>
                <FormItem label="停车场：" prop="park_id">
                    <Select placeholder="请选择停车场" v-model="form.park_id" filterable>
                        <Option v-for="item in options" :key="item.id" :value="item.id">
                            {{ item.name }}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="车牌号码：" prop="car_number">
                    <Input placeholder="请输入车牌号码" v-model="form.car_number" />
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
import { Header, ListFooter, WaterMark } from '@/components';
import {
    Card,
    Page,
    Spin,
    Table,
    Button,
    Drawer,
    Form,
    Input,
    FormItem,
    Message,
    Select,
    Option,
    Modal
} from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'IotParkBlacklist',
    data() {
        return {
            fetching: true,
            options: [],
            columns: [
                {
                    title: '车牌号码',
                    minWidth: 120,
                    key: 'car_number'
                },
                {
                    title: '停车场名称',
                    minWidth: 120,
                    key: 'park'
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
                    minWidth: 120,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            h('a', { on: { click: () => this.goUpdate(p.row) } }, '修改'),
                            h('a', { on: { click: () => this.goDelete(p.row, p.index) } }, '删除')
                        ])
                }
            ],
            visible: false,
            form: {
                park_id: '',
                car_number: ''
            },
            rules: {
                park_id: [{ required: true, type: 'number', message: '请选择停车场' }],
                car_number: [
                    { required: true, message: '请输入车牌号码' },
                    {
                        pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9]{0,1}[A-Z0-9挂学警港澳]{0,1}$/,
                        message: '请输入正确的车牌号码'
                    }
                ]
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
                    .post('/park/blacklist_list', data)
                    .then(res => {
                        this.fetching = false;
                        this.page_num = res.data.page_num;
                        this.page_size = res.data.page_size;
                        this.list = res.data.list;
                        this.total = res.data.total;
                    })
                    .catch(() => (this.fetching = false));
            };

            if (options.length === 0) {
                utils.request.post('/park/option', { community_id: postInfo.default_community_id }).then(res => {
                    this.options = res.data.list;
                    run();
                });
            } else {
                run();
            }
        },
        showDrawer() {
            this.form = {
                park_id: '',
                car_number: ''
            };
            this.$refs.form.resetFields();
            this.updateInfo = null;
            this.visible = true;
        },
        goUpdate(info) {
            this.form = {
                park_id: info.park_id ? info.park_id : '',
                car_number: info.car_number ? info.car_number : ''
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
                        .post('/park/blacklist_create', {
                            ...this.form,
                            community_id: this.postInfo.default_community_id
                        })
                        .then(res => {
                            const list = [].concat(this.list);

                            list.unshift({
                                ...this.form,
                                ...res.data,
                                community_id: this.postInfo.default_community_id,
                                created_by: this.userInfo.id,
                                real_name: this.userInfo.real_name
                            });
                            this.list = list;
                            this.submiting = false;
                            this.visible = false;
                            Message.success('添加黑名单成功');
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    utils.request
                        .post('/park/blacklist_update', {
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
                            Message.success('修改黑名单成功');
                        })
                        .catch(() => (this.submiting = false));
                }
            });
        },
        goDelete(info, index) {
            Modal.confirm({
                title: '请确认',
                content: `确认要删除黑名单车牌「${info.car_number}」吗？`,
                onOk: () => {
                    utils.request
                        .post('/park/blacklist_delete', {
                            id: info.id,
                            car_number: info.car_number,
                            park_id: info.park_id,
                            community_id: this.postInfo.default_community_id
                        })
                        .then(() => {
                            this.list.splice(index, 1);
                            Message.success('删除黑名单用户成功');
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
        Select,
        Option
    }
};
</script>
