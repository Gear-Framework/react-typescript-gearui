import * as React from 'react';
import { TableProps } from '../../../node_modules/antd/lib/table/interface';
import * as Tag from '../Tag';
import * as Table from '../data/Table';
import * as Button from '../basic/Button';
import * as FormTag from './FormTag';
import { UUID } from '../../utils';
import { ObjectUtil } from '../../utils';
import * as Icon from '../basic/Icon';
import * as EditTableCell from './EditTableCell';
import {FormComponentProps} from 'antd/es/form/Form';
import { Form } from "./index";
import { default as Column } from '../data/Column';
export var props = {
    ...Table.props,
    ...FormTag.props,
    editable: GearType.Boolean,
    editCell: GearType.Boolean,
    copyType: GearType.Enum<"copy"|"insert">(),
    control: GearType.String,
    rowControl: GearType.Boolean,
    controlLabel: GearType.String,
    footerControl: GearType.Boolean
}
export interface state extends Table.state,FormTag.state {
    control?: string;
    editable?: boolean;
    title?: any;
    controlLabel?: string;
    value?:any
    children:any
}
export interface Control {
    name: string;
    props: Partial<typeof Button.props>;
    onclick: Function;
    ref?: Function;
}
export var useName = 'editlist';
class EdittableControl {
    static add: Control = {
        name: "add",
        props: {
            icon: "plus",
            value: "添加行"
        },
        ref:function(ele: any){
            this.controlBtns.put("add",ele);
        },
        onclick: function(){
            this.add();
        }
    };
    static delete:Control = {
        name: "delete",
        props: {
            icon: "delete",
            value: "删除行",
        },
        ref:function(ele: any){
            this.controlBtns.put("delete",ele);
        },
        onclick: function(){
            this.delete();
        }
    };
    static clear:Control = {
        name: "clear",
        props: {
            icon: "clear",
            value: "清空",
        },
        ref:function(ele: any){
            this.controlBtns.put("clear",ele);
        },
        onclick: function(){
            this.clear();
        }
    };
    static copy:Control = {
        name: "copy",
        props: {
            icon: "copy",
            value: "复制行",
        },
        ref:function(ele: any){
            this.controlBtns.put("copy",ele);
        },
        onclick: function(){
            this.copy();
        }
    };
    static edit:Control = {
        name: "edit",
        props: {
            icon: "edit",
            value: "编辑",
        },
        ref:function(ele: any){
            this.controlBtns.put("edit",ele);
        },
        onclick: function(){
            this.edit();
        }
    };
    static paste:Control = {
        name: "paste",
        props: {
            icon: "paste",
            value: "粘贴行",
        },
        ref:function(ele: any){
            this.controlBtns.put("paste",ele);
        },
        onclick: function(){
            this.paste();
        }
    };
    static up:Control = {
        name: "up",
        props: {
            icon: "up",
            value: "上移"
        },
        ref:function(ele: any){
            this.controlBtns.put("up",ele);
        },
        onclick: function(){
            this.up();
        }
    };
    static down:Control = {
        name: "down",
        props: {
            icon: "down",
            value: "下移"
        },
        ref:function(ele: any){
            this.controlBtns.put("down",ele);
        },
        onclick: function(){
            this.down();
        }
    };
    static save:Control = {
        name: "save",
        props: {
            icon: "save",
            value: "保存",
        },
        ref:function(ele: any){
            this.controlBtns.put("save",ele);
        },
        onclick: function(){
            this.save();
        }
    };
    static reset:Control = {
        name: "reset",
        props: {
            icon: "reset",
            value: "取消修改",
        },
        ref:function(ele: any){
            this.controlBtns.put("reset",ele);
        },
        onclick: function(){
            this.reset();
        }
    };
    
}
export default class EditTable<P extends typeof props & TableProps<any>, S extends state> extends Table.default<P, S> {

