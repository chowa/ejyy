<template>
    <div class="images">
        <img v-lazy="ASSET_HOST + imgs[0]" @click="preview(0)" />
        <span class="more" v-if="imgs.length > 1">点击图片查看更多…</span>

        <div class="preview" @click="closePreview" v-if="visible">
            <div class="close" @click.stop="closePreview">
                <Icon type="ios-close-circle-outline" />
            </div>
            <div class="pre" @click.stop="pre" v-if="imgs.length > 1">
                <Icon type="ios-arrow-dropleft" />
            </div>
            <div class="img">
                <img :src="ASSET_HOST + imgs[index]" @click.stop />
            </div>
            <div class="next" @click.stop="next" v-if="imgs.length > 1">
                <Icon type="ios-arrow-dropright" />
            </div>
        </div>
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

import { Icon } from 'view-design';
import * as config from '@/config';

export default {
    name: 'Images',
    data() {
        return {
            ASSET_HOST: config.ASSET_HOST,
            visible: false,
            index: 0
        };
    },
    props: {
        imgs: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        preview(index) {
            this.index = index;
            this.visible = true;

            window.addEventListener('keydown', this.onKeyDown, false);
        },
        onKeyDown(e) {
            switch (e.keyCode) {
                case 27:
                    this.closePreview();
                    break;

                case 37:
                    this.pre();
                    break;

                case 39:
                    this.next();
                    break;
            }
        },
        closePreview() {
            this.visible = false;
            window.removeEventListener('keydown', this.onKeyDown);
        },
        pre() {
            if (this.index === 0) {
                this.index = this.imgs.length - 1;
            } else {
                this.index -= 1;
            }
        },
        next() {
            if (this.index === this.imgs.length - 1) {
                this.index = 0;
            } else {
                this.index += 1;
            }
        }
    },
    components: {
        Icon
    }
};
</script>

<style lang="less">
.images {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: wrap;
    vertical-align: top;

    > img {
        height: 80px;
        cursor: pointer;

        + img {
            margin-left: 12px;
        }
    }

    .more {
        font-size: 12px;
        color: #777;
        line-height: 80px;
        margin-left: 6px;
    }

    .preview {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        .pre,
        .next {
            width: 5vw;
            color: #fff;
            cursor: pointer;
            font-size: 24px;
            text-align: center;
        }

        .close {
            font-size: 20px;
            color: #fff;
            position: absolute;
            top: 12px;
            right: 12px;
            cursor: pointer;
        }

        .img {
            width: 95vw;
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                max-width: 100%;
                max-height: 100vh;
            }
        }
    }
}

@media screen and (max-width: 576px) {
    .images {
        .preview {
            .img {
                height: 70vh;
            }

            .pre,
            .next {
                position: absolute;
                bottom: 22px;
            }

            .pre {
                left: 30px;
            }

            .next {
                right: 30px;
            }
        }
    }
}
</style>
