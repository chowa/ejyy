<template>
    <WaterMark>
        <Header>
            <span slot="description">全公司通用，非小区独立信息</span>
        </Header>

        <Button type="primary" @click="showModal" class="mb-16">添加类别</Button>

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

        <Modal :title="editId ? '修改类别' : '添加类别'" v-model="visible">
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent>
                <FormItem prop="name" label="类别名称：">
                    <Input v-model="form.name" placeholder="请输入类别名称" />
                </FormItem>
                <FormItem prop="description" label="类别描述：">
                    <Input v-model="form.description" placeholder="请输入类别描述" />
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
import { Header, ListFooter, WaterMark } from '@/components';
import { Card, Page, Spin, Table, Button, Form, FormItem, Modal, Input, Message } from 'view-design';
import * as utils from '@/utils';
import moment from 'moment';
import pageMixin from '@/mixins/page';

export default {
    name: 'OaContractCategory',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    title: '类别名称',
                    minWidth: 140,
                    key: 'name'
                },
                {
                    title: '类别描述',
                    minWidth: 240,
                    render: (h, p) => h('span', p.row.description ? p.row.description : '-')
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
                    title: '创建时间',
                    minWidth: 120,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
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
                name: '',
                description: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入类别名称' },
                    { max: 32, message: '类别名称不能大于32个字符' }
                ],
                description: [{ max: 128, message: '类别描述不能大于128个字符' }]
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

            utils.request.post('/contract/category_list', { page_num, page_size }).then(res => {
                this.fetching = false;
                this.page_num = res.data.page_num;
                this.page_size = res.data.page_size;
                this.list = res.data.list;
                this.total = res.data.total;
            });
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
            this.editId = id;
            this.editIndex = index;
            this.form.name = this.list[index].name;
            this.form.description = this.list[index].description;
            this.visible = true;
        },
        delete(id, index) {
            Modal.confirm({
                title: '请确认',
                content: `确认要删除「${this.list[index].name}」类别吗？`,
                onOk: () => {
                    utils.request
                        .get(`/contract/category_delete/${id}`)
                        .then(() => {
                            this.list.splice(index, 1);
                            Message.success('删除类别成功');
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

                const resetFields = () => {
                    this.form.name = '';
                    this.form.description = '';
                    this.$refs.form.resetFields();
                    this.submiting = false;
                    this.visible = false;
                };

                if (this.editId) {
                    utils.request
                        .post('/contract/category_update', { ...this.form, id: this.editId })
                        .then(() => {
                            const list = [].concat(this.list);

                            list[this.editIndex] = {
                                ...list[this.editIndex],
                                ...this.form
                            };

                            this.list = list;

                            resetFields();
                            Message.success('修改类别成功');
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    utils.request
                        .post('/contract/category_create', this.form)
                        .then(res => {
                            this.list.unshift({
                                id: res.data.id,
                                ...this.form,
                                created_at: res.data.created_at,
                                created_by: this.userInfo.id,
                                real_name: this.userInfo.real_name
                            });

                            resetFields();
                            Message.success('添加类别成功');
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
