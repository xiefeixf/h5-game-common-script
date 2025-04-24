/*
 * 
 * 纯代码创建界面API接口
 */

import * as cc from "cc";
import { gui_setting } from "./Defines";

export let gui_manual_setting = {
    /**
     * 默认cc.SpriteFrame(白色1x1像素)
     * gui.init() 初始化后将有效
     */
    defaultSpriteFrame: null,
    /** 
     * 默认字体大小
     * */
    defaultFontSize: 22,
    /**
     * 默认字体颜色
     */
    defaultLabelColor: cc.Color.WHITE
}

/**
 * 创建一个node
 */
export interface GUINodeOptions {
    /** 节点名 */
    name?: string;
    /** 是否使用已有的节点 */
    node?: cc.Node;
    /** 父节点 */
    parent?: cc.Node,
    x?: number;
    y?: number;
    siblingIndex?: number;
    layer?: number; // Group层级
    /** setAnchorPoint  */
    ax?: number;
    ay?: number;
    width?: number;
    height?: number;
    opacity?: number,
    spriteOpt?: GUISpriteOptions,
    labelOpt?: GUILabelOptions,
    widgetOpt?: widgetOpt,
    blockInputEvents?: boolean,
    scrollView?: scrollViewOpt,
    mask?: maskOpt,
    richText?: richTextOpt,
    call?: Function,
}

interface richTextOpt {
    string?: string,
    horizontalAlign?: number,
    verticalAlign?: number,
    fontSize?: number,
    useSystemFont?: boolean,
    fontFamily?: string,
    font?: cc.TTFFont,
    maxWidth?: number,
    lineHeight?: number,
    imageAtlas?: cc.SpriteAtlas,
    handleTouchEvent?: boolean,
}

interface maskOpt {
    inverted?: boolean,
    type?: number,
    segments?: number,
    spriteFrame?: cc.SpriteFrame,
    alphaThreshold?: number,
}

interface scrollViewOpt {
    horizontal?: boolean;
    vertical?: boolean;
    horizontalScrollBar?: cc.ScrollBar;
    verticalScrollBar?: cc.ScrollBar;
    inertia?: boolean;
    brake?: number;
    elastic?: boolean;
    bounceDuration?: number;
    content?: cc.Node;
    cancelInnerEvents?: boolean;
    scrollEvents?: cc.EventHandler[];
}

interface widgetOpt {
    isAlignLeft?: boolean;
    isAlignRight?: boolean;
    isAlignTop?: boolean;
    isAlignBottom?: boolean;
    left?: number;
    right?: number;
    bottom?: number;
    top?: number;
}

/**
 * 创建一个sprite节点
 */
export interface GUISpriteOptions extends GUINodeOptions {
    /** 默认使用内置白色2x2纹理 */
    spriteFrame?: cc.SpriteFrame;
    /** 默认白色 */
    color?: cc.Color | string;
    /**cc.Sprite.SizeMode 节点尺寸 */
    sizeMode?: number;
    /** cc.Sprite.Type 渲染模式，普通、九宫格、平铺... */
    type?: number;
    /** 是否开启灰度渲染，grayScale */
    gray?: boolean;
}
/**
 * 创建一个label节点
 */
export interface GUILabelOptions extends GUINodeOptions {
    string?: string,
    /** 默认白色 */
    color?: cc.Color | string,
    /** 默认22 */
    fontSize?: number,
    /** 默认24 */
    lineHeight?: number,
    /** 默认 cc.Label.Overflow.NONE */
    overflow?: number,
    /** 是否使用系统字体，默认true */
    useSystemFont?: boolean,
    /** 是否加粗，默认false */
    isBold?: boolean,
    /** 横向对齐方式，默认cc.Label.HorizontalAlign.CENTER */
    horizontalAlign?: number,
    /** 纵向对齐方式，默认cc.Label.VerticalAlign.CENTER */
    verticalAlign?: number,
    /** 是否允许换行，默认引擎 */
    warp?: boolean,
    /** 是否下划线，默认false */
    isUnderline?: boolean,
    /** 下划线高度 */
    underlineHeight?: number,
    /**是否允许自动换行 */
    enableWrapText?: boolean,
    /**字体 */
    font?: cc.Font,

}

function _is_num(val: number) {
    return typeof val === "number" && !isNaN(val);
}
function _safe_num(val: number, defaultVal: number = 0) {
    return _is_num(val) ? val : defaultVal;
}

