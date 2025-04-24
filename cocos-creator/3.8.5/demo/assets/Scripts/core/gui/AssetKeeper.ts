/**
 * 资源引用类
 * 1. 提供加载功能，并记录加载过的资源
 * 2. 在node释放时自动清理加载过的资源
 * 3. 支持手动添加记录
 */
import * as cc from 'cc';
import { BIMap } from '../util/BIMap';

const trace = function (...args) {
    console.log("AssetKeeper", ...args);
};

const traceError = function (...args) {
    console.error("AssetKeeper", ...args);
};
type ArgsInfo = { type: typeof cc.Asset, onProgress: (finish: number, total: number, item: any) => void, onComplete: (error: Error, assets: cc.Asset) => void };
const { ccclass } = cc._decorator;


@ccclass(`core/AssetKeeper`)
export default class AssetKeeper extends cc.Component {

    /************************** 资源统一释放接口 begin ********************/
    /**
     * 资源释放
     * 如资源引用技术为1，则会放在下一帧判断释放
     * cocos内部已经是下帧做释放，因此去除处理
     * @param asset 
     * @returns 
     */
    public static releaseNextFrame(asset: cc.Asset, func?: (out: cc.Asset) => void) {
        asset.decRef();
        if (asset.refCount === 0) {
            trace(" release assets => ", asset.nativeUrl || asset.name);
            asset["$remote"] && AssetKeeper.remoteCaches.delete(asset);
        }
        func && func(asset);
    }
    /************************** 资源统一释放接口 end ********************/

    private _assetsList: cc.Asset[] = null;
    public get assetsList() {
        if (!this._assetsList) {
            this._assetsList = [];
        }
        return this._assetsList;
    }

    private appendAsset(asset: cc.Asset) {
        if (asset && this.assetsList.indexOf(asset) < 0) {
            this.assetsList.push(asset.addRef());
        }
    }
    /**
     * 处理bundle下的资源回调
     * @param bundle 
     * @param url 
     * @param resArgs 
     */
    private _handlerBundle<T extends cc.Asset>(bundle: cc.AssetManager.Bundle, url: string, resArgs: ArgsInfo) {
        if (bundle && this.isValid) {
            let asset = bundle.get(url, resArgs.type);
            if (asset) {
                resArgs.onComplete(null, asset);
            } else {
                let info = bundle.getInfoWithPath(url);
                if (!info) {
                    return resArgs.onComplete(new Error(`${bundle.name}|${url} not found!`), null);
                }
                bundle.load(url, resArgs.type, resArgs.onProgress, resArgs.onComplete);
            }
        }
    }
    /**
     * 【支持分包】加载资源
     * @param paths 资源路径，或者前缀分包名的资源路径地址，如spx|prefabs/shop.prefab
     * @param assetType 
     * @param onComplete 加载完成回调
     */
    loadAsset<T extends cc.Asset>(paths: string, type: (new () => T), onProgress: (finish: number, total: number, item: any) => void, onComplete: (error: Error, assets: T) => void): void;
    loadAsset<T extends cc.Asset>(paths: string, onProgress: (finish: number, total: number, item: any) => void, onComplete: (error: Error, assets: T) => void): void;
    loadAsset<T extends cc.Asset>(paths: string, type: (new () => T), onComplete?: (error: Error, assets: T) => void): void;
    loadAsset<T extends cc.Asset>(paths: string, onComplete?: (error: Error, assets: T) => void): void;
    loadAsset<T extends cc.Asset>(paths: string, opts: ArgsInfo): void;
    public loadAsset<T extends cc.Asset>(): void {
        let paths: string = arguments[0];
        let resArgs = this._parseLoadResArgs(arguments[1], arguments[2], arguments[3]);
        if (paths.indexOf("|") > 0) {
            let urls = paths.split("|");
            let bundleName = urls[0];
            let url = urls[1];
            let bundle = cc.assetManager.getBundle(bundleName);
            if (bundle) {
                this._handlerBundle(bundle, url, resArgs);
            } else {
                cc.assetManager.loadBundle(bundleName, (err, lbundle) => {
                    if (err || !lbundle) {
                        traceError(err, lbundle);
                        return resArgs.onComplete(err, null);
                    }
                    this._handlerBundle(lbundle, url, resArgs);
                });
            }
        } else {
            this._handlerBundle(cc.resources, paths, resArgs);
        }
    }
    /**
     * 加载资源，通过此接口加载的资源会在界面被销毁时自动释放，开启自动释放功能
     * 如果同时有其他地方引用的资源，会解除当前界面对该资源的占用
     * @param url           资源url
     * @param type          资源类型，默认为null
     * @param onProgess     加载进度回调
     * @param onCompleted   加载完成回调
     */
    loadRes<T extends cc.Asset>(paths: string, type: typeof cc.Asset, onProgress: (finish: number, total: number, item: any) => void, onComplete: (error: Error, assets: T) => void): void;
    loadRes<T extends cc.Asset>(paths: string[], type: typeof cc.Asset, onProgress: (finish: number, total: number, item: any) => void, onComplete: (error: Error, assets: Array<T>) => void): void;
    loadRes<T extends cc.Asset>(paths: string, onProgress: (finish: number, total: number, item: any) => void, onComplete: (error: Error, assets: T) => void): void;
    loadRes<T extends cc.Asset>(paths: string[], onProgress: (finish: number, total: number, item: any) => void, onComplete: (error: Error, assets: Array<T>) => void): void;
    loadRes<T extends cc.Asset>(paths: string, type: typeof cc.Asset, onComplete?: (error: Error, assets: T) => void): void;
    loadRes<T extends cc.Asset>(paths: string[], type: typeof cc.Asset, onComplete?: (error: Error, assets: Array<T>) => void): void;
    loadRes<T extends cc.Asset>(paths: string, onComplete?: (error: Error, assets: T) => void): void;
    loadRes<T extends cc.Asset>(paths: string[], onComplete?: (error: Error, assets: Array<T>) => void): void;
    public loadRes<T extends cc.Asset>() {
        let paths: string = arguments[0];
        let resArgs = this._parseLoadResArgs(arguments[1], arguments[2], arguments[3]);
        if (typeof paths === "string") {
            return this.loadAsset(paths, resArgs);
        }
        cc.resources.load<T>(paths, resArgs.type, resArgs.onProgress, resArgs.onComplete);
    }

