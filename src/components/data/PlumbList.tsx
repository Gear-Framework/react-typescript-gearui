import * as Tag from "../Tag";
import * as React from 'react';
import {Popover,Icon as AntdIcon,Select,Spin as AntdSpin} from 'antd';
import { default as Http} from '../../utils/http';
import UUID from '../../utils/uuid';
import { relative } from "path";
export declare type connector = 'Bezier' | 'Straight' | 'Flowchart';//贝塞尔曲线、直线、90度折线
export var props = {
    ...Tag.props,
    connector:GearType.Enum<connector>(),
    rightListWidth:GearType.Number,
    leftListWidth:GearType.Number,
    leftCellWidth:GearType.Any,
    rightCellWidth:GearType.Any,
    width:GearType.Number,
    showLabel:GearType.Boolean,
    title: GearType.String,
    class: GearType.String,
    url:GearType.String,
    linkType:GearType.Number,//1:一对一、2:一对多、3：多对一、4：多对多
    leftTitle:GearType.String,
    rightTitle:GearType.String,
    pointRadius:GearType.Number,//短点半径
    pointColor:GearType.Any,//端点颜色
    lineColor:GearType.Any,//连接线的颜色
    lineWidth: GearType.Number,//连接线的宽的
    control:GearType.Any,
    showSequence:GearType.Boolean


}
export interface state extends Tag.state {
    leftDataIndex:any;
    rightDataIndex:any;
    leftData:any[];
    rightData:any[];
    connector:connector,
    width?:number,
    rightListWidth?:string,
    leftListWidth?:string,
    linkType?:number,
    pointRadius?:number,
    pointColor?:any,
    lineColor?:any,
    control:any[],
    url:string,
    selectData:any[],//下拉框数据
    defaultSelectValue:any,//下拉默认选中项
    loading:boolean,
    showSequence:boolean
}

export default class PlumbList<P extends typeof props, S extends state> extends Tag.default<P, S> {
    // constructor(...arg:any){
    //     super(...arg);
    // };
    protected cacheData:any;//缓存数据
    warpId = UUID.get();
    getInitialState():state{
        return {
            leftData: [],
            rightData: [],
            leftDataIndex:[],
            rightDataIndex:[],
            selectData: [],
            defaultSelectValue:"",
            connector:this.props.connector|| 'Straight',
            width:this.props.width,
            rightListWidth:(this.props.rightListWidth || 200)+'px',
            leftListWidth:(this.props.leftListWidth || 200)+'px',
            linkType:this.props.linkType||1,
            pointRadius:this.props.pointRadius || 5,
            pointColor:this.props.pointColor || "#1890ff",
            lineColor:this.props.lineColor || "#1890ff",
            control : (this.props.control && this.props.control.split(',').length>0)? this.props.control.split(','):[],
            url:this.props.url,
            loading:true,
            showSequence:this.props.showSequence===true?true:false,
        }
    }

    getProps(){
        return G.G$.extend({},this.state,{
            className:"plumblist-warp "+this.state.className,
            ref: (ele: any)=>{
                this.ref = ele;
            },
        })
    } 

    // parseControl(controls:any[]){
    //     let controlIcons = [];
    //     for(let c in controls){
    //         switch (c) {
    //             case 'delete':
    //                 controlIcons.push(
    //                     <AntdIcon
    //                         style={{ cursor:'pointer'}}
    //                         type="close"
    //                         title="删除"
    //                         className={"plumb-cell-icon-delete"}
    //                         onClick={this.deleteItem.bind(this,item.id,side)}
    //                     />
    //                 )
    //                 break;
            
    //             default:
    //                 break;
    //         }
    //     }
    // }

