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

export function adaptor(ctx) {
    // @ts-ignore
    return Object.assign(ctx, {
        setStrokeStyle(val) {
            ctx.strokeStyle = val;
        },
        setLineWidth(val) {
            ctx.lineWidth = val;
        },
        setLineCap(val) {
            ctx.lineCap = val;
        },
        setFillStyle(val) {
            ctx.fillStyle = val;
        },
        setFontSize(val) {
            ctx.font = String(val);
        },
        setGlobalAlpha(val) {
            ctx.globalAlpha = val;
        },
        setLineJoin(val) {
            ctx.lineJoin = val;
        },
        setTextAlign(val) {
            ctx.textAlign = val;
        },
        setMiterLimit(val) {
            ctx.miterLimit = val;
        },
        setShadow(offsetX, offsetY, blur, color) {
            ctx.shadowOffsetX = offsetX;
            ctx.shadowOffsetY = offsetY;
            ctx.shadowBlur = blur;
            ctx.shadowColor = color;
        },
        setTextBaseline(val) {
            ctx.textBaseline = val;
        },
        createCircularGradient() {},
        draw() {}
    });
}
