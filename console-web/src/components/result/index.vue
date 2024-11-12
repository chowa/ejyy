<template>
    <Card dis-hover :bordered="false">
        <div class="result">
            <span :class="iconClasses">
                <Icon :type="type === 'success' ? 'ios-checkmark' : 'ios-close'" />
            </span>

            <p class="result-title">
                {{ title }}
            </p>

            <p class="result-description">
                {{ description }}
            </p>

            <div class="result-extra" v-if="$slots.extra">
                <slot name="extra" />
            </div>

            <div class="result-actions" v-if="$slots.actions">
                <slot name="actions" />
            </div>
        </div>
    </Card>
</template>

<script>
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

import { Icon, Card } from 'view-design';

export default {
    name: 'Result',
    props: {
        type: {
            type: String,
            validation: prop => {
                return ['success', 'error'].includes(prop);
            },
            default: 'success'
        },
        title: {
            type: String,
            required: true
        },
        description: String
    },
    computed: {
        iconClasses() {
            return {
                'result-icon': true,
                [`result-icon-${this.type}`]: true
            };
        }
    },
    components: {
        Icon,
        Card
    }
};
</script>

<style lang="less">
.result {
    width: 72%;
    margin: 0 auto;
    padding: 32px 0;
    text-align: center;

    &-icon {
        display: inline-block;
        width: 72px;
        height: 72px;
        line-height: 72px;
        font-size: 72px;
        margin-bottom: 24px;
        border-radius: 50%;
        color: #fff;

        &-success {
            background-color: #19be6b;
        }

        &-error {
            background-color: #ed4014;
        }
    }

    &-title {
        margin-bottom: 16px;
        color: #17233d;
        font-weight: 500;
        font-size: 24px;
        line-height: 32px;
    }

    &-description {
        margin-bottom: 24px;
        color: #808695;
        font-size: 14px;
        line-height: 22px;
    }

    &-extra {
        padding: 24px 40px;
        text-align: left;
        background: #f8f8f9;
        border-radius: 4px;
    }

    &-actions {
        margin-top: 32px;

        .ivu-btn:not(:last-child) {
            margin-right: 8px;
        }
    }
}

@media screen and (max-width: 480px) {
    .result {
        width: 100%;
    }
}
</style>
