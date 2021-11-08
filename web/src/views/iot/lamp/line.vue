<template>
    <WaterMark>
        <Header />

        <Button type="primary" @click="showDrawer">添加线路</Button>

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
            :title="updateInfo ? '修改线路' : '添加线路'"
            transfer
            width="460"
            class-name="cw-drawer-width-footer"
            :closable="false"
            :mask-closable="false"
        >
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent label-position="top">
                <FormItem label="线路名称：" prop="name">
                    <Input placeholder="请输入线路名称" v-model="form.name" />
                </FormItem>
                <FormItem label="灯控设备" prop="lamp_id">
                    <Select placeholder="请选择设备类型" v-model="form.lamp_id" filterable>
                        <Option v-for="item in options" :key="item.id" :value="item.id">
                            {{ item.name }}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="端口号：" prop="port">
                    <Input placeholder="请输入端口号" v-model="form.port" type="number" />
                </FormItem>
                <FormItem label="工作模式：" prop="work_mode">
                    <template v-for="(item, key) in form.work_mode">
                        <div :key="key" class="lamp-line-work-mode">
                            <Row>
                                <Col :span="18">
                                    <Input
                                        v-model="form.work_mode[key].name"
                                        :placeholder="`请输入模式${key + 1}名称`"
                                    />
                                </Col>
                                <Col :span="6">
                                    <div
                                        class="lamp-line-btn"
                                        v-if="key === form.work_mode.length - 1"
                                        @click="addMode"
                                    >
                                        <Icon type="ios-add-circle-outline" />
                                    </div>
                                    <div class="lamp-line-btn" v-if="key !== 0" @click="removeMode(key)">
                                        <Icon type="ios-remove-circle-outline" />
                                    </div>
                                </Col>
                                <Col :span="11">
                                    <TimePicker
                                        v-model="form.work_mode[key].start_time"
                                        :placeholder="`请选择模式${key + 1}开启时间`"
                                    />
                                </Col>
                                <Col :span="2">至</Col>
                                <Col :span="11">
                                    <TimePicker
                                        v-model="form.work_mode[key].end_time"
                                        :placeholder="`请选择模式${key + 1}关闭时间`"
                                    />
                                </Col>
                            </Row>
                        </div>
                    </template>
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
    Tag,
    Button,
    Drawer,
    Form,
    Input,
    FormItem,
    Message,
    Select,
    Option,
    TimePicker,
    Icon,
    Row,
    Col
} from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';
import WorkMode from './components/mode';

