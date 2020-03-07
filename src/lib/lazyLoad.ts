export default function init<Func extends () => Promise<any>>(resources: ImportanceMap<any, any>, globalInitFunc?: (instance: any) => void | Promise<void>) {
  const resolvements = new Map<string, Function>();
  const indexMap = new ResourcesMap();
  const alreadyResolvedResources = [];
  return function load(initalKey?: string): ResourcesMap{
    try {
      if (initalKey !== undefined) resources.getByString(initalKey).key.importance = -Infinity;
    }
    catch (e) {
      console.warn("Unexpected initalKey");
    }

    resources.forEach((e: () => Promise<object>, imp) => {

      if (imp.val !== undefined) if (indexMap.get(imp.val) === undefined) {
        if (imp.importance !== Infinity) indexMap.set(imp.val, new Promise((res) => {
          resolvements.set(imp.val, res);
        }));
        else {
          if (!alreadyResolvedResources.includes(imp.val)) {
            alreadyResolvedResources.add(imp.val);
            //@ts-ignore
            indexMap.set(imp.val, async () => {
              let res: Function;
              indexMap.set(imp.val, new Promise((r) => {
                res = r;
              }));
              let instance =  await imp.initer((await resources.getByString(imp.val).val()).default)
              if (globalInitFunc !== undefined) await globalInitFunc(instance);
              res(instance);
              return instance;
            });
          }
        }
      }
    });

    (async () => {
      await resources.forEachOrdered(async <Mod>(e: () => Promise<{default: {new(): Mod}}>, imp: Import<string, Mod>) => {
        if (imp.val !== undefined) {
          if (alreadyResolvedResources.includes(imp.val)) return;
          alreadyResolvedResources.add(imp.val);
          let instance = imp.initer((await e()).default);
          if (globalInitFunc !== undefined) await globalInitFunc(instance);
          resolvements.get(imp.val)(instance);
        }
        // just load it (and preseve in webpack cache)
        else (await e());
      });
    })();
    return indexMap;
  }
}

export class ResourcesMap extends Map<string, Promise<any>> {
  public get(key: string): Promise<any> {
    let val = super.get(key);
    if (typeof val === "function") {
      //@ts-ignore
      return val();
    }
    else return val;
  }
}



export class ImportanceMap<Func extends () => Promise<{default: {new(): Mod}}>, Mod> extends Map<Import<string, Mod>, Func> {
  private importanceList: Import<string, Mod>[] = [];
  constructor(...map: Map<Import<string, Mod>, Func>[]);
  constructor(...a: {key: Import<string, Mod>, val: Func}[]);
  constructor(...a: {key: Import<string, Mod>, val: Func}[] | Map<Import<string, Mod>, Func>[]) {
    super();
    if (a[0] instanceof Map) {
      //@ts-ignore
      a.ea((m) => {
        m.forEach((v, k) => {
          this.set(k, v);
        })
      })
    }
    else {
      //@ts-ignore
      a.forEach((e) => {
        this.set(e.key, e.val);
      });
    }
  }
  public getByString(key: string): {key: Import<string, Mod>, val: Func} {
    let kk: any, vv: any;
    this.forEach((v,k) => {
      if (k.val === key) {
        vv = v;
        kk = k;
      }
    });
    if (!kk || !vv) throw "No such value found";
    return {key: kk, val: vv};
  }
  public set(key: Import<string, Mod>, val: Func): this {
    this.importanceList.add(key);
    super.set(key, val);
    return this;
  }
  public async forEachOrdered(loop: (e?: Func, key?: Import<string, Mod>, i?: number) => any) {
    this.importanceList.sort((a, b) => {
      return a.importance - b.importance;
    });
    for (let i = 0; i < this.importanceList.length; i++) {
      await loop(this.get(this.importanceList[i]), this.importanceList[i], i);
    }
  }
}

export class Import<T, Mod> {
  constructor(public val: T, public importance: number, public initer: (mod: {new(): Mod}) => Mod) {

  }
}
