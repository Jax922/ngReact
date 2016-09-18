# ngReact
angular结合React（如果不想看如何实现的直接看［使用说明］［ngReact APi］就可以了）
###  Angular结合React组件
>  前言: 如何结合Angular和React?这个问题困扰了我很长时间.一开始的想法是每一个React组件对应一个Ng的指令,我们直接把React的组件直接渲染到Ng指令的DOM上.示意图如下:
![img](./Slice 1.png)
这样做的工作量无疑很大,每一个React的组件都要对应到一个Ng指令,后期维护成本同样很大.这里面最大问题是Ng指令太多了,要是能够用一个指令,这样就可以解决上面的问题.示意图如下:
![img](./Slice 2.png)
为什么要使用Ng指令？不用其他的Ng特性呢。
首先我们想把React当作View层，Angular作为数据流管理，想尽可能把让React组件只在Ng的模版中使用，那么这个时候考虑Ng指令是最好的。用指令就等于我们让Angular和React直接就通过真实的DOM链接起来。这个里面其实也可以提供Ng的Service出来，如果需要的话，后期可以暴露出相对应Ng的Service。


####  技术实现
*  如何让Ng指令去结合React组件?
在Ng指令(rc-comp)上提供一个属性(rcname),只要提供了rcname,Ng就会去找到对应的React组件,然后和directive scope 上的props结合渲染成真实DOM，最后插入到到Ng指令的真实节点上.示意图如下:
![img](http://chuantu.biz/t5/23/1469625991x3738746535.jpg)

*  如何将Ng模版分发到React组件中?
分发到底什么意思？千万不要觉得很高大上，其实就是将指定的ng模板插入到React组件渲染完成后的对应的真实节点DOM上。
提供另外一个Ng指令(rc-slot),在rc-comp中使用rc-slot指令将特定的Ng模版分发到React组件中.rc-slot提供type属性,type必须和React提供的装载分发内容的容器名称相同.有type属性之后将rc-slot中的Ng模版,插入到React对应的容器.

>  分发这个想法和概念都是借鉴vue的。[vue分发介绍](http://cn.vuejs.org/guide/components.html#使用-Slot-分发内容)
![img](http://chuantu.biz/t5/23/1469629289x3738746595.png)

####  使用说明
*   首先引入文件
*   将文件提供的ngReact module,加入你的ng module的依赖中
```js
var app = angular.module('app', ['ngReact']);
```
*   经过上面两步就可以在angular中使用react组件了,当你需要使用react组件的时候,直接在angular模版文件中使用rc-comp指令引入对应的react组件.
```html
// 下面举例引入Button组件,
// 参数解读:
// 1. rcname对应React具体的组件名称
// 2.props属性是传入对应React组件的属性 , 比如buttonProps在controller中定义为: {type: 'primary', handleClick: function(){...}};那么对应传入组件的属性是type 和handleClick
<rc-comp rcname="Button" props="buttonProps"></rc-comp>
```
如果需要分发angular的模板到react中:例子如下:
```html
// 下面举例引入Modal组件,
// 参数解读:
// 1. rcname对应React具体的组件名称( 同上)
// 2. props属性是传入对应React组件的属性 (同上)
// 3. rc-slot解读:
// rc-slot上需要提供一个type属性,这个属性必须和React组件提供的相对应容器的名称一致(这里容器名称会在React组件的API中说明,当你使用具体React组件的时候,一定要仔细查看对应的API)
// 当你提供了具体的type属性之后,angular的模版就可以分发到组件对应的容器中.
<rc-comp rcname="Modal" props="modalProps">
    <rc-slot type="title">
        <h1>这里是modal的标题</h1>
    </rc-slot>
    <rc-slot type="content">
        <div>这里是modal的内容</div>
    </rc-slot>
</rc-comp>
```

####   ngReact API
*   rc-comp(指令),功能：获取对应的React组件，然后传递一些props给组件，最后渲染改组件到指令的真实DOM上。

| 属性名        | 属性值类型    | 说明                           |
| ------------- |:-------------:| :-----------------------------:|
| rcname        | string        | rcname 对应具体React组件的名称 |
| props         | object        | props，通过scope获取，props上的键值最后全部传递给对应的React组件［作为React组件的属性］|

*   rc-slot(指令),功能：将Ng的模版分发到React组件对应的容器中（听起来抽象，写代码看代码之后就很好懂...）。

| 属性名        | 属性值类型    | 说明                           |
| ------------- |:-------------:| :-----------------------------:|
| type          | string        | 对应React组件具体的容器名称，这个名称需要查看具体该组件的API说明 |
