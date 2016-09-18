/**
 * Created by dong.she on 16/7/10.
 */
var angular = require('angular'),
    react = require('react'),
    reactDOM = require('react-dom'),
    components = require('../react_components/config'),
    ucNgReact = angular.module('ucNgReact', []);

// 根据componentName获取React组件
function getComponent(componentName) {
    return components[componentName];
}

// 安全的apply函数
function applied(fn, scope) {
    if (fn.warpInApply) {
        return fn;
    }
    var wrapped = function () {
        var args = arguments;
        var phase = scope.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            return fn.apply(null, args);
        } else {
            return scope.$apply(function () {
                return fn.apply(null, args);
            });
        }
    };
    wrapped.warpInApply = true;
    return wrapped;
}

// 将props上的函数 包一层ng的$apply
function applyFunction(obj, scope) {
    for (var key in obj) {
        obj[key] = angular.isFunction(obj[key]) ? applied(obj[key], scope) : obj[key];
    }
    return obj;
}

// 渲染react的组件
function renderReactComponent(component, props, scope, elem, slot, done) {
    var reactNode;
    done = angular.isFunction(done) ? done : angular.noop;
    component && scope.$evalAsync(function () {
        reactNode = reactDOM.render(React.createElement(component, props), elem, done);
        //  分发ng 模版 到react中
        slotContent(slot, reactNode);
    }, 0);
}

// 报错机制提示
function catchError(type, error) {
    switch (type) {
        case 'NO_VAR_COMP_NAME'://没有组件名称
            console.error('Error:--->' + '你没有传入组件的名称,需要指定rcname属性,eg:<uc-comp rcname="UC-Button"></uc-comp>');
            break;
        case 'NO_COMP'://没有该组件
            console.error('Error:--->' + '在映射表中无法找到对应组件的名称,1.请确认react组件是否已经加入到映射表,2.请确认rcname是否和指定的映射表对应.');
            break;
        case 'NO_SLOT_ELEM': //有孩子节点但是无SLOT
            // TODO 加上WIKI地址
            console.error('WARNING:--->' + '如果需要将angular的内容分发到react组件中,需要使用uc-slot指令,wiki地址:...');
            break;
        case 'NO_SLOT_TYPE': //有SLOT但是无type属性
            // TODO 加上WIKI地址
            console.error('WARNING:--->' + '如果需要将angular的内容分发到react组件中,需要在uc-slot指令添加对应的type属性,wiki地址:...');
            break;
        case 'SLOT_TYPE_ERROR': //有SLOT但是无type属性
            // TODO 加上WIKI地址
            console.error('WARNING:--->' + error);
            break;

    }
}

// 取出ng-slot
function slotOnChildElem(elems) {
    var jqDivElem = angular.element('<div>');
    var divElem = jqDivElem.append(elems)[0];
    var slotElemsObj = {};
    var type = '', i = 0;
    var slotElems = divElem.querySelectorAll('uc-slot');
    var slotElemsByAttr = divElem.querySelectorAll('[uc-slot]');
    if (slotElems.length > 0) {
        for (i = 0; i < slotElems.length; i++) {
            if (!slotElems[i].isSlot) {
                slotElems[i].isSlot = true;
                type = slotElems[i].getAttribute('type');
                slotElemsObj[type] = slotElems[i].childNodes[0];
            }
        }
        var attrElem = divElem.querySelectorAll('[uc-slot]');
        for (i = 0; i < attrElem.length; i++) {
            if (!attrElem[i].isSlot) {
                attrElem[i].isSlot = true;
                type = attrElem[i].getAttribute('type');
                slotElemsObj[type] = attrElem[i].childNodes[0];
            }
        }
    } else {
        for (i = 0; i < slotElemsByAttr.length; i++) {
            slotElemsByAttr[i].isSlot = true;
            type = slotElemsByAttr[i].getAttribute('type');
            slotElemsObj[type] = slotElemsByAttr[i].childNodes[0];
        }
    }
    if (elems.length > 0 && slotElems.length <= 0 && slotElemsByAttr.length <= 0) {
        catchError('NO_SLOT_ELEM');
    }
    return slotElemsObj;
}

// 具体的分发函数
function slotContent(elems, reactNode) {
    var slotElemsObj = slotOnChildElem(elems);
    var reactNodeRefs = reactNode.refs;
    if (slotElemsObj) {
        _.each(slotElemsObj, function (item, key) {
            // react refs中没有对应的key就报错
            if (_.indexOf(_.keys(reactNodeRefs), key) > -1) {
                reactNodeRefs[key].appendChild(item);
            } else {
                key !== 'null' && catchError('SLOT_TYPE_ERROR', '你ng-slot的type为' + key + ',这个[' + key + ']无法在React组件中找到接受分发内容的容器名称,请查看具体的该组件的API');
            }
        });
    }
}

ucNgReact.directive('ucSlot', [function () {
    return {
        restrict: 'AE',
        transclude: true,
        template: '<div class="uc-slot" ng-transclude></div>',
        link: function (scope, elem, attrs) {
            if (!attrs.type) {
                catchError('NO_SLOT_TYPE');
            }
        }
    };
}]);

ucNgReact.directive('ucComp', ['$parse', '$compile', '$timeout', function ($parse, $compile, $timeout) {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        // TODO 这一块为了编译transclude中的节点 好像有一些问题
        scope: {
            props: '='
        },
        template: '<div class="uc-comp"></div>',
        compile: function (element, attrs, transclude) {
            return function (scope, elem, attrs) {
                if (!attrs.rcname) {
                    catchError('NO_VAR_COMP_NAME');
                    return;
                }
                var props = scope.props || {},
                    component = getComponent(attrs.rcname),
                    clone = [];
                // 但props的属性是 function时候,需要包一层 $apply
                if (!component) {
                    catchError('NO_COMP');
                    return;
                }
                props = applyFunction(props, scope);
                // 处理 编译slot;
                if (props && props.compileScope) { // 如果开发者指定了compileScope,则选用开发的compileScope,默认$parent
                    clone = transclude(props.compileScope);
                } else {
                    clone = transclude(scope.$parent);
                }
                // 只关心 props中值的变化
                function watchProps() {
                    scope.$watch('props', function (val, old) {
                        val !== old && renderReactComponent(component, val, scope, elem[0], clone);
                    }, true);
                }
                // 渲染react组件
                renderReactComponent(component, props, scope, elem[0], clone, watchProps);
            };
        }
    };
}]);

module.exports = ucNgReact;
