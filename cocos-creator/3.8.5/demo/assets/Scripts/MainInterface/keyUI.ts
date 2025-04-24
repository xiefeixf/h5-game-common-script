import { _decorator } from 'cc';
import { item_type } from './HeroUI';
import { BasicEnemyUI } from './BasicEnemyUI';
import engine from '../core/Engine';
const { ccclass } = _decorator;

@ccclass('keyUI')
export class keyUI extends BasicEnemyUI {
    Basic_type: item_type = item_type.key;
    IsClick: boolean = false;

    click_Btn() {
        if (!this.IsClick) { return }
        engine.event.emit("atk", this);
        engine.event.emit("openDoor", this.indexID);
    }
}


