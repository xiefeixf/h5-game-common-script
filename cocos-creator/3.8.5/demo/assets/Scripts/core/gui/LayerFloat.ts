/*
 * 浮动层控制器, 队列式
 * 该层的节点可显示多可浮动窗口，删除以后会自动从队列当中取一个弹窗，直到队列为空
 */

import * as cc from "cc";


import { GUIFloatOptions, ViewParams } from "./Defines";
import { LayerBase } from "./LayerBase";

export const enum floatZindex {
    normal = 0,
    middle = 50,
    hight = 999,
}

export class LayerFloat extends LayerBase {

    constructor(name: string, container: cc.Node) {
        super(name, container);
    }

    /**
     * 添加一个预制件节点到层容器中，该方法将返回一个唯一`uuid`来标识该操作节点
     * @param prefabPath 预制件路径或预制件对象
     * @param params     传给组件`onAdded`、`onRemoved`方法的参数。
     * @param opts       回调函数对象，可选
     */
    add(prefabPath: string | cc.Prefab, params?: any, opts: GUIFloatOptions = null): number {
        return super.add(prefabPath, params, opts);
    }

    protected _handlerTask(next: Function, viewParams: ViewParams) {
        if (!viewParams.valid) {
            viewParams.destroy();
            return next(false);
        }
        let $onRemoved = viewParams.guiOption.onRemoved;
        viewParams.guiOption.onRemoved = (node, params) => {
            if ($onRemoved) {
                $onRemoved(node, params);
                $onRemoved = null;
            }
            next();
        };
        super._handlerTask((success) => {
            if (!success) {
                next();
            }
        }, viewParams);
    }
}