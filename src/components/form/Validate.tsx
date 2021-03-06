import * as VoidTag from "../VoidTag";
import * as React from 'react';
import { Form } from "./index";
import {FormComponentProps} from 'antd/es/form/Form';
export var props = {
    //相等验证
    equals: GearType.String,
    //比较验证
    compare: GearType.String,
    //远程校验
    remote: GearType.String,
    //远程校验的key
    remoteKey: GearType.String,
    //正则校验
    regexp: GearType.String,
    //指定校验器名字
    validatorName: GearType.String,
    //自定义校验过程
    doValidate: GearType.Function,
    ...VoidTag.props
};
export interface state extends VoidTag.state {
    
};
export default abstract class Validate<P extends typeof props, S extends (state)> extends VoidTag.default<P, S> {

    protected form: Form.Form<typeof Form.props & FormComponentProps, Form.state>;

    constructor(props: P, context: {}) {
        super(props, context);
    }
    render() {
        return this.props.children;
    }

}