    parserList(data:any[],side:'left'|'right'){
        let list:any[]=[];
        let controlArray:any = this.state.control;
        let control = this.state.control;
        data.map((item:any,index:number)=>{
            list.push(
                control.length>0?
                <Popover key={'pop'+item.id} placement={side}
                    content={<div className="plumb-cell-control">
                        {controlArray.includes('delete')?<AntdIcon
                            style={{ cursor:'pointer'}}
                            type="close"
                            title="删除"
                            className={"plumb-cell-icon-delete"}
                            onClick={this.deleteItem.bind(this,item.id,side)}
                        />:null}
                        {controlArray.includes('up')?<AntdIcon
                            style={{ cursor:'pointer',display:index!=0?'inline-block':'none'}}
                            type="arrow-up"
                            title="上移"
                            className={"plumb-cell-icon-up"}
                            onClick={this.upData.bind(this,item,side)}
                        />:null}
                        {controlArray.includes('down')?<AntdIcon
                            style={{ cursor:'pointer',display:index+1<data.length?'inline-block':'none'}}
                            type="arrow-down"
                            title="下移"
                            className={"plumb-cell-icon-down"}
                            onClick={this.downData.bind(this,item,side)}
                        />:null}
                        {controlArray.includes('move')?<AntdIcon
                            style={{ cursor:'pointer'}}
                            type={side=='left'?"arrow-right":'arrow-left'}
                            title={side=='left'?"右移":'左移'}
                            className={"plumb-cell-icon-rollback"}
                            onClick={this.moveData.bind(this,item,side)}
                        />:null}
                        {controlArray.includes('moveLeft') && side=='right'?<AntdIcon//只允许左移
                            style={{ cursor:'pointer'}}
                            type={'arrow-left'}
                            title={'左移'}
                            className={"plumb-cell-icon-rollback"}
                            onClick={this.moveData.bind(this,item,side)}
                        />:null}
                        {controlArray.includes('moveRight') && side=='left'?<AntdIcon//只允许右移
                            style={{ cursor:'pointer'}}
                            type={'arrow-right'}
                            title={'右移'}
                            className={"plumb-cell-icon-rollback"}
                            onClick={this.moveData.bind(this,item,side)}
                        />:null}
                        {controlArray.includes('edit')?<AntdIcon//编辑
                            style={{ cursor:'pointer'}}
                            type={'edit'}
                            title={'编辑'}
                            className={"plumb-cell-icon-edit"}
                            onClick={this.editClick.bind(this,item.id,side)}
                        />:null}
                </div>}>    
                    <div className="plumblist-col item"  id={item.id} key={item.id}>
                        {side==="left"&&this.state.showSequence?<span>{index}</span>:null}
                        {this.parserText(item.fieldText)}
                    </div>
                </Popover>:
                <div className="plumblist-col item"  id={item.id} key={item.id}>
                    {side==="left"&&this.state.showSequence?<span>{index}</span>:null}                        
                    {this.parserText(item.fieldText)}
                </div>
            )
        })
        return list;
    }
    parserText(arr:any){
        let children:any[]=[];
        arr.map((item:any,index:number)=>{
            children.push(
                <span key={UUID.get()}>{item}</span>
            )
        })
        return children;
    }
    //删除某个节点的端点
    delPlumb(id:any){
        jsPlumb.remove([id])
    }
    render(){
        let leftData = this.state.leftData;
        let rightData = this.state.rightData;
        let props:any = this.getProps();
        delete props.rightListWidth;
        delete props.leftListWidth;
        delete props.leftData;
        delete props.rightData;
        delete props.leftDataIndex;
        delete props.rightDataIndex;
        delete props.linkType;
        delete props.pointRadius;
        delete props.pointColor;
        delete props.lineColor;
        delete props.selectData;
        delete props.defaultSelectValue;
        delete props.loading;
        delete props.showSequence;
        let selectProps = {
            
        };
        return <div {...props}>
                    {this.props.title?<h3>{this.props.title}</h3>:null}
                    <div className="list-warp" id={this.warpId}>
                            <dl key="left" className="left-list list" style={{width:this.state.leftListWidth}}>
                                <dt><h4 className="left-list-title"><span>{this.props.leftTitle||'左侧列表'}</span></h4></dt>
                                <dd className="plumblist-table">
                                    <div className="plumblist-col plumblist-table-th">{this.state.leftDataIndex.map((item:any)=>
                                                <span key={UUID.get()}>{item}</span>
                                    )}</div> 
                                    {leftData.length>0?this.parserList(leftData,'left'):"暂无数据"}

                                </dd>
                            </dl>
                            <dl key="right" className="right-list list" style={{width:this.state.rightListWidth}}>
                                <dt>
                                    <h4 className="right-list-title">
                                        <span>{this.props.rightTitle||'右侧列表'}</span>
                                        <span className="list-title-select">
                                            {this.state.selectData.length>0?<Select value={this.state.defaultSelectValue} onSelect={this.onSelect.bind(this)} style={{ width: "50%" }} {...selectProps}>
                                                {this.state.selectData.map((item)=>{
                                                    return <Select.Option  key={item.value}>{item.label}</Select.Option>
                                                })}
                                            </Select>:null}
                                        </span>
                                    </h4>
                                </dt>
                                <dd className="plumblist-table">
                                    <div className="plumblist-col plumblist-table-th">
                                        {this.state.rightDataIndex.map((item:any)=>
                                            <span key={UUID.get()}>{item}</span>
                                        )}
                                    </div>
                                    {rightData.length>0?this.parserList(rightData,'right'):"暂无数据"}    
                                </dd>
                            </dl>
                    </div>
                    {/* <div className="plumb-btn-bar">
                        <Button.default onClick={this.save.bind(this)}>保存</Button.default>
                        <Button.default onClick={this.reset.bind(this)}>重置</Button.default>
                    </div>   */}
                </div>
                
            {/* </div> */}
            // <AntdSpin spinning={this.state.loading} style={{"minHeight":"21px"}} delay={100}>
        /* </AntdSpin> */
    }
    onSelect(key:any,option:any){
        let url:string="";
        this.state.selectData.map(o=>{
            if(o.value==key){
                url = o.url
            }
        })
        this.setState({
            url,
            defaultSelectValue:key
        },()=>{
            this.loadData()
        })
    }
    afterUpdate(){//更细数据后画点、连线
        
        this.dragLinks();
        this.setCellWidth();
    }
    
