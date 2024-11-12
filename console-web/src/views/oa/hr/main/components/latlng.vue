<template>
    <div>
        <Row class="detail-row" v-for="item in row.items" :key="item.begin">
            <Col :lg="8" :sm="12" :xs="12">
                <span class="detail-label">上班打卡时间</span>
                <div class="detail-content">{{ item.begin | mom_format }}</div>
            </Col>
            <Col :lg="8" :sm="12" :xs="12">
                <span class="detail-label">上班打卡坐标</span>
                <div class="detail-content">{{ item.begin_lng }}，{{ item.begin_lat }}</div>
            </Col>
            <Col :lg="8" :sm="12" :xs="12">
                <span class="detail-label">上班打卡误差</span>
                <div class="detail-content">{{ item.begin_accuracy }}</div>
            </Col>
            <Col :lg="8" :sm="12" :xs="12">
                <span class="detail-label">下班打卡时间</span>
                <div class="detail-content">
                    <span v-if="item.finish">{{ item.finish | mom_format }}</span>
                    <span v-else class="text-color-light">-</span>
                </div>
            </Col>
            <Col :lg="8" :sm="12" :xs="12">
                <span class="detail-label">下班打卡坐标</span>
                <div class="detail-content">
                    <span v-if="item.finish">{{ item.finish_lng }}，{{ item.finish_lat }}</span>
                    <span v-else class="text-color-light">-</span>
                </div>
            </Col>
            <Col :lg="8" :sm="12" :xs="12">
                <span class="detail-label">下班打卡误差</span>
                <div class="detail-content">
                    <span v-if="item.finish">{{ item.finish_accuracy }}</span>
                    <span v-else class="text-color-light">-</span>
                </div>
            </Col>
        </Row>
    </div>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { Row, Col } from 'view-design';

export default {
    name: 'HrSignLatlng',
    props: {
        row: Object
    },
    components: {
        Row,
        Col
    }
};
</script>
