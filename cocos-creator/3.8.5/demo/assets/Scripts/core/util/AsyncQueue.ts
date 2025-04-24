/*
 * @Description: 异步队列处理
 * 目的：用于处理一组串联式的异步任务队列。
 */


export type NextFunction = (nextArgs?: any) => void;

export type AsyncCallback = (next: (nextArgs?: any) => void, params: any, args: any) => void;

interface AsyncTask {
    /**
     * 任务uuid
     */
    uuid: number;
    /**
      * 任务开始执行的回调
      * params: push时传入的参数
      * args: 上个任务传来的参数
      */
    callbacks: Array<AsyncCallback>;
    /**
      * 任务参数
      */
    params: any,
    /**
     * 优先级
     */
    priority: number
}

export class AsyncQueue {
    /**
     * 全局开关
     */
    public static globalEnable = true;

    // 任务task的唯一标识
    private static uuid_count: number = 1;
    private static taskPool: Array<AsyncTask> = [];
    private static allocTask(params: any, priority: number) {
        let uuid = AsyncQueue.uuid_count++;
        if (AsyncQueue.taskPool.length > 0) {
            let task = AsyncQueue.taskPool.pop();
            task.uuid = uuid;
            task.params = params;
            task.priority = priority;
            return task;
        }
        return {
            uuid: uuid,
            callbacks: [],
            params: params,
            priority: priority
        };
    }
    private static freeTask(task: AsyncTask) {
        if (task) {
            task.params = null;
            if (AsyncQueue.taskPool.length < 10) {
                task.callbacks.length = 0;
                task.priority = 0;
                AsyncQueue.taskPool.push(task);
            } else {
                task.callbacks = null;
            }
        }
    }
    // 正在运行的任务
    private _runningAsyncTask: AsyncTask = null;


    private _queues: Array<AsyncTask> = [];
    /**
     * 当前异步队列里面还未运行的任务
     */
    public get queues(): Array<AsyncTask> {
        return this._queues;
    }
    // 正在执行的异步任务标识
    private _isProcessingTaskUUID: number = 0;

    private _enable: boolean = true;
    /**
     * 是否开启可用
     */
    public get enable() {
        return this._enable;
    }
    /**
     * 是否开启可用
     */
    public set enable(val: boolean) {
        if (this._enable === val) {
            return;
        }
        this._enable = val;
        if (val && this.size > 0) {
            this.play();
        }
    }

    /**
     * 任务队列完成回调
     */
    public complete: Function = null;

    private _timeoutId: number = -1;
    public logprint() {
        let desc = {
            running: "",
            queues: []
        };
        if (this._runningAsyncTask.params && this._runningAsyncTask.params["des"]) {
            desc.running = this._runningAsyncTask.params["des"];
        }
        for (let qqqq of this._queues) {
            if (qqqq.params) {
                desc.queues.push(qqqq.params["desc"]);
            } else {
                desc.queues.push('');
            }
        }
        return desc;
    }
    /**
     * push一个异步任务到队列中
     * 返回任务uuid
     */
    public push(callback: AsyncCallback, params: any = null, priority: number = 0): number {
        let task = AsyncQueue.allocTask(params, priority);
        task.callbacks.push(callback);
        this._queues.push(task);
        this._queues.sort((a, b) => {
            return b.priority - a.priority;
        });
        return task.uuid;
    }

    /**
     * push多个任务，多个任务函数会同时执行,
     * 返回任务uuid
     */
    public pushMulti(params: any, ...callbacks: AsyncCallback[]): number {
        let task = AsyncQueue.allocTask(params, 0);
        task.callbacks.push(...callbacks);
        this._queues.push(task);
        this._queues.sort((a, b) => {
            return b.priority - a.priority;
        });
        return task.uuid;
    }