    protected focusRow:any;
    protected mouseOnRow:any;
    copyRow:any;
    protected controlBtns: GearJson<Button.default<any, any>> = new GearJson();
    // protected upBtn:GButton<GButtonProps>;
    // protected downBtn:GButton<GButtonProps>;
    static control = EdittableControl;
    protected controls = {};
    protected cells = {};
    //数据缓存
    protected cacheData:any[];
    //记录单元格是否已经渲染过了，防止在column["render"]中多次渲染----antd的bug
    protected cellRendered = {};
    protected form: Form.Form<typeof Form.props & FormComponentProps, Form.state>;
    constructor(props: P, context: {}) {
        super(props, context);
        this.setForm(this.ast);
    }

    private setForm(ast: ASTElement) {
        if(ast) {
            let parent = ast.parent;
            if(parent && ObjectUtil.isExtends(parent.vmdom, "Form")) {
                this.form = parent.vmdom;
            }else {
                this.setForm(parent);
            }
        }
    }
    //获取控制按钮
    getControls() {
        let controls = new Array();
        let control: any = this.state.control;
        if(control) {
            let controlArray = GearArray.fromString(control,",");
            if(controlArray) {
                for(let i = 0; i < controlArray.length(); i ++) {
                    let con: Control = EditTable.control[controlArray.get(i)];
                    if(con) {
                        let props: any = con.props;
                        if(con.onclick) {
                            props.onClick = con.onclick.bind(this);
                        }
                        if(con.ref) {
                            props.ref = con.ref.bind(this);
                        }
                        let btn = <Button.default key={UUID.get()} {...props}/>;
                        controls.push(btn);
                    }
                }
            }
        }
        return controls;
    }
    protected _loadSuccess() {
        let dataSource:any = this.getData();
        this.cacheData = new GearArray(dataSource).clone(true).toArray();
    }

    getInitialState(): state {
        let state:any = super.getInitialState();
        return G.G$.extend({},state,{
            editable: this.props.editable != false,
            control: this.props.control,
            controlLabel: this.props.controlLabel,
            // width: this.props.width
        });
    }

    getProps() {

        let props = super.getProps();
        let controlBar = this.props.footerControl===true?{footer:()=>{
            return this.getFooter();
        }}:{title:(currentPageData: any)=>{
            return this.getHeader();
        }}
        return G.G$.extend({},props,controlBar);
    }

    protected _onMouseLeave(record: any,index: any,event: any) {
        this.mouseOnRow = null;
    }

    protected _onMouseEnter(record: any,index: any,event: any) {
        this.mouseOnRow = record;
    }

    protected _onRowClick(record: any,index: any,event: any) {
        this.focusRow = record;
        super._onRowClick(record,index,event);
        if(this.controlBtns.get("up")) {
            if(this.focusRow.sequence <= 1) {
                this.controlBtns.get("up").disable();
            }else {
                this.controlBtns.get("up").enable();
            }
        }
        let data = this.getData()||[];
        if(this.controlBtns.get("down")) {
            if(this.focusRow.sequence >= data.length) {
                this.controlBtns.get("down").disable();
            }else {
                this.controlBtns.get("down").enable();
            }
        }
        if(this.controlBtns.get("delete")) {
            if(this.focusRow.cannotControl===true) {//
                this.controlBtns.get("delete").disable();
            }else {
                this.controlBtns.get("delete").enable();
            }
        }
    }

    //获取头部按钮
    protected getHeader() {
        let controls = this.getControls();
        let eleMap = controls.map((ele)=>{
            return <div key={UUID.get()} className={"list-control"}>{ele}</div>;
        });
        if(eleMap.length > 0) {
            return <div className={"list-header"}>
                {eleMap}
            </div>;
        }
        return null;
    }
    //获取底部按钮
    protected getFooter() {
        let controls = this.getControls();
        let eleMap = controls.map((ele)=>{
            return <div key={UUID.get()} className={"list-control"}>{ele}</div>;
        });
        if(eleMap.length > 0) {
            return <div className={"list-footer"}>
                {eleMap}
            </div>;
        }
        return null;
    }

