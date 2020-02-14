import {withMixins} from "./index";

class BaseClass {

    private counter = 0;

    constructor(private readonly val1: string, private readonly val2: number) {
    }

    baseClassMethod() {
        console.log("baseClassMethod", this.counter++);
    }
}

class WrongMixin {
    constructor(private readonly val1: string, private readonly val2: number) {
    }
}

class Mixin1 {

    private counter = 0;

    valueFromMixin1 = "abc";

    mixin1(a: string) {
        console.log("mixin1", a, this.counter++);
    }

    baseClassMethod(v2: Date) {
        console.log("baseClassMethod in mixin", v2);
    }
}

class Mixin1Sub extends Mixin1 {
    mixin1sub() {
        console.log("mixin1sub");
    }
}

class Mixin1B {

    private counter = 0;

    mixin1(b: boolean) {
        console.log("mixin1b", b);
    }

    mixin1b() {
        console.log("mixin1b", this.counter++);
    }
}

class Sub extends withMixins(BaseClass, Mixin1Sub, Mixin1B, OnDestroyMixin) {

    constructor() {
        super("", 2);
    }

    foo() {
        this.observeOnDestroy()

        this.baseClassMethod();
        this.mixin1("");
        this.mixin1b();

        this.baseClassMethod();
        this.mixin1("");
        this.mixin1b();

        this.mixin1sub();
    }

}



describe("mixin", () => {
    it("test", () => {
        const sub = new Sub();
        expect(sub).toBeInstanceOf(Sub);
        expect(sub).toBeInstanceOf(BaseClass);
        sub.foo();
    });
});

