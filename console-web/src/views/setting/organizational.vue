<template>
    <section>
        <Header>
            <span slot="description">
                公司整体设置，请谨慎操作，如有疑问请发信至
                <a href="mailto:contact@chowa.cn">技术支持</a>
                咨询。
            </span>
        </Header>

        <Button type="primary" @click="showModal" class="mb-16">添加部门</Button>

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

        <Modal :title="editId ? '修改部门' : '添加部门'" v-model="modalVisible">
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent>
                <FormItem prop="name" label="部门名称：">
                    <Input v-model="form.name" placeholder="请输入部门名称" />
                </FormItem>
            </Form>

            <div slot="footer">
                <Button @click="hideModal">取消</Button>
                <Button type="primary" @click="submit" :loading="submiting">{{ editId ? '更新' : '确认' }}</Button>
            </div>
        </Modal>

        <Drawer :title="(jobInfo ? jobInfo.name : '') + '岗位信息'" v-model="drawerVisible" width="600">
            <SettingOrganizationalJob v-if="drawerVisible" :parent_id="jobInfo.id" />
        </Drawer>

        <Spin size="large" fix v-if="fetching" />
    </section>
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

import { Header, ListFooter } from '@/components';
import { Card, Page, Spin, Table, Button, Form, FormItem, Modal, Input, Message, Drawer } from 'view-design';
import * as utils from '@/utils';
import pageMixin from '@/mixins/page';
import SettingOrganizationalJob from './components/job';

export default {
    name: 'SettingOrganizational',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    title: '部门名称',
                    minWidth: 180,
                    key: 'name'
                },
                {
                    title: '操作',
                    key: 'id',
                    minWidth: 180,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            h('a', { on: { click: () => this.update(p.row.id, p.index) } }, '修改'),
                            h('a', { on: { click: () => this.delete(p.row.id, p.index) } }, '删除'),
                            h('a', { on: { click: () => this.showJob(p.row) } }, '所属职位管理')
                        ])
                }
            ],
            modalVisible: false,
            editId: null,
            editIndex: -1,
            submiting: false,
            form: {
                name: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入部门名称' },
                    { max: 12, message: '部门名称不能大于12个字符' }
                ]
            },
            drawerVisible: false,
            jobInfo: null
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
                .post('/department/list', { page_num, page_size })
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
            this.modalVisible = true;
        },
        hideModal() {
            this.modalVisible = false;
        },
        update(id, index) {
            this.editId = id;
            this.editIndex = index;
            this.form.name = this.list[index].name;
            this.modalVisible = true;
        },
        delete(id, index) {
            Modal.confirm({
                title: '请确认',
                content: `确认要删除「${this.list[index].name}」部门吗？删除部门同时也会删除部门所属的岗位`,
                onOk: () => {
                    utils.request
                        .get(`/department/delete/${id}`)
                        .then(() => {
                            this.list.splice(index, 1);
                            Message.success('删除部门成功');
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
                    this.$refs.form.resetFields();
                    this.submiting = false;
                    this.modalVisible = false;
                };

                if (this.editId) {
                    utils.request
                        .post('/department/update', { ...this.form, id: this.editId })
                        .then(() => {
                            const list = [].concat(this.list);

                            list[this.editIndex] = {
                                ...list[this.editIndex],
                                ...this.form
                            };

                            this.list = list;

                            resetFields();
                            Message.success('修改部门成功');
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    utils.request
                        .post('/department/create', this.form)
                        .then(res => {
                            this.list.unshift({
                                id: res.data.id,
                                ...this.form
                            });

                            resetFields();
                            Message.success('添加部门成功');
                        })
                        .catch(() => (this.submiting = false));
                }
            });
        },
        showJob(info) {
            this.jobInfo = info;
            this.drawerVisible = true;
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
        Drawer,
        SettingOrganizationalJob
    }
};
</script>