    reset() {
        if(this.doJudgementEvent("beforeReset")==false)
            return;
        if(this.cacheData != null && this.cacheData.length > 0) {
            let dataSource = new GearArray(this.cacheData).clone(true).toArray();
            let data = this._loadFilter({dataList:dataSource});
            this.setState({
                dataSource: data.dataList
            },()=>{
                //清除选中等其他状态
                G.G$(".list-row-selected").removeClass("list-row-selected");
                this.mouseOnRow = null;
                this.focusRow = null;
            });
        }else {
            this.setState({
                dataSource: []
            },()=>{
                G.G$(".list-row-selected").removeClass("list-row-selected");
                this.mouseOnRow = null;
                this.focusRow = null;
            });
        }
    }

    //子组件-单元格修改后，同步到父组件 
    changeValue(key:any,props:any,value:any){
        let data:any = this.getData() || [];
        data = data.map((row:any)=>{
            if(row.key == key){
                row[props] = value;
            }
            return row
        })
        this.setState({
            dataSource:data
        })
    }

    resetRow(gele: Tag.default<typeof Tag.props & {__record__: any}, Tag.state>) {
        let nowRow = this.mouseOnRow || this.focusRow;
        if(gele != null) {
            if(gele instanceof Tag.default) {
                nowRow = gele.props.__record__;
            }else {
                nowRow = this.getRow(gele);
            }
        }
        if(this.doJudgementEvent("beforeRowReset",nowRow)==false)
            return false;
        if(this.cacheData != null && this.cacheData.length > 0) {
            let cacheRow = this.cacheData.filter((value: any,index: any)=>{
                return value.key == nowRow.key;
            });
            let data = this.getData()||[];
            // console.log(cacheRow[0]);
            if(cacheRow && cacheRow.length > 0) {
                for(let i = 0; i < data.length;i++) {
                    if(data[i].key == cacheRow[0].key) {
                        data[i] = G.G$.extend({},cacheRow[0]);
                    }
                }
            }else {
                data = new GearArray(this.cacheData).clone(true).toArray();
            }
            this.setState({
                dataSource: data
            },()=>{
            });
        }else {
            this.setState({
                dataSource: []
            });
        }
        return true;
    }

    validate():boolean {
        if(this.form) {
            return this.form.validate();
        }
        return true;
    }

    //保存所有数据
    save() {
        if(this.doJudgementEvent("beforeSave")==false)
            return;
        let validated = this.validate();
        console.log(validated)
        if(validated != true) {
            return;
        }
        //返回false保持编辑状态
        if(this.doJudgementEvent("save")==false) {
            return;
        }
        
        let editable: any = this.state.editable;
        if(editable != true) {
            if(typeof editable == "boolean") {
                editable = {};
            }
            let dataSource = this.getData()||[];
            for(let i=0; i < dataSource.length; i++) {
                let row = dataSource[i];
                editable[row.key] = false;
            }
            this.setState({
                editable
            },()=>{
                this.cacheData = new GearArray(this.getData()).clone(true).toArray();
            });
        }else {
            this.cacheData = new GearArray(this.getData()).clone(true).toArray();
        }
    }

    //保存一行数据
    saveRow(gele: Tag.default<typeof Tag.props & {__record__: any}, Tag.state>) {
        let nowRow = this.mouseOnRow || this.focusRow;
        if(gele != null) {
            if(gele instanceof Tag.default) {
                nowRow = gele.props.__record__;
            }else {
                nowRow = this.getRow(gele);
            }
        }
        if(this.doJudgementEvent("beforeRowSave",nowRow)==false)
            return;        
        //校验
        if(nowRow) {
            let validated:any = true;
            for(let key in nowRow) {
                let cell = this.getCell(nowRow,key);
                if(cell instanceof EditTableCell.default) {
                    let cellvalidated = cell.validate();
                    if(cellvalidated != true) {
                        validated = false;
                    }
                }
            }
            if(validated == false) {
                return;
            }
            
        }
        //返回false保持编辑状态
        if(this.doJudgementEvent("rowSave",nowRow)==false) {
            return;
        }
        if(nowRow) {
            let editable: any = this.state.editable;
            if(editable != true) {
                if(typeof editable == "boolean") {
                    editable = {};
                }
                editable[nowRow.key] = false;
                this.setState({
                    editable
                },()=>{
                    this.cacheData = new GearArray(this.getData()).clone(true).toArray();
                });
            }else {
                this.cacheData = new GearArray(this.getData()).clone(true).toArray();
            }
            
        }
    }

