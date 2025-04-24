import { _decorator, Component, Node } from 'cc';
import Singleton from '../util/Singleton';
import engine from '../Engine';
const { ccclass, property } = _decorator;

@ccclass('GF_DynamicData')
export class GF_DynamicData extends Singleton<GF_DynamicData>() {

    //音效开关
    private _audioOpen: boolean = true

    public get audioOpen() {
        return this._audioOpen;
    }
    public set audioOpen(value: boolean) {
        this._audioOpen = value;
    }

    //震动开关
    private _shakeOpen: boolean = true

    public get shakeOpen() {
        return this._shakeOpen;
    }
    public set shakeOpen(value: boolean) {
        this._shakeOpen = value;
    }


}


