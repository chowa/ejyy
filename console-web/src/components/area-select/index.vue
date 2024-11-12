<template>
    <div class="area-select">
        <Row :gutter="gutterNum">
            <Col :span="span" v-if="show(0)">
                <Select
                    ref="prov"
                    v-model="currPro"
                    @on-change="hasChange"
                    :filterable="searchable"
                    :placeholder="phHandled(0)"
                    :size="size"
                    :not-found-text="ndsHandled(0)"
                    :disabled="disabled === undefined ? false : disHandled(0)"
                    transfer
                    style="width:100%"
                >
                    <Option v-for="item in provList" :value="item" :key="item">{{ item }}</Option>
                </Select>
            </Col>
            <Col :span="span" v-if="show(1)">
                <Select
                    ref="city"
                    v-model="currCit"
                    @on-change="hasChange"
                    :filterable="searchable"
                    :placeholder="phHandled(1)"
                    :size="size"
                    :not-found-text="ndsHandled(1)"
                    :disabled="disabled === undefined ? false : disHandled(1)"
                    transfer
                    style="width:100%"
                >
                    <Option v-for="item in cityList" :value="item" :key="item">{{ item }}</Option>
                </Select>
            </Col>
            <Col :span="span" v-if="show(2)">
                <Select
                    ref="coun"
                    v-model="currCou"
                    @on-change="hasChange"
                    :filterable="searchable"
                    :placeholder="phHandled(2)"
                    :size="size"
                    :not-found-text="ndsHandled(2)"
                    :disabled="disabled === undefined ? false : disHandled(2)"
                    transfer
                    style="width:100%"
                >
                    <Option v-for="item in counList" :value="item" :key="item">{{ item }}</Option>
                </Select>
            </Col>
            <Col :span="span" v-if="show(3)">
                <Select
                    ref="stre"
                    v-model="currStr"
                    @on-change="hasChange"
                    :filterable="searchable"
                    :placeholder="phHandled(3)"
                    :size="size"
                    :not-found-text="ndsHandled(3)"
                    :disabled="disabled === undefined ? false : disHandled(3)"
                    transfer
                    style="width:100%"
                >
                    <Option v-for="item in streList" :value="item" :key="item">{{ item }}</Option>
                </Select>
            </Col>
        </Row>
        <slot></slot>
    </div>
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

import { Row, Col, Select, Option } from 'view-design';
import areaData from 'area-data/pcaa';
import utils from './utils';

const areaLinkageArr = utils.levelArr;
const dataTypeArr = utils.dataType;

