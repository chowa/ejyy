<template>
    <WaterMark>
        <Header />

        <Button type="primary" v-if="userInfo.access.includes(ROLES.WLCC)" @click="showModal" class="mb-16">
            添加物料
        </Button>

        <FilterQuery :filterOptions="filterOptions" :fetching="fetching" :filters="filters" class="mt-16" />

        <Card dis-hover :bordered="false">
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

        <Modal :title="editId ? '修改物料' : '添加物料'" v-model="visible">
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent>
                <FormItem prop="name" label="物料名称：">
                    <Input v-model="form.name" placeholder="请输入物料名称" />
                </FormItem>
                <FormItem prop="total" label="物料数量：" v-if="!editId">
                    <Input v-model="form.total" type="number" placeholder="请输入物料数量" />
                </FormItem>
                <FormItem prop="category_id" label="物料分类：">
                    <Select v-model="form.category_id" placeholder="请选择物料分类" filterable>
                        <Option v-for="item in category" :key="item.id" :value="item.id">
                            {{ item.name }}
                            <template v-if="item.description">-{{ item.description }}</template>
                        </Option>
                    </Select>
                </FormItem>
                <FormItem prop="storehouse_id" label="所在仓库：">
                    <Select v-model="form.storehouse_id" placeholder="请选择所在仓库" filterable>
                        <Option v-for="item in storehouse" :key="item.id" :value="item.id">
                            {{ item.name }}
                            <template v-if="item.local">-{{ item.local }}</template>
                        </Option>
                    </Select>
                </FormItem>
            </Form>

            <div slot="footer">
                <Button @click="hideModal">取消</Button>
                <Button type="primary" @click="submit" :loading="submiting">{{ editId ? '更新' : '确认' }}</Button>
            </div>
        </Modal>

        <MaterialUse v-model="useVisible" :info.sync="useInfo" />
        <MaterialUsed v-model="usedVisible" :info="showInfo" />
        <MaterialPurchase v-model="purchaseVisible" :info="showInfo" />
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
import { Header, ListFooter, WaterMark, FilterQuery } from '@/components';
import { Card, Page, Spin, Table, Button, Form, FormItem, Modal, Input, Message, Select, Option } from 'view-design';
import * as utils from '@/utils';
import moment from 'moment';
import pageMixin from '@/mixins/page';
import ROLES from '@/constants/role';
import MaterialUse from './components/use';
import MaterialUsed from './components/used';
import MaterialPurchase from './components/purchase';

