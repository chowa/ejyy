<template>
    <Row class="detail-row">
        <Col :lg="8" :sm="12" :xs="12">
            <span class="detail-label">开户行名称</span>
            <div class="detail-content">{{ row.bank_name ? row.bank_name : '-' }}</div>
        </Col>
        <Col :lg="8" :sm="12" :xs="12">
            <span class="detail-label">银行账号</span>
            <div class="detail-content">{{ row.bank_id ? row.bank_id : '-' }}</div>
        </Col>
        <Col :lg="8" :sm="12" :xs="12">
            <span class="detail-label">开户行地址</span>
            <div class="detail-content">{{ row.bank_address ? row.bank_address : '-' }}</div>
        </Col>
    </Row>
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

import { Row, Col } from 'view-design';

export default {
    name: 'OaSupplierBank',
    props: {
        row: Object
    },
    components: {
        Row,
        Col
    }
};
</script>
