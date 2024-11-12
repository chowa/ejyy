<template>
    <section>
        <Header>
            <span slot="description">
                公司整体设置，请谨慎操作，如有疑问请发信至
                <a href="mailto:contact@chowa.cn">技术支持</a>
                咨询。
            </span>
        </Header>

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
import { Card, Page, Spin, Table, Button } from 'view-design';
import * as utils from '@/utils';
import pageMixin from '@/mixins/page';
import moment from 'moment';

export default {
    name: 'SettingCommunityList',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('C', p.row.created_at, p.row.id))
                },
                {
                    title: '小区名称',
                    minWidth: 180,
                    key: 'name'
                },
                {
                    title: '有效期',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.expire).format('YYYY-MM-DD HH:mm:ss'))
                },
                {
                    title: '所在地',
                    minWidth: 180,
                    render: (h, p) => h('span', `${p.row.province}${p.row.city}${p.row.district}`)
                },
                {
                    title: '创建时间',
                    key: 'created_at',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                },
                {
                    title: '操作',
                    key: 'id',
                    minWidth: 100,
                    fixed: 'right',
                    render: (h, p) =>
                        h('span', [
                            h('a', { on: { click: () => this.goDetail(p.row.id) } }, '查看'),
                            h('a', { on: { click: () => this.goUpdate(p.row.id) } }, '修改')
                        ])
                }
            ]
        };
    },
    mixins: [pageMixin],
    mounted() {
        this.getListData();
    },
    methods: {
        getListData() {
            const { page_num, page_size } = this;

            this.fetching = true;

            utils.request.post('/community_manage/list', { page_num, page_size }).then(res => {
                this.fetching = false;
                this.page_num = res.data.page_num;
                this.page_size = res.data.page_size;
                this.list = res.data.list;
                this.total = res.data.total;
            });
        },
        goDetail(id) {
            this.$router.push(`/setting/community/detail/${id}`);
        },
        goUpdate(id) {
            this.$router.push(`/setting/community/update/${id}`);
        }
    },
    components: {
        Header,
        ListFooter,
        Card,
        Page,
        Spin,
        Table,
        Button
    }
};
</script>
