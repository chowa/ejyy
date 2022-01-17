<template>
    <WaterMark>
        <Header />

        <Button type="primary" @click="showModal" class="mb-16">添加巡检点位</Button>

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

        <Modal :title="editId ? '修改巡检点位' : '添加巡检点位'" v-model="visible">
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent>
                <FormItem prop="category_id" label="巡检点位分类：">
                    <Select v-model="form.category_id" placeholder="请选择巡检点位分类" filterable>
                        <Option v-for="item in options.category" :key="item.id" :value="item.id">
                            {{ item.name }}
                            <template v-if="item.description">-{{ item.description }}</template>
                        </Option>
                    </Select>
                </FormItem>
                <FormItem prop="local" label="巡检点位位置：">
                    <Input v-model="form.local" placeholder="请输入巡检点位位置" />
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
import { Card, Page, Spin, Table, Button, Form, FormItem, Modal, Input, Message, Select, Option } from 'view-design';
import * as utils from '@/utils';
import moment from 'moment';
import pageMixin from '@/mixins/page';

export default {
    name: 'OaMissionPoint',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    title: '巡检编号',
                    minWidth: 140,
                    render: (h, p) => h('span', utils.order.num('MP', p.row.created_at, p.row.id))
                },
                {
                    title: '巡检点位位置',
                    minWidth: 240,
                    key: 'local'
                },
                {
                    title: '巡检点位分类',
                    minWidth: 140,
                    key: 'category'
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
                    minWidth: 160,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            h('a', { on: { click: () => this.update(p.row.id, p.index) } }, '修改'),
                            h('a', { on: { click: () => this.delete(p.row.id, p.index) } }, '删除'),
                            h('a', { on: { click: () => this.printCode(p.row) } }, '打印二维码')
                        ])
                }
            ],
            visible: false,
            editId: null,
            editIndex: -1,
            submiting: false,
            form: {
                category_id: '',
                local: ''
            },
            rules: {
                category_id: [{ required: true, type: 'number', message: '请选择巡检点位归属分类' }],
                local: [
                    { required: true, message: '请输入巡检点位位置' },
                    { max: 128, message: '巡检点位不能大于128个字符' }
                ]
            },
            options: {
                category: []
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
            const { page_num, page_size } = this;

            this.fetching = true;

            const run = () => {
                utils.request
                    .post('/mission_manage/point_list', {
                        page_num,
                        page_size,
                        community_id: this.postInfo.default_community_id
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

            if (this.options.category.length === 0) {
                utils.request
                    .post('/mission_manage/option', { community_id: this.postInfo.default_community_id })
                    .then(res => {
                        this.options = res.data;
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
            this.editId = id;
            this.editIndex = index;
            this.form.category_id = this.list[index].category_id;
            this.form.local = this.list[index].local;
            this.visible = true;
        },
        delete(id, index) {
            Modal.confirm({
                title: '请确认',
                content: `确认要删除「${this.list[index].local}」巡检点位吗？`,
                onOk: () => {
                    utils.request
                        .post('/mission_manage/point_delete', { id, community_id: this.postInfo.default_community_id })
                        .then(() => {
                            this.list.splice(index, 1);
                            Message.success('删除巡检点位成功');
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
                const findName = form => {
                    const index = this.options.category.findIndex(item => item.id === form.category_id);

                    return this.options.category[index].name;
                };

                const resetFields = () => {
                    this.form.category_id = '';
                    this.form.local = '';
                    this.$refs.form.resetFields();
                    this.submiting = false;
                    this.visible = false;
                };

                if (this.editId) {
                    utils.request
                        .post('/mission_manage/point_update', {
                            ...this.form,
                            id: this.editId,
                            community_id: this.postInfo.default_community_id
                        })
                        .then(() => {
                            const list = [].concat(this.list);

                            list[this.editIndex] = {
                                ...list[this.editIndex],
                                ...this.form,
                                category: findName(this.form)
                            };

                            this.list = list;

                            resetFields();
                            Message.success('修改巡检点位成功');
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    utils.request
                        .post('/mission_manage/point_create', {
                            ...this.form,
                            community_id: this.postInfo.default_community_id
                        })
                        .then(res => {
                            this.list.unshift({
                                id: res.data.id,
                                ...this.form,
                                category: findName(this.form),
                                created_at: res.data.created_at,
                                created_by: this.userInfo.id,
                                real_name: this.userInfo.real_name
                            });

                            resetFields();
                            Message.success('添加巡检点位成功');
                        })
                        .catch(() => (this.submiting = false));
                }
            });
        },
        printCode(info) {
            this.$router.push(
                `/print/mission?code=${utils.order.num('MP', info.created_at, info.id)}&title=${info.local}`
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
        Button,
        Form,
        FormItem,
        Modal,
        Input,
        WaterMark,
        Select,
        Option
    }
};
</script>
