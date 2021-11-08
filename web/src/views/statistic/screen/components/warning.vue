<template>
    <section class="card mr warning">
        <div :class="['alarm', active ? 'active' : '']">
            <div class="light">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="bulb">
                <div class="eyes">
                    <span></span>
                    <span></span>
                </div>
                <div class="mouth"></div>
            </div>
            <div class="base"></div>
        </div>

        <Slider :list="list" :gutter="false" empty="没有情况就是最好的情况" />
    </section>
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

import Slider from './slider';
import moment from 'moment';
import * as utils from '@/utils';

export default {
    name: 'WarningChart',
    props: {
        detail: {
            type: Array,
            default: () => {
                return [];
            }
        }
    },
    mounted() {
        this.renderList();
    },
    data() {
        return {
            list: [],
            active: false
        };
    },
    methods: {
        renderList() {
            const list = [];
            let active = false;

            this.detail.forEach(record => {
                if (moment().diff(moment(record.created_at), 'minute') < 5) {
                    active = true;
                }

                let name = '';

                switch (record.category) {
                    case 1:
                        name = '漏水';
                        break;

                    case 2:
                        name = '起火';
                        break;

                    case 3:
                        name = '漏气';
                        break;
                }

                list.push({
                    name,
                    local: utils.building.text(record),
                    created_at: record.created_at
                });
            });

            this.list = list;
            this.active = active;
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
.warning {
    flex: 0 0 20%;
    margin-bottom: 18px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    @keyframes eye-brow {
        0% {
            top: -50px;
        }
        25% {
            top: -50px;
        }
        50% {
            top: -50px;
        }
        60% {
            top: -50px;
        }
        75% {
            top: 0;
        }
        80% {
            top: -50px;
        }
        100% {
            top: -50px;
        }
    }

    @keyframes eyes {
        0% {
            margin-left: 0;
        }
        25% {
            margin-left: -15px;
        }
        50% {
            margin-left: 0;
        }
        75% {
            margin-left: 15px;
        }
        100% {
            margin-left: 0;
        }
    }

    @keyframes light1 {
        0% {
            transform: scale(0);
        }
        50% {
            transform: scale(1);
        }
        100% {
            transform: scale(0);
        }
    }

    @keyframes light2 {
        0% {
            transform: scale(0) rotate(35deg);
        }
        50% {
            transform: scale(1) rotate(35deg);
        }
        100% {
            transform: scale(0) rotate(35deg);
        }
    }

    @keyframes light3 {
        0% {
            transform: scaleY(0) translate(-50%, 0%) rotate(90deg);
            height: 0;
        }
        50% {
            transform: scaleY(1) translate(-50%, 0%) rotate(90deg);
            height: 5px;
        }
        100% {
            transform: scaleY(0) translate(-50%, 0%) rotate(90deg);
            height: 0;
        }
    }

    @keyframes light4 {
        0% {
            transform: scale(0) rotate(145deg);
        }
        50% {
            transform: scale(1) rotate(145deg);
        }
        100% {
            transform: scale(0) rotate(145deg);
        }
    }

    @keyframes bulb {
        0% {
            background-color: #ff5722;
            box-shadow: inset 15px 5px 0 1px rgba(0, 0, 0, 0.15), 0 -10px 30px rgba(224, 67, 17, 0);
        }
        50% {
            background-color: #e04311;
            box-shadow: inset 15px 5px 0 1px rgba(0, 0, 0, 0.15), 0 -10px 30px rgba(224, 67, 17, 0.5);
        }
        100% {
            background-color: #ff5722;
            box-shadow: inset 15px 5px 0 1px rgba(0, 0, 0, 0.15), 0 -10px 30px rgba(224, 67, 17, 0);
        }
    }

    @keyframes shake {
        0% {
            transform: translate(1px, 1px) rotate(0deg);
        }
        10% {
            transform: translate(-1px, -2px) rotate(-1deg);
        }
        20% {
            transform: translate(-3px, 0px) rotate(1deg);
        }
        30% {
            transform: translate(3px, 2px) rotate(0deg);
        }
        40% {
            transform: translate(1px, -1px) rotate(1deg);
        }
        50% {
            transform: translate(-1px, 2px) rotate(-1deg);
        }
        60% {
            transform: translate(-3px, 1px) rotate(0deg);
        }
        70% {
            transform: translate(3px, 1px) rotate(-1deg);
        }
        80% {
            transform: translate(-1px, -1px) rotate(1deg);
        }
        90% {
            transform: translate(1px, 2px) rotate(0deg);
        }
        100% {
            transform: translate(1px, -2px) rotate(-1deg);
        }
    }
    .alarm {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 10vh;
        height: 10vh;
        position: relative;
        flex: none;
        margin-right: 26px;

        .bulb {
            width: 7vh;
            height: 7vh;
            border-top-left-radius: 100px;
            border-top-right-radius: 100px;
            background-color: #ff5722;
            position: relative;

            &:after {
                content: '';
                position: absolute;
                width: 40px;
                height: 40px;
                border: 10px solid transparent;
                border-top-color: rgba(255, 255, 255, 0.2);
                top: 15%;
                left: 50%;
                transform: rotate(45deg);
                border-radius: 50%;
            }

            .eyes {
                margin-top: 1.8vh;
                display: flex;
                justify-content: space-evenly;

                span {
                    display: block;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background-color: #ffffff;
                    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
                    position: relative;
                    overflow: hidden;
                    padding: 5px;

                    &:before {
                        content: '';
                        width: 10px;
                        height: 10px;
                        background-color: #000000;
                        display: block;
                        border-radius: 50%;
                    }

                    &:after {
                        content: '';
                        width: 30px;
                        height: 30px;
                        background-color: #ff5722;
                        display: block;
                        border-radius: 50%;
                        position: absolute;
                        top: -30px;
                        left: calc(~'50% - 15px');
                        animation: 3s ease-in-out 0s normal none infinite eye-brow;
                    }
                }
            }

            .mouth {
                width: 40px;
                height: 18px;
                position: absolute;
                left: 50%;
                top: 75%;
                transform: translate(-50%, -50%);
                overflow: hidden;

                &:before {
                    content: '';
                    display: block;
                    width: 40px;
                    height: 40px;
                    margin-top: -55%;
                    border-radius: 50%;
                    background-color: #000000;
                    box-shadow: inset 5px 5px 0 1px rgba(255, 255, 255, 0.2);
                    transition: all 0.2s ease-in-out;
                }

                &:after {
                    content: '';
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background-color: #ffffff;
                    top: 6%;
                    left: 50%;
                    transform: translate(-50%, -31%);
                    border-bottom-left-radius: 5px;
                    border-bottom-right-radius: 5px;
                }
            }
        }

        .base {
            width: 10vh;
            height: 2vh;
            border-top-left-radius: 50px;
            border-top-right-radius: 50px;
            margin-top: -4px;
            background-color: #394178;
        }

        .base,
        .bulb {
            border: 2px solid #262b55;
            box-shadow: inset 15px 5px 0 1px rgba(0, 0, 0, 0.15);
        }

        .light {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;

            span {
                position: absolute;
                width: 0;
                height: 5px;
                background-color: #e04311;
                border-radius: 10px;
            }

            span:nth-child(1) {
                left: -10%;
                top: 50%;
                transform-origin: right;
            }

            span:nth-child(2) {
                transform: rotate(35deg);
                left: 0;
                top: 15%;
                transform-origin: right;
            }

            span:nth-child(3) {
                transform: translate(-50%, 0%) rotate(90deg);
                left: 40%;
                top: 4%;
                transform-origin: right;
            }

            span:nth-child(4) {
                transform: rotate(145deg);
                right: 25%;
                top: 15%;
                transform-origin: right;
            }

            span:nth-child(5) {
                right: -10%;
                top: 50%;
                transform-origin: left;
            }
        }

        &.active {
            cursor: pointer;
            animation: shake 1s linear infinite;

            .bulb {
                animation: bulb 1s ease infinite;
            }

            .eyes {
                span {
                    &:before {
                        animation: eyes 1.2s linear infinite;
                    }
                }
            }

            .mouth {
                &:before {
                    margin-top: 0;
                }
            }

            .light {
                span {
                    width: 30px;
                }

                span:nth-child(1) {
                    animation: light1 1s ease infinite;
                }
                span:nth-child(2) {
                    animation: light2 1s ease infinite;
                }
                span:nth-child(3) {
                    animation: light3 1s ease infinite;
                }
                span:nth-child(4) {
                    animation: light4 1s ease infinite;
                }
                span:nth-child(5) {
                    animation: light1 1s ease infinite;
                }
            }
        }
    }
}
</style>
