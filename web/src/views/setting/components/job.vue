<template>
    <section>
        <Button type="primary" @click="showModal" class="mb-16">添加岗位</Button>

        <Table stripe :columns="columns" :data="list" />

        <ListFooter>
            <Page
                show-total
                show-elevator
                :page-size="page_size"
                :total="total"
                :current="page_num"
                @on-change="onPageChange"
            />
        </ListFooter>

        <Modal :title="editId ? '修改岗位' : '添加岗位'" v-model="visible">
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent>
                <FormItem prop="name" label="岗位名称：">
                    <Input v-model="form.name" placeholder="请输入岗位名称" />
                </FormItem>
            </Form>

            <div slot="footer">
                <Button @click="hideModal">取消</Button>
                <Button type="primary" @click="submit" :loading="submiting">{{ editId ? '更新' : '确认' }}</Button>
            </div>
        </Modal>
        <Spin size="large" fix v-if="fetching" />
    </section>
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

import { ListFooter } from '@/components';
import { Page, Spin, Table, Button, Form, FormItem, Modal, Input, Message } from 'view-design';
import * as utils from '@/utils';
import * as config from '@/config';

export default {
    name: 'SettingOrganizationalJob',
    props: {
        parent_id: Number
    },
    data() {
        return {
            fetching: true,
            page_num: 1,
            page_size: config.DEGAULT_PAGE_SIZE,
            total: 0,
            list: [],
            columns: [
                {
                    title: '编号',
                    key: 'id',
                    minWidth: 70
                },
                {
                    title: '岗位名称',
                    minWidth: 180,
                    key: 'name'
                },
                {
                    title: '操作',
                    key: 'id',
                    minWidth: 80,
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
                name: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入岗位名称' },
                    { max: 12, message: '岗位名称不能大于12个字符' }
                ]
            }
        };
    },
    mounted() {
        this.getListData();
    },
    methods: {
        onPageChange(num) {
            this.page_num = num;
            this.getListData();
        },
        getListData() {
            const { page_num, page_size } = this;

            this.fetching = true;

            utils.request.post('/job/list', { page_num, page_size, parent_id: this.parent_id }).then(res => {
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
            this.visible = true;
        },
        delete(id, index) {
            Modal.confirm({
                title: '请确认',
                content: `确认要删除「${this.list[index].name}」岗位吗？`,
                onOk: () => {
                    utils.request
                        .get(`/job/delete/${id}`)
                        .then(() => {
                            this.list.splice(index, 1);
                            Message.success('删除岗位成功');
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
                    this.visible = false;
                };

                if (this.editId) {
                    utils.request
                        .post('/job/update', { ...this.form, id: this.editId })
                        .then(() => {
                            const list = [].concat(this.list);

                            list[this.editIndex] = {
                                ...list[this.editIndex],
                                ...this.form
                            };

                            this.list = list;

                            resetFields();
                            Message.success('修改岗位成功');
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    utils.request
                        .post('/job/create', { ...this.form, parent_id: this.parent_id })
                        .then(res => {
                            this.list.unshift({
                                id: res.data.id,
                                ...this.form
                            });

                            resetFields();
                            Message.success('添加岗位成功');
                        })
                        .catch(() => (this.submiting = false));
                }
            });
        }
    },
    components: {
        ListFooter,
        Page,
        Spin,
        Table,
        Button,
        Form,
        FormItem,
        Modal,
        Input
    }
};
</script>
