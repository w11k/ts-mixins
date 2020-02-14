
function getAllPropertyDescriptors(obj: any): string[] {
    const allPropDesc: string[] = [];
    while (obj !== undefined && obj !== null && Object.getPrototypeOf(obj) !== null) {
        Object.getOwnPropertyNames(obj).forEach(name => {
            if (name === "constructor") {
                return;
            }
            allPropDesc.push(name);
        });

        obj = Object.getPrototypeOf(obj);
    }
    return allPropDesc;
}

function hasProperty(obj: any, propName: string): boolean {
    while (obj !== undefined && obj !== null && Object.getPrototypeOf(obj) !== null) {
        for (const name of Object.getOwnPropertyNames(obj)) {
            if (name === propName) {
                return true;
            }
        }
        obj = Object.getPrototypeOf(obj);
    }
    return false;
}

function forwardMixinProperties(target: any, mixinClass: Mixin) {
    const mixin = new mixinClass();
    let allPropertyDescriptors = getAllPropertyDescriptors(mixin);
    allPropertyDescriptors.forEach(name => {

        if (!hasProperty(target, name)) {
            Object.defineProperty(target, name, {
                configurable: false,
                enumerable: true,
                get: () => {
                    const value = mixin[name];
                    if (typeof value === "function") {
                        return (...args: any[]) => (value as Function).apply(mixin, args);
                    }
                    throw new Error(`A class can only access methods from a mixin (tried to access '${name}').`);
                },
            });
        }
    });
}

type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
type PickNovelFunctions<A, B> = FunctionProperties<Pick<A, Exclude<keyof A, keyof B>>>;
export type Constructable = new (...args: any[]) => any;
export type Mixin = new () => any;

type ClassWith2Mixins<C, M1, M2> =
        C extends new (...args: infer A) => infer T
                ? M1 extends new () => infer M1T
                ? M2 extends new () => infer M2T
                        ? new (...args: A) =>
                                T
                                & PickNovelFunctions<M1T, T>
                                & PickNovelFunctions<M2T, T & M1T>
                        : never
                : never
                : never;

export function withMixins<BC extends Constructable,
        M1 extends Mixin,
        M2 extends Mixin>(
        baseClass: BC,
        mixin1: M1,
        mixin2: M2,
): ClassWith2Mixins<BC, M1, M2> {
    return class extends baseClass {
        constructor(...args: any[]) {
            super(...args);
            forwardMixinProperties(this, mixin1);
            forwardMixinProperties(this, mixin2);
        }
    } as any;
}

