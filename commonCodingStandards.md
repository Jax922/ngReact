###  React组件规范
####  JSX规范
*  文件名称<font color=red>驼峰</font>命名并且<font color=red>首字母</font>必须<font color=red>大写</font>，文件名<font color=red>扩展名</font>必须是<font color=red>jsx</font>（不可是js），eg.Button.jsx,FlatButton.jsx.
*  组件名称同文件名称。
*  <font color=red>内部（私有）</font>方法 必须以  <font color=red> _ </font> （<font color=red>下划线</font>）开头。
```js
class Button extends Component {
    _handleClick(){
        console.log('click...');    
    }
    render (){
        return (
            <button onClick={()=>{this._handleClick}}>button</button>  
        );
    }
}
```
*  组件render中的return部分必须用()包裹一层，如上例。
*  组件的属性props必须用PropTypes去制定。[PropTypes说明](https://facebook.github.io/react/docs/component-specs.html#proptypes)
*  模块化统一使用es6 Module。不可以直接import React from 'react',如果使用React.xxx，必须要写import {xxx,yyy,zzz} from 'react',比如要使用React.Component和React.PropTypes,必须import {Component,PropTypes} from 'react'
```js
// 这个是React@v15.2.0版本所有暴露的方法，要使用什么方法直接import {xxx} from 'react' 即可。
var React = {

  // Modern

  Children: {
    map: ReactChildren.map,
    forEach: ReactChildren.forEach,
    count: ReactChildren.count,
    toArray: ReactChildren.toArray,
    only: onlyChild
  },

  Component: ReactComponent,

  createElement: createElement,
  cloneElement: cloneElement,
  isValidElement: ReactElement.isValidElement,

  // Classic

  PropTypes: ReactPropTypes,
  createClass: ReactClass.createClass,
  createFactory: createFactory,
  createMixin: function (mixin) {
    // Currently a noop. Will be used to validate and trace mixins.
    return mixin;
  },

  // This looks DOM specific but these are actually isomorphic helpers
  // since they are just generating DOM strings.
  DOM: ReactDOMFactories,

  version: ReactVersion,

  // Deprecated hook for JSX spread, don't use this for anything.
  __spread: __spread
};
```
*  所有的props上选传的值，必须初始化defaultPorps
#####  需要讨论的规范
*  文件中尽量不要随便引入react-dom（findDOMNode，render）
*  由于es6不是auto binding，所以在render中使用组的内部方法的时候，必须要bind this。这一块有两种方法解决，一种就是bind,一种是箭头函数。用哪一个？统一一下。
*  组件的state，不可以把很大的数据放入state，比如一个List组件，这个时候state不可以直接存储整个list数据，应该是list.length。这个里面最好还得规范一下state的对象深度，eg.
```js
this.state = {
    a: {
        //...
        b: {
           // ...
        }
    }
}
// 这个state深入为3，是不是有点太深了。。。这个到时候重点讨论一下。
```
####  API接口规范
*  命名是驼峰，首字母小写的,最多不超多3 <font color=red> 这个地方也可以是最多2个</font>个英文单词（讨论一下） 尽量语意化，实在不好用英文命名的，提出来大家讨论，eg.onChange,title.
*  暴露DOM事件接口时，接口名称必须和React的事件名称一致，eg.onClick,onChange,onFocus onBlur,onChange onInput onSubmit,onClick onDoubleClick onDrag onDragEnd onDragEnter onDragExit onDragLeave
onDragOver onDragStart onDrop onMouseDown onMouseEnter onMouseLeave
onMouseMove onMouseOut onMouseOver onMouseUp

####   style规范
使用less。
*   如果需要写mixin，必须在mixin.less中书写
*   在组件的style文件夹下必须存在index.js,这个js文件是require所有的less文件
*   所有的className必须小写，并且以下划线分割。
*   每一个组件最外层需要添加一个className，{命名空间}-{组件名}（命名空间定为rc），比如rc-button,不可以rc-black,rc-red这种。保持语义化。
*   子组件的className, 命名必须是{命名空间}-{组件名}-{子模块名}，比如：
```html
 <Modal className="rc-modal">
    <div className="rc-modal-title"></div>
    <div className="rc-modal-content"></div>
    <div className="rc-modal-footer"></div>
 </Modal>
```
*   组件可能需要添加一些状态的class，这时候命名规范：{命名空间}-{组件名}-{状态描述},eg.rc-modal-open,rc-modal-close,不可以随便命名为rc-modal-red
*   全部（最好）都是class，保证可以通过className叠加的方式改变样式
*   在js中使用class的时候，使用classname辅助我们开发，不要手动书写class，比如：这样写不推荐
```html
<div className="class-1 class-2 class-3"></div> 
```
[classname介绍](https://github.com/JedWatson/classnames)



