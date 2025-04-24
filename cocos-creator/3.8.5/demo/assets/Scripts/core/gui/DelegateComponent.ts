

/*
 * gui内部组件
 * 每个通过gui.xxx.add的预制件节点，都会自动增加一个DelegateComponent
 * 用于监听界面生命周期，处理回调事宜
 */
import { ViewUtils } from "../ui/ViewUtils";
import AssetKeeper from "./AssetKeeper";

import { GUIEvent, GUIOptions, gui_setting, ILayerBase, ViewParams } from "./Defines";
import { NodeTree } from "./NodeTree";
import { compPropertyMap, prefabComponentMap } from "./gui_global";
import { Component, Node, director, js } from "cc";

const trace = function (...args) {
    console.log("DelegateComponent", ...args);
};

export default class DelegateComponent extends Component {

    public viewParams: ViewParams = null;

    public guiLayer: ILayerBase = null;

    protected _isLayer: boolean = false;

    protected _onBeforeRemoveCalled: number = 0;


    /****** 20230129 新增NodeTree begin */
    private _nodeTree: NodeTree = null;
    /**
     * 惰性初始化, 提高性能
     */
    private get nodeTree() {
        if (!this._nodeTree) {
            this._nodeTree = NodeTree.alloc(this.node);
        }
        return this._nodeTree;
    }
    /**
     * 获取一个子节点，内部会遍历子节点的子节点
     * @param name 节点名称
     * @returns 
     */
    public get(name: string): Node {
        return this.nodeTree.get(name);
    }
    /**
     * root中是否存在某个节点
     * @param name 节点名称
     * @returns 
     */
    public has(name: string): boolean {
        return this.nodeTree.has(name);
    }

    /**
     * 获取子节点的组件
     * @param node_name 
     * @param type 
     * @returns 
     */
    public getChildComponent<T extends Component>(node_name: string, type: { prototype: T }): T {
        let node: Node = this.get(node_name);
        if (node) {
            return node.getComponent(type as any);
        }
        return null;
    }
    /****** 20230129 新增NodeTree end */

    /***********************************************************************************/
    /**
     * 【内部调用】初始化
     * @param layer 节点所属层
     * @param viewParams 界面状态信息
     */
    init(layer: ILayerBase, viewParams: ViewParams) {
        this.guiLayer = layer;
        this.viewParams = viewParams;
    }
    /**
     * 【内部调用】
     * @returns 
     */
    addView() {
        let viewParams = this.viewParams;
        if (!viewParams) {
            return;
        }
        let guiOption = viewParams.guiOption;
        if (viewParams.prefab) {
            if (typeof guiOption.autoRelease != "boolean") {
                guiOption.autoRelease = true;
            }
            // 自动释放模式，加一次引用计数
            guiOption.autoRelease && viewParams.prefab.addRef();
        }

        // 判断是否有自动添加的组件
        const bundle = viewParams?.guiOption?.bundle;
        const prefabPath: string = bundle ? (bundle + '|' + viewParams.prefabPath) : viewParams.prefabPath;
        let prefabComponent = prefabComponentMap.get(prefabPath);
        if (prefabComponent && !this.node.getComponent(prefabComponent)) {
            this.addCustomComponent(prefabComponent)
        }

        this.applyCallbackFunction("onAdded", guiOption, viewParams.params);
        /**
         * 调整 DelegateComponent 到节点组件数组最前面，
         * 用于解决onRemove调用时，其他组件内部属性已被释放的风险
         **/
        let components: Array<Component> = (<any>this.node)._components;
        if (components) {
            for (let i = 0; i < components.length; ++i) {
                const comp = components[i];
                if (comp === this) {
                    components.splice(i, 1);
                    // 将DelegateComponent插入到组件数组[0]
                    components.unshift(comp);
                    break;
                }
            }
        }
    }

    /** 自定义的添加组件的方法，不直接使用addComonent，但实现方式和addComonent相同 */
    private addCustomComponent(componentName: string) {
        const compConstructor = js.getClassByName(componentName);
        const comp: any = new compConstructor();
        comp.node = this.node;
        this.node['_components'].push(comp);
        this.bindGuiProperty(comp);
        if (this.node.activeInHierarchy) director._nodeActivator.activateComp(comp);
    }

