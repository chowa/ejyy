<template>
    <div>
        <div class="title">物业费催缴通知</div>

        <p class="to">尊敬的业主：</p>

        <p class="section">
            {{ community_name }}小区{{ start_year }}年至{{ end_year }}年物业费缴纳已有一段时间，您名下房产{{
                building
            }}物业费用{{ fee | yuan }}元还未缴纳，请及时缴费。
        </p>
        <p class="section">您可前往物业办公室现场缴费，或扫描下方二维码通过业主小程序缴费。</p>
        <img src="~@/assets/help/ump/qrcode.jpg" @load="imgLoaded" width="215" />
        <p class="section">感觉您对物业工作的理解和支持。</p>
        <p class="date">{{ now | mom_format }}</p>
    </div>
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
import printMixin from '@/mixins/print';

export default {
    name: 'PrintFeeUrge',
    data() {
        return {
            fetching: true,
            building: '',
            end_year: '',
            fee: '',
            start_year: '',
            now: Date.now()
        };
    },
    mixins: [printMixin],
    created() {
        this.building = this.$route.query.building;
        this.end_year = this.$route.query.end_year;
        this.fee = this.$route.query.fee;
        this.start_year = this.$route.query.start_year;
    },
    methods: {
        imgLoaded() {
            this.print();
        }
    },
    computed: {
        ...mapGetters({
            postInfo: 'common/postInfo'
        }),
        community_name() {
            if (!this.postInfo.default_community_id) {
                return '';
            }

            const index = this.postInfo.community_list.findIndex(
                item => item.community_id === this.postInfo.default_community_id
            );

            return this.postInfo.community_list[index].name;
        }
    }
};
</script>
