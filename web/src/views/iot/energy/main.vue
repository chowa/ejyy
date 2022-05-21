<template>
    <WaterMark>
        <Header />

        <FilterQuery :filterOptions="filterOptions" :filters="filters" class="mt-16" />

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

        <History v-model="visible" :info="selectInfo" @on-read="onRead" />
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
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Header, ListFooter, WaterMark, FilterQuery } from '@/components';
import { Card, Page, Spin, Table, Tag } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';
import ROLES from '@/constants/role';
import History from './components/history';

export default {
    name: 'IotEnergyRead',
    data() {
        return {
            fetching: true,
            filters: {
                building_id: undefined
            },
            filterOptions: [
                {
                    label: '关联房产',
                    prop: 'building_id',
                    type: 'select',
                    list: []
                }
            ],
            options: {
                category: [
                    {
                        name: '水表',
                        value: 1
                    },
                    {
                        name: '电表',
                        value: 2
                    },
                    {
                        name: '燃气表',
                        value: 3
                    }
                ]
            },
            columns: [
                {
                    title: '仪表名称',
                    minWidth: 120,
                    key: 'name'
                },
                {
                    title: '仪表型号',
                    minWidth: 120,
                    key: 'model'
                },
                {
                    title: '设备类型',
                    minWidth: 120,
                    render: (h, p) => {
                        const index = this.options.category.findIndex(item => item.value === p.row.category);

                        return h('span', index >= 0 ? this.options.category[index].name : '-');
                    }
                },
                {
                    title: '仪表编号',
                    minWidth: 120,
                    render: (h, p) => h('span', p.row.no ? p.row.no : '-')
                },
                {
                    title: 'imei',
                    minWidth: 120,
                    render: (h, p) => h('span', p.row.imei ? p.row.imei : '-')
                },
                {
                    title: '关联房产',
                    minWidth: 120,
                    render: (h, p) => {
                        if (this.userInfo.access.includes(ROLES.FCDA) && p.row.building_id) {
                            return h(
                                'a',
                                {
                                    on: {
                                        click: () => this.$router.push(`/basic/building/detail/${p.row.building_id}`)
                                    }
                                },
                                utils.building.text(p.row)
                            );
                        }

                        return h('span', p.row.building_id ? utils.building.text(p.row) : '-');
                    }
                },
                {
                    title: '关联中继器',
                    minWidth: 120,
                    render: (h, p) => h('span', p.row.repeater_id ? p.row.repeater : '-')
                },
                {
                    title: '设备状态',
                    minWidth: 100,
                    render: (h, p) =>
                        h(
                            Tag,
                            { props: { color: p.row.online ? 'success' : 'warning' } },
                            p.row.online ? '在线' : '离线'
                        )
                },
                {
                    title: '初始读数',
                    minWidth: 120,
                    key: 'init_value'
                },
                {
                    title: '当前读数',
                    minWidth: 120,
                    key: 'current_value'
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
                    minWidth: 160,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                },
                {
                    title: '操作',
                    key: 'id',
                    minWidth: 80,
                    fixed: 'right',
                    render: (h, p) => h('a', { on: { click: () => this.goRead(p.row) } }, '抄表')
                }
            ],
            visible: false,
            selectInfo: {}
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
            const { page_num, page_size, postInfo, filters } = this;
            this.fetching = true;

            const run = () => {
                const data = {
                    page_num,
                    page_size,
                    community_id: postInfo.default_community_id,
                    ...filters
                };

                utils.request
                    .post('/energy/read', data)
                    .then(res => {
                        this.fetching = false;
                        this.page_num = res.data.page_num;
                        this.page_size = res.data.page_size;
                        this.list = res.data.list;
                        this.total = res.data.total;
                    })
                    .catch(() => (this.fetching = false));
            };

            if (this.filterOptions[0].list.length === 0) {
                const data = { community_id: postInfo.default_community_id };

                utils.request.post('/option/building', data).then(res => {
                    this.filterOptions[0].list = res.data.list.map(item => {
                        return {
                            label: utils.building.text(item),
                            value: item.building_id
                        };
                    });
                    run();
                });
            } else {
                run();
            }
        },
        goRead(info) {
            this.selectInfo = info;
            this.visible = true;
        },
        onRead(value) {
            const list = [].concat(this.list);
            const index = list.findIndex(item => item.id === this.selectInfo.id);

            list[index] = {
                ...list[index],
                current_value: value
            };

            this.list = list;
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
        FilterQuery,
        History
    }
};
</script>