    /**
    * 加载资源，通过此接口加载的资源会在界面被销毁时自动释放，开启自动释放功能
    * 如果同时有其他地方引用的资源，会解除当前界面对该资源的占用
    * @param bundleName      bundle名字
    * @param url           资源url
    * @param type          资源类型，默认为null
    * @param onProgess     加载进度回调
    * @param onCompleted   加载完成回调
    */
    loadBundleRes<T extends cc.Asset>(bundleName: string, paths: string, type: typeof cc.Asset, onProgress: (finish: number, total: number, item: any) => void, onComplete: (error: Error, assets: T) => void): void;
    loadBundleRes<T extends cc.Asset>(bundleName: string, paths: string[], type: typeof cc.Asset, onProgress: (finish: number, total: number, item: any) => void, onComplete: (error: Error, assets: Array<T>) => void): void;
    loadBundleRes<T extends cc.Asset>(bundleName: string, paths: string, onProgress: (finish: number, total: number, item: any) => void, onComplete: (error: Error, assets: T) => void): void;
    loadBundleRes<T extends cc.Asset>(bundleName: string, paths: string[], onProgress: (finish: number, total: number, item: any) => void, onComplete: (error: Error, assets: Array<T>) => void): void;
    loadBundleRes<T extends cc.Asset>(bundleName: string, paths: string, type: typeof cc.Asset, onComplete?: (error: Error, assets: T) => void): void;
    loadBundleRes<T extends cc.Asset>(bundleName: string, paths: string[], type: typeof cc.Asset, onComplete?: (error: Error, assets: Array<T>) => void): void;
    loadBundleRes<T extends cc.Asset>(bundleName: string, paths: string, onComplete?: (error: Error, assets: T) => void): void;
    loadBundleRes<T extends cc.Asset>(bundleName: string, paths: string[], onComplete?: (error: Error, assets: Array<T>) => void): void;
    public loadBundleRes<T extends cc.Asset>(): void {
        let bundleName: string = arguments[0];
        let paths: string = arguments[1];
        let resArgs = this._parseLoadResArgs(arguments[2], arguments[3], arguments[4]);
        if (typeof paths === "string") {
            return this.loadAsset(`${bundleName}|${paths}`, resArgs);
        }
        let bundle = cc.assetManager.getBundle(bundleName);
        if (bundle == null) {
            return resArgs.onComplete && resArgs.onComplete(null, null);
        }
        bundle.load<T>(paths, resArgs.type, resArgs.onProgress, resArgs.onComplete);
    }
    /**
     * Promise方式加载resources资源
     * @param path 
     * @param type 
     * @returns 
     */
    public async asyncLoadRes<T extends cc.Asset>(path: string, type: typeof cc.Asset): Promise<T> {
        return new Promise((resolve, reject) => {
            this.loadRes(path, type, (error: Error, assets: T) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(assets);
                }
            });
        });
    }
    /**
     * Promise方式加载bundle资源
     * @param path 
     * @param type 
     * @returns 
     */
    public async asyncLoadBundleRes<T extends cc.Asset>(bundle: string, path: string, type: typeof cc.Asset): Promise<T> {
        return new Promise((resolve, reject) => {
            this.loadBundleRes(bundle, path, type, (error: Error, assets: T) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(assets);
                }
            });
        });
    }
    /**
     * 远程加载资源
     */
    public static remoteCaches = new BIMap<cc.Asset>();
    /**
     * 远程加载图片或base64
     * @param path 
     * @param onComplete 
     */
    /**
     * 远程外部加载图片
     * @param path 
     * @param opt  可选设置，默认：{ ext: '.png' }
     * @param onComplete 
     */
    loadRemoteRes<T extends cc.Asset>(path: string, options: any, onComplete?: (error: Error, assets: T) => void): void;
    public loadRemoteRes<T extends cc.Asset>(path: string, onComplete?: (error: Error, assets: T) => void): void {
        let lopt = null;
        let lonComplete: (error: Error, assets: T) => void = null;
        if (typeof arguments[1] === "function") {
            lonComplete = arguments[1];
            lopt = { ext: '.png' };// 默认.png
        } else {
            lopt = arguments[1];
            lonComplete = onComplete;
        }
        if (AssetKeeper.remoteCaches.has(path)) {
            let asset = AssetKeeper.remoteCaches.get(path);
            if (asset.refCount > 0) {
                this.appendAsset(asset);
                return lonComplete && lonComplete(null, asset as T);
            } else {
                AssetKeeper.remoteCaches.delete(path);
            }
        }
        cc.assetManager.loadRemote<T>(path, lopt, (error, res) => {
            if (!error && this.isValid) {
                let asset = null;
                if (res instanceof cc.ImageAsset) {
                    asset = cc.SpriteFrame.createWithImage(res);
                } else {
                    asset = res;
                }
                asset["$remote"] = true;
                AssetKeeper.remoteCaches.set(path, asset);
                this.appendAsset(asset);
                lonComplete && lonComplete(null, asset);
            } else {
                traceError(error);
                lonComplete && lonComplete(error, null);
            }
        });
    }

    /**
     * 适配资源加载参数，对传入参数进行处理得到合适的赋值结果
     * @param urls
     * @param type
     * @param onProgress
     * @param onCompleted
     */
    private _parseLoadResArgs(type, onProgress, onComplete) {
        if (typeof type === "object" && type && type["type"]) {
            if (!onComplete && !onProgress) {
                return type;
            }
        }
        if (onComplete === undefined) {
            let isValidType = cc.js.isChildClassOf(type, cc.Asset);
            if (onProgress) {
                onComplete = onProgress;
                if (isValidType) {
                    onProgress = null;
                }
            } else if (onProgress === undefined && !isValidType) {
                onComplete = type;
                onProgress = null;
                type = null;
            }
            if (onProgress !== undefined && !isValidType) {
                onProgress = type;
                type = null;
            }
        }
        let temp = { type: type, onProgress: onProgress, onComplete: null };
        temp.onComplete = (error: Error, res: cc.Asset | cc.Asset[]) => {
            if (!error && this.isValid) {
                if (res instanceof cc.Asset) {
                    this.appendAsset(res);
                } else {
                    for (const iterator of res) {
                        this.appendAsset(iterator);
                    }
                }
                onComplete && onComplete(error, res);
            } else {
                onComplete && onComplete(error, null);
                error && traceError(error);
            }
        };
        return temp;
    }
    /**
     * 组件销毁时自动释放所有keep的资源
     */
    public onDestroy() {
        this.releaseAll();
    }

    /**
     * 释放资源，组件销毁时自动调用
     */
    public releaseAll() {
        if (this._assetsList && this._assetsList.length > 0) {
            for (let asset of this._assetsList) {
                AssetKeeper.releaseNextFrame(asset, null);
            }
            this._assetsList = null;
        }
    }

    /**
     * 加入一个自动释放的资源
     * @param asset 资源url和类型 [ useKey ]
     */
    public autoReleaseRes(asset: cc.Asset) {
        return this.appendAsset(asset);
    }

    /**
     * 直接通过asset释放资源（如cc.Prefab、cc.SpriteFrame）
     * @param asset 要释放的asset
     */
    public releaseAsset(asset: cc.Asset) {
        let idx = this.assetsList.indexOf(asset);
        if (idx >= 0) {
            this.assetsList.splice(idx, 1);
            AssetKeeper.releaseNextFrame(asset, null);
        }
    }
}