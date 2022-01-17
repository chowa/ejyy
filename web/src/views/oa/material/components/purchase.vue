<template>
    <Drawer :value="value" :title="`物料「${info.name}」采购记录`" transfer width="560" @on-close="cancel">
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
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Drawer, Table, Page, Spin, Tag } from 'view-design';
import { ListFooter } from '@/components';
import * as utils from '@/utils';
import * as config from '@/config';
import moment from 'moment';

export default {
    name: 'OaMaterialPurchase',
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
                    title: '采购人',
                    minWidth: 80,
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
                    title: '采购数量',
                    minWidth: 100,
                    key: 'total'
                },
                {
                    title: '采购源',
                    minWidth: 110,
                    render: (h, p) => {
                        let color = '';
                        let text = '';

                        switch (p.row.origin) {
                            case 1:
                                color = 'blue';
                                text = '初始入库';
                                break;

                            case 2:
                                color = 'volcano';
                                text = '现金采购';
                                break;

                            case 3:
                                color = 'gold';
                                text = '调拨';
                                break;
                        }

                        return h(Tag, { props: { color } }, text);
                    }
                },
                {
                    title: '采购状态',
                    minWidth: 100,
                    render: (h, p) => {
                        let color = '';
                        let text = '';

                        switch (p.row.finish) {
                            case 1:
                                color = 'green';
                                text = '已入库';
                                break;

                            case 0:
                                color = 'geekblue';
                                text = '采购中';
                                break;
                        }

                        return h(Tag, { props: { color } }, text);
                    }
                },
                {
                    title: '采购时间',
                    minWidth: 100,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD'))
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

            utils.request.post('/material/purchase', { page_num, page_size, material_id: this.info.id }).then(res => {
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
