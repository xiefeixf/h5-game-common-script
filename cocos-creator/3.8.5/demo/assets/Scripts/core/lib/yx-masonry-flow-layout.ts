import { _decorator, Component, log, math, Node, UITransform } from 'cc';
import { YXCollectionView, YXLayout, YXLayoutAttributes } from './yx-collection-view';
import { YXEdgeInsets, YXIndexPath } from './yx-types';
import { YXFlowLayout } from './yx-flow-layout';
const { ccclass, property } = _decorator;

/**
 * 瀑布流布局方案
 */
export class YXMasonryFlowLayout extends YXFlowLayout {

    /**
     * 分几行(水平滚动模式下)或者几列(垂直滚动模式下)展示
     */
    divide: number | ((section: number, layout: YXMasonryFlowLayout, collectionView: YXCollectionView) => number) = 1

    /**
     * @see YXFlowLayout.extraVisibleCount
     */
    extraVisibleCount: number = 10

    /**
     * 水平滚动模式下，仅宽度生效
     * 垂直滚动模式下，仅高度生效
     */
    itemSize: math.Size | ((indexPath: YXIndexPath, layout: YXFlowLayout, collectionView: YXCollectionView) => math.Size) = new math.Size(100, 100);

    prepare(collectionView: YXCollectionView): void {
        if (this.scrollDirection == YXMasonryFlowLayout.ScrollDirection.HORIZONTAL) {
            this._masonry_horizontal(collectionView)
            return
        }
        if (this.scrollDirection == YXMasonryFlowLayout.ScrollDirection.VERTICAL) {
            this._masonry_vertical(collectionView)
            return
        }
    }

    private _masonry_horizontal(collectionView: YXCollectionView) {
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
            let divide = this.divide instanceof Function ? this.divide(section, this, collectionView) : this.divide
            let itemHeight = (contentSize.height - sectionInset.top - sectionInset.bottom - (divide - 1) * verticalSpacing) / divide

            sectionMaxX += sectionInset.left
            // 初始化区布局信息，key=行，value=目前此行最右边的位置
            let sectionInfos = {}
            for (let divideIdx = 0; divideIdx < divide; divideIdx++) {
                sectionInfos[`${divideIdx}`] = sectionMaxX
            }

            for (let item = 0; item < numberOfItems; item++) {
                let indexPath = new YXIndexPath(section, item)
                let itemSize = this.itemSize instanceof Function ? this.itemSize(indexPath, this, collectionView) : this.itemSize
                itemSize.height = itemHeight

                // 查找目前最短的行，在最短的行后面插入节点
                let x = null
                let y = null
                let idx = null
                for (let divideIdx = 0; divideIdx < divide; divideIdx++) {
                    let max = sectionInfos[`${divideIdx}`]
                    if (x == null || max < x) {
                        idx = divideIdx
                        x = max
                        y = sectionInset.top + (itemHeight + verticalSpacing) * divideIdx
                    }
                }

                let attributes = new YXLayoutAttributes()
                attributes.indexPath = indexPath
                attributes.frame = new math.Rect(x + horizontalSpacing, y, itemSize.width, itemSize.height)
                allAttributes.push(attributes)

                sectionInfos[`${idx}`] = attributes.frame.xMax
                sectionMaxX = Math.max(sectionMaxX, attributes.frame.xMax)
            }
            sectionMaxX += sectionInset.right
        }

        this.attributes = allAttributes
        contentSize.width = Math.max(contentSize.width, sectionMaxX)
        this.contentSize = contentSize
    }

    private _masonry_vertical(collectionView: YXCollectionView) {
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
            let divide = this.divide instanceof Function ? this.divide(section, this, collectionView) : this.divide
            let itemWidth = (contentSize.width - sectionInset.left - sectionInset.right - (divide - 1) * horizontalSpacing) / divide

            sectionMaxY += sectionInset.top
            // 初始化区布局信息，key=列，value=目前此列最底部的位置
            let sectionInfos = {}
            for (let divideIdx = 0; divideIdx < divide; divideIdx++) {
                sectionInfos[`${divideIdx}`] = sectionMaxY
            }

            for (let item = 0; item < numberOfItems; item++) {
                let indexPath = new YXIndexPath(section, item)
                let itemSize = this.itemSize instanceof Function ? this.itemSize(indexPath, this, collectionView) : this.itemSize
                itemSize.width = itemWidth

                // 查找目前最短的列，在最短的列下面插入节点
                let x = null
                let y = null
                let idx = null
                for (let divideIdx = 0; divideIdx < divide; divideIdx++) {
                    let max = sectionInfos[`${divideIdx}`]
                    if (y == null || max < y) {
                        idx = divideIdx
                        y = max
                        x = sectionInset.left + (itemWidth + horizontalSpacing) * divideIdx
                    }
                }

                let attributes = new YXLayoutAttributes()
                attributes.indexPath = indexPath
                attributes.frame = new math.Rect(x, y + verticalSpacing, itemSize.width, itemSize.height)
                allAttributes.push(attributes)

                sectionInfos[`${idx}`] = attributes.frame.yMax
                sectionMaxY = Math.max(sectionMaxY, attributes.frame.yMax)
            }
            sectionMaxY += sectionInset.bottom
        }

        this.attributes = allAttributes
        contentSize.height = Math.max(contentSize.height, sectionMaxY)
        this.contentSize = contentSize
    }
}
