import { __private, _decorator, Component, Event, EventMouse, EventTouch, instantiate, log, Mask, math, Node, NodeEventType, NodePool, Prefab, ScrollView, UITransform, Vec3 } from 'cc';
import { YXIndexPath } from './yx-types';
const { ccclass, property, requireComponent, disallowMultiple, help } = _decorator;

/**
 * 私有组件
 * cell 节点添加到 YXCollectionView 上时，自动挂载此组件，用来记录一些实时参数
 */
class _cell_ extends Component {
    /**
     * 此节点是通过哪个标识符创建的
     */
    identifier: string

    /**
     * 此节点目前绑定的布局属性
     */
    attributes: YXLayoutAttributes
}

/**
 * 私有组件
 * 内部滚动视图组件
 * https://github.com/cocos/cocos-engine/blob/v3.8.0/cocos/ui/scroll-view.ts
 */
class _scroll_view extends ScrollView {
    /**
     * 禁掉鼠标滚轮
     */
    protected _onMouseWheel(event: EventMouse, captureListeners?: Node[]): void { }

    /**
     * 准备开始惯性滚动
     * @param touchMoveVelocity 手势速度
     */
    protected _startInertiaScroll(touchMoveVelocity: math.Vec3): void {
        super._startInertiaScroll(touchMoveVelocity)
        if (this._yxOnStartInertiaScroll) { this._yxOnStartInertiaScroll(touchMoveVelocity) }
    }
    _yxOnStartInertiaScroll: (touchMoveVelocity: math.Vec3) => void

    protected _onTouchBegan(event: EventTouch, captureListeners?: Node[]): void {
        if (this.node.getComponent(YXCollectionView).scrollEnabled == false) { return }
        let nodes: Node[] = [event.target]
        if (captureListeners) { nodes = nodes.concat(captureListeners) }
        for (let index = 0; index < nodes.length; index++) {
            const element = nodes[index];
            // 清空滚动节点标记
            element[`_yx_scroll_target`] = null
            // 记录开始滚动时的偏移量，如果这是个 YXCollectionView 节点的话
            let collectionView = element.getComponent(YXCollectionView)
            if (collectionView) {
                let offset = collectionView.scrollView.getScrollOffset()
                offset.x = - offset.x
                collectionView[`_scroll_offset_on_touch_start`] = offset
            }
        }
        super._onTouchBegan(event, captureListeners)
    }
    protected _onTouchMoved(event: EventTouch, captureListeners?: Node[]): void {
        if (this.node.getComponent(YXCollectionView).scrollEnabled == false) { return }
        // 处理嵌套冲突，每次只滚动需要滚动的列表
        let scrollTarget = this._yxGetScrollTarget(event, captureListeners)
        if (this.node === scrollTarget) {
            super._onTouchMoved(event, captureListeners)
        }
    }
    protected _onTouchCancelled(event: EventTouch, captureListeners?: Node[]): void {
        super._onTouchCancelled(event, captureListeners)
    }
    protected _onTouchEnded(event: EventTouch, captureListeners?: Node[]): void {
        super._onTouchEnded(event, captureListeners)
    }

    protected _hasNestedViewGroup(event: Event, captureListeners?: Node[]): boolean {
        // 直接把所有的列表都标记为可滑动，具体滑动哪一个，去 _onTouchMoved 判断
        return false
    }

    protected _stopPropagationIfTargetIsMe(event: Event): void {
        if (this._touchMoved) {
            event.propagationStopped = true;
            return
        }
        super._stopPropagationIfTargetIsMe(event)
    }

