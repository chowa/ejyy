<template>
    <section>
        <Header>
            <span slot="description">
                公司整体设置，请谨慎操作，如有疑问请发信至
                <a href="mailto:contact@chowa.cn">技术支持</a>
                咨询。
            </span>
        </Header>

        <Button type="primary" @click="showModal" class="mb-16">添加权限</Button>

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

        <Modal :title="editId ? '修改权限' : '添加权限'" v-model="visible">
            <Form :model="form" :rules="rules" ref="form" label-position="top" @submit.native.prevent>
                <FormItem prop="name" label="权限名称：">
                    <Input v-model="form.name" placeholder="请输入权限名称" />
                </FormItem>
                <FormItem prop="content" label="访问模块：">
                    <CheckboxGroup v-model="form.content">
                        <template v-for="item in ROLES">
                            <Checkbox :key="item" :label="item" v-if="item !== ROLES.ANYONE">
                                {{ roleText(item) }}
                            </Checkbox>
                        </template>
                    </CheckboxGroup>
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
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Header, ListFooter } from '@/components';
import {
    Card,
    Page,
    Spin,
    Table,
    Button,
    Form,
    FormItem,
    Modal,
    Input,
    Message,
    Checkbox,
    CheckboxGroup
} from 'view-design';
import * as utils from '@/utils';
import pageMixin from '@/mixins/page';
import ROLES from '@/constants/role';

export default {
    name: 'SettingAccess',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    title: '编号',
                    key: 'id',
                    minWidth: 70
                },
                {
                    title: '权限名称',
                    minWidth: 120,
                    key: 'name'
                },
                {
                    title: '可访问模块',
                    minWidth: 260,
                    render: (h, p) => h('span', p.row.content.map(id => this.roleText(id)).join('、'))
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
                name: '',
                content: []
            },
            rules: {
                name: [
                    { required: true, message: '请输入权限名称' },
                    { max: 12, message: '权限名称不能大于12个字符' }
                ],
                content: [{ required: true, type: 'array', message: '请勾选可访问的模块' }]
            },
            ROLES
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
                .post('/role_access/list', { page_num, page_size })
                .then(res => {
                    this.fetching = false;
                    this.page_num = res.data.page_num;
                    this.page_size = res.data.page_size;
                    this.list = res.data.list;
                    this.total = res.data.total;
                })
                .catch(() => (this.fetching = false));
        },
        roleText(id) {
            return utils.roleAccess.text(id);
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
            this.form.content = this.list[index].content;
            this.visible = true;
        },
        delete(id, index) {
            Modal.confirm({
                title: '请确认',
                content: `确认要删除「${this.list[index].name}」权限吗？`,
                onOk: () => {
                    utils.request
                        .get(`/role_access/delete/${id}`)
                        .then(() => {
                            this.list.splice(index, 1);
                            Message.success('删除权限成功');
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
                    this.form.content = [];
                    this.$refs.form.resetFields();
                    this.submiting = false;
                    this.visible = false;
                };

                if (this.editId) {
                    utils.request
                        .post('/role_access/update', { ...this.form, id: this.editId })
                        .then(() => {
                            const list = [].concat(this.list);

                            list[this.editIndex] = {
                                ...list[this.editIndex],
                                ...this.form
                            };

                            this.list = list;

                            resetFields();
                            Message.success('修改权限成功');
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    utils.request
                        .post('/role_access/create', this.form)
                        .then(res => {
                            this.list.unshift({
                                id: res.data.id,
                                ...this.form
                            });

                            resetFields();
                            Message.success('添加权限成功');
                        })
                        .catch(() => (this.submiting = false));
                }
            });
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
        Checkbox,
        CheckboxGroup
    }
};
</script>
