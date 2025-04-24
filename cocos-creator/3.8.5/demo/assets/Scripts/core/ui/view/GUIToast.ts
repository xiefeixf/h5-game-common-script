import * as cc from "cc";
import { GUILabelOptions, GUISpriteOptions, gui_createLabel, gui_createNode, gui_createSprite } from "../../gui/gui_manual";

const enum notifyTypeEnum {
    none = 0,
    single_content,
    single_node,
}
export default class GUIToast extends cc.Component {
    lab: cc.Label = null;
    bg: cc.Sprite = null;

    public index = 0;

    public static globalInit: (labNode: cc.Label, content: string, useI18n: boolean) => void = null;
    static ToastNode: cc.Node = null;
    private _params = null;

    onLoad() {
        this.index++;
    }

    onAdded(params) {
        this._params = params;
        this.showToast(params.content, params.time, params.useI18n, null, null);
    }

    public refresh() {
        let opacityComp = this.node.getComponent(cc.UIOpacity);
        cc.Tween.stopAllByTarget(opacityComp);
        this._params && this.showToast(this._params.content, this._params.time, this._params.useI18n, null, null);
    }

    /**
     * 显示toast
     * @param msg       文本
     * @param useI18n   多语言标签
     * @param callback  提示动画播放完成回调
     */
    public showToast(msg: string, time: number, useI18n: boolean, next: Function, callback: Function) {
        // this.layout();
        if (GUIToast.globalInit) {
            GUIToast.globalInit(this.lab, msg, useI18n);
        } else {
            this.lab.string = msg;
        }
        this.bg.getComponent(cc.Widget).updateAlignment();
        // this.node.getComponent(cc.UIOpacity).opacity = 255;
        let opacityComp = this.node.getComponent(cc.UIOpacity);
        opacityComp.opacity = 0;
        cc.tween(opacityComp)
            .to(0.5, { opacity: 255 })
            .delay(time - 0.88)
            .to(0.5, { opacity: 0 })
            .call(() => {
                callback && callback();
                this.node.destroy();
            })
            .start();
    }

    static createToastNode(style: { bg: GUISpriteOptions; label: GUILabelOptions }, notifyType: number) {
        //notify模式为单节点，且有节点的情况下， 直接返回这个节点
        if (notifyType === notifyTypeEnum.single_node && this.ToastNode && this.ToastNode.isValid) {
            this.ToastNode.getComponent(GUIToast) && this.ToastNode.getComponent(GUIToast).refresh();
            return this.ToastNode;
        }
        let container = gui_createNode(style.bg);
        {
            let layout = container.addComponent(cc.Layout);
            layout.type = cc.Layout.Type.NONE;
            layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            layout.paddingTop = 0;
            layout.paddingBottom = 0;
            layout.paddingLeft = 0;
            layout.paddingRight = 0;
            layout.spacingX = 0;
            // container.parent = parent;
        }
        let bgSprite = gui_createSprite(style.bg);
        container.addChild(bgSprite.node);
        {
            let widget = bgSprite.addComponent(cc.Widget);
            widget.isAlignLeft = true;
            widget.isAlignRight = true;
            widget.isAlignTop = true;
            widget.isAlignBottom = true;
            widget.left = 0;
            widget.right = 0;
            widget.bottom = 0;
            widget.top = 0;
        }
        let label = gui_createLabel(style.label);
        let toast = container.addComponent(GUIToast);
        toast.lab = label;
        toast.bg = bgSprite;
        container.addChild(label.node);
        this.ToastNode = container;
        return this.ToastNode;
    }
}
