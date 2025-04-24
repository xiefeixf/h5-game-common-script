
/**
 * UI节点基层
 */

import { Component, EventTarget, Node, Prefab, UITransform, instantiate, } from "cc";
import engine from "../Engine";
import { gui } from "./GUI";
import { Log } from "../Log";
import { UIBaseView } from "../ui/UIBaseView";

export class LayerBase extends EventTarget {

    private _container: Node = null;
    /**资源引用池 */
    private _loader: Map<string, [Prefab, UIBaseView]> = new Map<string, [Prefab, UIBaseView]>();

    public get container() {
        return this._container;
    }

    constructor(name: string, container: Node) {
        super();
        container.name = name;
        container.addComponent(UITransform);
        this._container = container;
        this.setup();
    }


    private setup() {

    }

    /**添加节点 */
    public add(layerType: string, params?: any) {
        if (this._loader.has(layerType)) {
            if (!this._loader.get(layerType)) {
                return;
            }
            let base = this._loader.get(layerType)[1];
            base.node.active = true;
            base.onAdded(params);
            base.node.setSiblingIndex(this._container.children.length - 1);
        } else {
            this._createNode(layerType, params);
        }
    }

    /**获取对应节点方法 */
    public get<T extends Component>(layerType: string, componentClass: new () => T): T | null {
        if (!this._loader.has(layerType)) { return };

        const base = this._loader.get(layerType)?.[1];
        if (base) {
            return base.getComponent(componentClass);
        }
        return null;
    }

    /**自定义父节点添加 */
    public customAdd(layerType: string, parent: Node, params?: any) {
        if (this._loader.has(layerType)) {
            if (!this._loader.get(layerType)) {
                return;
            }
            let base = this._loader.get(layerType)[1];
            base.node.active = true;
            base.onAdded(params);
            base.node.setSiblingIndex(this._container.children.length - 1);
        } else {
            this._createNode(layerType, params, parent);
        }
    }

    /**移除节点 */
    public remove(layerType: string, params?: any) {
        if (!this._loader.has(layerType) || !this._loader.get(layerType)) {
            return;
        }
        let base = this._loader.get(layerType)[1];
        base.node.setSiblingIndex(0);
        base.node.active = false;
        base.onRemoved(params);
    }

    /**销毁节点 */
    public destroy(layerType: string) {
        if (!this._loader.has(layerType)) {
            return;
        }
        let base = this._loader.get(layerType)[1];
        base.node.destroy();
        this._loader.get(layerType)[0].decRef();
        this._loader.delete(layerType);
    }

    /**创建节点 */
    private _createNode(layerType: string, params?: any, parent?: Node) {
        this._loader.set(layerType, null)
        engine.resMar.loadRes(layerType, Prefab, (assets: Prefab) => {
            let obj = instantiate(assets);
            !!parent ? parent.addChild(obj) : this._container.addChild(obj);
            let base = obj.getComponent(UIBaseView);
            this._loader.set(layerType, [assets, base]);
            if (base) {
                base.onAdded(params);
            }
        })
    }


    public getNodeByName(name: string, isError: boolean = true) {
        let obj = this.findChildByName(this._container, name);
        isError && !obj && Log.error(`未在${this._container.name}层查询到${name}节点`);
        return obj;
    }


    private findChildByName(parent: Node, name: string): Node | null {
        const searchNode = (currentNode: Node, targetName: string): Node | null => {
            if (currentNode.name === targetName) {
                return currentNode;
            }

            for (let i = 0; i < currentNode.children.length; i++) {
                const foundNode = searchNode(currentNode.children[i], targetName);
                if (foundNode) {
                    return foundNode;
                }
            }
            return null;
        };

        // 从父节点开始搜索
        return searchNode(parent, name);
    }


    /** 设置层大小 */
    public layout(width: number, height: number) {
        this._container.getComponent(UITransform).setContentSize(width, height);
    }

}
