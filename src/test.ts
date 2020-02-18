import {withBaseClassAndMixins, withMixins} from "./index";

class BaseClass {
    baseClassMethod() {
        return 0;
    }
}

class Mixin1 {
    mixin1Method() {
        return 1;
    }
}

class Mixin2 {
    mixin2Method() {
        return 2;
    }
}

describe("general semantics", () => {
    it("mixin methods can be accessed via the prototype", () => {
        class Sub extends withBaseClassAndMixins(BaseClass, Mixin1) {
        }

        expect(Sub.prototype.mixin1Method).toBeDefined();
    });

    it("mixin members must be compatible", () => {
        class Mx1 {
            mem = 0;
        }
        class Mx2 {
            mem = "a";
            set2() {
                this.mem = "b";
            }
        }
        class Sub extends withMixins(Mx1, Mx2) {
            met() {
                return this.mem;
            }
        }
        const sub = new Sub();
        sub.set2();
        expect(sub.met()).toEqual(0);
    });

    it("a mixin can have state", () => {
        class Mx {
            state = 0;

            inc(by: number) {
                this.state += by;
            }

            getState() {
                return this.state;
            }
        }

        class Sub extends withBaseClassAndMixins(BaseClass, Mx) {
        }

        const sub = new Sub();
        sub.inc(1);
        sub.inc(2);
        expect(sub.getState()).toEqual(3);
    });

    it("an inherited mixin can have state", () => {
        class Mx1 {
            state = 0;

            inc(by: number) {
                this.state += by;
            }

            getState() {
                return this.state;
            }
        }

        class Mx2 extends Mx1 {

            state2 = 0;

            inc2(by: number) {
                this.state2 += by;
            }

            getState2() {
                return this.state2;
            }
        }

        class Sub extends withBaseClassAndMixins(BaseClass, Mx2) {
        }

        const sub = new Sub();

        sub.inc(4);
        sub.inc(9);
        sub.inc2(1);
        sub.inc2(2);
        expect(sub.getState()).toEqual(13);
        expect(sub.getState2()).toEqual(3);
    });
});

describe("Angular", () => {
    it("can get a mixin method from prototype and invoke it later", () => {
        class NgMixin {
            lifecycle() {
                return 5;
            }
        }

        class Comp extends withBaseClassAndMixins(BaseClass, NgMixin) {
        }

        const mm = Comp.prototype.lifecycle;
        const comp = new Comp();
        const result = mm.apply(comp, []);
        expect(result).toEqual(5);
    });
});

describe("withBaseClassAndMixins", () => {
    it("preserves is-a relationship", () => {
        class Sub extends withBaseClassAndMixins(BaseClass, Mixin1) {
        }

        const sub = new Sub();
        expect(sub).toBeInstanceOf(Sub);
        expect(sub).toBeInstanceOf(BaseClass);
    });

    it("mixins do not have a is-a relationship", () => {
        class Sub extends withBaseClassAndMixins(BaseClass, Mixin1) {
        }

        const sub = new Sub();
        expect(sub).not.toBeInstanceOf(Mixin1);
    });
});

describe("withBaseClassAndMixins 1-n mixins are supported", () => {
    it("1 mixin", () => {
        class Sub extends withBaseClassAndMixins(BaseClass, Mixin1) {
        }

        const sub = new Sub();
        expect(sub.baseClassMethod()).toEqual(0);
        expect(sub.mixin1Method()).toEqual(1);
    });

    it("2 mixins", () => {
        class Sub extends withBaseClassAndMixins(BaseClass, Mixin1, Mixin2) {
        }

        const sub = new Sub();
        expect(sub.baseClassMethod()).toEqual(0);
        expect(sub.mixin1Method()).toEqual(1);
        expect(sub.mixin2Method()).toEqual(2);
    });
});

describe("withMixins 1-n mixins are supported", () => {
    it("1 mixin", () => {
        class Sub extends withMixins(Mixin1) {
        }

        const sub = new Sub();
        expect(sub.mixin1Method()).toEqual(1);
    });

    it("2 mixins", () => {
        class Sub extends withMixins(Mixin1, Mixin2) {
        }

        const sub = new Sub();
        expect(sub.mixin1Method()).toEqual(1);
        expect(sub.mixin2Method()).toEqual(2);
    });
});