    down(gele: Tag.default<typeof Tag.props & {__record__: any}, Tag.state>) {
        let nowRow = this.mouseOnRow || this.focusRow;
        if(gele != null) {
            if(gele instanceof Tag.default) {
                nowRow = gele.props.__record__;
            }else {
                nowRow = this.getRow(gele);
            }
        }
        if(nowRow && this.doJudgementEvent("beforeRowDown",nowRow)==false)
            return;
        if(nowRow == null) {
            G.messager.alert("提示消息","请先选中要下移的行");
            return;
        }
        let dataSource:Array<any> = this.getData()||[];
        let dataArr = new GearArray(dataSource);
        nowRow = dataSource.filter((value,index)=>{
            return value.key == nowRow.key;
        });
        nowRow = nowRow[0];
        dataArr.down(nowRow);
        dataSource = dataArr.toArray();
        let data = this._loadFilter({dataList:dataSource});
        this.setState({
            dataSource:data.dataList
        },()=>{
            for(let i = 0; i< dataSource.length;i++){
                let row = dataSource[i];
                if(row.key == nowRow.key) {
                    G.G$(".list-row-index" + row.key).addClass("list-row-selected");
                }else {
                    G.G$(".list-row-index" + row.key).removeClass("list-row-selected");
                }
            }
            this.controlBtns.get("up").enable();
            if(nowRow.sequence >= dataSource.length) {
                this.controlBtns.get("down").disable();
            }
        });
    }

    up(gele: Tag.default<typeof Tag.props & {__record__: any}, Tag.state>) {
        let nowRow = this.mouseOnRow || this.focusRow;
        if(gele != null) {
            if(gele instanceof Tag.default) {
                nowRow = gele.props.__record__;
            }else {
                nowRow = this.getRow(gele);
            }
        }
        if(nowRow && this.doJudgementEvent("beforeRowUp",nowRow)==false)
            return;        
        if(nowRow == null) {
            G.messager.alert("提示消息","请先选中要上移的行");
            return;
        }
        let dataSource:Array<any> = this.getData()||[];
        let dataArr = new GearArray(dataSource);
        nowRow = dataSource.filter((value,index)=>{
            return value.key == nowRow.key;
        });
        nowRow = nowRow[0];
        dataArr.up(nowRow);
        dataSource = dataArr.toArray();
        let data = this._loadFilter({dataList:dataSource});
        this.setState({
            dataSource:data.dataList
        },()=>{
            for(let i = 0; i< dataSource.length;i++){
                let row = dataSource[i];
                if(row.key == nowRow.key) {
                    G.G$(".list-row-index" + row.key).addClass("list-row-selected");
                }else {
                    G.G$(".list-row-index" + row.key).removeClass("list-row-selected");
                }
            }
            this.controlBtns.get("down").enable();
            if(nowRow.sequence <= 1) {
                this.controlBtns.get("up").disable();
            }
        });
    }

    paste(gele: Tag.default<typeof Tag.props & {__record__: any}, Tag.state>) {
        let nowRow = this.mouseOnRow || this.focusRow;
        if(gele != null) {
            if(gele instanceof Tag.default) {
                nowRow = gele.props.__record__;
            }else {
                nowRow = this.getRow(gele);
            }
        }
        if(this.copyRow == null) {
            G.messager.alert("提示消息","请先使用复制功能复制要粘贴的行");
            return;
        }
        if(this.props.copyType == "copy") {
            let dataSource:Array<any> = this.getData()||[];
            if(nowRow) {
                let dataArr = new GearArray(dataSource);
                let index = dataArr.indexOf(nowRow);
                dataArr.insert(this.copyRow,index);
                dataSource = dataArr.toArray();
            }else {
                dataSource.push(this.copyRow);
            }
            let data = this._loadFilter({dataList:dataSource});
            let editable = this.state.editable||{};
            if(typeof editable == "boolean") {
                editable = {};
                for(let i=0; i < data.dataList.length; i++) {
                    let row = data.dataList[i];
                    editable[row.key] = true;
                }
            }
            if(editable) {
                editable[this.copyRow.key] = true;
            }
            this.setState({
                "dataSource":data.dataList,
                "editable": editable
            },()=>{
                this.cacheData = new GearArray(data.dataList).clone(true).toArray();
            });
        }
    }

