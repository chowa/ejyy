<template>
    <WaterMark>
        <Header />

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
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { mapGetters } from 'vuex';
import { Header, ListFooter, WaterMark } from '@/components';
import { Card, Page, Spin, Table, Tag } from 'view-design';
import pageMixin from '@/mixins/page';
import * as utils from '@/utils';
import moment from 'moment';
import ROLES from '@/constants/role';

export default {
    name: 'IotEntranceLog',
    data() {
        return {
            fetching: true,
            columns: [
                {
                    title: '门禁名称',
                    minWidth: 180,
                    key: 'name'
                },
                {
                    title: '通行方式',
                    minWidth: 100,
                    render: (h, p) => {
                        let text;
                        let color;
                        switch (p.row.method) {
                            case 1:
                                text = '二维码';
                                color = 'purple';
                                break;

                            case 2:
                                text = 'NFC';
                                color = 'geekblue';
                                break;

                            case 3:
                                text = 'IC卡';
                                color = 'cyan';
                                break;
                        }

                        return h(Tag, { props: { color } }, text);
                    }
                },
                {
                    title: '通行类型',
                    minWidth: 100,
                    render: (h, p) => h('span', p.row.ower_id ? '业主' : '访客')
                },
                {
                    title: '通行人员',
                    minWidth: 100,
                    render: (h, p) => {
                        if (p.row.ower_id) {
                            if (this.userInfo.access.includes(ROLES.YZDA)) {
                                return h(
                                    'a',
                                    { on: { click: () => this.$router.push(`/basic/ower/detail/${p.row.ower_id}`) } },
                                    p.row.ower_real_name
                                );
                            } else {
                                return h('span', p.row.ower_real_name);
                            }
                        } else {
                            if (this.userInfo.access.includes(ROLES.FKTX)) {
                                return h(
                                    'a',
                                    {
                                        on: {
                                            click: () => this.$router.push(`/basic/vistor/detail/${p.row.vistor_id}`)
                                        }
                                    },
                                    p.row.vistor_name
                                );
                            } else {
                                return h('span', p.row.vistor_name);
                            }
                        }
                    }
                },
                {
                    title: '通行时间',
                    key: 'created_at',
                    minWidth: 180,
                    render: (h, p) => h('span', moment(p.row.created_at).format('YYYY-MM-DD HH:mm:ss'))
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
            const { page_num, page_size, postInfo } = this;

            this.fetching = true;
            const data = {
                page_num,
                page_size,
                community_id: postInfo.default_community_id
            };

            utils.request
                .post('/entrance/log', data)
                .then(res => {
                    this.fetching = false;
                    this.page_num = res.data.page_num;
                    this.page_size = res.data.page_size;
                    this.list = res.data.list;
                    this.total = res.data.total;
                })
                .catch(() => (this.fetching = false));
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
        WaterMark
    }
};
</script>
