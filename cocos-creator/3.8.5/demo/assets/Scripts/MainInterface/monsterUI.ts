import { _decorator } from 'cc';
import { item_type } from './HeroUI';
import { BasicEnemyUI } from './BasicEnemyUI';
const { ccclass } = _decorator;

@ccclass('monsterUI')
export class monmonsterUIster extends BasicEnemyUI {
    Basic_type: item_type = item_type.monster;
}