    componentDidMount(){
        super.componentDidMount()
        //初始化画点、连线
        this.loadData();
        
    }

    protected loadData(callback?:Function){
        let p = Http.getMethod('get')(this.state.url,'json');
        if(p){
            p.then((response)=>{
                let resData = response.data;
                if(resData.defaultSelectValue){
                    this.setState({
                        defaultSelectValue: resData.defaultSelectValue
                    })
                }
                this.setState({
                    leftDataIndex: resData.leftDataIndex,
                    rightDataIndex: resData.rightDataIndex,
                    leftData:  new GearArray(resData.leftData).clone(true).toArray(),
                    rightData: new GearArray(resData.rightData).clone(true).toArray(),//response.data.rightData
                    selectData: new GearArray(resData.selectData).clone(true).toArray(),
                },()=>{
                    this.cacheData =  {
                        leftData:  new GearArray(resData.leftData).clone(true).toArray(),
                        rightData: new GearArray(resData.rightData).clone(true).toArray(),
                    };
                    this.setState({
                        loading:false
                    },()=>{
                        if(callback){
                            callback()
                        };
                    })
                })
            }).catch((error)=>{
                return Promise.resolve(error);
            });
        }
    }
    //loadUrl
    loadUrl(url:any,callback:Function){
        this.setState({
            url
        },()=>{
            this.loadData(callback)
        })
    }
    setCellWidth(){//设置定义的单元格宽度
        let leftWidthArr = this.props.leftCellWidth.split(',');
        let rightWidthArr = this.props.rightCellWidth.split(',');
        let leftCol = G.G$(this.realDom).find('.left-list .plumblist-col');
        let rightCol = G.G$(this.realDom).find('.right-list .plumblist-col');
        let fn = (col:any,widthArr:any)=>{
            for(let i=0;i<col.length;i++){
                widthArr.map((item:any,index:number)=>{
                    if(G.G$(col[i]).find('span')[index]) 
                    G.G$(col[i]).find('span')[index].style.width = item + "px";
                })
            }
        }
        fn(leftCol,leftWidthArr);
        fn(rightCol,rightWidthArr);
    }

