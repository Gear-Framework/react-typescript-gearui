interface GearType {
  String: string,
  Boolean: boolean,
  Number: number,
  Object: object,
  Function: Function,
  Array<T>(): Array<T>,
  Undefined: undefined,
  RegExp: RegExp,
  Null: null,
  CssProperties: React.CSSProperties,
  Or<T, U>(t1: T, t2: U): T | U;
  Or<T, U, V>(t1: T, t2: U, t3: V): T | U | V;
  Or<T, U, V, W>(t1: T, t2: U, t3: V, t4: W): T | U | V | W;
  Or<T, U, V, W, X>(t1: T, t2: U, t3: V, t4: W, t5: X): T | U | V | W | X;
  Or<T, U, V, W, X, Y>(t1: T, t2: U, t3: V, t4: W, t5: X, t7: Y): T | U | V | W | X | Y;
  Or<T, U, V, W, X, Y, Z>(t1: T, t2: U, t3: V, t4: W, t5: X, t7: Y, t8: Z): T | U | V | W | X | Y | Z;
  Or(t1: any, t2: any, ...tn: any[]): any;
  VoidT<T>(): T;
  Enum<T>(): T;
  Any: any;
  AstElement: ASTElement;
}

declare var GearType: GearType;

interface ASTModifiers {
  prevent: any;
  passive: any;
  capture: any;
  once: any;
  right: any;
  middle: any;
  native: any;
  number: any;
  lazy: any;
  trim: any;
}

interface Directive {
  name: string,
  rawName: string,
  value: string,
  arg?: string|null,
  modifiers?: ASTModifiers|null;
}

interface ASTDirective {
  value: any;
  modifiers: any;
}

interface ASTElement {
  attrsList?: Array<{name: string, value: string}>;
  /**
   * 1: 节点,
   * 2: 表达式,例如{{test}}, 会解析成_s(test)
   * 3: 文本
   */
  type: number;
  id: string;
  tag: string;
  attrsMap: {[idx: string]: any};
  plain?: boolean;
  parent: ASTElement;
  children: Array<ASTElement>;
  attrs: Array<{name: string, value: string}>;
  props: Array<{name: string, value: any}>;
  text?: string;
  staticClass?: string;
  classBinding?: string|null;
  directives?: Array<Directive>;
  nativeEvents?: any;
  events?: any;
  staticStyle?: string;
  styleBinding?: string;
  processed?: boolean;
  if?: any;
  else?: any;
  elseif?: any;
  component?: any;
  model?: any;
  ns?: any;
  forbidden?: any;
  pre?: any;
  slotScope?: any;
  slotTarget?: any;
  key?: any;
  ifConditions?: Array<ASTIfCondition>;
  for?: any;
  alias?: any;
  iterator1?: any;
  iterator2?: any;
  index: number[];
  vmdom?: any;
  afterRender?:any;
  componentDidMount?:any;
  componentWillMount?:any;
  componentDidUpdate?:any;
  html: ()=>JQuery<HTMLElement>|undefined;
  tagClass: any;
  // dom: Element;
}

interface ASTIfCondition {

}

interface CompilerOptions {
  expectHTML?: boolean;
  warn?: Function;
  delimiters?: any;
  modules?: any;
  directives?: any;
  isPreTag?: Function;
  isUnaryTag?: Function;
  mustUseProp?: Function;
  canBeLeftOpenTag?: Function;
  isReservedTag?: Function;
  getTagNamespace?: Function;
  staticKeys?: string;
  preserveWhitespace?: any;
  shouldDecodeNewlines?: any;
  shouldDecodeNewlinesForHref?: any;
  comments?: any;
  optimize?: any;
  shouldKeepComment?: boolean;
  comment?: any;
  end?: any;
  start?: any;
  chars?: any;
  isNonPhrasingTag?: any;
}

interface ParseResult {ast: ASTElement,cacheHtml: string, parent: Element}

interface Constants {
  EXPAND_NAME:string;
  APP_SIZE_NUMBER:number;
  APP_PADDING: number;

  APP_NORMAL: string;

  APP_BIG: string;

  APP_SMALL: string;

  REDIRECT: string;

  ROOT: string;

  FILTER_PATH: string;

  LOGINPATH: string;

  RELOGINPATH:string;

  MAINPATH: string;

  SESSION_COOKIENAME: string;

  RQUICK_EXPR: RegExp;

  TYPE: {
      String: string,
      Boolean: string,
      Number: string,
      Object: string,
      Function: string,
      Array: string,
      Undefined: string,
      Null: string,
      RegExp: string,
      CssProperties: string,
      Any: string,
  };

  HTML_PARSER_DOM_INDEX: string;
}