    copy(gele: Tag.default<typeof Tag.props & {__record__: any}, Tag.state>) {
        let nowRow = this.mouseOnRow || this.focusRow;
        if(gele != null) {
            if(gele instanceof Tag.default) {
                nowRow = gele.props.__record__;
            }else {
                nowRow = this.getRow(gele);
            }
        }
        if(nowRow == null) {
            G.messager.alert("提示消息","请先选中要复制的行");
            return;
        }
        this.copyRow = G.G$.extend(true,{},nowRow);
        let key = UUID.get();
        this.copyRow['key'] = key;
        if(this.props.copyType != "copy") {
            
            let dataSource:Array<any> = this.getData()||[];
            dataSource.push(this.copyRow);
            let data = this._loadFilter({dataList:dataSource});
            let editable = this.state["editable"]||{};
            if(typeof editable == "boolean") {
                editable = {};
                for(let i=0; i < data.dataList.length; i++) {
                    let row = data.dataList[i];
                    editable[row.key] = true;
                }
            }
            if(editable) {
                editable[key] = true;
            }
            this.setState({
                "dataSource": data.dataList,
                "editable": editable
            });
        }
    }

    edit() {
        if(this.doJudgementEvent("beforeEdit")==false) {
            return;
        }
        let dataSource = this.getData();
        if(dataSource == null || dataSource.length < 0) {
            G.messager.alert("提示消息","没有可供编辑的数据");
            return;
        }
        this.cacheData = new GearArray(dataSource).clone(true).toArray();
        let editable = this.state.editable||{};
        if(typeof editable == "boolean") {
            editable = {};
        }
        for(let i=0; i < dataSource.length; i++) {
            let row = dataSource[i];
            if(editable) {
                editable[row.key] = true;
            }
        }
        this.setState({
            editable
        });
    }

    editRow(gele: Tag.default<typeof Tag.props & {__record__: any}, Tag.state>) {
        let nowRow = this.mouseOnRow || this.focusRow;
        if(gele != null) {
            if(gele instanceof Tag.default) {
                nowRow = gele.props.__record__;
            }else {
                nowRow = this.getRow(gele);
            }
        }
        //返回false保持编辑状态
        if(this.doJudgementEvent("beforeRowEdit",nowRow)==false)
            return;
        const dataSource:any[] = this.getData() || [];
        if(nowRow == null) {
            G.messager.alert("提示消息","请先选中要编辑的行");
            return;
        }
        this.cacheData = new GearArray(dataSource).clone(true).toArray();
        let editable = this.state.editable||{};
        if(dataSource && typeof editable == "boolean") {
            editable = {};
            for(let i=0; i < dataSource.length; i++) {
                let row = dataSource[i];
                editable[row.key] = true;
            }
        }
        if(editable) {
            editable[nowRow.key] = true;
        }
        this.setState({
            editable
        });
    }

    clear() {
        if(this.doJudgementEvent("beforeClear")==false)
            return false;
        //返回false保持编辑状态
        if(this.doJudgementEvent("clear")==false) {
            return false;
        }
        this.setState({
            dataSource:[]
        });
        return true;
    }

    delete(gele: Tag.default<typeof Tag.props & {__record__: any}, Tag.state>) {
        let nowRow = this.mouseOnRow || this.focusRow;
        if(gele != null) {
            if(gele instanceof Tag.default) {
                nowRow = gele.props.__record__;
            }else {
                nowRow = this.getRow(gele);
            }
        }
        if(this.doJudgementEvent("beforeRowDelete",nowRow)==false)
            return;

        //返回false保持编辑状态
        if(this.doJudgementEvent("rowDelete",nowRow)==false) {
            return;
        }
        if(nowRow == null) {
            G.messager.alert("提示消息","请先选中要删除的行");
            return;
        }
        let dataSource:Array<any> = this.getData()||[];

        let row = dataSource.filter((value,index)=>{
            return value.key == nowRow.key;
        });
        if(row[0]) {
            let dataArray = new GearArray<any>(dataSource);
            dataArray.remove(row[0]);
            dataSource = dataArray.toArray();
            let data = this._loadFilter({dataList:dataSource});
            this.setState({
                dataSource: data.dataList
            },()=>{
                this.cacheData = new GearArray(data.dataList).clone(true).toArray();
            });
        }
    }

