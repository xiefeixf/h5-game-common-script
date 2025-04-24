/*
 * core全局事件管理
 * 
 * 各个子玩法，请在模块内自行创建 XXXEventConst.ts，定义事件名字符串。
 * 避免使用明文事件字符串，如 GlobalEvent.on("level_change"...);
 */

import { Component, EventTarget, isValid, view } from "cc";



const trace = function (...args) {
    console.log("engine.event", ...args);
};
const traceError = function (...args) {
    console.error("engine.event", ...args);
};

let __uuid = 1;

class AutoEventComponent extends Component {

    private static eventMaps = new Map<string, Map<number, AutoEventComponent>>();

    private static getEvents(evt: string): Map<number, AutoEventComponent> {
        if (AutoEventComponent.eventMaps.has(evt)) {
            return AutoEventComponent.eventMaps.get(evt);
        }
        let devent = new Map<number, AutoEventComponent>();
        AutoEventComponent.eventMaps.set(evt, devent);
        return devent;
    }

    public static onEvent(evt: string, comp: Component, callback: Function) {
        if (!evt || !isValid(comp)) {
            return traceError(evt, comp.roleID);
        }
        let resizeComp = comp.node.getComponent(AutoEventComponent);
        if (!resizeComp) {
            resizeComp = comp.node.addComponent(AutoEventComponent);
            AutoEventComponent.getEvents(evt).set(resizeComp.guuid, resizeComp);
        }
        resizeComp.callbacks.set(evt, callback);
    }
    public static emit(evt: string, arg0: any) {
        if (AutoEventComponent.eventMaps.has(evt)) {
            let eventInfo = AutoEventComponent.eventMaps.get(evt);
            for (let [id, comp] of eventInfo) {
                if (comp._callbacks) {
                    let func = comp._callbacks.get(evt);
                    func && func(arg0);
                }
            }
        }
    }

    public static offEvent(evt: string, comp: Component) {
        if (!evt || !isValid(comp)) {
            return traceError(evt, comp.roleID);
        }
        let resizeComp = comp.node.getComponent(AutoEventComponent);
        if (!resizeComp) {
            return;
        }
        if (resizeComp._callbacks) {
            resizeComp._callbacks.delete(evt);
        }
    }

    public static clear() {
        for (let [_, eventInfo] of AutoEventComponent.eventMaps) {
            for (let [id, comp] of eventInfo) {
                comp.callbacks.clear();
            }
            eventInfo.clear();
        }
        AutoEventComponent.eventMaps.clear();
    }

    public guuid = __uuid++;
    protected _callbacks: Map<string, Function> = null;
    public get callbacks() {
        if (!this._callbacks) {
            this._callbacks = new Map<string, Function>();
        }
        return this._callbacks;
    }
    protected onDestroy(): void {
        if (this._callbacks) {
            this._callbacks.clear();
            this._callbacks = null;
        }
        if (this.guuid > 0) {
            for (let [_, eventInfo] of AutoEventComponent.eventMaps) {
                eventInfo.delete(this.guuid);
            }
            this.guuid = 0;
        }
    }
}

export class EventDispatcher extends EventTarget {


    private __eventStateMap: Map<string, number> = null;
    /**
     * 记录事件发送状态，0表示正常，1表示暂停，-1表示失效。
     */
    public get eventStateMap() {
        if (!this.__eventStateMap) {
            this.__eventStateMap = new Map<string, number>();
        }
        return this.__eventStateMap;
    }
    private _gstate = 0;
    /**
     * 停止所有事件派发
     */
    public pauseAll() {
        this._gstate = 1;
    }
    /**
     * 恢复所有事件派发
     */
    public resumeAll() {
        this._gstate = 0;
    }
    /**
     * 暂停某个事件的派发
     * @param event 
     */
    public pause(event: string) {
        if (event) {
            trace("pause " + event);
            this.eventStateMap.set(event, 1);
        }
    }
    /**
     * 恢复某个事件派发
     * @param event 
     */
    public resume(event: string) {
        if (event) {
            trace("resume " + event);
            this.eventStateMap.set(event, 0);
        }
    }
    /***
     * 监听一个事件，如监听成功将返回一个callback，该callback === 传入的callback
     */
    public on<TFunction extends (...any: any[]) => void>(event: string, callback: TFunction, thisArg?: any, once?: boolean): typeof callback {

        return super.on(event, callback, thisArg, once);
    }
    /**
     * 一个事件全局只监听一次
     * @param event 
     * @param callback 
     * @param thisArg 
     * @param once 
     * @returns 
     */
    public only<TFunction extends (...any: any[]) => void>(event: string, callback: TFunction, thisArg?: any, once?: boolean): typeof callback {
        this.removeAll(event); // 删除之前监听的事件
        return super.on(event, callback, thisArg, once);
    }

    /**
     * 注销事件
     * @param event 
     * @param callback 
     * @param thisArg 
     * @returns 
     */
    public off<TFunction extends (...any: any[]) => void>(event: string, callback?: TFunction, thisArg?: any): void {
        if (this.eventStateMap.has(event)) {
            this.eventStateMap.set(event, -1);
        }
        return super.off(event, callback, thisArg);
    }

    /**
     * 发送事件, 会判断事件是否已暂停
     * @param event 
     * @param arg0 事件参数...
     * @param arg1 
     * @param arg2 
     * @param arg3 
     * @param arg4 
     * @returns 
     */
    public emit(event: string, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any): void {
        if (this._gstate === 1 || this.eventStateMap.get(event) === 1) {
            return trace("stop emit!");
        }
        return super.emit(event, arg0, arg1, arg2, arg3, arg4);
    }
    /**
     * 清除所有事件监听
     */
    public clearAll() {
        for (let [evt, state] of this.eventStateMap) {
            if (state >= 0) {
                super.removeAll(evt);
            }
        }
        this.eventStateMap.clear();
        AutoEventComponent.clear();
    }

    /****************** 系统事件监听 ***************** */
    /**
     * 监听屏幕resize 事件
     * 组件释放时event内部会自动释放监听函数，研发无需手动处理，若需要提前删除监听，可以调用offResize；
     * @param func 
     * @param comp 
     * @returns 
     */
    public onResize(func: (...any: any[]) => void, comp: Component) {
        return AutoEventComponent.onEvent("resize", comp, func);
    }
    /**
     * 主动取消屏幕resize监听函数
     * @param comp 
     * @returns 
     */
    public offResize(comp: Component) {
        return AutoEventComponent.offEvent("resize", comp);
    }
    /**
     * 发送resize事件，由SceneRoot来执行，外部请勿主动调用
     */
    public emitResize() {
        AutoEventComponent.emit("resize", view.getVisibleSize());
    }
}

export const GlobalEvent = new EventDispatcher();