function _safe_bool(val: boolean, defaultVal: boolean = true) {
    return typeof val === "boolean" ? val : defaultVal;
}

export interface GUIFullNodeOptions extends GUINodeOptions {
    children?: GUIFullNodeOptions[],
}

export function gui_createFullNode(opt: GUIFullNodeOptions) {
    let root = gui_createNode(opt);
    if (opt.children && opt.children.length) {
        for (let cchild of opt.children) {
            let childNode = gui_createFullNode(cchild);
            childNode.setParent(root);
        }
    }
    return root;
}

/**
 * 代码形式创建一个节点
 * @param opt 
 */
export function gui_createNode(opt: GUINodeOptions): cc.Node {
    let node = opt.node || (new cc.Node(opt.name));
    if (opt.parent) {
        node.parent = opt.parent;
    }
    node.setPosition(_safe_num(opt.x), _safe_num(opt.y), 0);
    if (_is_num(opt.siblingIndex)) {
        node.setSiblingIndex(opt.siblingIndex);
    }
    node.layer = _safe_num(opt.layer, gui_setting.defaultLayer);
    node.addComponent(cc.UIOpacity).opacity = _safe_num(opt.opacity, 255);
    let UIComp = node.addComponent(cc.UITransform);
    if (opt.spriteOpt) {
        opt.spriteOpt.node = node;
        gui_createSprite(opt.spriteOpt);
    } else if (opt.labelOpt) {
        opt.labelOpt.node = node;
        gui_createLabel(opt.labelOpt);
    }
    UIComp.setAnchorPoint(_safe_num(opt.ax, 0.5), _safe_num(opt.ay, 0.5));
    UIComp.setContentSize(_safe_num(opt.width), _safe_num(opt.height));
    if (opt.widgetOpt) {
        _setWidget(node, opt.widgetOpt);
    }
    if (opt.blockInputEvents) {
        node.addComponent(cc.BlockInputEvents);
    }
    if (opt.scrollView) {
        _setScrollView(node, opt.scrollView);
    }
    if (opt.mask) {
        _setMask(node, opt.mask);
    }
    if (opt.richText) {
        _setRichText(node, opt.richText);
    }
    if (opt.call) {
        opt.call(node);
    }
    return node;
}

function _setRichText(node: cc.Node, richTextOpt: richTextOpt) {
    let richTextComp = node.addComponent(cc.RichText);
    richTextComp.string = richTextOpt.string || "";
    richTextComp.horizontalAlign = _is_num(richTextOpt.horizontalAlign) ? richTextOpt.horizontalAlign : cc.RichText.HorizontalAlign.CENTER;
    richTextComp.verticalAlign = _is_num(richTextOpt.verticalAlign) ? richTextOpt.verticalAlign : cc.RichText.VerticalAlign.CENTER;
    richTextComp.fontSize = richTextOpt.fontSize || 30;
    richTextComp.useSystemFont = _safe_bool(richTextOpt.useSystemFont, true);
    richTextComp.fontFamily = richTextOpt.fontFamily || "";
    richTextComp.font = richTextOpt.font || null;
    richTextComp.maxWidth = richTextOpt.maxWidth || 400;
    richTextComp.lineHeight = richTextOpt.lineHeight || 35;
    richTextComp.imageAtlas = richTextOpt.imageAtlas || null;
    richTextComp.handleTouchEvent = _safe_bool(richTextOpt.handleTouchEvent, true);

}

function _setMask(node: cc.Node, maskOpt: maskOpt) {
    let maskComp = node.addComponent(cc.Mask);
    maskComp.inverted && (maskComp.inverted = !!(maskOpt.inverted));
    maskComp.type = _safe_num(maskOpt.type, 0);// cc.Mask.Type.RECT
    maskComp.segments = maskOpt.segments || 64;
    if (maskComp.type === 3) {// SPRITE_STENCIL = 3 使用图片模版作为遮罩。
        maskComp.spriteFrame = maskOpt.spriteFrame || null;
    }
    maskComp.alphaThreshold = maskOpt.alphaThreshold || 0.1;
}