    add(addData?:any) {
        if(this.doJudgementEvent("beforeRowAdd")==false)
            return;             
        let dataSource = this.getData()||[];
        let dataClone = {};
        if(dataSource instanceof Array && dataSource.length > 0) {
            dataClone = G.G$.extend({},dataSource[dataSource.length - 1]);
        }else if(dataSource instanceof Array && dataSource.length == 0){
            dataClone = G.G$.extend({},this.defaultRecord)
        }
        for(let key in dataClone) {
            dataClone[key] = null;
        }
        // let defaultData = addData || {};//默认数据
        // dataClone = G.G$.extend({},dataClone,defaultData)
        dataSource.push(dataClone);
        let data = this._loadFilter({dataList:dataSource});
        let lastData = data.dataList[data.dataList.length - 1];
        let editable: any = this.state.editable;
        if(editable != true) {
            if(typeof editable == "boolean") {
                editable = {};
            }
            editable[lastData.key] = true;
        }
        this.setState({
            dataSource: data.dataList,
            editable
        },()=>{
            this.doEvent('afteradd',lastData)
        });
    }
   
    /**
     * 两种方式
     * 1：从json数据中直接解析
     * 2：从子节点中解析
     */
    protected _parseColumns(data?: any) {
        let columns = super._parseColumns(data);
        //只有非编辑状态下的表格可显示单行操作按钮
        if(this.props.rowControl == true && this.props.editable == false) {
            columns.push(Column.getControl(this));
        }
        return columns;
    }

    public parseControlColumnRender() {
        return (text: any,record: any) => {
            let editProps: any = {
                icon: "edit",
                "__record__": record,
                ref: (ele: any)=>{
                    let recordControls = this.controls[record.key]||{};
                    recordControls["editControl"] = ele;
                    this.controls[record.key] = recordControls;
                },
                key: UUID.get(),
                title: "编辑",
                class: "list-conlum-control list-conlum-control-edit",
                onclick: (e:any)=>{
                    let recordControls = this.controls[record.key]||{};
                    let editControl = recordControls["editControl"];
                    this.editRow(editControl);
                    e.stopPropagation();
                }
            };
            let saveProps: any = {
                icon: "save",
                "__record__": record,
                ref: (ele: any)=>{
                    let recordControls = this.controls[record.key]||{};
                    recordControls["saveControl"] = ele;
                    this.controls[record.key] = recordControls;
                },
                key: UUID.get(),
                title: "保存",
                class: "list-conlum-control list-conlum-control-save",
                onclick: (e:any)=>{
                    let recordControls = this.controls[record.key]||{};
                    let saveControl = recordControls["saveControl"];
                    this.saveRow(saveControl);
                    e.stopPropagation();
                }
            };
            let rowbackProps: any = {
                icon: "rollback",
                "__record__": record,
                ref: (ele: any)=>{
                    let recordControls = this.controls[record.key]||{};
                    recordControls["rowbackControl"] = ele;
                    this.controls[record.key] = recordControls;
                },
                key: UUID.get(),
                title: "撤销",
                class: "list-conlum-control list-conlum-control-rowback",
                onclick: (e:any)=>{
                    let recordControls = this.controls[record.key]||{};
                    let rowbackControl = recordControls["rowbackControl"];
                    this.resetRow(rowbackControl);
                    e.stopPropagation();
                }
            };
            let deleteProps: any = {
                icon: "delete",
                "__record__": record,
                ref: (ele: any)=>{
                    let recordControls = this.controls[record.key]||{};
                    recordControls["deleteControl"] = ele;
                    this.controls[record.key] = recordControls;
                },
                key: UUID.get(),
                title: "删除",
                class: "list-conlum-control list-conlum-control-delete",
                onclick: (e:any)=>{
                    let recordControls = this.controls[record.key]||{};
                    let deleteControl = recordControls["deleteControl"];
                    this.delete(deleteControl);
                    e.stopPropagation();
                }
            };
            let editable: any = this.state.editable;
            if((typeof editable == "boolean") == false) {
                if(editable[record.key] != null) {
                    editable = editable[record.key];
                }else {
                    editable = this.props.editable == null ? true : this.props.editable;
                }
            }
            let icons = [];
            
            if(editable == true) {
                icons.push(<Icon.default {...saveProps}></Icon.default>);
                icons.push(<Icon.default {...rowbackProps}></Icon.default>);
                icons.push(<Icon.default {...deleteProps}></Icon.default>);
            }else {
                icons.push(<Icon.default {...editProps}></Icon.default>);
                icons.push(<Icon.default {...deleteProps}></Icon.default>);
            }
            let iconsMap = icons.map((ele)=>{
                return ele;
            });
            return <span>
                {record.cannotControl === true? "---":iconsMap}
            </span>;
        };
    }

