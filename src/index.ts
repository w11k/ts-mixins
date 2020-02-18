export type Constructable = new (...args: any[]) => any;
export type EmptyClass = new () => unknown;
export type Mixin = new () => any;

//////////////////////////////////////////////////////////////////////////////

function getAllPropertyDescriptors(obj: any): [string, PropertyDescriptor][] {
    const allPropDesc: [string, PropertyDescriptor][] = [];
    while (obj !== undefined && obj !== null && Object.getPrototypeOf(obj) !== null) {
        Object.getOwnPropertyNames(obj).forEach(name => {
            if (name === "constructor") {
                return;
            }

            allPropDesc.push([name, Object.getOwnPropertyDescriptor(obj, name)!]);
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
    allPropertyDescriptors.forEach(([name]) => {
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

//////////////////////////////////////////////////////////////////////////////

type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
type PickNovelFunctions<A, B> = FunctionProperties<Pick<A, Exclude<keyof A, keyof B>>>;

//////////////////////////////////////////////////////////////////////////////

type ClassWith1Mixin<C, M1> =
        C extends new (...args: infer A) => infer T
                ? M1 extends new () => infer M1T
                ? new (...args: A) =>
                        T
                        & Readonly<PickNovelFunctions<M1T, T>>
                : never
                : never;

type ClassWith2Mixins<C, M1, M2> =
        C extends new (...args: infer A) => infer T
                ? M1 extends new () => infer M1T
                ? M2 extends new () => infer M2T
                        ? new (...args: A) =>
                                T
                                & Readonly<PickNovelFunctions<M1T, T>>
                                & Readonly<PickNovelFunctions<M2T, T & M1T>>
                        : never
                : never
                : never;

//////////////////////////////////////////////////////////////////////////////

export function withBaseClassAndMixins<BC extends Constructable,
        M1 extends Mixin>(
        baseClass: BC,
        mixin1: M1,
): ClassWith1Mixin<BC, M1>;

export function withBaseClassAndMixins<BC extends Constructable,
        M1 extends Mixin,
        M2 extends Mixin>(
        baseClass: BC,
        mixin1: M1,
        mixin2: M2,
): ClassWith2Mixins<BC, M1, M2>;

export function withBaseClassAndMixins<BC extends Constructable>(
        baseClass: BC,
        ...mixins: Mixin[]
) {
    class BaseClassWithMixins extends baseClass {
        constructor(...args: any[]) {
            super(...args);

            mixins.forEach(mixinClass => {
                const mixin = new mixinClass();
                Object.assign(this, mixin);
            });
        }
    }

    mixins.forEach(mixin => {
        const allPropertyDescriptors = getAllPropertyDescriptors(mixin.prototype);
        allPropertyDescriptors.forEach(([name, desc]) => {
            if (!hasProperty(BaseClassWithMixins.prototype, name)) {
                Object.defineProperty(BaseClassWithMixins.prototype, name, {
                    configurable: false,
                    enumerable: true,
                    value: desc.value
                    // get: () => {
                    //     const value = mixin[name];
                    //     if (typeof value === "function") {
                    //         return (...args: any[]) => (value as Function).apply(mixin, args);
                    //     }
                    //     throw new Error(`A class can only access methods from a mixin ( tried to access '${name}').`);
                    // },
                });
            }
        });
    });

    return BaseClassWithMixins;
}

//////////////////////////////////////////////////////////////////////////////

export function withMixins<M1 extends Mixin>(
        mixin1: M1,
): ClassWith1Mixin<EmptyClass, M1>;

export function withMixins<M1 extends Mixin,
        M2 extends Mixin>(
        mixin1: M1,
        mixin2: M2,
): ClassWith2Mixins<EmptyClass, M1, M2>;

export function withMixins(...mixins: Mixin[]) {
    class Base {
    }

    return (withBaseClassAndMixins as any)(Base, ...mixins);
}
