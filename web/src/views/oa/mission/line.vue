<template>
    <WaterMark>
        <Header />

        <Button type="primary" @click="showModal" class="mb-16">添加巡检路线</Button>

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

        <Modal :title="editId ? '修改巡检路线' : '添加巡检路线'" v-model="visible">
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent>
                <FormItem prop="name" label="路线名称：">
                    <Input v-model="form.name" placeholder="请输入巡检路线名称" />
                </FormItem>
                <FormItem prop="description" label="巡检路线描述：">
                    <Input v-model="form.description" placeholder="请输入巡检路线描述" />
                </FormItem>
                <FormItem prop="category_id" label="巡检路线分类：">
                    <Select v-model="form.category_id" placeholder="请选择巡检路线分类" filterable>
                        <Option v-for="item in options.category" :key="item.id" :value="item.id">
                            {{ item.name }}
                            <template v-if="item.description">-{{ item.description }}</template>
                        </Option>
                    </Select>
                </FormItem>
                <FormItem prop="points" label="巡检点位：">
                    <Select v-model="form.points" placeholder="请选择巡检点" multiple filterable>
                        <template v-for="item in options.point">
                            <Option :key="item.id" :value="item.id" v-if="form.category_id === item.category_id">
                                {{ item.local }}
                            </Option>
                        </template>
                    </Select>
                </FormItem>
            </Form>

            <div slot="footer">
                <Button @click="hideModal">取消</Button>
                <Button type="primary" @click="submit" :loading="submiting">{{ editId ? '更新' : '确认' }}</Button>
            </div>
        </Modal>

        <Drawer
            v-model="detailVisible"
            :title="`巡检路线「${detail.info.name}」详情`"
            transfer
            width="560"
            class-name="cw-drawer-width-footer"
            :closable="false"
            :mask-closable="false"
        >
            <Row class="detail-row">
                <Col :lg="12" :sm="12" :xs="24">
                    <span class="detail-label">巡检路线名称</span>
                    <div class="detail-content">
                        {{ detail.info.name }}
                    </div>
                </Col>
                <Col :lg="12" :sm="12" :xs="24">
                    <span class="detail-label">巡检路线描述</span>
                    <div class="detail-content">
                        {{ detail.info.description }}
                    </div>
                </Col>
                <Col :lg="12" :sm="12" :xs="24">
                    <span class="detail-label">巡检路线分类</span>
                    <div class="detail-content">
                        {{ detail.info.category }}
                    </div>
                </Col>
                <Col :lg="12" :sm="12" :xs="24">
                    <span class="detail-label">创建时间</span>
                    <div class="detail-content">
                        {{ detail.info.created_at | mom_format }}
                    </div>
                </Col>
                <Col :lg="24" :sm="24" :xs="24">
                    <span class="detail-label">巡检点位</span>
                    <div class="detail-content">
                        <Timeline class="points">
                            <TimelineItem v-for="item in detail.points" :key="item.id">
                                {{ item.local }}
                            </TimelineItem>
                        </Timeline>
                    </div>
                </Col>
            </Row>

            <Spin size="large" fix v-if="detailFetching" />

            <div class="cw-drawer-footer">
                <Button @click="closeDrawer">关闭</Button>
                <Button type="primary" :loading="submiting" @click="update">修改</Button>
            </div>
        </Drawer>

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
    Select,
    Option,
    Drawer,
    Timeline,
    TimelineItem,
    Row,
    Col
} from 'view-design';
import * as utils from '@/utils';
import moment from 'moment';
import pageMixin from '@/mixins/page';

export default {
    name: 'OaMissionLine',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    title: '巡检路线名称',
                    minWidth: 120,
                    key: 'name'
                },
                {
                    title: '巡检路线描述',
                    minWidth: 240,
                    key: 'description'
                },
                {
                    title: '巡检路线分类',
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
                    minWidth: 100,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            h('a', { on: { click: () => this.showDetail(p.row.id, p.index) } }, '详细'),
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
                description: '',
                category_id: '',
                points: []
            },
            rules: {
                name: [
                    { required: true, message: '请输入巡检路线名称' },
                    { max: 56, message: '巡检路线名称为不能大于56个字符' }
                ],
                description: [
                    { required: true, message: '请输入巡检路线描述' },
                    { max: 256, message: '巡检路线描述不能大于256个字符' }
                ],
                category_id: [{ required: true, type: 'number', message: '请选择巡检路线归属分类' }],
                points: [{ required: true, type: 'array', min: 1, message: '请选择巡检点' }]
            },
            options: {
                category: [],
                point: []
            },
            detail: {
                info: {},
                points: []
            },
            detailVisible: false,
            detailFetching: false
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
                    .post('/mission_manage/line_list', {
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
        showDetail(id, index) {
            this.editId = id;
            this.editIndex = index;
            this.detailVisible = true;
            this.detailFetching = true;

            utils.request
                .post('/mission_manage/line_detail', { id, community_id: this.postInfo.default_community_id })
                .then(res => {
                    this.detail = res.data;
                    this.detailFetching = false;
                })
                .catch(() => (this.detailFetching = false));
        },
        closeDrawer() {
            this.detailVisible = false;
        },
        showModal() {
            this.editId = null;
            this.editIndex = -1;
            this.visible = true;
        },
        hideModal() {
            this.visible = false;
        },
        update() {
            this.form = {
                name: this.detail.info.name,
                description: this.detail.info.description,
                category_id: this.detail.info.category_id,
                points: this.detail.points.map(item => item.id)
            };
            this.detailVisible = false;
            this.visible = true;
        },
        delete(id, index) {
            Modal.confirm({
                title: '请确认',
                content: `确认要删除「${this.list[index].name}」巡检路线吗？`,
                onOk: () => {
                    utils.request
                        .post('/mission_manage/line_delete', { id, community_id: this.postInfo.default_community_id })
                        .then(() => {
                            this.list.splice(index, 1);
                            Message.success('删除巡检路线成功');
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
                    this.form = {
                        name: '',
                        description: '',
                        category_id: '',
                        points: []
                    };
                    this.$refs.form.resetFields();
                    this.submiting = false;
                    this.visible = false;
                };

                if (this.editId) {
                    utils.request
                        .post('/mission_manage/line_update', {
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
                            Message.success('修改巡检路线成功');
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    utils.request
                        .post('/mission_manage/line_create', {
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
                            Message.success('添加巡检路线成功');
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
        Button,
        Form,
        FormItem,
        Modal,
        Input,
        WaterMark,
        Select,
        Option,
        Drawer,
        Timeline,
        TimelineItem,
        Row,
        Col
    }
};
</script>

<style lang="less">
.points {
    padding: 12px 0;

    .ivu-timeline-item-content {
        font-size: 12px;
        line-height: 20px;
    }
}
</style>
