import * as Tag from '../Tag';
import { Icon as AntdIcon,Popover } from 'antd';
import * as React from 'react';
import { Form } from "./index";
import { GearUtil } from '../../utils';
import * as Combotree from '../form/Combotree';
import { UUID, ObjectUtil } from '../../utils';
var props = {
    ...Tag.props,
    editable: GearType.Boolean,
    editCType: GearType.String,
    editCell: GearType.Boolean,
    value: GearType.String,
    form: GearType.VoidT<Form.Form<any, Form.state>>(),
    lower: GearType.String,
    upper: GearType.String,
    label: GearType.String,
    showLink:GearType.Boolean
};
interface state extends Tag.state {
    editable?: boolean;
    editCell?: boolean;
    value?: string;
    label?: string;
    oldValue?: string;
    width?:any
}
//可编辑的单元格
export default class EditTableCell<P extends typeof props, S extends state> extends Tag.default<P, S> {
    
    private gearEle: any;
    //缓存数据
    private cacheValue: any;

    protected afterReceiveProps(nextProps: P): Partial<typeof props> {
        return {
            editable: nextProps.editable,
            value: nextProps.value,
            label: this.getLabel()
        };
    }

    validate() {
        if(this.props.form) {
            return this.props.form.validateField(this.props.name);
        }
        return true;
    }

    getProps() {
        return {
            save: ()=>{
                if(this.doJudgementEvent("beforeSave",this.props.name,this.props.value)==false)
                    return;
                let error = this.validate();
                if(error != true) {
                    return;
                }
                this.doEvent("change", this.state.value, this.state.oldValue, this.state.label);
                this.editDisable(()=>{
                    //返回false保持编辑状态
                    if(this.doJudgementEvent("save",this.props.name,this.state.value)==false) {
                        this.editEnable();
                    }
                });
            },
            edit:()=>{
                //编辑的时候缓存数据
                if(this.doJudgementEvent("beforeEdit",this.props.name,this.state.value)==false)
                    return;
                this.cacheValue = this.state.value;
                this.editEnable();                
            },
            reset:()=>{
                if(this.doJudgementEvent("beforeReset",this.props.name,this.state.value)==false)
                    return;
                this.setValue(this.cacheValue);
            },
            editable: this.state.editable,
            value: this.state.value,
            label: this.state.label,
            showLink: this.props.showLink===false?false:true
        };
    }

    getInitialState(): state {
        this.cacheValue = this.props.value;
        return {
            editable: this.props.editable,
            value: this.props.value,
            label: ""
        };
    }

    render() {
        let props = this.getProps();
        let reactEle = this.getEditGearEle();
        // console.log(reactEle)
        let cellText = (reactEle && reactEle['props'] && reactEle['props'].ctype=="file" && props.showLink)?<a download href={props.label || " "}  className={"cell-value"}>{props.label || " "}</a>:<span className={"cell-value"}>{props.label || " "}</span>;
        // return <span className={"cell-element"}>{reactEle}</span>;
        return <div className="edit-table-cell">
                <div className="editable-cell-input-wrapper" style={{display: props.editable?"block":"none"}}>
                        {
                            this.props.editCell ? 
                            <Popover trigger="hover" placement="right" content={<div className="editable-cell-control">
                                <AntdIcon
                                    style={{ cursor:'pointer'}}
                                    type="check"
                                    title="保存"
                                    className={"editable-cell-icon-save"}
                                    onClick={props.save.bind(this)}
                                />
                                <AntdIcon
                                    style={{ cursor:'pointer'}}
                                    type="rollback"
                                    title="取消"
                                    className={"editable-cell-icon-reset"}
                                    onClick={props.reset.bind(this)}
                                />
                            </div>}>
                                <span className={"cell-element"}>{reactEle}</span>
                            </Popover>
                            :<span className={"cell-element"}>{}</span>
                        }
                </div>
                <div className="editable-cell-text-wrapper" style={{display: props.editable?"none":"block"}}>
                    {
                        this.props.editCell?
                        <Popover trigger="hover" placement="right" content={<div className="editable-cell-control">
                                <AntdIcon
                                    style={{ cursor:'pointer'}}
                                    type="edit"
                                    title="编辑"
                                    className={"editable-cell-icon-edit"}
                                    onClick={props.edit.bind(this)}
                                />
                            </div>}>
                            <span className={"cell-value"}>{cellText}</span>
                        </Popover>
                        :
                        <span className={"cell-value"}>{cellText}</span>
                    }
                </div>
        </div>;
    }

    getLabel() {
        // console.log(this.gearEle && this.gearEle.getValue())
        let label;
        if(this.gearEle != null && this.gearEle.getText) {
            label = this.gearEle.getText();
        }
        if(label) {
            return label;
        }else {
            label = G.$(this.props.columnEle).attr("text");
            return ObjectUtil.parseDynamicValue(label,this.props.record);
        }
    }

    afterRender() {  

        let editable = this.state["editable"];
        if(editable != true) {
            let label = this.getLabel();
            this.setState({
                label: label
            });
        }
    }

    getEditGearEle() {
        console.log(this)
        let editCType = this.props.editCType;
        let lower = this.props.lower;
        let upper = this.props.upper;
        let props:any = G.G$.extend(
            {
                dictype:this.props['dictype'],
                width:this.props.width,
                url:this.props['url'],
                required:this.props['required']
            },
            // this.props,
            {
                id: this.props.id,
                key: this.props.id,
                name: this.props.name,
                ref: (ele: any)=>{
                    if(ele) {
                        this.gearEle = ele;
                    }
                },
                lower: lower,
                upper: upper,
                "data-cellId": this.props.id,
                onChange: (value: any,oldValue: any) => {
                    console.log('change')
                    console.log(value)
                    console.log(oldValue)
                    let label = this.getLabel();
                    console.log(label)
                    this.setState({
                        oldValue,
                        value,
                        label
                    })
                },
                value: this.state.value
        });
        // console.log(props)
        delete props.editCell
        // console.log(this.props.children)
        return editCType?GearUtil.newInstanceByType(editCType, props):this.props.children; 
    }

    setValue(value: any,callback?: Function) {
        let text: any;
        let oldValue: any = this.state.value;
        if(this.gearEle) {
            this.gearEle.setValue(value, ()=> {
                text = this.gearEle.getText();
                this.doEvent("change", value, oldValue, text);
                if(callback) {
                    callback();
                }
            });
        }else {
            this.doEvent("change", value, oldValue, text);
            if(callback) {
                callback();
            }
        }
        
    }

    setText(text: any,callback?: Function) {
        let oldValue: any = this.state.value;;
        if(this.gearEle) {
            this.gearEle.setText(text, ()=> {
                let value = this.gearEle.getValue();
                this.doEvent("change", value, oldValue, text);
                if(callback) {
                    callback();
                }
            });
        }else {
            this.doEvent("change", text);
            if(callback) {
                callback();
            }
        }
    }

    editEnable(callback?: Function) {
        this.setState({
            editable: true
        },()=>{
            if(callback) {
                callback();
            }
        });
    }

    editDisable(callback?: Function) {
        this.setState({
            editable: false
        },()=>{
            if(callback) {
                callback();
            }
        });
    }
}