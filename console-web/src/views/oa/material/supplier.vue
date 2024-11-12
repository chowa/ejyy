<template>
    <WaterMark>
        <Header>
            <span slot="description">全公司通用，非小区独立信息</span>
        </Header>

        <Button type="primary" @click="showModal" class="mb-16">添加供应商</Button>

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

        <Modal :title="editId ? '修改供应商' : '添加供应商'" v-model="visible">
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent>
                <FormItem prop="title" label="供应商名称：">
                    <Input v-model="form.title" placeholder="请输入供应商名称" />
                </FormItem>
                <FormItem prop="linkman" label="供应商联系人：">
                    <Input v-model="form.linkman" placeholder="请输入供应商联系人" />
                </FormItem>
                <FormItem prop="phone" label="联系电话：">
                    <Input v-model="form.phone" placeholder="请输入供应商联系电话" />
                </FormItem>
                <FormItem prop="business" label="供应业务：">
                    <Input
                        type="textarea"
                        v-model="form.business"
                        :row="3"
                        show-word-limit
                        :maxlength="512"
                        placeholder="请输入供应商供应业务"
                    />
                </FormItem>
                <FormItem prop="bank_name" label="开户行名称：">
                    <Input v-model="form.bank_name" placeholder="请输入开户行名称" />
                </FormItem>
                <FormItem prop="bank_id" label="银行账号：">
                    <Input v-model="form.bank_id" placeholder="请输入银行账号" />
                </FormItem>
                <FormItem prop="bank_address" label="开户行地址：">
                    <Input v-model="form.bank_address" placeholder="请输入开户行地址" />
                </FormItem>
            </Form>

            <div slot="footer">
                <Button @click="hideModal">取消</Button>
                <Button type="primary" @click="submit" :loading="submiting">{{ editId ? '更新' : '确认' }}</Button>
            </div>
        </Modal>
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
import { Header, ListFooter, WaterMark } from '@/components';
import { Card, Page, Spin, Table, Button, Form, FormItem, Modal, Input, Message } from 'view-design';
import * as utils from '@/utils';
import moment from 'moment';
import pageMixin from '@/mixins/page';
import SupplierBank from './components/bank';

export default {
    name: 'OaMaterialSupplier',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    type: 'expand',
                    width: 50,
                    render: (h, params) => {
                        return h(SupplierBank, {
                            props: {
                                row: params.row
                            }
                        });
                    }
                },
                {
                    title: '供应商名称',
                    minWidth: 140,
                    key: 'title'
                },
                {
                    title: '联系人',
                    minWidth: 120,
                    key: 'linkman'
                },
                {
                    title: '联系电话',
                    minWidth: 120,
                    key: 'phone'
                },
                {
                    title: '供应业务',
                    minWidth: 240,
                    key: 'business'
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
                    minWidth: 100,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            h('a', { on: { click: () => this.update(p.row.id, p.index) } }, '修改'),
                            h('a', { on: { click: () => this.delete(p.row.id, p.index) } }, '删除')
                        ])
                }
            ],
            visible: false,
            editId: null,
            editIndex: -1,
            submiting: false,
            form: {
                title: '',
                linkman: '',
                phone: '',
                business: '',
                bank_name: '',
                bank_id: '',
                bank_address: ''
            },
            rules: {
                title: [
                    { required: true, message: '请输入供应商名称' },
                    { max: 128, message: '供应商名称不能大于128个字符' }
                ],
                linkman: [
                    { required: true, message: '请输入供应商联系人' },
                    { max: 12, message: '供应商联系人不能大于12个字符' }
                ],
                phone: [
                    { required: true, message: '请输入正确的联系电话' },
                    { pattern: /^\d{11}$/, message: '请输入正确的联系电话' }
                ],
                business: [
                    { required: true, message: '请输入供应商供应业务' },
                    { max: 512, message: '供应商供应业务不能大于512个字符' }
                ],
                bank_name: [{ max: 56, message: '开户行名称不能大56个字符' }],
                bank_id: [{ max: 56, message: '账户名称不能大56个字符' }],
                bank_address: [{ max: 128, message: '开户行地址不能大128个字符' }]
            }
        };
    },
    mounted() {
        this.getListData();
    },
    mixins: [pageMixin],
    methods: {
        getListData() {
            const { page_num, page_size } = this;

            this.fetching = true;

            utils.request
                .post('/supplier/list', { page_num, page_size })
                .then(res => {
                    this.fetching = false;
                    this.page_num = res.data.page_num;
                    this.page_size = res.data.page_size;
                    this.list = res.data.list;
                    this.total = res.data.total;
                })
                .catch(() => (this.fetching = false));
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
                title: info.title,
                linkman: info.linkman,
                phone: info.phone,
                business: info.business,
                bank_name: info.bank_name,
                bank_id: info.bank_id,
                bank_address: info.bank_address
            };
            this.visible = true;
        },
        delete(id, index) {
            Modal.confirm({
                title: '请确认',
                content: `确认要删除「${this.list[index].title}」供应商吗？`,
                onOk: () => {
                    utils.request
                        .get(`/supplier/delete/${id}`)
                        .then(() => {
                            this.list.splice(index, 1);
                            Message.success('删除供应商成功');
                        })
                        .catch(() => {});
                }
            });
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) {
                    return;
                }

                this.submiting = true;

                if (this.editId) {
                    utils.request
                        .post('/supplier/update', { ...this.form, id: this.editId })
                        .then(() => {
                            const list = [].concat(this.list);

                            list[this.editIndex] = {
                                ...list[this.editIndex],
                                ...this.form
                            };
                            this.list = list;
                            this.form = {
                                title: '',
                                linkman: '',
                                phone: '',
                                business: '',
                                bank_name: '',
                                bank_id: '',
                                bank_address: ''
                            };
                            this.$refs.form.resetFields();
                            this.submiting = false;
                            this.visible = false;
                            Message.success('修改供应商成功');
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    utils.request
                        .post('/supplier/create', this.form)
                        .then(res => {
                            this.list.unshift({
                                id: res.data.id,
                                ...this.form,
                                created_at: res.data.created_at,
                                created_by: this.userInfo.id,
                                real_name: this.userInfo.real_name
                            });

                            this.form = {
                                title: '',
                                linkman: '',
                                phone: '',
                                business: '',
                                bank_name: '',
                                bank_id: '',
                                bank_address: ''
                            };
                            this.$refs.form.resetFields();
                            this.submiting = false;
                            this.visible = false;
                            Message.success('添加供应商成功');
                        })
                        .catch(() => (this.submiting = false));
                }
            });
        }
    },
    computed: {
        ...mapGetters({
            userInfo: 'common/userInfo'
        })
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
        WaterMark
    }
};
</script>