    /** 绑定guiProperty属性 */
    private bindGuiProperty(comp: Component) {
        const nodeTree = this;
        const classNames: string[] = [];
        let properties: { nodeName: string, key: string, type?: typeof Component | typeof Node }[] = [];

        // 获取自己的类名和所有父类类名，避免子类中没有填充父类的guiProperty
        ViewUtils.getAllClassName(comp, 'Component', classNames);
        classNames.forEach(compName => {
            const props = compPropertyMap.get(compName);

            props && (properties = properties.concat(props));
        });
        if (nodeTree && properties) {
            // 遍历guiProperty，然后赋值
            properties.forEach(params => {
                const type = params.type;
                const key = params.key;
                if (!type || type === Node) {
                    comp[key] = nodeTree.get(params.nodeName);
                } else {
                    comp[key] = nodeTree.getChildComponent(params.nodeName, type as typeof Component);
                }
            });
        }
    }

    public set isLayer(val: boolean) {
        if (this._isLayer != val) {
            this._isLayer = val;
            if (val) {
                this.node.on(Node.EventType.TOUCH_END, (event) => {
                    this.guiLayer && this.guiLayer.emit(GUIEvent.CHILD_TOUCH_END, event);
                }, this);
            } else {
                this.node.targetOff(this);
            }
        }
    }

    /**
     * 删除节点，该方法只能调用一次，将会触发onBeforeRemoved回调
     */
    removeView() {
        let viewParams = this.viewParams;
        if (!viewParams) {
            return;
        }
        if (viewParams.valid && this._onBeforeRemoveCalled === 0) {
            this._onBeforeRemoveCalled = 1;
            let doonBeforeRemove = () => {
                this.applyCallbackFunction("onBeforeRemove", null, viewParams.params);
                if (viewParams.guiOption && (typeof viewParams.guiOption.onBeforeRemove === "function")) {
                    viewParams.guiOption.onBeforeRemove(this.node, this.onceDestroy.bind(this));
                } else {
                    this.node.destroy();
                    this._onBeforeRemoveCalled = 2;
                }
                viewParams.valid = false;
            };
            let commonCallbacks = this.guiLayer.commonCallbacks;
            if (commonCallbacks && typeof commonCallbacks.onBeforeRemove === "function") {
                commonCallbacks.onBeforeRemove(this.node, doonBeforeRemove);
            } else {
                doonBeforeRemove();
            }
        }
    }

    onceDestroy() {
        if (this._onBeforeRemoveCalled === 1) {
            this.node.destroy();
        }
        this._onBeforeRemoveCalled = 2;
    }

    protected onDestroy() {
        if (this._onBeforeRemoveCalled !== 1 && this._onBeforeRemoveCalled !== 2) {
            return trace(" onDestroy invalid call!");
        }
        this._onBeforeRemoveCalled = 3;
        let viewParams = this.viewParams;
        this.viewParams = null;
        if (!viewParams) {
            return;
        }
        viewParams.valid = false;
        if (gui_setting.engineValid && this.isValid && this.node && this.node.isValid) {
            this.applyCallbackFunction("onRemoved", viewParams.guiOption, viewParams.params);
        }
        if (viewParams.prefab && viewParams.guiOption.autoRelease) {
            // 将释放延迟到下帧完成，避免下一次要用到同样资源时重复加载
            AssetKeeper.releaseNextFrame(viewParams.prefab);
        }
        viewParams.destroy();
        this.node.targetOff(this);
        this.guiLayer = null;
        /** 释放回收节点树对象内存 */
        if (this._nodeTree) {
            NodeTree.free(this._nodeTree);
            this._nodeTree = null;
        }
    }

    protected applyCallbackFunction(funName: "onAdded" | "onRemoved" | "onBeforeRemove", guiOption: GUIOptions, params: any) {
        if (!this.guiLayer) { return; }
        let ntobj = funName === "onAdded" ? this : undefined; // 只有onAdded需要传NodeTree
        if (guiOption && this.guiLayer) {
            // 处理guilayer通用回调
            const commonCallbacks = this.guiLayer.commonCallbacks;
            if (commonCallbacks && commonCallbacks[funName]) {
                commonCallbacks[funName](this.node, params, ntobj);
            }
        }
        // 回调组件内onAdded/onBeforeRemove/onRemoved
        let components = this.node.components;
        if (components) {
            for (let comp of components) {
                let func = comp[funName];
                if (typeof func === "function") {
                    func.call(comp, params, ntobj);
                }
            }
        }
        // 回调 GUIOptions
        if (guiOption) {
            let func = guiOption[funName];
            if (typeof func === "function") {
                guiOption[funName] = null;
                func(this.node, params, ntobj);
            }
        }
    }
}