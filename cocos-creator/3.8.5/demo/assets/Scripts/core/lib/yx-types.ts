import { _decorator, ValueType } from 'cc';
const { ccclass, property } = _decorator;


/**
 * 表示索引的对象
 */
@ccclass(`YXIndexPath`)
export class YXIndexPath extends ValueType {
    public static ZERO: Readonly<YXIndexPath> = new YXIndexPath(0, 0)
    section: number = 0
    item: number = 0
    constructor(section: number, item: number) {
        super()
        this.section = section
        this.item = item
    }
    clone(): YXIndexPath {
        return new YXIndexPath(this.section, this.item)
    }
    equals(other: YXIndexPath): boolean {
        return (this.section == other.section && this.item == other.item)
    }
    set(other: YXIndexPath): void {
        this.section = other.section
        this.item = other.item
    }
    toString(): string {
        return `${this.section} - ${this.item}`
    }
}

/**
 * 表示边距的对象
 */
@ccclass(`YXEdgeInsets`)
export class YXEdgeInsets extends ValueType {

    public static ZERO: Readonly<YXEdgeInsets> = new YXEdgeInsets(0, 0, 0, 0)
    top: number
    left: number
    bottom: number
    right: number
    constructor(top: number, left: number, bottom: number, right: number) {
        super()
        this.top = top
        this.left = left
        this.bottom = bottom
        this.right = right
    }
    clone(): YXEdgeInsets {
        return new YXEdgeInsets(this.top, this.left, this.bottom, this.right)
    }
    equals(other: YXEdgeInsets): boolean {
        return (this.top == other.top && this.left == other.left && this.bottom == other.bottom && this.right == other.right)
    }
    set(other: YXEdgeInsets): void {
        this.top = other.top
        this.left = other.left
        this.bottom = other.bottom
        this.right = other.right
    }
    toString(): string {
        return `[ ${this.top}, ${this.left}, ${this.bottom}, ${this.right} ]`
    }
}
