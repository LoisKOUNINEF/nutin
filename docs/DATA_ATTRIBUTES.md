# Data-xxx Attributes

Use to interact with the DOM.

## Components

- `data-component`

```html
<div class="my-class">
	<span data-component="my-first-selector"></span>
</div>
<div data-component="my-second-selector"></div>
```
```ts
class MyParent {
	childConfigs(): ComponentConfig[] {
	  return [{
	    selector: 'my-first-selector',
	      factory: (el) => new MyComponent(el, {
	      	// config?
	  	  })
		  },{
	    selector: 'my-second-selector',
	      factory: (el) => new MyComponent(el, {
	      	// config?
	  	  })
		  }
		]
	}
}
```

- `data-catalog`

```html
<div data-catalog="my-first-catalog"></div>
<div data-catalog="my-second-catalog"></div>
```
```ts
class MyParent {
	childConfigs(): ComponentConfig[] {
	// catalogConfig inherited method returns ComponentConfig[]
	  const catalog =  this.catalogConfig({
	    array: myArray, // Array from which components will be generated
	    elementName: 'first-element', 
	    selector: `my-first-catalog`,
	    component: MyComponent
	  });

	  return catalog;
	}
}
```

## Pipes

- `data-pipe`

```html
<!-- basic usage -->
<div data-pipe="capitalizeAll"></div>
<!-- passing arguments -->
<div data-pipe="date:fr-FR,long,time"></div>
<!-- chaining pipes -->
<div data-pipe="date|capitalizeAll"></div>
<!-- arguments & chaining -->
<div data-pipe="date:en-US,long,time|capitalizeAll"></div>
```

- `data-pipe-source`

```html
<div 
	data-pipe="capitalizeAll"
	data-pipe-source="this will be capitalized and set as textcontent"
></div>
```

## i18n

- data-i18n

```html
<!-- will set textContent with key value from my-component/locales/*.json -->
<div data-i18n="my-component.key"></div>
```

## Event binding

- `data-event`

```html
<!-- direct argument -->
<div data-event="change:callbackFn:fnArg"></div>
<!-- set argument -->
<div value="my-value" data-event="change:callbackFn:@value"></div>
```

- `data-bind`

```html
<!-- 
input and textarea : el.value = String(value); // foo
other elements (fallback) : el.textContent = String(value); // bar
-->
<input data-bind="foo"></input>
<div data-bind="bar"></div>
```
```ts
// component
class MyComponent {
	constructor(mountTarget: HTMLElement, config: MyConfig, props?: ComponentProps) {
	  super({ templateFn, mountTarget, config, props });
	}
}

// parent
class MyParent {
	childConfigs(): ComponentConfig[] {
	  return [{
	    selector: 'my-selector',
	    factory: (el) => new MyComponent(el,
	    	{
		    	// myconfig
	     	},
	     	{ foo: 'foo', bar: 'bar' }
	    )
	  }]
	}
}
```

## Remove empty HTML tags

- `data-optional` 

```html
<!-- Will remove div if myOptionalData is undefined -->
<div data-optional>${ myOptionalData }</div>
```

- `data-optional="attrName"` (`src`, `href`, ...)

```html
<!-- Will remove div if src is undefined -->
<div data-optional="src" src="">Will be removed</div>
```              
