<template>
    <Card dis-hover :bordered="false" class="filter-query">
        <div class="filter-query-row" v-for="(query, key) in filterOptions" :key="key">
            <div class="filter-query-name" v-if="query.label">{{ query.label }}：</div>

            <div v-if="query.type === 'text'" class="filter-query-input">
                <div :class="errors[query.prop] ? 'ivu-form-item-error' : ''">
                    <Input
                        :placeholder="`请输入${query.label}搜索`"
                        @on-search="onSearch(query.prop)"
                        @on-change="onChange(query, $event)"
                        :value="inputs[query.prop]"
                        search
                        enter-button="检索"
                    />
                    <transition name="fade">
                        <div class="query-error-tip" v-if="errors[query.prop]">{{ errors[query.prop] }}</div>
                    </transition>
                </div>
            </div>
            <div v-else-if="query.type === 'select'">
                <Select v-model="radios[query.prop]" filterable :placeholder="`请选择${query.label}搜索`" clearable>
                    <Option v-for="item in query.list" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </Option>
                </Select>
            </div>
            <div class="filter-query-list" v-else>
                <RadioGroup type="button" v-model="radios[query.prop]">
                    <Radio label="all-selector">全部</Radio>
                    <template v-for="(item, index) in query.list">
                        <Radio :key="index" :label="labelValue(item.value)">{{ item.label }}</Radio>
                    </template>
                </RadioGroup>
            </div>
        </div>
    </Card>
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

import { Card, Input, Radio, RadioGroup, Select, Option } from 'view-design';

export default {
    name: 'FilterQuery',
    props: {
        filterOptions: Array,
        // [[label: '', prop: '',list: [], type: 'text']],
        filters: Object,
        fetching: Boolean
    },
    data() {
        return {
            inputs: {},
            radios: {},
            errors: {}
        };
    },
    created() {
        this.computedResult();
    },
    methods: {
        computedResult() {
            const inputs = {};
            const radios = {};

            this.filterOptions.forEach(({ prop, type, list }) => {
                if (type === 'text') {
                    inputs[prop] = this.filters[prop];
                } else {
                    if (!Array.isArray(list) || list.length === 0) {
                        return;
                    }

                    if (typeof list[0].value === 'boolean') {
                        radios[prop] = this.filters[prop] === undefined ? 'all-selector' : this.filters[prop] ? 1 : 0;
                    } else {
                        radios[prop] = this.filters[prop] === undefined ? 'all-selector' : this.filters[prop];
                    }
                }
            });

            this.inputs = inputs;
            this.radios = radios;
        },
        labelValue(val) {
            if (typeof val === 'boolean') {
                return val ? 1 : 0;
            }

            return val;
        },
        onSearch(prop) {
            if (this.errors[prop]) {
                return;
            }

            this.trigger();
        },
        onChange(query, e) {
            const { min, max, label, pattern, prop } = query;
            const val = e.target.value;
            let result = undefined;
            let error = null;

            if (val && min && val.length < min) {
                error = `${label}应大于${min}个字`;
            } else if (val && max && val.length > max) {
                error = `${label}应小于${max}个字`;
            } else if (val && pattern && !pattern.test(val)) {
                error = `请输入正确的${label}`;
            } else {
                result = val ? val : undefined;
            }

            this.inputs = {
                ...this.inputs,
                [prop]: result
            };

            this.errors = {
                ...this.errors,
                [prop]: error
            };
        },
        trigger() {
            const val = {};
            const query = { ...this.$route.query };

            this.filterOptions.forEach(({ prop, type, list }) => {
                if (type === 'text') {
                    val[prop] = this.inputs[prop];
                } else {
                    if (!Array.isArray(list) || list.length === 0) {
                        return;
                    }

                    if (typeof list[0].value === 'boolean') {
                        val[prop] =
                            this.radios[prop] === 'all-selector' ? undefined : this.radios[prop] === 1 ? true : false;
                    } else {
                        val[prop] = this.radios[prop] === 'all-selector' ? undefined : this.radios[prop];
                    }
                }
            });

            for (let key in val) {
                if (val[key] === undefined) {
                    delete query[key];
                } else {
                    query[key] = val[key];
                }
            }

            this.$router.push(
                `${this.$route.path}?${Object.keys(query)
                    .map(key => `${key}=${query[key]}`)
                    .join('&')}`
            );
        }
    },
    watch: {
        radios: {
            deep: true,
            handler() {
                if (!this.fetching) {
                    this.trigger();
                }
            }
        },
        filterOptions: {
            deep: true,
            handler() {
                this.computedResult();
            }
        },
        filters: {
            deep: true,
            handler() {
                this.computedResult();
            }
        }
    },
    components: {
        Card,
        Input,
        RadioGroup,
        Radio,
        Select,
        Option
    }
};
</script>

<style lang="less">
.filter-query {
    margin-bottom: 26px;

    &-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        color: #515a6e;
        padding: 12px 0;
    }

    &-row + &-row {
        border-top: 1px dashed #eee;
    }

    &-name {
        padding-right: 20px;
        flex: none;
        white-space: nowrap;
        font-size: 12px;
    }

    &-list {
        .ivu-radio-group-button .ivu-radio-wrapper {
            font-size: 12px !important;
        }
    }

    &-input {
        flex: auto;
        max-width: 260px;

        .ivu-input,
        .ivu-input-group {
            font-size: 12px !important;
        }
    }

    .query-error-tip {
        font-size: 12px;
        line-height: 1;
        margin-top: 6px;
        color: #ed4014;
    }
}
</style>
