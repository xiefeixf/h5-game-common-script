import { director, EventTarget, macro, Scheduler } from "cc";

const TIME_RATIO = 1 / 60;

enum TimerState {
    RUNNING,
    PAUSED
}

interface TimerInfo {
    callback: (dt: number) => void;
    interval: number;
    elapsedTime: number;
    state: TimerState;
}

export class EngineTime extends EventTarget {
    id: string = "engintimer";
    uuid: string = "uengintimer";

    private scheduleCallMap = new Map<string, TimerInfo>();
    private _scheduleCount: number = 1;
    private scheduler: Scheduler;

    public totalTimerState: TimerState = TimerState.RUNNING;

    constructor() {
        super();
        // 初始化调度器
        this.scheduler = director.getScheduler();
    }

    /**
     * 格式化日期显示 format= "yyyy-MM-dd hh:mm:ss"
     * @param format 格式化字符串
     * @param date 日期对象，默认为当前日期
     * @returns 格式化后的日期字符串
     */
    public format(format: string, date: Date = null): string {
        let ldate = date || new Date();
        let o = {
            "M+": ldate.getMonth() + 1,
            "d+": ldate.getDate(),
            "h+": ldate.getHours(),
            "m+": ldate.getMinutes(),
            "s+": ldate.getSeconds(),
            "q+": Math.floor((ldate.getMonth() + 3) / 3),
            "S": ldate.getMilliseconds()
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (ldate.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (let k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    }

    /**
     * 格式化秒显示
     * @param timer 时间秒
     * @param formatOrout 对象或格式化模板，支持三种模式
     * @returns 格式化后的时间字符串或包含小时、分钟、秒的对象
     */
    public formatSecond(timer: number, formatOrout?: { h?: number, m?: number, s?: number } | string): typeof formatOrout {
        let secondTime = parseInt(timer.toString());
        let minuteTime = 0;
        let hourTime = 0;
        if (secondTime >= 60) {
            minuteTime = (secondTime * TIME_RATIO) | 0;
            secondTime = (secondTime % 60) | 0;
            if (minuteTime >= 60) {
                hourTime = (minuteTime * TIME_RATIO) | 0;
                minuteTime = (minuteTime % 60) | 0;
            }
        }
        if (formatOrout) {
            if (typeof formatOrout === "object") {
                formatOrout.h = hourTime;
                formatOrout.m = minuteTime;
                formatOrout.s = secondTime;
                return formatOrout;
            }
        } else {
            formatOrout = "hh:mm:ss";
        }
        formatOrout = formatOrout.replace("hh", hourTime < 10 ? "0" + hourTime : hourTime.toString());
        formatOrout = formatOrout.replace("mm", minuteTime < 10 ? "0" + minuteTime : minuteTime.toString());
        return formatOrout.replace("ss", secondTime < 10 ? "0" + secondTime : secondTime.toString());
    }

    /**
     * 设置一个循环计时器
     * @param callback 计时器回调函数
     * @param interval 时间间隔（秒）
     * @returns 计时器的UUID
     */
    public schedule(callback: (dt: number) => void, interval: number): string {
        let UUID = `time+${this._scheduleCount++}`;
        let timerInfo: TimerInfo = {
            callback: callback,
            interval: interval,
            elapsedTime: 0,
            state: TimerState.RUNNING
        };
        this.scheduleCallMap.set(UUID, timerInfo);

        this.scheduler.schedule((dt) => {
            let timer = this.scheduleCallMap.get(UUID);
            if (timer && timer.state === TimerState.RUNNING) {
                timer.elapsedTime += dt;
                if (timer.elapsedTime >= timer.interval) {
                    timer.elapsedTime = 0;
                    timer.callback(dt);
                }
            }
        }, this, 0, macro.REPEAT_FOREVER, 0, false);

        return UUID;
    }

    /**
     * 设置一个一次性计时器
     * @param callback 计时器回调函数
     * @param delay 延迟时间（秒）
     * @returns 计时器的UUID
     */
    public scheduleOnce(callback: (dt: number) => void, delay: number = 0): string {
        let UUID = `timeonce+${this._scheduleCount++}`;
        let timerInfo: TimerInfo = {
            callback: callback,
            interval: delay,
            elapsedTime: 0,
            state: TimerState.RUNNING
        };
        this.scheduleCallMap.set(UUID, timerInfo);

        this.scheduler.schedule((dt) => {
            let timer = this.scheduleCallMap.get(UUID);
            if (timer && timer.state === TimerState.RUNNING) {
                timer.elapsedTime += dt;
                if (timer.elapsedTime >= timer.interval) {
                    timer.callback(dt);
                    this.unschedule(UUID);
                }
            }
        }, this, 0, 0, delay, false);

        return UUID;
    }

    /**
     * 暂停指定计时器
     * @param uuid 计时器的UUID
     */
    public pauseTimer(uuid: string) {
        let timer = this.scheduleCallMap.get(uuid);
        if (timer) {
            timer.state = TimerState.PAUSED;
        }
    }

    /**
     * 恢复指定计时器
     * @param uuid 计时器的UUID
     */
    public resumeTimer(uuid: string) {
        let timer = this.scheduleCallMap.get(uuid);
        if (timer) {
            timer.state = TimerState.RUNNING;
        }
    }

    /**
     * 暂停所有计时器
     */
    public pauseAllTimers() {
        this.scheduleCallMap.forEach((timer) => {
            timer.state = TimerState.PAUSED;
        });
        this.totalTimerState = TimerState.PAUSED;
    }

    /**
     * 恢复所有计时器
     */
    public resumeAllTimers() {
        this.scheduleCallMap.forEach((timer) => {
            timer.state = TimerState.RUNNING;
        });
        this.totalTimerState = TimerState.RUNNING;
    }

    /**
     * 取消指定的计时器
     * @param uuid 计时器的UUID
     */
    public unschedule(uuid: string) {
        let timer = this.scheduleCallMap.get(uuid);
        if (timer) {
            this.scheduler.unschedule(timer.callback, this);
            this.scheduleCallMap.delete(uuid);
        }
    }

    /**
     * 取消所有计时器
     */
    public unscheduleAllCallbacks() {
        this.scheduleCallMap.forEach((timer) => {
            this.scheduler.unschedule(timer.callback, this);
        });
        this.scheduleCallMap.clear();
    }
}
