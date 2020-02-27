
[![Build Status](https://travis-ci.org/w11k/ts-mixins.svg?branch=master)](https://travis-ci.org/w11k/ts-mixins)
[![npm version](https://badge.fury.io/js/%40w11k%2Fts-mixins.svg)](https://badge.fury.io/js/%40w11k%2Fts-mixins)

# Sophisticated Mixin Library for TypeScript

**Patrons**

❤️ [W11K - The Web Engineers](https://www.w11k.de/)

❤️ [theCodeCampus - Trainings for Angular and TypeScript](https://www.thecodecampus.de/)

## Demo

```

```

## Installation

**Download the NPM package**

```
npm i --save @w11k/ts-mixins
```

**Usage**

**How to use mixins together with a base class:**

```
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

class Sub extends withBaseClassAndMixins(BaseClass, Mixin1) {
}
```

**How to use mixins without a base class:**

```
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

class Sub extends withMixins(BaseClass, Mixin1) {
}
```