    reset(){
        this.setState({
            leftData:this.cacheData.leftData,
            rightData:this.cacheData.rightData,
        })
    }
    dragLinks(){
        this.find(".list-warp").scrollTop(0);
        let jsPlumb:any = window.jsPlumb;
        let _this = this;
        jsPlumb.ready(function () {
            // jsPlumb.setContainer(G.G$("#" + _this.warpId))//(G.G$(".list-warp"))////
            // G.G$("#" + _this.warpId).mousedown(function(e){
            //     G.G$("#" + _this.warpId).mousemove(function(){
            //         let mouseX1 = e.pageX - G.G$("#" + _this.warpId).offset().left;
            //         let mouseY1 = e.pageY - G.G$("#" + _this.warpId).offset().top;
            //         console.log(mouseX1)
            //         console.log(mouseY1)
            //     })
            // });
            // G.G$(".plumblist-warp").mousedown(function(){
            //     G.G$(this).mousemove(function(e:any){
            //         console.log(e)
            //     })

            // })
            // G.G$(".plumblist-warp").scroll(function(e:any) {
            //     console.log(e)
            // }) 

            // console.log(G.G$('.jtk-endpoint'))
            //jsPlumb是根据元素id取绘制，所以每次更新都需要重新绘制，所以删除所有的节点和线
            jsPlumb.deleteEveryEndpoint();//删除所有的点
            jsPlumb.deleteEveryConnection();//初始化删除所有连线
            // console.log(G.G$('.jtk-endpoint'))
            // console.log(_this.state.leftData);
            // console.log(_this.state.rightData);
            // let myJsPlumb = jsPlumb.getInstance()
            // jsPlumb.getInstance({
            //     Container: "#plumb",//_this.warpId,
            //     DragOptions: { cursor: 'pointer', zIndex: 2000 },
            // });
            var common = {
                Container:_this.warpId,
                connector: [_this.state.connector],
                maxConnections: -1,
                endpointStyle: { radius : _this.state.pointRadius, fill : _this.state.pointColor},
                connectorStyle: {
                    outlineStroke: _this.state.lineColor,
                    strokeWidth:_this.props.lineWidth || 1
                },
                dragAllowedWhenFull:false,
                EndpointHoverStyle:{opacity: 0.8},
                // ConnectionOverlays:[],//这个是鼠标拉出来的线的属性
                overlays: [
                    ['Arrow', { width: 12, length: 12, location: .95 ,paintStyle: {fill: _this.state.lineColor,stroke: _this.state.lineColor}}],
                    // ["Label", {  //标签参数设置 
                    //     id: "label",
                    //     cssClass: "activeLabel", //hover时label的样式名
                    //     events: {
                    //         tap: function () {
                    //         }
                    //     },
                    //     visible: false
                    // }]
                ],
                // ReattachConnections: false,      
            };
            let sTargetMax:number,tTargetMax:number;
            switch (_this.state.linkType) {
                case 1://一对一
                    sTargetMax = 1,tTargetMax = 1
                    break;
                case 2://一对多
                    sTargetMax = -1,tTargetMax = 1
                    break;
                case 3://多对一
                    sTargetMax = 1,tTargetMax = -1
                    break;
                case 4://多对多
                    sTargetMax = -1,tTargetMax = -1
                    break;
                default:
                    break;
            }
            //给做出列表每项增加端点
            if(_this.state.leftData.length>0){
                _this.state.leftData.map((item:any,index:number)=>{
                    jsPlumb.addEndpoint([item.id],{
                        anchors: ['Right'],
                        isSource: true,//作为起点
                        // isTarget: true,//作为终点
                        uuid: item.id,
                        maxConnections: sTargetMax
                    },common)
                    // endpoints.bind('mousedown',function(endpoint:any,originalEvent:any){
                    //     console.log(originalEvent)
                    // })
                });
            }

            //给右侧列表每项设置终点
            if(_this.state.rightData.length>0){
                _this.state.rightData.map((item:any,index:number)=>{
                    jsPlumb.addEndpoint([item.id],{
                        anchors: ['Left'],
                        isTarget: true,
                        // isSource: true,
                        uuid: item.id||1,
                        maxConnections: tTargetMax
                    },common)
                });
            }
             
            //先解绑事件
            jsPlumb.unbind('dblclick');
            jsPlumb.unbind('connection');
            jsPlumb.unbind('beforeDrop');
            jsPlumb.unbind('connectionDetached');
            jsPlumb.unbind('connectionAborted');

            jsPlumb.bind("connection", function (connInfo:any, originalEvent:any) {
                //连线时动作
                //例如给连线添加label文字
                let conn = connInfo.connection;
                if(!(_this.props.showLabel===false) && conn.source && conn.target){
                    let labelText = '连接'+conn.source.innerText+'--'+conn.target.innerText;
                    conn.setLabel(labelText);
                }
                //修改数据
                _this.addLinks(conn.sourceId,conn.targetId);
                G.G$(".list-warp").scrollTop(0)
                
            })
            // jsPlumb.bind('beforeDrop', function (conn:any) {
            //        G.G$(".list-warp").scrollTop(0);
            // })
            _this.state.leftData.map((item:any,i:number)=>{
                if(item.targetArr){
                    item.targetArr.map((t:any,i:number)=>{  
                        if(sTargetMax==1 && tTargetMax==1 && i==1){//如果只能1对1
                            _this.linkNode(item.id,t,common)
                        }else{
                            _this.linkNode(item.id,t,common)
                        }
                    })
                }
            })
             
            //连接线点击事件
            jsPlumb.bind('dblclick', function (conn:any, originalEvent:any) {
                // G.messager.confirm({message:"确定要删除连接线吗？",callback:()=>{
                    G.G$(".list-warp").scrollTop(0)
                    _this.setState({
                        leftData: _this.deleteLinks(conn.sourceId,conn.targetId)
                    })
                // }})
            });
            
            // 当链接建立前
            // jsPlumb.bind('beforeDrop', function (info:any) {
            //     if (1) {
            //     console.log('链接会自动建立')
            //     return true // 链接会自动建立
            //     } else {
            //     console.log('链接取消')
            //     return false // 链接不会建立，注意，必须是false
            //     }
            // });
            jsPlumb.bind("beforeDetach",function(info:any){//手动拖拽？取消连接时删除对应数据
                G.G$(".list-warp").scrollTop(0)
                _this.setState({
                    leftData: _this.deleteLinks(info.sourceId,info.targetId)
                }) 

            })
            jsPlumb.bind('connectionAborted',function(){//在连接到端点或目标元素之前拖动新连接但被放弃时触发
                G.G$(".list-warp").scrollTop(0)
            })
            // //取消连接
            // jsPlumb.bind("connectionDetached", function (conn:any, originalEvent:any) {   
            //     // return false  
            //     console.log('取消了')
            //     if (conn.sourceId == conn.targetId) {      
            //         //自己连接自己时会自动取消连接      
            //     }else{      
            //         _this.setState({
            //             leftData: _this.deleteLinks(conn.sourceId,conn.targetId)
            //         })     
            //     }      
            // });
            // G.G$(document).on('mouseenter.link','.jtk-connector',function(){
            //     console.log(G.G$(this).index());
            //     console.log( G.G$(document).find('.jtk-overlay'))
            //     G.G$(document).find('.jtk-overlay').show()
            // }).on('mouseleave.link','.jtk-connector',function(){
            //     console.log(G.G$(this).index());
            //     console.log( G.G$(document).find('.jtk-overlay'))
            //     G.G$(document).find('.jtk-overlay').hide(2000)
            // })
            jsPlumb.fire();
        })
    }
    //连接两个节点
    protected linkNode(source:any,target:any,common?:any){
        jsPlumb.connect({
            uuids: [source, target],
            // anchor: ['Left', 'Right'], 
        },common)
    }
    //删除某个节点
    deleteItem(id:any,side:string){
        if(side=='left'){
            let leftData=this.state.leftData.filter(o=>o.id!=id)
            this.setState({
                leftData
            });
        }else{
            let rightData=this.state.rightData.filter(o=>o.id!=id);
            //右侧的话，需要删除左侧相关的连线
            this.setState({
                leftData:this.deleteLinks(null,id),
                rightData
            });
        }
    }
    
