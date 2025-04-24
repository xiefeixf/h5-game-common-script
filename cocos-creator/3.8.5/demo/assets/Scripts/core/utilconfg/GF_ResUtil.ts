/**
 * @author : zhangxiaoqiang
 * @description : 本地常用路径
 */


export class GF_ResUtil {



    /**UI模块下返回路径 - UILayerType */
    public static UIModular = (UILayerType: string, name: string) => {
        return UILayerType.replace(/\/[^\/]*$/, '') + `/${name}`;
    }

    /**根据路径获取图片 */
    public static getTexturebyPath = (path: string) => {
        return `UI/Texture/${path}/spriteFrame`;
    }

    /**获取角色身体部位 */
    public static getRolePartPath = (path: string) => {
        return `UI/Texture/role/${path}/spriteFrame`;
    }

    /**获取resource资源预制 */
    public static getResPrfab = (name: string) => {
        return `common/prefab/${name}`;
    }

    /**获取spine资源预制 */
    public static getResSpine = (name: string) => {
        return `roleSp/${name}`;
    }

    /**获取动画 */
    public static getSkeleton = (id: number) => {
        return `Animation/${id}/${id}`;
    }
}


