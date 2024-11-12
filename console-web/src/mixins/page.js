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

import * as config from '@/config';
import * as utils from '@/utils';

export default {
    data() {
        return {
            page_num: 1,
            total: 0,
            page_size: config.DEGAULT_PAGE_SIZE,
            list: []
        };
    },
    created() {
        this.updateFilters();
    },
    methods: {
        updateFilters() {
            this.page_num = this.$route.query.p ? parseInt(this.$route.query.p, 10) : 1;
            this.page_size = this.$route.query.s ? parseInt(this.$route.query.s, 10) : config.DEGAULT_PAGE_SIZE;

            if (typeof this.filters === 'object') {
                const filters = { ...this.filters };

                for (let filter in filters) {
                    if (filter in this.$route.query) {
                        const val = this.$route.query[filter];

                        if (/^\d+$/.test(val)) {
                            filters[filter] = parseInt(val, 10);
                        } else if (val === 'true' || val === 'false') {
                            filters[filter] = val === 'true' ? true : false;
                        } else {
                            filters[filter] = val;
                        }
                    } else {
                        filters[filter] = undefined;
                    }
                }

                if (!utils.diff.vueSame(filters, this.filters)) {
                    this.filters = filters;
                }
            }
        },
        changeRouteQuery() {
            const query = [`p=${this.page_num}`, `s=${this.page_size}`];

            if (typeof this.filters === 'object') {
                for (let key in this.filters) {
                    if (this.filters[key] !== undefined) {
                        query.push(`${key}=${this.filters[key]}`);
                    }
                }
            }

            this.$router.push(`${this.$route.path}?${query.join('&')}`);
        },
        onPageChange(num) {
            this.page_num = num;
            this.changeRouteQuery();
        },
        onPageSizeChange(num) {
            this.page_num = 1;
            this.page_size = num;
            this.changeRouteQuery();
        }
    },
    watch: {
        $route: {
            deep: true,
            handler() {
                if (this.postInfo && !this.postInfo.default_community_id) return;
                this.updateFilters();
                this.$nextTick(() => {
                    this.getListData();
                });
            }
        }
    }
};
