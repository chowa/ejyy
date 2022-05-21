<template>
    <Drawer
        :value="value"
        :title="`「${info.name}」抄表记录`"
        transfer
        width="760"
        @on-close="cancel"
        :mask-closable="false"
    >
        <Button type="primary" ghost @click="showModal">抄表</Button>

        <Table stripe :columns="columns" :data="list" class="mt-16" />

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

        <Modal title="抄表" v-model="visible">
            <Form :model="form" :rules="rules" ref="form" @submit.native.prevent>
                <FormItem prop="value" label="当前读数：">
                    <Input v-model="form.value" type="number" placeholder="请输入当前读数" />
                </FormItem>
            </Form>

            <div slot="footer">
                <Button @click="hideModal">取消</Button>
                <Button type="primary" @click="submit" :loading="submiting">确认</Button>
            </div>
        </Modal>
    </Drawer>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Drawer, Table, Page, Form, Input, FormItem, Button, Message, Modal, Tag } from 'view-design';
import { ListFooter } from '@/components';
import * as utils from '@/utils';
import * as config from '@/config';
import moment from 'moment';

export default {
    name: 'IotMeterlHistory',
    props: {
        value: Boolean,
        info: Object
    },
    data() {
        return {
            submiting: false,
            page_num: 1,
            total: 0,
            page_size: config.DEGAULT_PAGE_SIZE,
            list: [],
            columns: [
                {
                    title: '抄表时间',
                    minWidth: 120,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                },
                {
                    title: '数据来源',
                    minWidth: 100,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.from_repeater ? 'cyan' : 'purple' } },
                            p.row.from_repeater ? '中继器' : '人工'
                        )
                },
                {
                    title: '上次读数',
                    minWidth: 100,
                    key: 'last_value'
                },
                {
                    title: '当前读数',
                    minWidth: 100,
                    key: 'current_value'
                },
                {
                    title: '抄表人',
                    minWidth: 100,
                    render: (h, p) => {
                        if (p.row.from_repeater) {
                            return h('span', '-');
                        }

                        return h(
                            'a',
                            {
                                on: {
                                    click: () => this.$router.push(`/oa/hr/colleague/detail/${p.row.created_by}`)
                                }
                            },
                            p.row.real_name
                        );
                    }
                }
            ],
            form: {
                value: ''
            },
            rules: {
                value: [{ required: true, message: '请输入仪表当前读数' }]
            },
            visible: false
        };
    },
    methods: {
        onPageChange(num) {
            this.page_num = num;
            this.getListData();
        },
        onPageSizeChange(num) {
            this.page_num = 1;
            this.page_size = num;
            this.getListData();
        },
        getListData() {
            const data = {
                page_num: this.page_num,
                page_size: this.page_size,
                meter_id: this.info.id,
                community_id: this.postInfo.default_community_id
            };

            utils.request
                .post('/energy/read_history', data)
                .then(res => {
                    this.fetching = false;
                    this.page_num = res.data.page_num;
                    this.page_size = res.data.page_size;
                    this.list = res.data.list;
                    this.total = res.data.total;
                })
                .catch(() => (this.fetching = false));
        },
        cancel() {
            this.$emit('input', false);
        },
        submit() {
            this.$refs.form.validate(valid => {
                if (!valid) {
                    return;
                }

                this.submiting = true;

                const data = {
                    meter_id: this.info.id,
                    community_id: this.postInfo.default_community_id,
                    ...this.form
                };

                utils.request
                    .post('/energy/read_submit', data)
                    .then(res => {
                        this.list.unshift({
                            ...res.data,
                            current_value: this.form.value,
                            created_by: this.userInfo.id,
                            real_name: this.userInfo.real_name,
                            from_repeater: 0
                        });

                        this.$emit('on-read', this.form.value);
                        this.submiting = false;
                        Message.success('抄表成功');
                        this.hideModal();
                    })
                    .catch(() => (this.submiting = false));
            });
        },
        showModal() {
            this.visible = true;
            this.form = {
                value: ''
            };
            this.$refs.form.resetFields();
        },
        hideModal() {
            this.visible = false;
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo',
            userInfo: 'common/userInfo'
        })
    },
    watch: {
        value(cur) {
            if (cur && this.postInfo.default_community_id) {
                this.list = [];
                this.getListData();
            }
        },
        'postInfo.default_community_id'() {
            if (this.value) {
                this.getListData();
            }
        }
    },
    components: {
        Drawer,
        Form,
        Input,
        FormItem,
        Modal,
        Button,
        Table,
        Page,
        ListFooter
    }
};
</script>
