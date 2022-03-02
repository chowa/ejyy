/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」 —— 助力物业服务升级，用心服务万千业主
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经许可不能去掉「e家宜业」和「卓瓦科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: concat@chowa.cn
 * +----------------------------------------------------------------------
 */

interface ArticleNodeAttr {
    name: string;
    value: string;
}

interface ArticleNode {
    tag?: string;
    attrs: ArticleNodeAttr[];
    children: (ArticleNode | string)[];
}

interface TemplateMessageItem {
    label: string;
    key: string;
    type: string;
    value?: string;
}

declare namespace Content {
    interface QuestionnaireStatistics {
        total: number;
        options: {
            [option_id: number]: number;
        };
    }

    type Article = ArticleNode[];

    interface Virus {
        today: {
            confirm: number;
            suspect: number;
            heal: number;
            dead: number;
            severe: number;
            storeConfirm: number;
            input: number;
        };
        total: {
            confirm: number;
            suspect: number;
            heal: number;
            dead: number;
            severe: number;
            input: number;
        };
        extData: {
            noSymptom: number;
            incrNoSymptom: number;
        };
        lastUpdateTime: string;
    }

    type TemplateMessage = TemplateMessageItem[];
}

export = Content;