    /**
     * 获取本次滑动是要滑动哪个列表
     */
    private _yxGetScrollTarget(event: EventTouch, captureListeners?: Node[]): Node {
        // 尝试获取本次已经确定了的滚动节点
        let cache = event.target[`_yx_scroll_target`]
        if (cache) {
            return cache
        }

        let nodes: Node[] = [event.target]
        if (captureListeners) {
            nodes = nodes.concat(captureListeners)
        }
        if (nodes.length == 1) { return nodes[0] } // 无需处理冲突

        let touch = event.touch;
        let deltaMove = touch.getLocation().subtract(touch.getStartLocation());
        let x = Math.abs(deltaMove.x)
        let y = Math.abs(deltaMove.y)
        let distance = Math.abs(x - y)
        if (distance < 5) {
            return null // 不足以计算出方向
        }
        /** @todo 边界检测，滑动到边缘时滑动事件交给其他可滑动列表 */

        let result = null
        for (let index = 0; index < nodes.length; index++) {
            const element = nodes[index];
            let scrollComp = element.getComponent(_scroll_view)
            if (scrollComp) {
                let collectionView = element.getComponent(YXCollectionView)
                if (collectionView && collectionView.scrollEnabled == false) { continue } // 不支持滚动
                if (result == null) { result = element } // 取第一个滚动组件作为默认响应者
                if (scrollComp.horizontal && scrollComp.vertical) { continue } // 全方向滚动暂时不处理
                if (!scrollComp.horizontal && !scrollComp.vertical) { continue } // 不支持滚动的也不处理
                if (scrollComp.horizontal && x > y) {
                    result = element
                    break
                }
                if (scrollComp.vertical && y > x) {
                    result = element
                    break
                }
            }
        }

        // 给所有捕获到的节点都保存一份，方便任意一个节点都可以读到
        if (result) {
            for (let index = 0; index < nodes.length; index++) {
                const element = nodes[index];
                element[`_yx_scroll_target`] = result
            }
        }
        return result
    }
}

/**
 * 节点的布局属性
 */
export class YXLayoutAttributes {
    /**
     * 节点索引
     */
    indexPath: YXIndexPath = null

    /**
     * 节点在滚动视图中的位置和大小属性
     * origin 属性表示节点在父视图坐标系中的左上角的位置，size 属性表示节点的宽度和高度
     */
    frame: math.Rect = null

    /**
     * 节点层级
     * 越小会越早的添加到滚动视图上
     * https://docs.cocos.com/creator/manual/zh/ui-system/components/editor/ui-transform.html?h=uitrans
     * 备注: 内部暂时是通过节点的 siblingIndex 实现的，如果自定义 layout 有修改这个值的需求，需要重写 layout 的 @shouldUpdateAttributesZIndex 方法，默认情况下会忽略这个配置
     */
    zIndex: number = 0

    /**
     * 节点变换 - 缩放
     */
    scale: math.Vec3 = null

    /**
     * 节点变换 - 平移
     */
    offset: math.Vec3 = null

    /**
     * 节点变换 - 旋转
     * 备注: 3D 变换似乎需要透视相机???
     */
    eulerAngles: math.Vec3 = null

    /**
     * 克隆当前布局属性
     */
    clone(): YXLayoutAttributes {
        let result = new YXLayoutAttributes()
        result.indexPath = this.indexPath?.clone()
        result.frame = this.frame?.clone()
        result.scale = this.scale?.clone()
        result.offset = this.offset?.clone()
        result.eulerAngles = this.eulerAngles?.clone()
        return result
    }
}

/**
 * 布局规则
 * 这里只是约定出了一套接口，内部只是一些基础实现，具体布局方案通过子类重载去实现
 */
export abstract class YXLayout {
    constructor() { }

    /**
     * @required
     * 整个滚动区域大小
     * 需要在 @prepare 内初始化
     */
    contentSize: math.Size = math.Size.ZERO

    /**
     * @required
     * 所有元素的布局属性
     * 需要在 @prepare 内初始化
     */
    attributes: YXLayoutAttributes[] = []

    /**
     * @required
     * 子类重写实现布局方案
     * 注意: 必须初始化滚动区域大小并赋值给 @contentSize 属性
     * 注意: 必须初始化所有的元素布局属性，并保存到 @attributes 数组
     */
    abstract prepare(collectionView: YXCollectionView): void

