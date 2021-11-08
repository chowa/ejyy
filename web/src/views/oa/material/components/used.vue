<template>
    <Drawer :value="value" :title="`物料「${info.name}」领用记录`" transfer width="560" @on-close="cancel">
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

        <Spin size="large" fix v-if="fetching" />
    </Drawer>
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

import { Drawer, Table, Page, Spin } from 'view-design';
import { ListFooter } from '@/components';
import * as utils from '@/utils';
import * as config from '@/config';
import moment from 'moment';

export default {
    name: 'OaMaterialUsed',
    props: {
        value: Boolean,
        info: Object
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
                    title: '领用人',
                    minWidth: 100,
                    render: (h, p) =>
                        h(
                            'a',
                            {
                                on: {
                                    click: () => this.$router.push(`/oa/hr/colleague/detail/${p.row.used_by}`)
                                }
                            },
                            p.row.real_name
                        )
                },
                {
                    title: '领用数量',
                    minWidth: 100,
                    key: 'total'
                },
                {
                    title: '领用用途',
                    minWidth: 160,
                    key: 'reason'
                },
                {
                    title: '领用时间',
                    minWidth: 140,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                }
            ]
        };
    },
    methods: {
        onPageChange(num) {
            this.page_num = num;
            this.getListData();
        },
        getListData() {
            const { page_num, page_size } = this;

            this.fetching = true;

            utils.request.post('/material/used', { page_num, page_size, material_id: this.info.id }).then(res => {
                this.fetching = false;
                this.page_num = res.data.page_num;
                this.page_size = res.data.page_size;
                this.list = res.data.list;
                this.total = res.data.total;
            });
        },
        cancel() {
            this.$emit('input', false);
        }
    },
    watch: {
        value(cur) {
            if (cur) {
                this.page_num = 1;
                this.getListData();
            }
        }
    },
    components: {
        Drawer,
        Spin,
        Table,
        ListFooter,
        Page
    }
};
</script>