    //解析表头
    protected _parseColumn(child:any, index: number) {
        let column = super._parseColumn(child, index);
        const children = child.props.children;
        let props = child.props;
        if(props.editctype){
            ((column, props)=>{
                column.render = (text: any,record: any,rowIndex:number)=>{
                    // console.log(props)
                    let newProps = ObjectUtil.parseDynamicProps(props, record);
                    // console.log(newProps)
                    let editCType: string = newProps.editctype||  newProps.editCType  ||"";
                    let lower: string = newProps.lower ? newProps.lower + record.key : "";
                    let upper: string = newProps.upper ? newProps.upper + record.key : "";
                    let id: string = newProps.id ? newProps.id + record.key : record.key + "_" + index;
                    let name: string = newProps.name;
                    //获取本字段的编辑状态
                    let editable: any = this.state.editable;
                    if((typeof editable == "boolean") == false) {
                        if(editable[record.key] != null) {
                            editable = editable[record.key];
                        }else{
                            editable = this.props.editable == null ? true : this.props.editable;
                        }
                    }
                    let cellProps: any = G.G$.extend(newProps,{
                        dictype:newProps.dictype,
                        id: id,
                        value: text,
                        editCType,
                        editable: editable,
                        lower: lower,
                        upper: upper,
                        record:record,
                        editCell: record.cannotControl === true ?false:this.props.editCell,
                        cannotControl: record.cannotControl,
                        name: name,
                        form: this.form,
                        required: (newProps.required==="true" || newProps.required===true)?true:false,
                        ref:(ele: any) => {
                            let cells = this.cells[record.key]||{};
                            if(ele != null) {
                                cells[column.name] = ele;
                            }
                            this.cells[record.key] = cells;
                        },
                        onBeforeSave: (name: any,record: any)=>{
                            return this.doJudgementEvent("beforeCellSave",name,record);
                        },
                        onSave: (name: any,record: any)=>{
                            return this.doJudgementEvent("cellSave",name,record);
                        },
                        onBeforeEdit: (name: any,record: any)=>{
                            return this.doJudgementEvent("beforeCellEdit",name,record);
                        },
                        onBeforeReset:(name: any,record: any) => {
                            return this.doJudgementEvent("beforeCellReset",name,record);
                        },
                        // onChange: (value: any, oldValue: any, label: any) => {
                        //     //处理值变动的逻辑
                        //     if(props.onChange) {
                        //         props.onChange.call(this,value, oldValue);
                        //     }
                        // }
                    });
                    return <EditTableCell.default  onChangeValue={this.changeValue.bind(this,record.key,name)} {...cellProps}>{children}</EditTableCell.default>;
                };
            })(column,props);
        }
        
        return column;
    }

    //获取单元格
    getCell(record: any,columnName: any) {
        let cells = this.cells[record.key]||{};
        return cells[columnName];
    }

    // 得到默认的样式名称
    protected getDefaultClassName() {
        return "ant-table-editlist";
    }

    //新增row回调
    onAfterAdd(fun:Function){
        if(fun && G.G$.isFunction(fun)) {
            this.bind("afteradd",fun);
        }
    }
}