function _setScrollView(node: cc.Node, scrollViewOpt: scrollViewOpt) {
    let scrollComp = node.addComponent(cc.ScrollView);
    scrollComp.horizontal = !!(scrollViewOpt.horizontal);
    scrollComp.vertical = !!(scrollViewOpt.vertical);
    scrollComp.horizontalScrollBar = scrollViewOpt.horizontalScrollBar || null;
    scrollComp.verticalScrollBar = scrollViewOpt.verticalScrollBar || null;
    scrollComp.inertia = !!(scrollViewOpt.inertia);
    scrollComp.brake = scrollViewOpt.brake || 0.75;
    scrollComp.elastic = !!(scrollViewOpt.elastic);
    scrollComp.bounceDuration = scrollViewOpt.brake || 0.2;
    scrollComp.content = scrollViewOpt.content || null;
    scrollComp.cancelInnerEvents = !!(scrollViewOpt.cancelInnerEvents);
    scrollComp.scrollEvents = scrollViewOpt.scrollEvents || [];
}

function _setWidget(node: cc.Node, widgetOpt: widgetOpt) {
    let WidgetComp = node.addComponent(cc.Widget);
    WidgetComp.isAlignLeft = !!(widgetOpt.isAlignLeft);
    WidgetComp.isAlignRight = !!(widgetOpt.isAlignRight);
    WidgetComp.isAlignTop = !!(widgetOpt.isAlignTop);
    WidgetComp.isAlignBottom = !!(widgetOpt.isAlignBottom);
    WidgetComp.left = _safe_num(widgetOpt.left);
    WidgetComp.right = _safe_num(widgetOpt.right);
    WidgetComp.top = _safe_num(widgetOpt.top);
    WidgetComp.bottom = _safe_num(widgetOpt.bottom);
}

/**
 * 纯代码创建返回一个Sprite
 * @param opt 
 * @returns 
 */
export function gui_createSprite(opt: GUISpriteOptions): cc.Sprite {
    let node = opt.node || gui_createNode(opt);
    let sprite = node.addComponent(cc.Sprite);
    sprite.spriteFrame = opt.spriteFrame || gui_manual_setting.defaultSpriteFrame;
    if (_is_num(opt.width) && _is_num(opt.height)) {
        node.getComponent(cc.UITransform).setContentSize(opt.width, opt.height);
    }
    if (typeof opt.color === "string" && opt.color.length > 0) {
        sprite.color = new cc.Color().fromHEX(opt.color);
    } else {
        sprite.color = opt.color as cc.Color || gui_manual_setting.defaultLabelColor;
    }
    sprite.sizeMode = opt.sizeMode || cc.Sprite.SizeMode.CUSTOM;
    sprite.type = opt.type || cc.Sprite.Type.SIMPLE;
    if (typeof opt.gray === "boolean") {
        sprite.grayscale = opt.gray;
    }
    return sprite;
}

/**
 * 纯代码创建返回一个Label
 * @param opt 
 * @returns 
 */
export function gui_createLabel(opt: GUILabelOptions): cc.Label {
    let node = opt.node || gui_createNode(opt);
    let labelComp = node.addComponent(cc.Label);
    labelComp.fontSize = _safe_num(opt.fontSize, gui_manual_setting.defaultFontSize);
    labelComp.lineHeight = opt.lineHeight || labelComp.fontSize + 2 || 24;
    labelComp.horizontalAlign = opt.horizontalAlign || cc.Label.HorizontalAlign.LEFT;
    labelComp.verticalAlign = opt.verticalAlign || cc.Label.VerticalAlign.TOP;
    labelComp.overflow = opt.overflow || cc.Label.Overflow.NONE;
    if (typeof opt.color === "string" && opt.color.length > 0) {
        labelComp.color = new cc.Color().fromHEX(opt.color);
    } else {
        labelComp.color = opt.color as cc.Color || gui_manual_setting.defaultLabelColor;
    }
    if (typeof opt.warp) {
        labelComp.enableWrapText = opt.warp;
    }
    labelComp.string = opt.string || "";
    labelComp.useSystemFont = _safe_bool(opt.useSystemFont, true);
    labelComp.isBold = !!opt.isBold;
    if (_is_num(opt.width) && _is_num(opt.height)) {
        node.getComponent(cc.UITransform).setContentSize(opt.width, opt.height);
    }
    if (typeof opt.isUnderline === "boolean") {
        labelComp.isUnderline = opt.isUnderline;
        labelComp.underlineHeight = opt.underlineHeight || 1;
    }
    labelComp.enableWrapText = !!(opt.enableWrapText);
    if (opt.font) {
        labelComp.useSystemFont = false;
        labelComp.font = opt.font;
    }
    return labelComp;
}