export default {
    name: 'alSelector',
    data() {
        return {
            currPro: '',
            currCit: '',
            currCou: '',
            currStr: '',
            provList: areaData[86],
            cityList: {},
            counList: {},
            provIndex: 0,
            cityIndex: 0,
            counIndex: 0,
            isInit: true,
            defaultPlaceholder: ['请选择省', '请选择市', '请选择县区'],
            defaultnotFoundText: ['无匹配省', '无匹配市', '无匹配县区'],
            cloneValue: []
        };
    },
    props: {
        gutter: {
            type: [String, Number],
            default: 10
        },
        level: {
            type: [String, Number],
            default: 2,
            validator: val => {
                return utils.oneOf(parseInt(val), areaLinkageArr);
            }
        },
        value: {
            type: Array
        },
        searchable: {
            type: Boolean,
            default: false
        },
        dataType: {
            type: String,
            default: 'name',
            validator: val => {
                return utils.oneOf(val, dataTypeArr);
            }
        },
        auto: {
            type: Boolean,
            default: false
        },
        placeholder: {
            type: [Array, String],
            default() {
                return this.defaultPlaceholder;
            }
        },
        size: {
            type: String,
            default: 'default'
        },
        notFoundText: {
            type: [String, Array],
            default() {
                return this.defaultnotFoundText;
            }
        },
        disabled: {
            type: [Boolean, Array, Number],
            default: false
        }
    },
    computed: {
        gutterNum() {
            if (typeof this.gutter === 'number') {
                return this.gutter;
            } else {
                return parseInt(this.gutter);
            }
        },
        showLevel() {
            return parseInt(this.level);
        },
        span() {
            if (utils.oneOf(this.showLevel, areaLinkageArr)) {
                return 24 / (this.showLevel + 1);
            }

            return 0;
        }
    },
    watch: {
        currPro(prov) {
            this.updateNextSelector('provIndex', 'provList', 'cityList', prov, 'currCit', 0);
            if (this.showLevel === 0 || !areaData[utils.getIndex(areaData[86], prov)] || !this.auto) {
                this.returnRes(0);
            }
        },
        currCit(city) {
            this.updateNextSelector('cityIndex', 'cityList', 'counList', city, 'currCou', 1);
            if (this.showLevel === 1 || !areaData[utils.getIndex(this.provList, city)] || !this.auto) {
                this.returnRes(1);
            }
        },
        currCou(coun) {
            this.counIndex = utils.getIndex(this.counList, coun);

            if (this.showLevel === 2 || !this.auto) {
                this.returnRes(2);
            }
        },
        value() {
            this.init();
        }
    },
    methods: {
        init() {
            if (this.value && this.value.length > 0) {
                this.cloneValue = this.value;
                if (isNaN(parseInt(this.value[0]))) {
                    if (utils.getIndex(this.provList, this.value[0])) {
                        this.currPro = this.value[0];
                    }
                } else {
                    if (this.value[0]) {
                        if (areaData[86][this.value[0]]) {
                            this.currPro = areaData[86][this.value[0]];
                            this.provIndex = this.value[0];
                        }
                    }
                }
            }
        },
        show(level) {
            if (level <= this.showLevel) {
                return true;
            } else {
                return false;
            }
        },
        updateNextSelector(index, list, nextList, name, nextName, level) {
            if (level <= this.showLevel) {
                let nextSelected = '';
                if (this.isInit && this.value[level]) {
                    let valueItem = this.value[level];
                    if (isNaN(parseInt(valueItem))) {
                        if (utils.getIndex(this[list], this.value[level])) {
                            name = valueItem;
                        }
                    } else {
                        if (Object.keys(this[list]).indexOf(this.value[level]) > -1) {
                            if (level === 0) {
                                name = areaData[86][this.value[level]];
                            } else {
                                name = areaData[this.value[level - 1]][this.value[level]];
                            }
                        }
                    }
                }
                this[index] = utils.getIndex(this[list], name);
                if (areaData[this[index]]) {
                    if (this[index] === undefined) {
                        this.$refs[nextList.substr(0, 4)].setQuery('');
                    }
                    this[nextList] = areaData[this[index]];
                    if (this.isInit && this.cloneValue[level + 1]) {
                        let valueNextItem = this.cloneValue[level + 1];
                        if (isNaN(parseInt(valueNextItem))) {
                            if (utils.getIndex(this[nextList], this.cloneValue[level + 1])) {
                                nextSelected = this.cloneValue[level + 1];
                            }
                        } else {
                            if (Object.keys(this[nextList]).indexOf(this.cloneValue[level + 1]) > -1) {
                                nextSelected = areaData[this.cloneValue[level]][this.cloneValue[level + 1]];
                            }
                        }
                    }
                    if (this.isInit && this.value && this.value.length !== 0) {
                        this[nextName] = nextSelected || this.setNextSelect(index);
                    } else if (!this.isInit && this.auto) {
                        this[nextName] = nextSelected || this.setNextSelect(index);
                    }
                    if (this.isInit && level === this.showLevel) {
                        this.returnRes(level);
                    }
                } else {
                    this[nextName] = '';
                    this[nextList] = [];
                }
                if (
                    (this[nextName] === '市辖区' && this.auto) ||
                    (this[nextName] === '市辖区' && this.value && this.value.length !== 0)
                ) {
                    this.updateNextSelector('cityIndex', 'cityList', 'counList', '市辖区', 'currCou', 1);
                }
            }
        },
        returnRes(level) {
            if (this.auto) {
                this.returnResArr(this.showLevel);
            } else {
                this.returnResArr(level);
            }
        },
        setNextSelect(index) {
            return areaData[this[index]][Object.keys(areaData[this[index]])[0]];
        },
        returnResArr(level) {
            let res = [];
            let i = 0;
            let codeArr = [this.provIndex, this.cityIndex, this.counIndex];
            let nameArr = [this.currPro, this.currCit, this.currCou];

            if (this.dataType === 'name') {
                while (i <= level) {
                    if (nameArr[i]) {
                        res.push(nameArr[i]);
                    }
                    i++;
                }
            } else if (this.dataType === 'all') {
                while (i <= level) {
                    if (codeArr[i] && nameArr[i]) {
                        let item = {
                            code: codeArr[i],
                            name: nameArr[i]
                        };
                        res.push(item);
                    }
                    i++;
                }
            } else {
                while (i <= level) {
                    if (codeArr[i]) {
                        res.push(codeArr[i]);
                    }
                    i++;
                }
            }

            this.$emit('input', res);
            this.$emit('on-change', res);
        },
        hasChange() {
            this.isInit = false;
        },
        phHandled(level) {
            if (typeof this.placeholder === 'string' && this.placeholder !== '') {
                return this.placeholder;
            } else {
                if (this.placeholder && this.placeholder[level]) {
                    return this.placeholder[level];
                } else {
                    return this.defaultPlaceholder[level];
                }
            }
        },
        ndsHandled(index) {
            if (typeof this.notFoundText === 'string' && this.notFoundText !== '') {
                return this.notFoundText;
            } else {
                if (!this.notFoundText) {
                    return this.defaultnotFoundText[index];
                } else {
                    if (this.notFoundText[index]) {
                        return this.notFoundText[index];
                    } else {
                        return this.defaultnotFoundText[index];
                    }
                }
            }
        },
        disHandled(level) {
            if (typeof this.disabled === 'number') {
                if (utils.oneOf(this.disabled, areaLinkageArr)) {
                    if (level >= this.disabled) {
                        return true;
                    } else {
                        return false;
                    }
                }
            } else if (Array.isArray(this.disabled)) {
                let i = 0;
                let isDis = false;
                while (this.disabled[i]) {
                    if (this.disabled[i] === level) {
                        isDis = true;
                        break;
                    }
                    i++;
                }
                return isDis;
            } else {
                return this.disabled;
            }
        }
    },
    mounted() {
        this.init();
    },
    components: {
        Row,
        Col,
        Select,
        Option
    }
};
</script>

<style lang="less">
.area-select {
    width: 100%;
}
</style>
