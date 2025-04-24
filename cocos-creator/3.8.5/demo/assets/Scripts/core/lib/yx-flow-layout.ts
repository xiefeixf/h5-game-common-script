import { _decorator, log, math, UITransform } from 'cc';
import { YXCollectionView, YXLayout, YXLayoutAttributes } from './yx-collection-view';
import { YXEdgeInsets, YXIndexPath } from './yx-types';
const { ccclass, property } = _decorator;

/**
 * 支持水平/垂直方向排列滚动
 */
export class YXFlowLayout extends YXLayout {

    /**
     * 滚动方向，默认垂直方向滚动
     */
    scrollDirection: YXFlowLayout.ScrollDirection = YXFlowLayout.ScrollDirection.VERTICAL

    /**
     * 是否开启分页滚动效果
     */
    pagingEnabled: boolean = false

    /**
     * @bug 如果节点大小差距很大，可能会导致计算屏幕内节点时不准确，出现节点不被正确添加到滚动视图上的问题 (使用瀑布流布局时问题明显)
     * @fix 可以通过此属性，追加屏幕显示的节点数量
     * 设置这个值会在检查是否可见的节点时，尝试检查更多的可能处于屏幕外的节点，具体设置多少要根据实际情况调试，一般如果都是正常大小的节点，不需要考虑这个配置
     * 设置负值会检查所有的节点
     */
    extraVisibleCount: number = 0

    /**
     * 元素大小
     */
    itemSize: math.Size | ((indexPath: YXIndexPath, layout: YXFlowLayout, collectionView: YXCollectionView) => math.Size) = new math.Size(100, 100)
    getItemSize(): math.Size {
        if (this.itemSize instanceof Function == false) {
            return this.itemSize
        }
        throw new Error("YXFlowLayout: 动态配置的布局参数不支持直接获取，请检查自己的布局逻辑并谨慎的通过动态配置自己获取，注意避免死循环");
    }

    /**
     * 元素之间垂直间距
     */
    verticalSpacing: number | ((section: number, layout: YXFlowLayout, collectionView: YXCollectionView) => number) = 0
    getVerticalSpacing(): number {
        if (this.verticalSpacing instanceof Function == false) {
            return this.verticalSpacing
        }
        throw new Error("YXFlowLayout: 动态配置的布局参数不支持直接获取，请检查自己的布局逻辑并谨慎的通过动态配置自己获取，注意避免死循环");
    }

    /**
     * 元素之间水平间距
     */
    horizontalSpacing: number | ((section: number, layout: YXFlowLayout, collectionView: YXCollectionView) => number) = 0
    getHorizontalSpacing(): number {
        if (this.horizontalSpacing instanceof Function == false) {
            return this.horizontalSpacing
        }
        throw new Error("YXFlowLayout: 动态配置的布局参数不支持直接获取，请检查自己的布局逻辑并谨慎的通过动态配置自己获取，注意避免死循环");
    }

    /**
     * 边距
     */
    sectionInset: YXEdgeInsets | ((section: number, layout: YXFlowLayout, collectionView: YXCollectionView) => YXEdgeInsets) = YXEdgeInsets.ZERO
    getSectionInset(): YXEdgeInsets {
        if (this.sectionInset instanceof Function == false) {
            return this.sectionInset
        }
        throw new Error("YXFlowLayout: 动态配置的布局参数不支持直接获取，请检查自己的布局逻辑并谨慎的通过动态配置自己获取，注意避免死循环");
    }

    prepare(collectionView: YXCollectionView): void {
        if (this.scrollDirection == YXFlowLayout.ScrollDirection.HORIZONTAL) {
            this._horizontal(collectionView)
            return
        }
        if (this.scrollDirection == YXFlowLayout.ScrollDirection.VERTICAL) {
            this._vertical(collectionView)
            return
        }
    }

    initOffset(collectionView: YXCollectionView): void {
        if (this.scrollDirection == YXFlowLayout.ScrollDirection.HORIZONTAL) {
            collectionView.scrollView.scrollToLeft(0)
            return
        }
        if (this.scrollDirection == YXFlowLayout.ScrollDirection.VERTICAL) {
            collectionView.scrollView.scrollToTop(0)
            return
        }
    }

