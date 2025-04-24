import { _decorator, math, v3 } from 'cc';
import { YXCollectionView, YXLayoutAttributes } from './yx-collection-view';
import { YXEdgeInsets, YXIndexPath } from './yx-types';
import { YXFlowLayout } from './yx-flow-layout';
const { ccclass, property } = _decorator;

/**
 * 用来实现突出选中节点效果的布局规则
 */
export class YXCoverLayout extends YXFlowLayout {

    mode: YXCoverLayout.Mode = YXCoverLayout.Mode.DEFAULT

    /**
     * 禁止外部使用的父类属性
     */
    sectionInset: never
    getSectionInset(): never { return this.sectionInset }

    /**
     * 元素大小
     */
    itemSize: math.Size = null
    getItemSize(): math.Size { return this.itemSize }

    /**
     * 非选中节点的缩放系数
     */
    scaleValue: number = 0.8

    /**
     * 构造函数，此类布局必须要确定节点大小属性
     * @param itemSize 
     */
    constructor(itemSize: math.Size) {
        super()
        this.itemSize = itemSize
    }

    prepare(collectionView: YXCollectionView): void {
        let pad_horizontal = (collectionView.scrollView.view.width - this.itemSize.width) * 0.5
        let pad_vertical = (collectionView.scrollView.view.height - this.itemSize.height) * 0.5
        this.sectionInset = new YXEdgeInsets(pad_vertical, pad_horizontal, pad_vertical, pad_horizontal) as never
        super.prepare(collectionView)
    }

    targetOffset(collectionView: YXCollectionView, touchMoveVelocity: math.Vec3, startOffset: math.Vec2): { offset: math.Vec2; time: number; } {
        if (this.pagingEnabled == false) {
            return null
        }

        let offset = collectionView.scrollView.getScrollOffset()
        offset.x = - offset.x

        // 找出离屏幕中心最近的节点
        let visibleRect = new math.Rect()
        visibleRect.origin = collectionView.scrollView.getScrollOffset()
        visibleRect.x = - visibleRect.x
        visibleRect.size = collectionView.scrollView.view.contentSize
        let result = this.layoutAttributesForElementsInRect(visibleRect, collectionView)

        let target: YXLayoutAttributes = null
        if (this.scrollDirection == YXFlowLayout.ScrollDirection.HORIZONTAL) {
            let mid = offset.x + collectionView.scrollView.view.width * 0.5
            result.forEach((element) => {
                let distance1 = Math.abs(element.frame.center.x - mid)
                let distance2 = target ? Math.abs(target.frame.center.x - mid) : null
                if (distance2 == null || distance1 < distance2) {
                    target = element
                }
            })
            offset.x = target.frame.center.x - collectionView.scrollView.view.width * 0.5
        }
        if (this.scrollDirection == YXFlowLayout.ScrollDirection.VERTICAL) {
            let mid = offset.y + collectionView.scrollView.view.height * 0.5
            result.forEach((element) => {
                let distance1 = Math.abs(element.frame.center.y - mid)
                let distance2 = target ? Math.abs(target.frame.center.y - mid) : null
                if (distance2 == null || distance1 < distance2) {
                    target = element
                }
            })
            offset.y = target.frame.center.y - collectionView.scrollView.view.height * 0.5
        }
        return { offset: offset, time: 0.25 }
    }

    scrollTo(indexPath: YXIndexPath, collectionView: YXCollectionView): math.Vec2 {
        let attr = this.layoutAttributesForItemAtIndexPath(indexPath, collectionView)
        if (attr) {
            let offset = attr.frame.origin
            if (this.scrollDirection == YXFlowLayout.ScrollDirection.HORIZONTAL) {
                offset.x = offset.x - (collectionView.scrollView.view.width - attr.frame.width) * 0.5
            }
            if (this.scrollDirection == YXFlowLayout.ScrollDirection.VERTICAL) {
                offset.y = offset.y - (collectionView.scrollView.view.height - attr.frame.height) * 0.5
            }
            return offset
        }
        return null
    }

    layoutAttributesForElementsInRect(rect: math.Rect, collectionView: YXCollectionView): YXLayoutAttributes[] {
        let result = super.layoutAttributesForElementsInRect(rect, collectionView)
        let offset = collectionView.scrollView.getScrollOffset()
        offset.x = - offset.x

        let scale = this.scaleValue

        if (this.scrollDirection == YXFlowLayout.ScrollDirection.HORIZONTAL) {
            let mid = offset.x + collectionView.scrollView.view.width * 0.5
            result.forEach((element) => {
                let distance = Math.abs(element.frame.center.x - mid)
                let progress = distance / this.itemSize.width
                progress = Math.min(1, progress)
                let scaleValue = 1 - (1 - scale) * progress
                element.scale = v3(scaleValue, scaleValue, 1)
                element.zIndex = 1 - progress
            })
        }

        if (this.scrollDirection == YXFlowLayout.ScrollDirection.VERTICAL) {
            let mid = offset.y + collectionView.scrollView.view.height * 0.5
            result.forEach((element) => {
                let distance = Math.abs(element.frame.center.y - mid)
                let progress = distance / this.itemSize.height
                progress = Math.min(1, progress)
                let scaleValue = 1 - (1 - scale) * progress
                element.scale = v3(scaleValue, scaleValue, 1)
                element.zIndex = 1 - progress
            })
        }

        return result
    }

    shouldUpdateAttributesZIndex(): boolean {
        return true
    }
}

export namespace YXCoverLayout {
    export enum Mode {
        /**
         * 缩放非选中的节点
         */
        DEFAULT,
    }
}