import * as Button from "./Button";
import * as React from 'react';
import { Icon as AntdIcon } from 'antd';

export var props = {
    // 按钮或链接，link、icon、button，默认为link
    type: GearType.Enum<'link' | 'icon' | 'button'>(),
    // 动作类型，可以自己扩展，可覆盖默认的
    actionType: GearType.String,
    ...Button.props
}

export interface state extends Button.state {
    type?: string | any;
    actionType?: string;
}

export default class ClickAction<P extends typeof props, S extends state> extends Button.default<P, S> {

    getInitialState(): state {
        return {
            type: this.props.type || 'link',
            actionType: this.props.actionType
        };
    }

    getIconState() {
        let style = this.state.style;
        if(style) {
            style.cursor = "pointer";
        }
        let state = G.G$.extend({},this.state, {
            type: this.state.icon
        });
        return state;
    }
    getProps(){
        let state:any = G.G$.extend({}, this.state);
        return state
    }
    render() {
        let type = this.state.type ;
        let state = this.getProps()
        console.log(state)
        if(type) {
            if(type == "link") {
                return <a {...state}>{this.state.text}</a>; 
            }else if(type == "icon") {
                let state = this.getIconState();
                return <AntdIcon {...state}/>;
            }
        }
        return super.render();
    }

    protected clickEvent(e?: any) {
        if(this.doJudgementEvent("click",e)==false){
            return;
        }

        let actionType = this.state.actionType;
        if(!actionType) {
            G.messager.error("错误提示","未设置动作类型");
            return;
        }
        let process = G.components["clickaction"][actionType];
        if(process){
            process.call(this,this.props);
        }else{
            G.messager.error("错误提示","未定义的动作“"+actionType+"”");
        }
    }

}