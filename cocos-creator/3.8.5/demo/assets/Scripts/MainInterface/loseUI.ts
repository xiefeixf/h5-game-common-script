import { _decorator, Component, director, game, Node } from 'cc';
import { UIBaseView } from '../core/ui/UIBaseView';
const { ccclass, property } = _decorator;

@ccclass('loseUI')
export class loseUI extends UIBaseView {
    start() {

    }

    update(deltaTime: number) {

    }

    clickBtn() {
        director.loadScene("main");
    }
}


