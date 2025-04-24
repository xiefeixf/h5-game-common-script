
import { Asset, assetManager, AssetManager, EventTarget, resources, sys } from "cc";
import { GUIOptions } from "./Defines";

const trace = function (...args) {
    console.log("GUILoader", ...args);
};

const traceError = function (...args) {
    console.log("GUILoader", ...args);
};

const enum AssetsLoaderState {
    LOADING = 0,
    WAIT = 1,
}

type CALL = Array<(res: Asset) => void>;

export class GUILoader<T extends Asset> extends EventTarget {
    private _callbacks: Map<string, CALL> = new Map<string, CALL>();

    private _assetsType: any = null;

    public complete: Function = null;

    constructor(type: { new(): T }) {
        super();
        this._assetsType = type;
    }

    public dispose() {
        // this._urls.length = 0;
        this._assetsType = null;
        this.complete = null;
        this._callbacks.clear();
        this._callbacks = null;
    }

    formatPath(bundle: AssetManager.Bundle, path: string) {
        let result = {
            rpath: path,
            kpath: path,
        };
        let p = path.indexOf("|");
        if (p > 0) {
            result.rpath = path.substring(p + 1);
        } else {
            if (bundle !== resources) {
                result.kpath = bundle.name + "|" + path;
            }
        }
        return result;
    }
    /**
     * 预加载资源
     * @param url
     * @param opts
     */
    public preload(url: string, opts: GUIOptions) {
        let bundleRes: AssetManager.Bundle = null;
        if (opts && opts.bundle) {
            if (!assetManager.bundles.has(opts.bundle)) {
                return assetManager.loadBundle(opts.bundle, (err, bundle) => {
                    if (!err && bundle) {
                        this._assetsType && bundle.preload(url, this._assetsType);
                    } else {
                        traceError("preload", err, bundle);
                    }
                });
            } else {
                bundleRes = assetManager.getBundle(opts.bundle);
            }
        } else {
            bundleRes = resources;
        }
        if (bundleRes) {
            if (bundleRes.get(url, this._assetsType)) {
                return;
            }
            // 预加载资源预制体
            bundleRes.preload(url, this._assetsType);
        }
    }

    private _get_res(bundle: AssetManager.Bundle, path: string, callback: (res: T) => void) {
        let pathInfo = this.formatPath(bundle, path);
        let res = bundle.get(pathInfo.rpath, this._assetsType);
        if (res) {
            callback(<T>res);
        } else {
            let cbcs = this._callbacks.get(pathInfo.kpath);
            if (!cbcs) {
                this._callbacks.set(pathInfo.kpath, [callback]);
            } else {
                cbcs.push(callback);
            }
            this._loadRes(bundle, pathInfo.rpath, 1);
        }
    }
    /**
     * 获取资源
     * @param path
     * @param callback
     */
    public getRes(rpath: string, opts: GUIOptions, callback: (res: T) => void) {
        if (opts && opts.bundle) {
            let bundle = assetManager.getBundle(opts.bundle);
            if (bundle) {
                this._get_res(bundle, rpath, callback);
            } else {
                assetManager.loadBundle(opts.bundle, (err, lbundle) => {
                    if (!err && lbundle) {
                        this._assetsType && this._get_res(lbundle, rpath, callback);
                    } else {
                        traceError(err, lbundle);
                    }
                });
            }
        } else {
            this._get_res(resources, rpath, callback);
        }
    }

    private _loadRes(bundle: AssetManager.Bundle, url: string, retry: number) {
        if (!url) {
            return;
        }
        let pathInfo = this.formatPath(bundle, url);
        let res: T = bundle.get(pathInfo.rpath, this._assetsType);
        if (res) {
            return this._$loadComplete(pathInfo.kpath, res);
        }
        // trace(`下载资源 ${url}`);
        bundle.load(pathInfo.rpath, this._assetsType, (error, resource) => {
            if (!this._assetsType) {
                return;
            }
            if (sys.isNative) {
                return this._$loadComplete(pathInfo.kpath, resource);
            }
            if (error) {
                traceError(error, resource);
            }
            if (error && !resource) {
                traceError("loadres failed " + pathInfo.kpath, error);
                if (retry > 0) {
                    this._loadRes(bundle, pathInfo.rpath, retry - 1);
                } else {
                    this._$loadComplete(pathInfo.kpath, null);
                }
                return;
            }
            this._$loadComplete(pathInfo.kpath, resource);
        });
    }
    private _$loadComplete(kpath: string, res: any) {
        let cbs = this._callbacks.get(kpath);
        if (cbs) {
            // 删除回调索引对象
            this._callbacks.delete(kpath);
            for (let cb of cbs) {
                cb(res);
            }
        }
    }
}