    //删除指定连接线
    deleteLinks(s:any,t:any){
        let leftData = this.state.leftData;
        if(s && t){//如果起点终点都有，即删除指定线条
            // G.messager.confirm({message:'确定解除所点击的链接吗？',callback:(id:any)=>{})
            leftData = leftData.map((item)=>{
               if(item.id===s){
                 item.targetArr = item.targetArr.filter((o:any)=>o!=t)
               }
               return item; 
            });
        }else if(s){//如果只有起点，即删除所有以此为起点的线
            leftData = leftData.map((item)=>{
                if(item.id===s){
                  item.targetArr = [];
                } 
                return item
            })
        }else if(t){//如果只有终点，即删除所有以此为终点的线
            leftData = leftData.map((item)=>{
                item.targetArr = item.targetArr.filter((o:any)=>o!=t);
                return item
            });
        }
        return leftData;
    }

    //新增连接线
    addLinks(s:any,t:any){
        let cacheData = JSON.parse(JSON.stringify(this.state.leftData)); 
        let leftData = this.state.leftData;
        leftData = leftData.map((item:any)=>{
            
            if(s===item.id){
                item.targetArr.push(t)
            }
            //初始化的时候会重复添加 此处做去重操作
            item.targetArr = Array.from(new Set(item.targetArr));
            return item
            
        });
        //连线动作在afterupdate中进行，所以为避免死循环，每次setState前先判断
        let isChange:boolean = false;
        for(let i=0;i<cacheData.length;i++){
            if(cacheData[i].targetArr.length!=leftData[i].targetArr.length){
                isChange = true;
            }
        }
        if(isChange){
            this.setState({
                leftData
            })
        }
    }

