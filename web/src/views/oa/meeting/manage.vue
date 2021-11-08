<template>
    <WaterMark>
        <Header />

        <Button type="primary" @click="showModal" class="mb-16">添加会议室</Button>

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

        <Modal :title="editId ? '修改会议室' : '添加会议室'" v-model="visible">
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent :label-width="120">
                <FormItem prop="name" label="会议室名称：">
                    <Input v-model="form.name" placeholder="请输入会议室名称" />
                </FormItem>
                <FormItem prop="local" label="会议室位置：">
                    <Input v-model="form.local" placeholder="请输入会议室位置" />
                </FormItem>
                <FormItem prop="have_tv" label="有电视：">
                    <OSwitch v-model="form.have_tv" :true-value="1" :false-value="0">
                        <span slot="open">否</span>
                        <span slot="close">是</span>
                    </OSwitch>
                </FormItem>
                <FormItem prop="have_board" label="有白板：">
                    <OSwitch v-model="form.have_board" :true-value="1" :false-value="0">
                        <span slot="open">否</span>
                        <span slot="close">是</span>
                    </OSwitch>
                </FormItem>
                <FormItem prop="have_projector" label="有投影仪：">
                    <OSwitch v-model="form.have_projector" :true-value="1" :false-value="0">
                        <span slot="open">否</span>
                        <span slot="close">是</span>
                    </OSwitch>
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
 * | Copyright (c) 2020~2021 https://www.chowa.com All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: jixuecong@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Header, ListFooter, WaterMark } from '@/components';
import { Card, Page, Spin, Table, Button, Form, FormItem, Modal, Input, Message, Tag, Switch } from 'view-design';
import * as utils from '@/utils';
import moment from 'moment';
import pageMixin from '@/mixins/page';

export default {
    name: 'MeetingRoomManage',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    title: '会议室编号',
                    minWidth: 140,
                    render: (h, p) => h('span', utils.order.num('MR', p.row.created_at, p.row.id))
                },
                {
                    title: '会议室名称',
                    minWidth: 140,
                    key: 'name'
                },
                {
                    title: '会议室位置',
                    minWidth: 240,
                    key: 'local'
                },
                {
                    title: '电视',
                    minWidth: 100,
                    render: (h, p) =>
                        h(Tag, { props: { color: p.row.have_tv ? 'green' : 'default' } }, p.row.have_tv ? '有' : '没有')
                },
                {
                    title: '白板',
                    minWidth: 100,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.have_board ? 'green' : 'default' } },
                            p.row.have_board ? '有' : '没有'
                        )
                },
                {
                    title: '投影仪',
                    minWidth: 100,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.have_projector ? 'green' : 'default' } },
                            p.row.have_projector ? '有' : '没有'
                        )
                },
                {
                    title: '创建时间',
                    minWidth: 140,
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
                    minWidth: 140,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            h('a', { on: { click: () => this.update(p.row.id, p.index) } }, '修改'),
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
                local: '',
                have_tv: 0,
                have_board: 0,
                have_projector: 0
            },
            rules: {
                name: [
                    { required: true, message: '请输入会议室名称' },
                    { max: 56, message: '会议室名称不能大于56个字符' }
                ],
                local: [
                    { required: true, message: '请输入会议室位置' },
                    { max: 128, message: '会议室位置不能大于128个字符' }
                ],
                have_tv: [{ required: true, type: 'number', message: '请选择是否有电视' }],
                have_board: [{ required: true, type: 'number', message: '请选择是否有白板' }],
                have_projector: [{ required: true, type: 'number', message: '请选择是否有投影仪' }]
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

            utils.request
                .post('/meeting_room/list', { page_num, page_size, community_id: this.postInfo.default_community_id })
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
            this.editId = id;
            this.editIndex = index;
            this.form.name = this.list[index].name;
            this.form.local = this.list[index].local;
            this.visible = true;
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) {
                    return;
                }

                this.submiting = true;
                const resetFields = () => {
                    this.form = {
                        name: '',
                        local: '',
                        have_tv: 0,
                        have_board: 0,
                        have_projector: 0
                    };
                    this.$refs.form.resetFields();
                    this.submiting = false;
                    this.visible = false;
                };

                if (this.editId) {
                    utils.request
                        .post('/meeting_room/update', {
                            ...this.form,
                            id: this.editId,
                            community_id: this.postInfo.default_community_id
                        })
                        .then(() => {
                            const list = [].concat(this.list);

                            list[this.editIndex] = {
                                ...list[this.editIndex],
                                ...this.form
                            };

                            this.list = list;

                            resetFields();
                            Message.success('修改会议室成功');
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    utils.request
                        .post('/meeting_room/create', {
                            ...this.form,
                            community_id: this.postInfo.default_community_id
                        })
                        .then(res => {
                            this.list.unshift({
                                id: res.data.id,
                                ...this.form,
                                created_at: res.data.created_at,
                                created_by: this.userInfo.id,
                                real_name: this.userInfo.real_name
                            });

                            resetFields();
                            Message.success('添加会议室成功');
                        })
                        .catch(() => (this.submiting = false));
                }
            });
        },
        printCode(info) {
            this.$router.push(
                `/print/meeting?code=${utils.order.num('MR', info.created_at, info.id)}&title=${info.name}`
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
        OSwitch: Switch
    }
};
</script>