export default {
    name: 'OaMaterialList',
    data() {
        return {
            ROLES,
            useVisible: false,
            useInfo: {},
            usedVisible: false,
            purchaseVisible: false,
            showInfo: {},
            fetching: true,
            filterOptions: [
                {
                    label: '所在仓库',
                    prop: 'storehouse_id',
                    list: []
                },
                {
                    label: '物料分类',
                    prop: 'category_id',
                    list: []
                }
            ],
            filters: {
                storehouse_id: undefined,
                category_id: undefined
            },
            category: [],
            storehouse: [],
            columns: [
                {
                    title: '物料编号',
                    minWidth: 140,
                    render: (h, p) => h('span', utils.order.num('ML', p.row.created_at, p.row.id))
                },
                {
                    title: '物料名称',
                    minWidth: 140,
                    key: 'name'
                },
                {
                    title: '库存数量',
                    minWidth: 120,
                    key: 'total'
                },
                {
                    title: '所属分类',
                    minWidth: 120,
                    key: 'category'
                },
                {
                    title: '所在仓库',
                    minWidth: 120,
                    key: 'storehouse'
                },
                {
                    title: '创建时间',
                    minWidth: 120,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
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
                    title: '操作',
                    key: 'id',
                    minWidth: 280,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            this.userInfo.access.includes(ROLES.WLCC)
                                ? h('a', { on: { click: () => this.update(p.row.id, p.index) } }, '修改')
                                : null,
                            this.userInfo.access.includes(ROLES.WLCC)
                                ? h('a', { on: { click: () => this.showUse(p.index) } }, '物料领用')
                                : null,
                            h('a', { on: { click: () => this.showPurchase(p.row) } }, '采购记录'),
                            h('a', { on: { click: () => this.showUsed(p.row) } }, '领用记录'),
                            h('a', { on: { click: () => this.printCode(p.row) } }, '打印二维码')
                        ])
                }
            ],
            visible: false,
            editId: null,
            editIndex: -1,
            submiting: false,
            form: {
                name: '',
                total: '',
                category_id: '',
                storehouse_id: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入物料名称' },
                    { max: 56, message: '物料名称不能大于56个字符' }
                ],
                total: [
                    { required: true, message: '请输入物料数量' },
                    { pattern: /^\d+$/, message: '物料数量仅支持整数' }
                ],
                category_id: [{ required: true, type: 'number', message: '请选择物料分类' }],
                storehouse_id: [{ required: true, type: 'number', message: '请选择所在仓库' }]
            }
        };
    },
    mounted() {
        if (this.postInfo.default_community_id) {
            this.getListData();
        }
    },
    mixins: [pageMixin],
    methods: {
        getListData() {
            const { page_num, page_size, filters, postInfo } = this;

            this.fetching = true;

            const run = () => {
                utils.request
                    .post('/material/list', {
                        page_num,
                        page_size,
                        ...filters,
                        community_id: postInfo.default_community_id
                    })
                    .then(res => {
                        this.fetching = false;
                        this.page_num = res.data.page_num;
                        this.page_size = res.data.page_size;
                        this.list = res.data.list;
                        this.total = res.data.total;
                    })
                    .catch(() => (this.fetching = false));
            };

            if (this.filterOptions[0].list.length === 0) {
                utils.request
                    .post('/material/option', { community_id: postInfo.default_community_id })
                    .then(res => {
                        this.filterOptions[0].list = res.data.storehouse.map(item => {
                            return { label: item.name, value: item.id };
                        });
                        this.filterOptions[1].list = res.data.category.map(item => {
                            return { label: item.name, value: item.id };
                        });

                        this.category = res.data.category;
                        this.storehouse = res.data.storehouse;
                        run();
                    })
                    .catch(() => (this.fetching = false));
            } else {
                run();
            }
        },
        showModal() {
            this.editId = null;
            this.editIndex = -1;
            this.visible = true;
        },
        hideModal() {
            this.visible = false;
        },
        update(id, index) {
            const info = this.list[index];

            this.editId = id;
            this.editIndex = index;
            this.form = {
                name: info.name,
                total: '',
                category_id: info.category_id,
                storehouse_id: info.storehouse_id
            };
            this.visible = true;
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) {
                    return;
                }

                this.submiting = true;

                const findName = form => {
                    const cindex = this.category.findIndex(item => item.id === form.category_id);
                    const sindex = this.storehouse.findIndex(item => item.id === form.storehouse_id);

                    return {
                        category: this.category[cindex].name,
                        storehouse: this.storehouse[sindex].name
                    };
                };

                const resetFields = () => {
                    this.form = {
                        name: '',
                        total: '',
                        category_id: '',
                        storehouse_id: ''
                    };
                    this.$refs.form.resetFields();
                    this.submiting = false;
                    this.visible = false;
                };

                if (this.editId) {
                    const data = {
                        ...this.form,
                        id: this.editId,
                        community_id: this.postInfo.default_community_id,
                        total: parseInt(this.form.total, 10)
                    };

                    delete data.total;

                    utils.request
                        .post('/material/update', data)
                        .then(() => {
                            const list = [].concat(this.list);

                            list[this.editIndex] = {
                                ...list[this.editIndex],
                                ...this.form,
                                total: list[this.editIndex].total,
                                ...findName(this.form)
                            };
                            this.list = list;
                            resetFields();
                            Message.success('修改物料成功');
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    const data = {
                        ...this.form,
                        community_id: this.postInfo.default_community_id,
                        total: parseInt(this.form.total, 10)
                    };

                    utils.request
                        .post('/material/create', data)
                        .then(res => {
                            this.list.unshift({
                                id: res.data.id,
                                ...data,
                                created_at: res.data.created_at,
                                created_by: this.userInfo.id,
                                real_name: this.userInfo.real_name,
                                ...findName(this.form)
                            });

                            resetFields();
                            Message.success('添加物料成功');
                        })
                        .catch(() => (this.submiting = false));
                }
            });
        },
        showUse(index) {
            this.useVisible = true;
            this.useInfo = { ...this.list[index] };
        },
        showUsed(info) {
            this.usedVisible = true;
            this.showInfo = info;
        },
        showPurchase(info) {
            this.purchaseVisible = true;
            this.showInfo = info;
        },
        printCode(info) {
            this.$router.push(
                `/print/material?code=${utils.order.num('ML', info.created_at, info.id)}&title=${info.name}`
            );
        }
    },
    computed: {
        ...mapGetters({
            userInfo: 'common/userInfo',
            postInfo: 'common/postInfo'
        })
    },
    watch: {
        'postInfo.default_community_id'() {
            this.getListData();
        },
        useInfo: {
            deep: true,
            handler(cur) {
                if (!cur.id) {
                    return;
                }

                const list = [].concat(this.list);
                const index = list.findIndex(item => item.id === cur.id);

                list[index] = cur;
                this.list = list;
            }
        }
    },
    components: {
        Header,
        ListFooter,
        Card,
        Page,
        Spin,
        Table,
        Button,
        Form,
        FormItem,
        Modal,
        Input,
        WaterMark,
        FilterQuery,
        Select,
        Option,
        MaterialUse,
        MaterialUsed,
        MaterialPurchase
    }
};
</script>
