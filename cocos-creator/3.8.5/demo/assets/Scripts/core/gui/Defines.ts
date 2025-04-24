/*
 * @Description:  gui模块常用类型定义 
 */

import { Component, EventTarget, Node, Prefab } from "cc";


/**
 * 全局设置
 */
export let gui_setting = {
    /**
     * UI 层级，默认是UI_2D
     */
    defaultLayer: 0,
    /**
     * 引擎是否可用
     */
    engineValid: true,
    /**
     * 默认SpriteFrame(白色1x1像素)
     * gui.init() 初始化后将有效
     */
    defaultSpriteFrame: null
};

/** 
 * 
 * GUI内部事件
 * 注意，gui内部事件的发起者是gui的层，这些层都继承于EventTarget 
 * 所以必须用以下形式监听, 如
 * gui.ui.on(GUIEvent.CHILD_ADDED, listener, this);
 * 
 */
export const enum GUIEvent {
    /***
     * 层节点add事件，
     * gui.xxx.on(GUIEvent.CHILD_ADDED,(childNode:Node)=>{
     *      
     * },this)
     */
    CHILD_ADDED = "gui.layer.CHILD_ADDED",
    /***
     * 层节点remove事件，
     * gui.xxx.on(GUIEvent.CHILD_REMOVED,(childNode:Node)=>{
     *      
     * },this)
     */
    CHILD_REMOVED = "gui.layer.CHILD_REMOVED",
    CHILD_TOUCH_END = "gui.layer.CHILD_TOUCH_END",
    POPUP_MODAL_TOUCH_END = "gui.layer.POPUP_MODAL_TOUCH_END",
}

/***
 * GUI层通用回调定义
 */
export interface GUICallbacks {
    /**
     * 希望在节点创建之前做一些事情，
     * 比如请求协议获取到数据后再进入界面，调用next(true)， 
     * 如果数据获取失败则 next(false) ,则会直接跳过
     */
    onBeforeCreate?: (next: (shouldCreate: boolean) => void) => void,

    /**
     * 节点添加到层级以后的回调（onLoad之后），在组件内onAdded回调之后执行
     * 执行时序： 组件onLoad-> 组件onAdded -> GUIOptions#onAdded
     * 
     * @param node 
     * @param params 
     * @param nodeTree 节点树对象，可以方便获取添加的预制件的子节点，GUINodeTree内部是懒初始化方式，只有调用get和has方法才会真正生成节点树对象
     * @returns 
     */
    onAdded?: (node: Node, params: any, nodeTree: GUINodeTree) => void,

    /** 
     * 注意：调用`gui.delete`或`gui.$delete`才会触发此onBeforeRemove回调，如果`this.node.destroy()`，该回调不会触发。
     * 如果指定onBeforeRemoved，则next必须调用，否则节点不会被正常删除。
     * 比如希望节点做一个FadeOut然后删除，则可以在`onBeforeRemoved`当中播放action动画，动画结束后调用next
     * 
     * */
    onBeforeRemove?: (node: Node, next: () => void) => void,

    /**
     * 节点删除回调，，在组件内onRemoved回调之后执行，
     * 执行时序： 组件onRemoved -> GUIOptions#onRemoved -> 组件onDestroy
     * 注意：该回调会在onDestroy之前调用
     */
    onRemoved?: (node: Node, params: any) => void,

    /**
     * 节点创建失败的回调
     */
    onError?: (error: any) => void;
}

/*** gui 层参数对象定义，GUIOptions继承GUICallbacks */
export interface GUIOptions extends GUICallbacks {

    /**
     * 【可选】节点z值, 除了LayerPopup以外，其他类型的层级都将有效
     */
    zIndex?: number,
    /**
     * 【可选】处理的优先级，越大越优先弹出
     * 默认0
     */
    priority?: number,
    /**
     * 【可选】是否自动释放预制件资源,
     * 默认为自动释放
     */
    autoRelease?: boolean,
    /**
     * 【可选】添加唯一预制件节点到层容器中，如果当前界面存在该节点，则本次添加行为无效.
     * 默认为false
     */
    single?: boolean,

    /**
     * 【可选】资源分包bundle名，如有值则将从该bundle中获取预制件，
     * 如无值内部自动切换到resources
     */
    bundle?: string
}

/** gui.float.add 浮动层回调对象定义 */
export interface GUIFloatOptions extends GUIOptions {


}

/** gui.popup.add 弹框层回调对象定义 */
export interface GUIPopupOptions extends GUIOptions {

    /** 【可选】 相对的父级节点，弹出的界面将显示在该节点上，用于实现DropDown效果，*/
    parent?: Node,

    /** 【可选】是否显示暗色背景 */
    modal?: boolean,

    /** 【可选】是否触摸背景关闭弹窗，默认为true */
    touchClose?: boolean,

    /** 【可选】控制暗色背景的透明度（0~255），默认128*/
    opacity?: number;
}

/**
 * 节点树对象
 */
export interface GUINodeTree {
    /**
     * 获取一个子节点
     * @param name 
     */
    get(name: string): Node;

    /**
     * 子节点是否存在
     * @param name 
     */
    has(name: string): boolean;

    /**
     * 获取子节点的组件
     * @param node_name 
     * @param type 
     */
    getChildComponent<T extends Component>(node_name: string, type: { prototype: T }): T;

}

/*********************** 以下为GUI内部定义，外部请勿使用 ************************************/
let uuid_seed = 1;
export function generate_uuid() {
    return uuid_seed++;
}
/**
 * 定义LayerBase接口形式，此定义作用仅限于避免循环引用警告
 */
export interface ILayerBase extends EventTarget {
    get container(): Node;
    get commonCallbacks(): GUICallbacks;
}

/** 操作界面的数据集合 */
export class ViewParams {
    public UUID: string;
    public prefabPath: string;
    public prefab: Prefab;
    public params: any;  // 传给`onAdded`、`onRemoved`回调的参数
    public guiOption: GUIOptions;
    public valid: boolean = true;  // 该节点是否有效

    constructor(UUID: string, prefabPath: string, prefab: Prefab, params: any, guiOption: GUIOptions) {
        this.UUID = UUID;
        this.prefabPath = prefabPath;
        this.prefab = prefab;
        this.guiOption = guiOption || {};
        this.params = params;
    }
    destroy() {
        this.prefabPath = null;
        this.prefab = null;
        this.params = null;
        this.guiOption = null;
    }
}
