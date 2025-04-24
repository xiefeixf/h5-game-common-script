import { _decorator, Asset, assetManager, AssetManager, resources } from 'cc';
import Singleton from '../util/Singleton';
import engine from '../Engine';
import { BundlesName } from '../confg/GF_Constant';
const { ccclass } = _decorator;

@ccclass('ResManager')
export class ResManager extends Singleton<ResManager>() {

    public bundleMap: Map<string, AssetManager.Bundle> = new Map<string, AssetManager.Bundle>();
    private preloadMap: Map<string, Asset> = new Map<string, Asset>(); // 用于存储预加载的资源

    /**
     * 异步加载多个资源
     * @param urls 资源路径数组
     * @param type 资源类型
     */
    public async loadResArr(urls: string[], type: typeof Asset): Promise<void> {
        const promises = urls.map(url => this.loadResAsync(url, type));
        try {
            await Promise.all(promises);
            engine.log.trace(`所有资源加载成功`);
        } catch (error) {
            engine.log.error(`部分资源加载失败: ${error}`);
        }
    }

    /**
     * 异步加载单个资源
     * @param url 资源路径
     * @param type 资源类型
     */
    public async loadResAsync(url: string, type: typeof Asset): Promise<Asset> {
        return new Promise((resolve, reject) => {
            this.loadRes(url, type, resolve, reject);
        });
    }

    /**
     * 获取资源
     * @param name 资源名称
     * @param type 资源类型
     * @param isLog 是否记录日志
     */
    public getRes<T extends Asset>(name: string, type: typeof Asset, isLog: boolean = true): T {
        let res = this.preloadMap.get(name) as T;
        if (!res && isLog) {
            engine.log.error(`资源未找到: ${name}`);
        }
        return res;
    }

    /**
     * 加载单个资源
     * @param url 资源路径
     * @param type 资源类型
     * @param onComplete 完成回调
     * @param onErrEvent 错误回调
     */
    public loadRes(url: string, type: typeof Asset, onComplete?: Function, onErrEvent?: Function) {
        let [bundleName, ...rest] = url.split('/');
        let path = rest.join('/');
        const validValues = Object.values(BundlesName);
        let value = validValues.indexOf(bundleName);
        if (value != -1) {
            this.bundleMap.get(validValues[value]).load(path, type, (err, res) => {
                if (err || !res) {
                    onErrEvent && onErrEvent(err);
                    engine.log.error(`加载错误: ${err}, 路径: ${path}`);
                    return;
                }
                onComplete && onComplete(res);
            })
        } else {
            resources.load(url, type, (err, res) => {
                if (err || !res) {
                    onErrEvent && onErrEvent(err);
                    engine.log.error(`加载错误: ${err}, 路径: ${url}`);
                    return;
                }
                onComplete && onComplete(res);
            })
        }
    }

    /**
     * 预加载单个资源
     * @param url 资源路径
     * @param type 资源类型
     */
    public async preloadRes(url: string, type: typeof Asset): Promise<void> {
        try {
            const res = await this.loadResAsync(url, type);
            this.preloadMap.set(url, res);
            engine.log.trace(`资源预加载成功: ${url}`);
        } catch (error) {
            engine.log.error(`资源预加载失败: ${url}, 错误: ${error}`);
        }
    }

    /**
     * 预加载多个资源
     * @param urls 资源路径数组
     * @param type 资源类型
     */
    public async preloadResArr(urls: string[], type: typeof Asset): Promise<void> {
        const promises = urls.map(url => this.preloadRes(url, type));
        try {
            await Promise.all(promises);
            engine.log.trace(`所有资源预加载成功`);
        } catch (error) {
            engine.log.error(`部分资源预加载失败: ${error}`);
        }
    }

    /**
     * 加载资源包
     * @param url 资源包路径
     * @param onComplete 完成回调
     */
    public loadBundle(url: string, onComplete?: Function) {
        assetManager.loadBundle(url, (err, bundle) => {
            if (err || !bundle) {
                engine.log.error(`${url} 加载错误: ${err}`);
                return;
            }
            this.bundleMap.set(url, bundle);
            onComplete && onComplete(bundle);
        })
    }
}