    /**
     * @optional
     * 列表在首次更新数据后会执行这个方法
     * 在这个方法里设置滚动视图的初始偏移量
     */
    initOffset(collectionView: YXCollectionView) { }

    /**
     * @optional
     * 当一次手势拖动结束后会立即调用此方法
     * 实现这个方法的话滚动视图会自动滚动到此方法返回的位置
     * @param touchMoveVelocity 本次手势拖动速度
     * @param startOffset 本次手势拖动开始时滚动视图的偏移位置
     * @returns null 不处理
     */
    targetOffset(collectionView: YXCollectionView, touchMoveVelocity: math.Vec3, startOffset: math.Vec2): { offset: math.Vec2, time: number } { return null }

    /**
     * @optional
     * 返回区域内可见的节点属性，并实时的调整这些节点变换效果
     * 根据实际的布局情况，计算出当前屏幕内需要显示的布局属性
     * 这个方法会直接影响到列表的性能，如果在自定义的时候对性能要求不高(比如明确知道数据量不多的情况下)，可以忽略此方法
     * @param rect 当前滚动视图的可见区域
     */
    layoutAttributesForElementsInRect(rect: math.Rect, collectionView: YXCollectionView): YXLayoutAttributes[] { return this.attributes }

    /**
     * @optional
     * 通过索引查找布局属性，默认 Array.find()
     * @param indexPath 
     * @param collectionView 
     */
    layoutAttributesForItemAtIndexPath(indexPath: YXIndexPath, collectionView: YXCollectionView): YXLayoutAttributes {
        return this.attributes.find((a) => a.indexPath.equals(indexPath))
    }

    /**
     * @optional
     * YXCollectionView 在调用 @scrollTo 方法时会触发这个方法，如果实现了这个方法，最终的滚动停止位置以这个方法返回的为准
     * @param indexPath 
     * @returns 滚动视图偏移位置
     */
    scrollTo(indexPath: YXIndexPath, collectionView: YXCollectionView): math.Vec2 { return null }

    /**
     * @optional
     * @see YXLayoutAttributes.zIndex
     * @returns 
     */
    shouldUpdateAttributesZIndex(): boolean { return false }
}

/**
 * @see NodePool.poolHandlerComp
 * 节点的自定义组件可以通过这个接口跟 @NodePool 的重用业务关联起来
 */
export interface YXCollectionViewCell extends Component {
    unuse(): void;
    reuse(args: any): void;
}

@ccclass('YXCollectionView')
@disallowMultiple(true)
@help(``)
export class YXCollectionView extends Component {

    /**
     * 版本号
     */
    static get VERSION(): string { return `1.0.0` }


    @property(Prefab)
    item: Prefab = null

    /**
     * 滚动视图组件
     */
    get scrollView(): ScrollView {
        let result = this.node.getComponent(_scroll_view)
        if (result == null) {
            result = this.node.addComponent(_scroll_view)
            // 配置 scroll view 默认参数
            result.brake = 0.6
        }
        if (result.content == null) {
            let content = new Node(`View`)
            content.parent = this.customParent || result.node
            content.layer = content.parent.layer

            let transform = content.getComponent(UITransform) || content.addComponent(UITransform)
            transform.contentSize = this.node.getComponent(UITransform).contentSize

            result.content = content
        }

        if (this.mask) {
            let mask = result.node.getComponent(Mask)
            if (mask == null) {
                mask = result.node.addComponent(Mask)
                mask.type = Mask.Type.GRAPHICS_RECT
            }
        }

        return result
    }
    private get _scrollView(): _scroll_view { return this.scrollView as _scroll_view }

    @property({ type: Node, tooltip: "自定义父节点，当不传父节点时则是自身" })
    private customParent: Node = null;