    //上移
    upData(item:any,side:string){
        if(side=='left'){
            let leftData = this.state.leftData;
            let index = leftData.indexOf(item);
            leftData[index] = leftData.splice(index-1,1,leftData[index])[0]
            this.setState({
                leftData
            })
        }else{
            let rightData = this.state.rightData;
            let index = rightData.indexOf(item);
            rightData[index] = rightData.splice(index-1,1,rightData[index])[0]
            this.setState({
                rightData
            })
        }
    }

    //下移
    downData(item:any,side:string){
        if(side=='left'){
            let leftData = this.state.leftData;
            let index = leftData.indexOf(item);
            leftData[index] = leftData.splice(index+1,1,leftData[index])[0]
            this.setState({
                leftData
            })
        }else{
            let rightData = this.state.rightData;
            let index = rightData.indexOf(item);
            rightData[index] = rightData.splice(index+1,1,rightData[index])[0]
            this.setState({
                rightData
            })
        }
    }

    //移动数据
    moveData(item:any,side:any,target:number=1){//target:即移动后该节点可连接线数
        if(side=='left'){//左边数据
            let rightData = this.state.rightData;
            // let index = leftData.indexOf(item);
            // let mData:any = leftData.splice(index,1)[0];
            delete item.targetArr;
            rightData.push(item);//push到右侧
            this.deleteItem(item.id,side);//删除左侧的;
            this.setState({
                rightData
            })
        }else{
            let leftData = this.state.leftData;
            // let index = leftData.indexOf(item);
            // let mData:any = leftData.splice(index,1)[0];
            item.targetArr=[];
            leftData.push(item);//push到左侧
            this.deleteItem(item.id,side);//删除右侧的;
            this.setState({
                leftData
            })
        }
    }

    getValue(){
        return {leftData:this.state.leftData,rightData:this.state.rightData}
    }

    getSelectValue(){
        return this.state.defaultSelectValue;
    }

    setItem(id:any,side:string,text:any){//设置指定节点的值
        if(side=='left'){//如果值左侧
            let leftData = this.state.leftData;
            leftData = leftData.map((item)=>{
                if(item.id===id){
                    item.text = text;
                }
                return item
            });
            this.setState({leftData})
        }else{
            let rightData = this.state.rightData;
            rightData = rightData.map((item)=>{
                if(item.id===id){
                    item.text = text;
                }
                return item
            });
            this.setState({rightData})
        }
    }

    setLinkType(type:any){//设置连接模式：1对1，1对多，多对1，多对多等
        this.setState({
            linkType:type
        })
    }

    editClick(id:any,side:any){
        alert(id+"---"+side)
        this.setItem(id,side,'test')
    }

    onEditItem(fun:any){
        if(fun && G.G$.isFunction(fun)) {
            this.bind("editItem",fun);
        }
    }
    // save(){
    //     return {leftData:this.state.leftData,rightData:this.state.rightData}
    // }
}