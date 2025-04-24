import { _decorator, AudioClip, AudioSource, Component, log, Node } from 'cc';
import Singleton from '../util/Singleton';
import engine from '../Engine';
import { GF_DynamicData } from '../confg/GF_DynamicData';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Singleton<AudioManager>() {

    public levelIdx: number = 0;

    /**音效模块 */
    private soundSource: AudioSource = null;
    /**音乐模块 */
    private musicSource: AudioSource = null;

    /**初始化 */
    public init(sound: AudioSource, music: AudioSource) {
        this.soundSource = sound;
        this.musicSource = music;
        this.musicSource.loop = true
    }

    public playSound(name: string, levelName: string = "common", suCall?: Function): string {
        //  if (!GF_DynamicData.ins.audioOpen) return
        //let levelID = engine.cgMar.levelConfig[this.levelIdx].levelID;
        engine.resMar.loadRes(`Story/${levelName}/audio/${name}`, AudioClip, (data: AudioClip) => {
            this.soundSource.clip = data;
            this.soundSource.play();
            engine.timer.scheduleOnce(() => {
                suCall && suCall();
            }, data.getDuration())
            engine.log.trace(`PlayTals : ${name}`);
        }, () => {
            engine.timer.scheduleOnce(() => {
                suCall && suCall();
            }, 1.5)
        })

        let cloneTals: string = name
        cloneTals = cloneTals.slice((name + "").length)
        return cloneTals;
    }

    public playMusic(name: string, levelName: string = "Texture", suCall?: Function) {
        engine.resMar.loadRes(`${levelName}/audio/${name}`, AudioClip, (data: AudioClip) => {
            this.musicSource.clip = data;
            this.musicSource.play();
            // engine.timer.scheduleOnce(() => {
            //     suCall && suCall();
            // }, data.getDuration())
            engine.log.trace(`PlayTals : ${name}`);
        }, () => {
            engine.timer.scheduleOnce(() => {
                suCall && suCall();
            }, 1.5)
        })
    }

    public playGameSound(name: string, levelName: string = "Texture", suCall?: Function) {
        engine.resMar.loadRes(`${levelName}/audio/${name}`, AudioClip, (data: AudioClip) => {
            this.soundSource.clip = data;
            this.soundSource.play();
            // engine.timer.scheduleOnce(() => {
            //     suCall && suCall();
            // }, data.getDuration())
            engine.log.trace(`PlayTals : ${name}`);
        }, () => {
            engine.timer.scheduleOnce(() => {
                suCall && suCall();
            }, 1.5)
        })
    }

    public checkAudioState(open: boolean) {
        GF_DynamicData.ins.audioOpen = open
        this.soundSource.volume = open ? 1 : 0
        this.musicSource.volume = open ? 1 : 0
    }

    public checkShakeState(open: boolean) {
        GF_DynamicData.ins.shakeOpen = open
    }

    public stopMusic() {
        this.musicSource.volume = 0
    }

    public resumeMusic() {
        this.musicSource.volume = 1
    }

    public get musicvolume(): number {
        return this.musicSource.volume
    }
    public get soundvolume(): number {
        return this.soundSource.volume
    }
    public set musicvolume(volume) {
        this.musicSource.volume = volume
    }
    public set soundvolume(volume) {
        this.soundSource.volume = volume
    }
}