    /**
     * 自动给挂载节点添加 mask 组件
     */
    @property({ tooltip: `自动给挂载节点添加 mask 组件`, visible() { return !this.customParent } })
    mask: boolean = false

    @property({ tooltip: `默认父节点大小一致`, visible() { return !this.customParent } })
    parentSize: Vec3 = new Vec3();

    /**
     * 允许手势滚动
     */
    @property({ tooltip: `允许手势滚动` })
    scrollEnabled: boolean = true

    /**
     * 每多少帧刷新一次可见节点，1 表示每帧都刷
     */
    @property({ tooltip: `每多少帧刷新一次可见节点，1 表示每帧都刷` })
    frameInterval: number = 1
    private _frameIdx = 0

    /**
     * 是否在滚动过程中立即回收不可见节点，默认 true
     * @bug 滚动过程中如果实时的回收不可见节点，有时候会收不到 scroll view 的 cancel 事件，导致 scroll view 的滚动状态不会更新 (且收不到滚动结束事件)
     * @fix 当这个属性设置为 false 时，只会在 `touch-up` 和 `scroll-ended` 里面回收不可见节点
     */
    immediateAutoRecycleInvisibleNodes: boolean = true

    /**
     * 内容要分几个区展示，默认 1
     * 没有分区展示的需求可以不管这个配置
     */
    numberOfSections: number | ((collectionView: YXCollectionView) => number) = 1

    /**
     * 每个区里要展示多少条内容
     */
    numberOfItems: number | ((section: number, collectionView: YXCollectionView) => number) = 0

    /**
     * 注册 cell
     * 可多次注册不同种类的 cell，只要确保 @identifier 的唯一性就好
     * @param identifier cell 标识符，通过 @dequeueReusableCell 获取重用 cell 时，会根据这个值匹配
     * @param maker 生成节点，当重用池里没有可用的节点时，会通过这个回调获取节点，需要在这个回调里面生成节点
     * @param poolComp 节点自定义组件，可以通过这个组件跟 @NodePool 的重用业务关联起来
     */
    register(identifier: string, maker: () => Node = () => instantiate(this.item), poolComp: (new (...args: any[]) => YXCollectionViewCell) | null = null) {
        let pool = new NodePool(poolComp)
        this.pools.set(identifier, pool)
        this.makers.set(identifier, maker)
    }
    private pools: Map<string, NodePool> = new Map()
    private makers: Map<string, () => Node> = new Map()

    /**
     * 通过标识符从重用池里取出一个可用的 cell 节点
     * @param identifier 注册时候的标识符
     * @returns 
     */
    dequeueReusableCell(identifier: string): Node {
        let pool = this.pools.get(identifier)
        if (pool == null) {
            throw new Error(`YXCollectionView: 未注册标识符为 \`${identifier}\` 的 cell，请先调用 YXCollectionView 的 register() 方法注册 cell 节点`);
        }
        let result = pool.get()
        if (result == null) {
            let maker = this.makers.get(identifier)
            if (maker instanceof Function == false) {
                throw new Error(`YXCollectionView: register() 参数错误，请正确配置 maker 回调函数以生成标识对应的节点`);
            }
            result = this.makers.get(identifier)()
            if (result instanceof Node && pool.poolHandlerComp instanceof Function) {
                result.getComponent(pool.poolHandlerComp) || result.addComponent(pool.poolHandlerComp)
            }
            let cell = result.getComponent(_cell_) || result.addComponent(_cell_)
            cell.identifier = identifier

            result.on(NodeEventType.TOUCH_END, this.onTouchItem, this)
        }
        return result
    }

