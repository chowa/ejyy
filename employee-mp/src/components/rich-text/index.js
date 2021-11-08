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

import { CwComponent } from '../common/component';

CwComponent({
    props: {
        detail: {
            type: Array,
            observer(value) {
                const traveNodes = nodes => {
                    if (!Array.isArray(nodes)) {
                        return [];
                    }

                    return nodes.map(item => transferNode(item));
                };

                const transferNode = node => {
                    if (typeof node === 'string') {
                        if (node.indexOf('<br/>') > -1 || node.indexOf('<script>') > -1) {
                            return { type: 'text', text: '' };
                        }

                        return { type: 'text', text: node };
                    }

                    const { tag, children, attrs } = node;

                    switch (tag) {
                        case 'script':
                            return '';

                        case 'font':
                            const styles = [];
                            if (Array.isArray(attrs)) {
                                attrs.forEach(({ name, value }) => {
                                    styles.push(`${name}:${value}`);
                                });
                            }

                            return {
                                type: 'node',
                                name: 'span',
                                attrs: {
                                    style: styles.join(';')
                                },
                                children: traveNodes(children)
                            };

                        default:
                            const attrsMap = {};
                            if (Array.isArray(attrs)) {
                                attrs.forEach(({ name, value }) => {
                                    if (
                                        [
                                            'class',
                                            'style',
                                            'name',
                                            'span',
                                            'width',
                                            'src',
                                            'height',
                                            'colspan',
                                            'rowspan',
                                            'type'
                                        ].includes(name)
                                    ) {
                                        attrsMap[name] = value;
                                    }
                                });
                            }

                            if (attrsMap.class) {
                                attrsMap.class += ` ${tag}`;
                            } else {
                                attrsMap.class = tag;
                            }

                            return {
                                type: 'node',
                                name: tag,
                                attrs: attrsMap,
                                children: traveNodes(children)
                            };
                    }
                };
                const nodes = traveNodes(value);

                this.setData({ nodes });
            }
        }
    },
    data: {
        nodes: []
    }
});
