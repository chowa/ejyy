<template>
    <section class="card mr entrance">
        <h2 class="card-title">今日小区通行记录</h2>

        <Slider :list="list" />
    </section>
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

import Slider from './slider';

export default {
    name: 'EntranceChart',
    props: {
        detail: {
            type: Object,
            default: () => {
                return {
                    entrance_current_day_log: [],
                    elevator_current_day_log: [],
                    park_current_day_log: []
                };
            }
        }
    },
    data() {
        return {
            list: []
        };
    },
    mounted() {
        this.renderList();
    },
    methods: {
        renderList() {
            const { entrance_current_day_log, elevator_current_day_log, park_current_day_log } = this.detail;
            const list = [];

            entrance_current_day_log.forEach(record => {
                list.push({
                    name: `${record.vistor ? '访客' : '业主'}·${record.vistor ? record.vistor : record.ower}`,
                    local: record.name,
                    created_at: record.created_at
                });
            });

            elevator_current_day_log.forEach(record => {
                list.push({
                    name: `${record.vistor ? '访客' : '业主'}·${record.vistor ? record.vistor : record.ower}`,
                    local: record.name,
                    created_at: record.created_at
                });
            });

            park_current_day_log.forEach(record => {
                list.push({
                    name: record.car_number,
                    local: `${record.name}·${record.gate}`,
                    created_at: record.created_at
                });
            });

            this.list = list;
        }
    },
    components: {
        Slider
    },
    watch: {
        detail: {
            deep: true,
            handler() {
                this.renderList();
            }
        }
    }
};
</script>

<style lang="less">
.entrance {
    flex: 0 0 24%;
    margin-bottom: 18px;
}
</style>