    /**
     * 配置每块内容对应的 UI 节点  
     * 在这个方法里，只需要关心 @indexPath 这个位置对应的节点应该是用注册过的哪个类型的 Node 节点，然后通过 @dequeueReusableCell 生成对应的 Node
     * 注意: 不要在这个方法里创建新的节点对象
     * @example
     * yourList.cellForItemAt = (indexPath, collectionView) => {
     *      return collectionView.dequeueReusableCell(`your identifier`)
     * }
     * @returns 注意: 这个方法返回的 cell，必须是通过 @dequeueReusableCell 匹配到的 Node
     */
    cellForItemAt: (indexPath: YXIndexPath, collectionView: YXCollectionView) => Node = null

    /**
     * cell 添加到滚动视图上之后执行，在这个方法里更新 cell 显示的 UI 内容
     * 可以通过 @indexPath 区分 cell 的种类
     * 重要: 如果 cell 的大小不是固定的，需要在这里重新调整子节点的位置，避免布局错乱
     */
    onCellDisplay: (cell: Node, indexPath: YXIndexPath, collectionView: YXCollectionView) => void = null

    /**
     * 点击到节点后调用
     */
    onTouchItemAt: (indexPath: YXIndexPath, collectionView: YXCollectionView) => void = null
    private onTouchItem(ev: EventTouch) {
        if (this.onTouchItemAt) {
            let cell = ev.target.getComponent(_cell_)
            this.onTouchItemAt(cell.attributes.indexPath, this)
        }
    }

    /**
     * 布局属性
     */
    layout: YXLayout = null

    /**
     * 获取当前正在显示的所有节点
     */
    visibleNodes: Node[] = []
    get visibleIndexPaths(): YXIndexPath[] {
        let result: YXIndexPath[] = []
        for (let index = 0; index < this.visibleNodes.length; index++) {
            const element = this.visibleNodes[index];
            let cell = element.getComponent(_cell_)
            result.push(cell.attributes.indexPath.clone())
        }
        return result
    }

    /**
     * 获取当前正在显示的某个节点
     * @param indexPath 
     */
    getVisibleNode(indexPath: YXIndexPath): Node | null {
        return this.visibleNodes.find((element) => {
            let cell = element.getComponent(_cell_)
            return (cell.attributes.indexPath.equals(indexPath))
        })
    }

    /**
     * 获取指定节点的索引
     * @param node 
     * @returns 
     */
    getVisibleNodeIndexPath(node: Node): YXIndexPath {
        let cell = node.getComponent(_cell_)
        if (cell) {
            return cell.attributes.indexPath.clone()
        }
        return null
    }

    /**
     * 刷新列表数据
     */
    reloadData() {
        // 校验 layout 参数
        if (this.layout == null) {
            throw new Error("YXCollectionView: 参数错误，请正确配置 layout 以确定布局方案");
        }
        // 立即停止当前滚动
        this.scrollView.stopAutoScroll()

        // 移除掉当前所有节点，准备刷新
        for (let index = 0; index < this.visibleNodes.length; index++) {
            const element = this.visibleNodes[index];
            this.pools.get(element.getComponent(_cell_).identifier).put(element)
        }
        this.visibleNodes = []

        // 记录一下当前的偏移量，保证数据更新之后位置也不会太偏
        let offset = this.scrollView.getScrollOffset()
        offset.x = -offset.x

        // 重新计算一遍布局属性
        this.layout.prepare(this)

        // 更新 content size
        let contentTransform = this.scrollView.content.getComponent(UITransform) || this.scrollView.content.addComponent(UITransform)
        contentTransform.contentSize = this.layout.contentSize

        // 默认偏移量 或者 恢复偏移量
        if (this.reloadDataCounter <= 0) {
            this.layout.initOffset(this)
        } else {
            let maxOffset = this.scrollView.getMaxScrollOffset()
            math.Vec2.min(offset, offset, maxOffset)
            this.scrollView.scrollToOffset(offset, 0)
        }

        // 更新 cell 节点
        this.reloadVisibleCells()
        this.reloadDataCounter++
    }

    /**
     * 记录 @reloadData 执行了多少次了，用来区分刷新列表的时候是否是首次刷新列表
     */
    private reloadDataCounter: number = 0

