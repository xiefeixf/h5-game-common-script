/*
 * 资源管理器 
 */

import { Asset, resources } from "cc";
import Singleton from "../util/Singleton";
import engine from "../Engine";



export class AssetsLoader extends Singleton<AssetsLoader>() {



    public loadRes(path: string, type: typeof Asset, onComplete: (assets: Asset) => void) {
        let res = resources.get(path, Asset);
        if (!res) {
            resources.load(path, type, (err, res) => {
                if (err) { return engine.log.error(`【AssetsLoader】: ${path} : ${err}`); }
                onComplete(res);
            });
        } else {
            onComplete(res);
        }
    }





}