    targetOffset(collectionView: YXCollectionView, touchMoveVelocity: math.Vec3, startOffset: math.Vec2): { offset: math.Vec2; time: number; } {
        if (this.pagingEnabled == false) {
            return null
        }
        let offset = collectionView.scrollView.getScrollOffset()
        offset.x = - offset.x
        let threshold = 0.2
        if (this.scrollDirection == YXFlowLayout.ScrollDirection.HORIZONTAL) {
            let idx = Math.round(offset.x / collectionView.scrollView.view.width)
            let r = touchMoveVelocity.x / collectionView.scrollView.view.width
            if (startOffset && Math.abs(r) >= threshold) {
                idx = Math.round(startOffset.x / collectionView.scrollView.view.width) + (r > 0 ? -1 : 1)
            }
            offset.x = idx * collectionView.scrollView.view.width
        }
        if (this.scrollDirection == YXFlowLayout.ScrollDirection.VERTICAL) {
            let idx = Math.round(offset.y / collectionView.scrollView.view.height)
            let r = touchMoveVelocity.y / collectionView.scrollView.view.height
            if (startOffset && Math.abs(r) >= threshold) {
                idx = Math.round(startOffset.y / collectionView.scrollView.view.height) + (r > 0 ? 1 : -1)
            }
            offset.y = idx * collectionView.scrollView.view.height
        }
        return { offset: offset, time: 0.25 }
    }

    layoutAttributesForElementsInRect(rect: math.Rect, collectionView: YXCollectionView): YXLayoutAttributes[] {
        if (this.extraVisibleCount < 0) {
            return super.layoutAttributesForElementsInRect(rect, collectionView)
        }
        let midIdx = -1
        let left = 0
        let right = this.attributes.length - 1

        while (left <= right && right >= 0) {
            let mid = left + (right - left) / 2
            mid = Math.floor(mid)
            let attr = this.attributes[mid]
            if (rect.intersects(attr.frame)) {
                midIdx = mid
                break
            }
            if (rect.yMax < attr.frame.yMin || rect.xMax < attr.frame.xMin) {
                right = mid - 1
            } else {
                left = mid + 1
            }
        }
        if (midIdx < 0) {
            return super.layoutAttributesForElementsInRect(rect, collectionView)
        }

        let result = []
        result.push(this.attributes[midIdx])

        let startIdx = midIdx
        while (startIdx > 0) {
            let idx = startIdx - 1
            let attr = this.attributes[idx]
            if (rect.intersects(attr.frame) == false) {
                break
            }
            result.push(attr)
            startIdx = idx
        }

        let extra_left = this.extraVisibleCount
        while (extra_left > 0) {
            let idx = startIdx - 1
            if (idx < 0) { break }
            let attr = this.attributes[idx]
            if (rect.intersects(attr.frame)) { result.push(attr) }
            startIdx = idx
            extra_left--
        }

        let endIdx = midIdx
        while (endIdx < this.attributes.length - 1) {
            let idx = endIdx + 1
            let attr = this.attributes[idx]
            if (rect.intersects(attr.frame) == false) {
                break
            }
            result.push(attr)
            endIdx = idx
        }
        
        let extra_right = this.extraVisibleCount
        while (extra_right > 0) {
            let idx = endIdx + 1
            if (idx >= this.attributes.length) { break }
            let attr = this.attributes[idx]
            if (rect.intersects(attr.frame)) { result.push(attr) }
            endIdx = idx
            extra_right--
        }

        return result
    }

    layoutAttributesForItemAtIndexPath(indexPath: YXIndexPath, collectionView: YXCollectionView): YXLayoutAttributes {
        let left = 0
        let right = this.attributes.length - 1

        while (left <= right && right >= 0) {
            let mid = left + (right - left) / 2
            mid = Math.floor(mid)
            let attr = this.attributes[mid]
            if (attr.indexPath.equals(indexPath)) {
                return attr
            }
            if (attr.indexPath.section < indexPath.section || (attr.indexPath.section == indexPath.section && attr.indexPath.item < indexPath.item)) {
                left = mid + 1
            } else {
                right = mid - 1
            }
        }
        return super.layoutAttributesForItemAtIndexPath(indexPath, collectionView)
    }