    /**
     * 根据当前的可见区域调整需要显示的节点以及移除不需要显示的节点
     */
    private reloadVisibleCells() {
        // 获取当前可见区域
        let visibleRect = new math.Rect()
        visibleRect.origin = this.scrollView.getScrollOffset()
        visibleRect.x = - visibleRect.x
        visibleRect.size = this.scrollView.view.contentSize

        // 根据可见区域，找出对应的布局属性
        let layoutAttributes = this.layout.layoutAttributesForElementsInRect(visibleRect, this)
        if (layoutAttributes == null || layoutAttributes == this.layout.attributes) {
            layoutAttributes = this.layout.attributes.slice()
        }

        // 按 zIndex 排序
        let shouldUpdateAttributesZIndex = this.layout.shouldUpdateAttributesZIndex()
        if (shouldUpdateAttributesZIndex) {
            layoutAttributes.sort((a, b) => a.zIndex - b.zIndex)
        }

        // 回收不可见节点
        if (this.immediateAutoRecycleInvisibleNodes) {
            this.recycleInvisibleNodes(visibleRect)
        }

        /*
        let poolsCounter = 0
        this.pools.forEach((a) => {
            poolsCounter = poolsCounter + a.size()
        })
        log(`需要显示的节点数量: ${layoutAttributes.length}  当前显示的节点数量: ${this.visibleNodes.length}  缓存池里的节点数量: ${poolsCounter}`)
        */

        // 添加需要显示的节点
        for (let index = 0; index < layoutAttributes.length; index++) {
            const element = layoutAttributes[index];
            if (visibleRect.intersects(element.frame) == false) { continue } // 这里还是要确实的检查一下是否真正可见，防止未实现 layoutAttributesForElementsInRect 时的情况

            // 需要显示并且正在显示的
            let visibleNode = this.getVisibleNode(element.indexPath)
            if (visibleNode) {
                this.applyLayoutAttributes(visibleNode, element, shouldUpdateAttributesZIndex)
                continue
            }

            // 需要显示但是当前未显示出来的
            let node = this.cellForItemAt(element.indexPath, this)
            node.parent = this.scrollView.content
            this.applyLayoutAttributes(node, element, shouldUpdateAttributesZIndex)
            this.visibleNodes.push(node)
            if (this.onCellDisplay) {
                this.onCellDisplay(node, element.indexPath, this)
            }
        }
    }

    /**
     * 回收不可见节点
     */
    private recycleInvisibleNodes(visibleRect: math.Rect = null) {
        if (visibleRect == null) {
            visibleRect = new math.Rect()
            visibleRect.origin = this.scrollView.getScrollOffset()
            visibleRect.x = - visibleRect.x
            visibleRect.size = this.scrollView.view.contentSize
        }

        this.visibleNodes = this.visibleNodes.filter((element) => {
            let cell = element.getComponent(_cell_)
            if (visibleRect.intersects(cell.attributes.frame) == false) {
                this.pools.get(cell.identifier).put(element)
                return false
            }
            return true
        })
    }

    /**
     * 刷新当前可见节点
     * @param force true: 立即刷新  false: 下帧刷新
     */
    markForUpdateVisibleData(force: boolean = false) {
        if (force) {
            this.reloadVisibleCells()
            return
        }
        this._late_update_visible_data = true
    }
    private _late_update_visible_data: boolean = false

