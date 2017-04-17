# Sync Model Params

This is a quick and dirty extension for turning typescript type definitions into
a class extending an immutable `Record`.

In other words, it turns this:
```js
  type params = {
    type?: string,
    displayName?: string,
  };
```

into this:
```js
type params = {
  type?: string,
  displayName?: string,
};

export class Section extends Record({ type: '', displayName: '' }) {
  type: string;
  displayName: string;

  constructor(params?: params) {
    params ? super(params) : super();
  }

  with(values: params) {
    return this.merge(values) as this;
  }
}
```

Running it again with modified types will re-sync while keeping the remainder of
the class implementation intact.

_Note: this isn't published to the extension marketplace.  I really wrote it for my
own use.  If you somehow ran across this and find it useful as well, drop me a line._
