/*
 * 单件模版Singleton Template
 */

export default function Singleton<T>() {
    class Singleton {
        protected constructor() { }

        protected static _Instance: Singleton = null;

        public static get ins(): T {
            if (null == Singleton._Instance) {
                Singleton._Instance = new this();
            }
            return Singleton._Instance as T;
        }

        public static set ins(v) {
            if (!v) {
                delete Singleton._Instance;
            }
            Singleton._Instance = v;
        }
    }
    return Singleton;
}