    private _horizontal(collectionView: YXCollectionView) {
        collectionView.scrollView.horizontal = true
        collectionView.scrollView.vertical = false
        let contentSize = collectionView.node.getComponent(UITransform).contentSize.clone()
        let allAttributes: YXLayoutAttributes[] = []

        let numberOfSections = collectionView.numberOfSections instanceof Function ? collectionView.numberOfSections(collectionView) : collectionView.numberOfSections

        let sectionMaxX = 0
        for (let section = 0; section < numberOfSections; section++) {
            let numberOfItems = collectionView.numberOfItems instanceof Function ? collectionView.numberOfItems(section, collectionView) : collectionView.numberOfItems
            let verticalSpacing = this.verticalSpacing instanceof Function ? this.verticalSpacing(section, this, collectionView) : this.verticalSpacing
            let horizontalSpacing = this.horizontalSpacing instanceof Function ? this.horizontalSpacing(section, this, collectionView) : this.horizontalSpacing
            let sectionInset = this.sectionInset instanceof Function ? this.sectionInset(section, this, collectionView) : this.sectionInset

            sectionMaxX += sectionInset.left

            let currentX = sectionMaxX;
            let currentY = sectionInset.top;
            let maxWidthInRow = 0;

            for (let item = 0; item < numberOfItems; item++) {
                let indexPath = new YXIndexPath(section, item)
                let itemSize = this.itemSize instanceof Function ? this.itemSize(indexPath, this, collectionView) : this.itemSize

                let attributes = new YXLayoutAttributes()
                attributes.indexPath = indexPath
                if (currentY + itemSize.height <= contentSize.height - sectionInset.bottom) {
                    attributes.frame = new math.Rect(currentX, currentY, itemSize.width, itemSize.height)
                    currentY = currentY + itemSize.height + verticalSpacing
                    maxWidthInRow = Math.max(maxWidthInRow, itemSize.width)
                } else {
                    currentX = currentX + maxWidthInRow + horizontalSpacing
                    currentY = sectionInset.top
                    attributes.frame = new math.Rect(currentX, currentY, itemSize.width, itemSize.height)
                    currentY = currentY + itemSize.height + verticalSpacing
                    maxWidthInRow = itemSize.width
                }
                allAttributes.push(attributes)
                sectionMaxX = Math.max(sectionMaxX, attributes.frame.xMax)
            }
            sectionMaxX += sectionInset.right
        }

        this.attributes = allAttributes
        contentSize.width = Math.max(contentSize.width, sectionMaxX)
        this.contentSize = contentSize
    }

    private _vertical(collectionView: YXCollectionView) {
        collectionView.scrollView.horizontal = false
        collectionView.scrollView.vertical = true
        let contentSize = collectionView.node.getComponent(UITransform).contentSize.clone()
        let allAttributes: YXLayoutAttributes[] = []

        let numberOfSections = collectionView.numberOfSections instanceof Function ? collectionView.numberOfSections(collectionView) : collectionView.numberOfSections

        let sectionMaxY = 0
        for (let section = 0; section < numberOfSections; section++) {
            let numberOfItems = collectionView.numberOfItems instanceof Function ? collectionView.numberOfItems(section, collectionView) : collectionView.numberOfItems
            let verticalSpacing = this.verticalSpacing instanceof Function ? this.verticalSpacing(section, this, collectionView) : this.verticalSpacing
            let horizontalSpacing = this.horizontalSpacing instanceof Function ? this.horizontalSpacing(section, this, collectionView) : this.horizontalSpacing
            let sectionInset = this.sectionInset instanceof Function ? this.sectionInset(section, this, collectionView) : this.sectionInset

            sectionMaxY += sectionInset.top

            let currentX = sectionInset.left;
            let currentY = sectionMaxY;
            let maxHeightInRow = 0;

            for (let item = 0; item < numberOfItems; item++) {
                let indexPath = new YXIndexPath(section, item)
                let itemSize = this.itemSize instanceof Function ? this.itemSize(indexPath, this, collectionView) : this.itemSize

                let attributes = new YXLayoutAttributes()
                attributes.indexPath = indexPath
                if (currentX + itemSize.width <= contentSize.width - sectionInset.right) {
                    attributes.frame = new math.Rect(currentX, currentY, itemSize.width, itemSize.height)
                    currentX = currentX + itemSize.width + horizontalSpacing
                    maxHeightInRow = Math.max(maxHeightInRow, itemSize.height)
                } else {
                    currentX = sectionInset.left
                    currentY = currentY + maxHeightInRow + verticalSpacing
                    attributes.frame = new math.Rect(currentX, currentY, itemSize.width, itemSize.height)
                    currentX = currentX + itemSize.width + horizontalSpacing
                    maxHeightInRow = itemSize.height
                }
                allAttributes.push(attributes)
                sectionMaxY = Math.max(sectionMaxY, attributes.frame.yMax)
            }
            sectionMaxY += sectionInset.bottom
        }

        this.attributes = allAttributes
        contentSize.height = Math.max(contentSize.height, sectionMaxY)
        this.contentSize = contentSize
    }
}

export namespace YXFlowLayout {
    /**
     * 滚动方向
     */
    export enum ScrollDirection {
        /**
         * 水平滚动
         */
        HORIZONTAL,

        /**
         * 垂直滚动
         */
        VERTICAL,
    }
}