    /** 移除一个还未执行的异步任务 */
    public remove(uuid: number) {
        if (this._runningAsyncTask.uuid === uuid) {
            console.log("正在执行的任务不可以移除");
            return;
        }
        for (let i = 0; i < this._queues.length; i++) {
            if (this._queues[i].uuid === uuid) {
                AsyncQueue.freeTask(this._queues[i]);
                this._queues.splice(i, 1);
                break;
            }
        }
    }
    /**
     * 队列长度
     */
    public get size(): number {
        return this._queues.length;
    }
    /**
     * 是否有正在处理的任务
     */
    public get isProcessing(): boolean {
        return this._isProcessingTaskUUID > 0;
    }
    /**
     * 队列是否已停止
     */
    public get isStop(): boolean {
        if (this._queues.length > 0) {
            return false;
        }
        if (this.isProcessing) {
            return false;
        }
        return true;
    }
    /** 正在执行的任务参数 */
    public get runningParams() {
        if (this._runningAsyncTask) {
            return this._runningAsyncTask.params;
        }
        return null;
    }

    /**
     * 清空队列
     */
    public clear() {
        for (let task of this._queues) {
            AsyncQueue.freeTask(task);
        }
        this._queues.length = 0;
        this._isProcessingTaskUUID = 0;
        this._runningAsyncTask = null;
        this._timeoutId > 0 && clearTimeout(this._timeoutId);
        this._timeoutId = -1;
    }

    protected next(taskUUID: number, args: any = null) {
        if (!AsyncQueue.globalEnable) {
            return;
        }
        AsyncQueue.freeTask(this._runningAsyncTask);
        if (this._isProcessingTaskUUID === taskUUID) {
            this._isProcessingTaskUUID = 0;
            this._runningAsyncTask = null;
            this.play(args);
        } else {
            //    console.warn("[AsyncQueue] 错误警告：正在执行的任务和完成的任务标识不一致，有可能是next重复执行！ProcessingTaskUUID："+this._isProcessingTaskUUID + " nextUUID:"+taskUUID)
            if (this._runningAsyncTask) {
                console.log(this._runningAsyncTask);
            }
            this._runningAsyncTask = null;
        }
    }
    /**
     * 跳过当前正在执行的任务
     */
    public step() {
        if (this.isProcessing) {
            this.next(this._isProcessingTaskUUID);
        }
    }
    /**
     * 开始运行队列
     */
    public play(args: any = null) {
        if (this.isProcessing) {
            return;
        }
        if (!this._enable) {
            return;
        }
        let actionData: AsyncTask = this._queues.shift(); // 异步队列
        if (actionData) {
            this._runningAsyncTask = actionData;
            let taskUUID: number = actionData.uuid;
            this._isProcessingTaskUUID = taskUUID;
            let callbacks: Array<AsyncCallback> = actionData.callbacks;
            if (callbacks.length == 1) {
                let nextFunc: NextFunction = (nextArgs: any = null) => {
                    this.next(taskUUID, nextArgs);
                };
                callbacks[0](nextFunc, actionData.params, args);
            } else {
                // 多个任务函数同时执行
                let fnum: number = callbacks.length;
                let nextArgsArr = [];
                let nextFunc: NextFunction = (nextArgs: any = null) => {
                    --fnum;
                    // console.warn("fnum",fnum)
                    nextArgsArr.push(nextArgs || null);
                    if (fnum === 0) {
                        this.next(taskUUID, nextArgsArr);
                    }
                };
                let knum = fnum;
                for (let i = 0; i < knum; i++) {
                    callbacks[i](nextFunc, actionData.params, args);
                }
            }
        } else {
            this._isProcessingTaskUUID = 0;
            this._runningAsyncTask = null;
            // console.log("任务完成")
            if (this.complete) {
                this.complete(args);
            }
        }
    }

    /**
     * 【比较常用，所以单独提出来封装】往队列中push一个延时任务
     * @param time 毫秒时间
     * @param callback （可选参数）时间到了之后回调
     */
    public yieldTime(time: number, callback: Function = null) {
        let self = this;
        let task = function (next: Function, params: any, args: any) {
            let _t = setTimeout(() => {
                clearTimeout(_t);
                self._timeoutId = -1;
                self = null;
                if (callback) {
                    callback();
                }
                next(args);
            }, time);
            self._timeoutId = _t;
        };
        this.push(task, { des: "AsyncQueue.yieldTime" + time });
    }

    /**
     * 返回一个执行函数，执行函数调用count次后，next将触发
     * @param count 
     * @param next 
     * @return 返回一个匿名函数
     */
    public static excuteTimes(count: number, next: Function = null): Function {
        let fnum: number = count;
        let tempCall = () => {
            --fnum;
            if (fnum === 0) {
                next && next();
            }
        };
        return tempCall;
    }
}
