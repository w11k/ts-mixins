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

//////////////////////////////////////////////////////////////////////////////

// type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
// type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
// export type FunctionProperties<T> = T;
export type PickNovelMember<A, B> = Pick<A, Exclude<keyof A, keyof B>>;

//////////////////////////////////////////////////////////////////////////////

type ClassWith1Mixin<C, M1> =
        C extends new (...args: infer A) => infer T
                ? M1 extends new () => infer M1T
                ? new (...args: A) => T
                        & PickNovelMember<M1T, T>
                : never
                : never;

export type ClassWith2Mixins<C, M1, M2> =
        C extends new (...args: infer A) => infer T
                ? M1 extends new () => infer M1T
                ? M2 extends new () => infer M2T
                        ?
                        new (...args: A) => T
                                & PickNovelMember<M1T, T>
                                & PickNovelMember<M2T, T & M1T>
                        : never
                : never
                : never;

export type ClassWith3Mixins<C, M1, M2, M3> =
        C extends new (...args: infer A) => infer T
                ? M1 extends new () => infer M1T
                ? M2 extends new () => infer M2T
                        ? M3 extends new () => infer M3T
                                ?
                                new (...args: A) => T
                                        & PickNovelMember<M1T, T>
                                        & PickNovelMember<M2T, T & M1T>
                                        & PickNovelMember<M3T, T & M1T & M2T>
                                : never
                        : never
                : never
                : never;

export type ClassWith4Mixins<C, M1, M2, M3, M4> =
        C extends new (...args: infer A) => infer T
                ? M1 extends new () => infer M1T
                ? M2 extends new () => infer M2T
                        ? M3 extends new () => infer M3T
                                ? M4 extends new () => infer M4T
                                        ?
                                        new (...args: A) => T
                                                & PickNovelMember<M1T, T>
                                                & PickNovelMember<M2T, T & M1T>
                                                & PickNovelMember<M3T, T & M1T & M2T>
                                                & PickNovelMember<M4T, T & M1T & M2T & M3T>
                                        : never
                                : never
                        : never
                : never
                : never;

export type ClassWith5Mixins<C, M1, M2, M3, M4, M5> =
        C extends new (...args: infer A) => infer T
                ? M1 extends new () => infer M1T
                ? M2 extends new () => infer M2T
                        ? M3 extends new () => infer M3T
                                ? M4 extends new () => infer M4T
                                        ? M5 extends new () => infer M5T
                                                ?
                                                new (...args: A) => T
                                                        & PickNovelMember<M1T, T>
                                                        & PickNovelMember<M2T, T & M1T>
                                                        & PickNovelMember<M3T, T & M1T & M2T>
                                                        & PickNovelMember<M4T, T & M1T & M2T & M3T>
                                                        & PickNovelMember<M5T, T & M1T & M2T & M3T & M4T>
                                                : never
                                        : never
                                : never
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

export function withBaseClassAndMixins<BC extends Constructable,
        M1 extends Mixin,
        M2 extends Mixin,
        M3 extends Mixin,
        >(
        baseClass: BC,
        mixin1: M1,
        mixin2: M2,
        mixin3: M3,
): ClassWith3Mixins<BC, M1, M2, M3>;

export function withBaseClassAndMixins<BC extends Constructable,
        M1 extends Mixin,
        M2 extends Mixin,
        M3 extends Mixin,
        M4 extends Mixin,
        >(
        baseClass: BC,
        mixin1: M1,
        mixin2: M2,
        mixin3: M3,
        mixin4: M4,
): ClassWith4Mixins<BC, M1, M2, M3, M4>;

export function withBaseClassAndMixins<BC extends Constructable,
        M1 extends Mixin,
        M2 extends Mixin,
        M3 extends Mixin,
        M4 extends Mixin,
        M5 extends Mixin,
        >(
        baseClass: BC,
        mixin1: M1,
        mixin2: M2,
        mixin3: M3,
        mixin4: M4,
        mixin5: M5,
): ClassWith5Mixins<BC, M1, M2, M3, M4, M5>;

export function withBaseClassAndMixins<BC extends Constructable>(
        baseClass: BC,
        ...mixins: (new () => any)[]
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
                });
            } else {
                throw new Error(`baseclass already has member '${name}'`);
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

export function withMixins<M1 extends Mixin,
        M2 extends Mixin,
        M3 extends Mixin,
        >(
        mixin1: M1,
        mixin2: M2,
        mixin3: M3,
): ClassWith3Mixins<EmptyClass, M1, M2, M3>;

export function withMixins<M1 extends Mixin,
        M2 extends Mixin,
        M3 extends Mixin,
        M4 extends Mixin,
        >(
        mixin1: M1,
        mixin2: M2,
        mixin3: M3,
        mixin4: M4,
): ClassWith4Mixins<EmptyClass, M1, M2, M3, M4>;

export function withMixins<M1 extends Mixin,
        M2 extends Mixin,
        M3 extends Mixin,
        M4 extends Mixin,
        M5 extends Mixin,
        >(
        mixin1: M1,
        mixin2: M2,
        mixin3: M3,
        mixin4: M4,
        mixin5: M5,
): ClassWith5Mixins<EmptyClass, M1, M2, M3, M4, M5>;

export function withMixins(...mixins: Mixin[]) {
    class Base {
    }

    return (withBaseClassAndMixins as any)(Base, ...mixins);
}
