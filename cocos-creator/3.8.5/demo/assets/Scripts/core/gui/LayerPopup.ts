/*
 *
 * popup层，调用add显示，可以显示暗色背景，弹框参数可以查看GUIPopupOptions
 * 允许同时弹出多个pop层，pop层之间相互block操作
 */
import * as cc from "cc";
import DelegateComponent from "./DelegateComponent";
import { GUIEvent, GUIPopupOptions, ViewParams } from "./Defines";
import { LayerBase } from "./LayerBase";
import { gui_createNode, gui_createSprite } from "./gui_manual";

const traceError = function (...args) {
    console.log("LayerPopUp", ...args);
};

export class LayerPopUp extends LayerBase {
    private modalBackLayer: cc.Node = null;

    constructor(name: string, container: cc.Node) {
        super(name, container);
        this._initModalBackLayer();
    }

    public layout(width: number, height: number) {
        super.layout(width, height);
        if (this.modalBackLayer) {
            this.modalBackLayer.getComponent(cc.UITransform).setContentSize(2 * width, 2 * height);
        }
    }
    private _initModalBackLayer() {
        let size = cc.view.getVisibleSize();

        this.modalBackLayer = gui_createNode({
            name: "ModalBG",
            width: size.width << 1,
            height: size.height << 1,
            x: 0,
            y: 0,
            opacity: 255,
        });
        this.modalBackLayer.setSiblingIndex(0);
        this._container.addChild(this.modalBackLayer);
        // this.modalBackLayer.addComponent(cc.BlockInputEvents);
        this.modalBackLayer.active = false;
        // 点击模态层背景自动关闭最上层的UI
        this.modalBackLayer.on(cc.Node.EventType.TOUCH_END, this.clickBgHandler, this);
    }

    private _initModal() {
        let bgSprite = this.modalBackLayer.getComponent(cc.Sprite);
        if (bgSprite) {
            return;
        }
        let size = cc.view.getVisibleSize();
        gui_createSprite({
            node: this.modalBackLayer,
            color: cc.Color.BLACK,
            sizeMode: cc.Sprite.SizeMode.CUSTOM,
            type: cc.Sprite.Type.SIMPLE,
            width: size.width << 1,
            height: size.height << 1,
            x: size.width >> 1,
            y: size.height >> 1,
        });
    }

    public setLayer(val: number) {
        this._container.layer = val;
        this.modalBackLayer.layer = val;
    }
    /**
     * 是否允许点击穿透
     * @param val true / false
     */
    touchControll(val: boolean) {
        if (val) {
            this.modalBackLayer.pauseSystemEvents(false);
        } else {
            this.modalBackLayer.resumeSystemEvents(false)
        }
        // this.modalBackLayer.active = bool;

    }

    protected clickBgHandler(event) {
        // console.log(" clickBgHandler")
        let _topNodeComp: DelegateComponent = null;
        let children = this.__nodes();
        for (let i = 0; i < children.length; i++) {
            if (!_topNodeComp) {
                _topNodeComp = children[i];
                continue;
            }
            if (_topNodeComp && _topNodeComp.node.getSiblingIndex() < children[i].node.getSiblingIndex()) {
                _topNodeComp = children[i];
            }
        }
        if (_topNodeComp) {
            if (_topNodeComp.node.getSiblingIndex() < this.modalBackLayer.getSiblingIndex()) {
                return;
            }
            let popParams = _topNodeComp.viewParams.guiOption as GUIPopupOptions;
            if (popParams.touchClose || typeof popParams.touchClose !== "boolean") {
                this.delete(_topNodeComp.viewParams.UUID);
            }
        }
        // 发送弹窗事件
        this.emit(GUIEvent.POPUP_MODAL_TOUCH_END, event);
    }

    /** 查找顶级节点并把背景暗色层放在顶级节点以下 */
    private refreshModalBG() {
        let _topNodeComp: DelegateComponent = null;
        let children = this.__nodes();
        for (let i = 0; i < children.length; i++) {
            let comp = children[i];
            if (!_topNodeComp) {
                _topNodeComp = comp;
                continue;
            }
            if (_topNodeComp && _topNodeComp.node.getSiblingIndex() < comp.node.getSiblingIndex()) {
                _topNodeComp = comp;
            }
        }
        if (_topNodeComp && _topNodeComp.viewParams && _topNodeComp.viewParams.valid) {
            this.modalBackLayer.active = true;
            this.modalBackLayer.setSiblingIndex(this._container.children.length - 2);
            let popParams = _topNodeComp.viewParams.guiOption as GUIPopupOptions;
            if (popParams.modal) {
                this._initModal();
                let alpha = 128;
                if (typeof popParams.opacity === "number") {
                    alpha = popParams.opacity;
                }
                this.modalBackLayer.getComponent(cc.UIOpacity).opacity = alpha;
            }
            let sp = this.modalBackLayer.getComponent(cc.Sprite);
            if (sp) {
                sp.enabled = popParams.modal;
            }
        } else {
            this.modalBackLayer.active = false;
        }
    }
    /**
     * 添加一个预制件节点到PopUp层容器中，该方法将返回一个唯一uuid来标识该操作节点
     * @param prefabPath 预制件路径
     * @param params     传给组件onAdded、onRemoved方法的参数。
     * @param popParams  弹出界面的设置定义，详情见GUIPopupOptions
     */
    add(prefabPath: string | cc.Prefab, params: any, popParams: GUIPopupOptions = null): number {
        return super.add(prefabPath, params, popParams);
    }

    protected _createNode(prefab: cc.Prefab, viewParams: ViewParams): cc.Node {
        let popParams = viewParams.guiOption as GUIPopupOptions;
        let $onRemoved = popParams.onRemoved;
        popParams.onRemoved = (node, params) => {
            if ($onRemoved) {
                $onRemoved(node, params);
            }
            // 组件删除之后，刷新一下modal背景
            this.refreshModalBG();
        };
        let childNode: cc.Node = this._instantiate(prefab, popParams)
        if (!childNode) {
            return null;
        }
        let comp = childNode.addComponent(this.DelegateComponent);
        comp.init(this, viewParams);
        // 如果有相对父节点则把当前界面放置在该父节点对应的全局坐标上
        if (popParams.parent && popParams.parent instanceof cc.Node) {
            let relativeNode = popParams.parent;
            childNode.setWorldPosition(relativeNode.worldPosition);
        }
        this._container.addChild(childNode);
        let _topNodeComp: DelegateComponent = null;
        let children = this.__nodes();
        for (let i = 0; i < children.length; i++) {
            let childcomp = children[i];
            if (!_topNodeComp) {
                _topNodeComp = childcomp;
                continue;
            }
            if (_topNodeComp && _topNodeComp.node.getSiblingIndex() < childcomp.node.getSiblingIndex()) {
                _topNodeComp = childcomp;
            }
        }
        let zzindex = 2;
        if (_topNodeComp) {
            zzindex = _topNodeComp.node.getSiblingIndex() + 2;
        }
        childNode.setSiblingIndex(zzindex);
        comp.addView();
        comp.isLayer = true;
        this.refreshModalBG();
        // 弹窗完成
        return childNode;
    }
    /** 清除所有pop */
    clear() {
        // this.modalBackLayer.off(cc.Node.EventType.TOUCH_END,this.clickBgHandler,this);
        super.clear();
        // this._initModalBackLayer();
    }

    clearAll() {
        this.modalBackLayer.off(cc.Node.EventType.TOUCH_END, this.clickBgHandler, this);
        super.clearAll();
        this._initModalBackLayer();
    }
}
