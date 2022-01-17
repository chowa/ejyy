<template>
    <WaterMark>
        <Header />

        <FilterQuery :filterOptions="filterOptions" :filters="filters" class="mt-16" />

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
import { Header, ListFooter, FilterQuery, WaterMark } from '@/components';
import { Card, Page, Spin, Table, Tag } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';

export default {
    name: 'BasicPetList',
    data() {
        return {
            fetching: true,
            filterOptions: [
                {
                    label: '雌雄',
                    prop: 'sex',
                    list: [
                        { label: '雄', value: 1 },
                        { label: '雌', value: 0 }
                    ]
                },
                {
                    label: '登记',
                    prop: 'license',
                    list: [
                        { label: '已登记', value: true },
                        { label: '未登记', value: false }
                    ]
                },
                {
                    label: '注销',
                    prop: 'remove',
                    list: [
                        { label: '是', value: 1 },
                        { label: '否', value: 0 }
                    ]
                },
                {
                    label: '品种',
                    prop: 'breed',
                    type: 'text',
                    max: 8
                },
                {
                    label: '毛色',
                    prop: 'coat_color',
                    type: 'text',
                    max: 5
                }
            ],
            filters: {
                sex: undefined,
                license: undefined,
                breed: undefined,
                coat_color: undefined,
                remove: undefined
            },
            columns: [
                {
                    title: '编号',
                    minWidth: 120,
                    render: (h, p) => h('span', utils.order.num('P', p.row.created_at, p.row.id))
                },
                {
                    title: '宠物名',
                    minWidth: 100,
                    key: 'name'
                },
                {
                    title: '宠物类型',
                    minWidth: 80,
                    render: (h, p) => h('span', p.row.pet_type === 1 ? '狗' : '-')
                },
                {
                    title: '雌雄',
                    minWidth: 40,
                    render: (h, p) => h('span', p.row.sex === 0 ? '雌' : '雄')
                },
                {
                    title: '品种',
                    minWidth: 100,
                    key: 'breed'
                },
                {
                    title: '毛色',
                    minWidth: 100,
                    key: 'coat_color'
                },
                {
                    title: '宠物登记',
                    minWidth: 120,
                    render: (h, p) => {
                        const color = !p.row.pet_license ? 'default' : 'green';

                        return h(Tag, { props: { color } }, !p.row.pet_license ? '未登记' : '已登记');
                    }
                },
                {
                    title: '是否注销',
                    minWidth: 120,
                    render: (h, p) => {
                        const color = !p.row.remove ? 'default' : 'error';

                        return h(Tag, { props: { color } }, !p.row.remove ? '否' : '是');
                    }
                },
                {
                    title: '登记时间',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
                },
                {
                    title: '操作',
                    minWidth: 80,
                    fixed: 'right',
                    render: (h, p) => h('a', { on: { click: () => this.goDetail(p.row.id) } }, '查看')
                }
            ]
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
            const data = {
                page_num,
                page_size,
                community_id: postInfo.default_community_id,
                ...filters
            };

            utils.request
                .post('/pet/list', data)
                .then(res => {
                    this.fetching = false;
                    this.page_num = res.data.page_num;
                    this.page_size = res.data.page_size;
                    this.list = res.data.list;
                    this.total = res.data.total;
                })
                .catch(() => (this.fetching = false));
        },
        goDetail(id) {
            this.$router.push(`/basic/pet/detail/${id}`);
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
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
        FilterQuery,
        WaterMark
    }
};
</script>