export default {
    name: 'IotLampLineManage',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    type: 'expand',
                    width: 50,
                    render: (h, p) => {
                        return h(WorkMode, {
                            props: {
                                list: p.row.work_mode
                            }
                        });
                    }
                },
                {
                    title: '线路名称',
                    minWidth: 120,
                    key: 'name'
                },
                {
                    title: '灯控名称',
                    minWidth: 120,
                    key: 'lamp'
                },
                {
                    title: '灯控端口',
                    minWidth: 120,
                    key: 'port'
                },
                {
                    title: '线路状态',
                    minWidth: 80,
                    render: (h, p) =>
                        h(Tag, { props: { color: p.row.off ? 'default' : 'green' } }, p.row.off ? '关闭' : '开启')
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
                    minWidth: 140,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                },
                {
                    title: '操作',
                    key: 'id',
                    minWidth: 100,
                    fixed: 'right',
                    render: (h, p) => h('a', { on: { click: () => this.goUpdate(p.row) } }, '修改配置')
                }
            ],
            options: [],
            visible: false,
            form: {
                name: '',
                port: '',
                lamp_id: undefined,
                work_mode: []
            },
            rules: {
                name: [
                    { required: true, message: '请输入线路名称' },
                    { max: 56, message: '线路名称不能超过56个字符' }
                ],
                port: [{ required: true, message: '请输入端口号' }],
                lamp_id: [{ required: true, type: 'number', message: '请选择灯控设备' }],
                work_mode: [
                    { required: true, type: 'array', min: 1, message: '请添加工作模式' },
                    {
                        message: '请输入完整的工作模式',
                        validator: (rule, val, cb) => {
                            const pass = val.every(item => !!item.name && !!item.start_time && !!item.end_time);

                            if (pass) {
                                cb();
                            } else {
                                cb(new Error('请输入完整的工作模式'));
                            }
                        }
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
            const { page_num, page_size, postInfo } = this;

            this.fetching = true;

            const data = {
                page_num,
                page_size,
                community_id: postInfo.default_community_id
            };

            utils.request
                .post('/lamp/line_list', data)
                .then(res => {
                    this.fetching = false;
                    this.page_num = res.data.page_num;
                    this.page_size = res.data.page_size;
                    this.list = res.data.list;
                    this.total = res.data.total;
                })
                .catch(() => (this.fetching = false));

            if (this.options.length === 0) {
                utils.request
                    .post('/lamp/option', data)
                    .then(res => {
                        this.options = res.data.list;
                    })
                    .catch(() => {});
            }
        },
        showDrawer() {
            this.form = {
                name: '',
                port: '',
                lamp_id: undefined,
                work_mode: [{}]
            };
            this.$refs.form.resetFields();
            this.updateInfo = null;
            this.visible = true;
        },
        addMode() {
            this.form.work_mode.push({});
        },
        removeMode(index) {
            this.form.work_mode.splice(index, 1);
        },
        goUpdate(info) {
            this.form = {
                name: info.name ? info.name : '',
                port: info.port ? info.port : '',
                lamp_id: info.lamp_id ? info.lamp_id : undefined,
                work_mode: info.work_mode.length ? info.work_mode : [{}]
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
                const lampName = id => {
                    const index = this.options.findIndex(item => item.id === id);

                    return this.options[index].name;
                };

                if (!this.updateInfo) {
                    utils.request
                        .post('/lamp/line_create', {
                            ...this.form,
                            community_id: this.postInfo.default_community_id
                        })
                        .then(res => {
                            const list = [].concat(this.list);

                            list.unshift({
                                ...this.form,
                                lamp: lampName(this.form.lamp_id),
                                id: res.data.id,
                                community_id: this.postInfo.default_community_id,
                                created_at: res.data.created_at,
                                created_by: this.userInfo.id,
                                real_name: this.userInfo.real_name
                            });
                            this.list = list;
                            this.submiting = false;
                            this.visible = false;
                            Message.success('添加线路成功');
                        })
                        .catch(() => (this.submiting = false));
                } else {
                    utils.request
                        .post('/lamp/line_update', {
                            ...this.form,
                            id: this.updateInfo.id,
                            community_id: this.postInfo.default_community_id
                        })
                        .then(() => {
                            const list = [].concat(this.list);
                            const index = list.findIndex(item => item.id === this.updateInfo.id);
                            list[index] = {
                                ...list[index],
                                ...this.form,
                                lamp: lampName(this.form.lamp_id)
                            };
                            this.list = list;
                            this.submiting = false;
                            this.visible = false;
                            Message.success('修改线路成功');
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
        WaterMark,
        Button,
        Drawer,
        Form,
        Input,
        FormItem,
        Select,
        Option,
        TimePicker,
        Icon,
        Row,
        Col
    }
};
</script>

<style lang="less">
.lamp-line-work-mode {
    text-align: center;
    padding: 8px 0;

    .ivu-row {
        padding: 4px 0;
        line-height: 40px;
    }

    .lamp-line-btn {
        font-size: 22px;
        line-height: 1;
        cursor: pointer;
        display: inline-block;
    }

    + .lamp-line-work-mode {
        border-top: 1px dashed #f5f5f5;
    }

    .ivu-date-picker {
        display: block !important;
    }
}
</style>