    /**
     * 调整节点的位置/变换
     * @param bringToFront 是否把这个节点移到最上层显示
     */
    private applyLayoutAttributes(node: Node, attributes: YXLayoutAttributes, bringToFront: boolean) {
        let cell = node.getComponent(_cell_)
        cell.attributes = attributes

        let transform = node.getComponent(UITransform) || node.addComponent(UITransform)
        transform.setContentSize(attributes.frame.size)

        let pos = attributes[`_in_collection_view_pos`] as math.Vec3
        if (pos == null) {
            pos = node.position.clone()
            pos.x = - (this.layout.contentSize.width - attributes.frame.width) * 0.5 + attributes.frame.x
            pos.y = + (this.layout.contentSize.height - attributes.frame.height) * 0.5 - attributes.frame.y
            attributes[`_in_collection_view_pos`] = pos
        }
        if (attributes.offset) {
            pos.add(attributes.offset)
        }
        node.position = pos

        if (attributes.scale) {
            node.scale = attributes.scale
        }
        if (attributes.eulerAngles) {
            node.eulerAngles = attributes.eulerAngles
        }

        if (bringToFront) {
            node.setSiblingIndex(-1)
        }
    }

    /**
     * 滚动到指定节点的位置
     * @returns 
     */
    scrollTo(indexPath: YXIndexPath, timeInSecond: number = 0, attenuated: boolean = true) {
        let toOffSet: math.Vec2 = this.layout.scrollTo(indexPath, this)
        if (toOffSet == null) {
            toOffSet = this.layout.layoutAttributesForItemAtIndexPath(indexPath, this)?.frame.origin
        }
        if (toOffSet) {
            this.scrollView.stopAutoScroll()
            this.scrollView.scrollToOffset(toOffSet, timeInSecond, attenuated)
            this.markForUpdateVisibleData()
        }
    }

    /**
     * 生命周期方法
     */
    protected onLoad(): void {
        this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(ScrollView.EventType.SCROLL_BEGAN, this.onScrollBegan, this)
        this.node.on(ScrollView.EventType.SCROLLING, this.onScrolling, this)
        this.node.on(ScrollView.EventType.TOUCH_UP, this.onScrollTouchUp, this)
        this.node.on(ScrollView.EventType.SCROLL_ENDED, this.onScrollEnded, this)
        this._scrollView._yxOnStartInertiaScroll = this.onStartInertiaScroll.bind(this)
    }

    protected onDestroy(): void {
        this.node.off(NodeEventType.TOUCH_START, this.onTouchStart, this)
        this.node.off(ScrollView.EventType.SCROLL_BEGAN, this.onScrollBegan, this)
        this.node.off(ScrollView.EventType.SCROLLING, this.onScrolling, this)
        this.node.off(ScrollView.EventType.TOUCH_UP, this.onScrollTouchUp, this)
        this.node.off(ScrollView.EventType.SCROLL_ENDED, this.onScrollEnded, this)

        this.visibleNodes = []
        this.pools.forEach((element) => {
            element.clear()
        })
        this.pools.clear()
        this.makers.clear()
        if (this.layout) {
            this.layout.attributes = []
        }
    }

    protected update(dt: number): void {
        this.updateVisibleDataIfNeeds(dt)
    }

    /**
     * 更新可见区域的 cell ，如果需要的话
     */
    private updateVisibleDataIfNeeds(dt: number) {
        if (this._late_update_visible_data) {
            this._late_update_visible_data = false
            this.reloadVisibleCells()
        }
    }

    private onTouchStart() {
    }

    private onScrollBegan() {
    }

    private onScrolling() {
        if (this.frameInterval <= 1) {
            this.reloadVisibleCells()
            return
        }
        this._frameIdx++
        if (this._frameIdx % this.frameInterval == 0) {
            this.reloadVisibleCells()
        }
    }

    private onScrollTouchUp() {
        this.recycleInvisibleNodes()
    }

    private onScrollEnded() {
        this.recycleInvisibleNodes()
    }

    private _scroll_offset_on_touch_start: math.Vec2 = null
    private onStartInertiaScroll(touchMoveVelocity: math.Vec3) {
        let endValue = this.layout.targetOffset(this, touchMoveVelocity, this._scroll_offset_on_touch_start)
        if (endValue) {
            this.scrollView.scrollToOffset(endValue.offset, endValue.time)
            this.markForUpdateVisibleData()
        }
    }
}
