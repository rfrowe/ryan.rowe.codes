(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[110],{92518:function(e,t,r){var n=Object.defineProperty,o=Object.defineProperties,a=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,s=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable,c=(e,t,r)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,d=(e,t)=>{for(var r in t||(t={}))s.call(t,r)&&c(e,r,t[r]);if(i)for(var r of i(t))l.call(t,r)&&c(e,r,t[r]);return e},u=(e,t)=>o(e,a(t)),p=(e,t)=>{var r={};for(var n in e)s.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&i)for(var n of i(e))t.indexOf(n)<0&&l.call(e,n)&&(r[n]=e[n]);return r};!function(e,t,n,o,a,i,s,l,c,m,h,f,g,b,k,w,y,v,x,_){"use strict";function E(e){return e&&"object"===typeof e&&"default"in e?e:{default:e}}function M(e){if(e&&e.__esModule)return e;var t={__proto__:null,[Symbol.toStringTag]:"Module"};return e&&Object.keys(e).forEach((function(r){if("default"!==r){var n=Object.getOwnPropertyDescriptor(e,r);Object.defineProperty(t,r,n.get?n:{enumerable:!0,get:function(){return e[r]}})}})),t.default=e,Object.freeze(t)}var C=M(t),S=E(t),$=E(a),A=E(s),z=M(s),I=M(g),T=E(b);const P=t.createContext({browserFocused:!0}),L=({children:e})=>{const[r,n]=t.useState(!0);return t.useEffect((()=>{const e=()=>n(!0),t=()=>n(!1);return window.addEventListener("focus",e),window.addEventListener("blur",t),()=>{window.removeEventListener("focus",e),window.removeEventListener("blur",t)}}),[]),C.createElement(P.Provider,{value:{browserFocused:r}},e)};P.Consumer;const N=()=>d({},t.useContext(P)),O=$.default.button`
  padding: 8px !important;
  border: none;
  border-right: 1px solid var(--tina-color-grey-2);
  width: auto;
  height: auto;
  border-left: none;
  margin: 0 0 -1px 0;
  flex-grow: 1;
  max-width: 48px;
  transition: background 150ms ease-out;

  &:hover {
    background-color: rgba(53, 50, 50, 0.09);
  }
  &:active {
    color: var(--tina-color-primary);
    fill: var(--tina-color-primary);
    background-color: rgba(53, 50, 50, 0.05);
  }
  svg {
    width: 20px;
    height: 20px;
  }
  ${e=>e.active&&a.css`
      color: var(--tina-color-primary);
      fill: var(--tina-color-primary);
      background-color: rgba(53, 50, 50, 0.05);
    `};
  ${e=>e.disabled&&a.css`
      pointer-events: none;
      color: #d1d1d1;
      fill: #d1d1d1;
    `};
`,D=t.createContext({mode:"wysiwyg",setMode:()=>{}}),F=({children:e})=>{const[r,n]=t.useState("wysiwyg");return t.useEffect((()=>{document.addEventListener("keydown",(e=>{e.altKey&&e.shiftKey&&e.metaKey&&77===e.keyCode&&n("wysiwyg"===r?"markdown":"wysiwyg")}))})),C.createElement(D.Provider,{value:{mode:r,setMode:n}},e)},B=D.Consumer,W=()=>t.useContext(D),R=()=>{const{mode:e,setMode:t}=W(),r=()=>{t("markdown"===e?"wysiwyg":"markdown")};return C.createElement(O,{"data-testid":"markdown-toggle","data-tooltip":"Markdown mode",title:"Toggle Markdown mode",onClick:r},C.createElement(o.MarkdownIcon,null))},V=t.createContext({editorView:void 0,translator:void 0}),H=({children:e,editorView:t,translator:r})=>C.createElement(V.Provider,{value:{editorView:t,translator:r}},e);V.Consumer;const q=()=>d({},t.useContext(V)),U=(e,t,r,n,o=!0)=>()=>{const{editorView:r}=q(),a=()=>{if(i()){const t=r.view;e(t.state,t.dispatch),o&&t.focus()}},i=()=>e(r.view.state);return S.default.createElement(O,{"data-tooltip":n,title:n,onClick:a,disabled:!i(),onMouseDown:e=>{e.preventDefault(),e.stopPropagation()}},S.default.createElement(t,null))};function j({mark:e,Icon:t,tooltip:r,defaultAttrs:n,selectionOnly:o=!1,noMix:a=[],isDisabled:s,onClick:l,onMenuOptionClick:c}){return()=>{const{editorView:d}=q(),u=d.view,p=e=>u.state.schema.marks[e],m=()=>h(e),h=e=>{const{state:t}=u,r=p(e),{from:n,$from:o,to:a,empty:i}=t.selection;return i?!!r.isInSet(t.storedMarks||o.marks()):t.doc.rangeHasMark(n,a,r)},f=()=>{if(s)return s(u);if("image"===e&&o){const{$cursor:e}=u.state.selection;return!!e||g()||b()}return g()||b()},g=()=>u.state.selection.$from.node(u.state.selection.$from.depth).type===u.state.schema.nodes.code_block,b=()=>a.map(h).reduce(((e,t)=>t||e),!1),k=()=>{if(l&&l(u),c)return c(u);if(f())return;const{state:t,dispatch:r}=u;t.selection.$cursor&&o||i.toggleMark(p(e),n)(t,r)};return p(e)?C.createElement(O,{"data-tooltip":r,"data-side":"top",title:r,onClick:k,active:!f()&&m(),disabled:f()},C.createElement(t,null)):null}}const K=C.createContext((()=>null));function G(){return t.useContext(K)}const X=({children:e})=>{const t=C.useRef(null),r=C.useCallback((e=>t.current?s.createPortal(e.children,t.current):null),[t]);return C.createElement(K.Provider,{value:r},C.createElement("div",{ref:t},e))},Z=$.default((e=>{var t=e,{children:r,open:n,triggerRef:o,innerRef:a}=t,i=p(t,["children","open","triggerRef","innerRef"]);const s=G(),l=C.useRef(null),[c,u]=C.useState(0);return C.useEffect((()=>{if(o.current&&l.current){const e=o.current.getBoundingClientRect(),t=l.current.getBoundingClientRect();u(e.x-t.x)}}),[o.current,l.current]),C.createElement(s,null,C.createElement("div",{ref:l},C.createElement(Q,{offset:c},C.createElement("div",d({},i),r))))}))`
  border-radius: var(--tina-radius-small);
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  bottom: -4px;
  left: 0;
  transform: translate3d(0, 100%, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 85ms ease-out;
  transform-origin: 0 0;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12), 0px 4px 8px rgba(48, 48, 48, 0.1);
  background-color: white;
  overflow: hidden;
  z-index: 10;
  white-space: nowrap;

  ${e=>e.open&&a.css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 100%, 0) scale3d(1, 1, 1);
    `};
`,Q=$.default.div`
  position: absolute;
  left: ${e=>e.offset}px;
`,Y=$.default.div`
  display: block;
  padding: 8px 12px;
  transition: all 85ms ease-out;
  cursor: pointer;
  &:first-child {
    padding-top: var(--tina-padding-small);
  }
  &:last-child {
    padding-bottom: var(--tina-padding-small);
  }
  &:hover {
    background-color: var(--tina-color-grey-1);
    color: var(--tina-color-primary);
  }
  &:active {
    color: var(--tina-color-primary);
    fill: var(--tina-color-primary);
    background-color: rgba(53, 50, 50, 0.05);
  }
  ${e=>e.active&&a.css`
      color: var(--tina-color-primary);
      fill: var(--tina-color-primary);
      background-color: rgba(53, 50, 50, 0.05);
    `};
`,J=(e,t)=>{let r=e,n=r.offsetTop;for(;r.offsetParent&&(!t||r.offsetParent!==t);)r=r.offsetParent,n+=r.offsetTop;return n<0?0:n},ee=(e,t)=>{let r=e,n=r.offsetLeft;for(;r.offsetParent&&(!t||r.offsetParent!==t);)r=r.offsetParent,n+=r.offsetLeft;return n},te=(e,t)=>!!re(e,t),re=(e,t)=>{const{selection:r}=e,{anchor:n,head:o}=r;let a,i;n<o?(a=n,i=o):(a=o,i=n),a=r.empty?a:a+1;const s=t.isInSet(e.doc.resolve(a).marks());if(!s)return!1;let l=s;for(;a<i&&l;a+=1)t.isInSet(e.doc.resolve(a).marks())||(l=void 0);return l},ne=()=>{if("undefined"===typeof r.g.navigator)return"Windows";const e=navigator.userAgent,t=[{s:"Windows",r:/Win16/},{s:"Windows",r:/(Windows 95|Win95|Windows_95)/},{s:"Windows",r:/(Win 9x 4.90|Windows ME)/},{s:"Windows",r:/(Windows 98|Win98)/},{s:"Windows",r:/Windows CE/},{s:"Windows",r:/(Windows NT 5.0|Windows 2000)/},{s:"Windows",r:/(Windows NT 5.1|Windows XP)/},{s:"Windows",r:/Windows NT 5.2/},{s:"Windows",r:/Windows NT 6.0/},{s:"Windows",r:/(Windows 7|Windows NT 6.1)/},{s:"Windows",r:/(Windows 8.1|Windows NT 6.3)/},{s:"Windows",r:/(Windows 8|Windows NT 6.2)/},{s:"Windows",r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},{s:"Linux",r:/(Linux|X11)/},{s:"iOS",r:/(iPhone|iPad|iPod)/},{s:"Mac OS X",r:/Mac OS X/},{s:"Mac OS",r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},{s:"QNX",r:/QNX/},{s:"UNIX",r:/UNIX/},{s:"BeOS",r:/BeOS/}],n=Object.keys(t);for(let r=0;r<t.length;r+=1){const o=t[n[r]];if(o.r.test(e))return o.s}return""},oe=e=>{const t="Windows"===ne()?"^":"\u2318";let r=e;return r=r.replace("Mod",t),r=r.replace("Shift","\u21e7"),r=r.replace("Alt","\u2325"),r};function ae(e,t){const{$cursor:r}=e.selection;if(!r)return!1;const n=e.doc.nodeAt(Math.max(r.pos-1,0));if(!n)return!1;if(n.type!=e.schema.nodes.heading)return!1;if(n.textContent.length)return!1;if(t){const{tr:o}=e;t(o.replaceRangeWith(r.pos-1,r.pos+n.nodeSize-1,e.schema.nodes.paragraph.create()).setSelection(new l.TextSelection(o.doc.resolve(e.selection.head))).scrollIntoView())}return!0}function ie(e,t,r,n){return function(o,a){const{from:i,to:s}=o.selection;let l=null,c=-1;if(o.doc.nodesBetween(i,s,((e,t)=>!l&&(e.isTextblock&&(l=e,c=t),!0))),!l||c<0)return!1;const d=o.doc.resolve(c),u=d.index(),p=o.selection.$head.parent.attrs.level==t.level,m=p?r:e,h=p?n:t;return!!d.parent.canReplaceWith(u,u+1,m)&&(a&&a(o.tr.setBlockType(i,s,m,h).scrollIntoView()),!0)}}function se(e){const{Component:t,children:r,command:n,typeName:o,attrs:a,title:i}=e;return class extends C.Component{constructor(){super(...arguments),this.canDo=()=>n(this.props.view.state),this.onClick=()=>{n(this.props.view.state,this.props.view.dispatch),this.props.view.focus(),this.props.onClick()}}get active(){if(!o)return!1;const{state:e}=this.props.view,t=e.selection.$from,r=t.node(t.depth),n=r.type.name===o,i=!a||r.attrs.level===a.level;return n&&i}render(){return C.createElement(Y,{onClick:this.onClick,disabled:!this.canDo(),active:this.active},C.createElement(le,null,C.createElement(t,null,r),C.createElement(ce,null,i)))}}}const le=$.default.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`,ce=$.default.span`
  color: #d1d1d1;
  font-size: 12px;
`,de=()=>{const[e,r]=t.useState(!1),n=t.useRef(),{editorView:a}=q(),i=a.view,s=()=>r(!e);return C.createElement(C.Fragment,null,C.createElement(o.Dismissible,{click:!0,escape:!0,disabled:!e,onDismiss:s},C.createElement(O,{ref:n,"data-tooltip":"Heading",title:"Heading",onClick:s,active:e},C.createElement(o.HeadingIcon,null)),C.createElement(Z,{triggerRef:n,open:e},C.createElement(we,{view:i,onClick:s}),C.createElement(ye,{view:i,onClick:s}),C.createElement(ve,{view:i,onClick:s}),C.createElement(xe,{view:i,onClick:s}),C.createElement(_e,{view:i,onClick:s}),C.createElement(Ee,{view:i,onClick:s}))))};function ue(e){return function(t,r){return ie(t.schema.nodes.heading,{level:e},t.schema.nodes.paragraph,null)(t,r)}}const pe=a.css`
  white-space: nowrap;
  line-height: 1;
  display: block;
  margin: 0;
`,me=$.default.h1`
  ${pe}
`,he=$.default.h2`
  ${pe}
`,fe=$.default.h3`
  ${pe}
`,ge=$.default.h4`
  ${pe}
`,be=$.default.h5`
  ${pe}
`,ke=$.default.h6`
  ${pe}
`,we=se({Component:me,children:"Heading 1",command:ue(1),typeName:"heading",attrs:{level:1},title:oe("Mod-Alt-1")}),ye=se({Component:he,children:"Heading 2",command:ue(2),typeName:"heading",attrs:{level:2},title:oe("Mod-Alt-2")}),ve=se({Component:fe,children:"Heading 3",command:ue(3),typeName:"heading",attrs:{level:3},title:oe("Mod-Alt-3")}),xe=se({Component:ge,children:"Heading 4",command:ue(4),typeName:"heading",attrs:{level:4},title:oe("Mod-Alt-4")}),_e=se({Component:be,children:"Heading 5",command:ue(5),typeName:"heading",attrs:{level:5},title:oe("Mod-Alt-5")}),Ee=se({Component:ke,children:"Heading 6",command:ue(6),typeName:"heading",attrs:{level:6},title:oe("Mod-Alt-6")}),Me=()=>C.createElement(O,{"data-tooltip":"Heading",disabled:!0},C.createElement(o.HeadingIcon,null));function Ce(e,t){const{code_block:r,paragraph:n}=e.schema.nodes,{selection:o,tr:a}=e;if(o.$to.node(o.$to.depth).type===r)return i.setBlockType(n)(e,t);if(!t||o.empty)return i.setBlockType(r)(e,t);let s,c,d="";e.doc.nodesBetween(o.from,o.to-1,((e,t)=>{e.isTextblock&&(void 0===s&&(s=t),d.length&&(d+="\n"),d+=e.textContent,c=t+e.textContent.length+1)}));const u=r.createChecked();return t(a.replaceRangeWith(s,c+1,u).insertText(d,s+1).setSelection(new l.TextSelection(a.doc.resolve(s+d.length+1))))}const Se=U(Ce,o.CodeIcon,"Codeblock",oe("Codeblock Mod-Alt-0"),!0),$e=()=>S.default.createElement(O,{"data-tooltip":"Codeblock","data-side":"top",disabled:!0},S.default.createElement(o.CodeIcon,null));function Ae(e,t){const{$head:r}=e.selection,n=r.node(-1),o=r.indexAfter(-1),a=n.defaultContentType(o);if(t){const n=r.before(),o=e.tr.replaceWith(n,n,a.createAndFill());o.setSelection(l.Selection.near(o.doc.resolve(n),1)),t(o.scrollIntoView())}return!0}function ze(e,t){const{$head:r,$anchor:n}=e.selection;if(!r.parent.type.spec.code||!r.sameParent(n))return!1;const o=r.node(-1),a=r.indexAfter(-1),i=o.defaultContentType(a);if(!o.canReplaceWith(a,a,i))return!1;if(t){const n=r.before(),o=e.tr.replaceWith(n,n,i.createAndFill());o.setSelection(l.Selection.near(o.doc.resolve(n),-1)),t(o.scrollIntoView())}return!0}function Ie(e){return(t,r)=>{const n=e.getCursor(),o=e.getValue(),a=!o.replace(/[ \r\n]/g,"");if(0!=n.line||0!=n.ch||!a)return!1;const{$from:i}=t.selection;if(r){const{schema:e,tr:n}=t;r(n.replaceRangeWith(i.pos-1,i.pos+o.length+1,e.nodes.paragraph.create()).setSelection(new l.TextSelection(n.doc.resolve(i.pos))))}return!0}}const Te="undefined"==typeof navigator,Pe="undefined"!=typeof navigator&&/Mac/.test(navigator.platform);let Le=null;Te||(Le=r(4631));class Ne{constructor(e,t,r){if(this.node=e,this.view=t,this.getPos=r,this.updating=!1,this.onCursorActivity=()=>{this.updating||this.forwardSelection()},this.forwardSelection=()=>{if(!this.cm.hasFocus())return;const e=this.view.state,t=this.asProseMirrorSelection(e.doc);t.eq(e.selection)||this.view.dispatch(e.tr.setSelection(t))},this.onChange=()=>{this.updating||this.valueChanged()},Te)return;this.cm=this.setupCodeMirror(e),this.dom=this.cm.getWrapperElement(),setTimeout((()=>this.cm.refresh()),20),this.cm.on("cursorActivity",this.onCursorActivity),this.cm.on("changes",this.onChange),this.cm.on("focus",this.forwardSelection);const n=this.getPos()+1,{anchor:o,head:a}=t.state.selection;this.setSelection(o-n,a-n)}valueChanged(){const e=Oe(this.node.textContent,this.cm.getValue());if(e){const t=this.getPos()+1,r=this.view.state.schema,n=this.view.state.tr.replaceWith(t+e.from,t+e.to,e.text?r.text(e.text):null);this.view.dispatch(n)}}asProseMirrorSelection(e){const t=this.getPos()+1,r=this.cm.indexFromPos(this.cm.getCursor("anchor"))+t,n=this.cm.indexFromPos(this.cm.getCursor("head"))+t;return l.TextSelection.create(e,r,n)}setSelection(e,t){this.cm.focus(),this.updating=!0,this.cm.setSelection(this.cm.posFromIndex(e),this.cm.posFromIndex(t)),this.updating=!1}setupCodeMirror(e){return Le(null,{value:e.textContent,lineNumbers:!0,extraKeys:this.codeMirrorKeymap(),mode:e.attrs.params,theme:"forestry"})}codeMirrorKeymap(){const e=this.view,t=Pe?"Cmd":"Ctrl";return Le.normalizeKeyMap({Up:()=>this.maybeEscape("line",-1),Left:()=>this.maybeEscape("char",-1),Down:()=>this.maybeEscape("line",1),Right:()=>this.maybeEscape("char",1),Backspace:()=>{if(!Ie(this.cm)(this.view.state,this.view.dispatch))return Le.Pass;this.view.focus()},[`${t}-Z`]:()=>c.undo(e.state,e.dispatch),[`Shift-${t}-Z`]:()=>c.redo(e.state,e.dispatch),[`${t}-Shift-Enter`]:()=>{const t=this.cm.getCursor();if(this.cm.somethingSelected()||t.line!=this.cm.firstLine())return Le.Pass;if(e.state.selection.$anchor.parentOffset){const t=e.state.selection.$anchor.pos;e.dispatch(e.state.tr.setSelection(l.Selection.near(this.view.state.doc.resolve(t-1),-1)))}return ze(e.state,e.dispatch)&&e.focus(),!0},"Shift-Enter":()=>{const t=this.cm.getCursor();if(this.cm.somethingSelected()||t.line!=this.cm.lastLine())return Le.Pass;if(e.state.selection.$anchor.parentOffset){const t=e.state.selection.$anchor.pos;e.dispatch(e.state.tr.setSelection(l.Selection.near(this.view.state.doc.resolve(t-1),-1)))}return i.exitCode(e.state,e.dispatch)||Ae(e.state,e.dispatch)?e.focus():void 0},[`${t}-Alt-0`]:()=>{const{state:t,dispatch:r}=e,{paragraph:n}=t.schema.nodes;i.setBlockType(n)(t,r)}})}maybeEscape(e,t){const r=this.cm.getCursor();if(this.cm.somethingSelected()||r.line!=(t<0?this.cm.firstLine():this.cm.lastLine())||"char"==e&&r.ch!=(t<0?0:this.cm.getLine(r.line).length))return Le.Pass;const n=this.getPos()+(t<0?0:this.node.nodeSize),o=l.Selection.near(this.view.state.doc.resolve(n),t);if(!(o.$from.pos+1<this.view.state.doc.content.size))return Le.Pass;this.view.dispatch(this.view.state.tr.setSelection(o)),this.view.focus()}update(e){if(e.type!=this.node.type)return!1;this.node=e;const t=Oe(this.cm.getValue(),e.textContent);return t&&(this.updating=!0,this.cm.replaceRange(t.text,this.cm.posFromIndex(t.from),this.cm.posFromIndex(t.to)),this.updating=!1),!0}selectNode(){this.cm.focus()}stopEvent(){return!0}}function Oe(e,t){if(e==t)return null;let r=0,n=e.length,o=t.length;for(;r<n&&e.charCodeAt(r)==t.charCodeAt(r);)++r;for(;n>r&&o>r&&e.charCodeAt(n-1)==t.charCodeAt(o-1);)n--,o--;return{from:r,to:n,text:t.slice(r,o)}}const De=new l.PluginKey("image"),Fe=new l.Plugin({key:De,props:{nodeViews:{code_block:(e,t,r)=>new Ne(e,t,r)}}}),Be=()=>C.createElement(C.Fragment,null,C.createElement(We,null),C.createElement(Re,null)),We=()=>{const{editorView:e}=q(),t=()=>{const{state:t,dispatch:r}=e.view;c.undo(t,r)},r=oe("Undo Mod-Z");return C.createElement(O,{"data-tooltip":r,title:r,"data-side":"top",onClick:t,disabled:c.undoDepth(e.view.state)<1},C.createElement(o.UndoIcon,null))},Re=()=>{const{editorView:e}=q(),t=()=>{const{state:t,dispatch:r}=e.view;c.redo(t,r)},r=oe("Redo Mod-Shift-Z");return C.createElement(O,{"data-tooltip":r,title:r,"data-side":"top",onClick:t,disabled:c.redoDepth(e.view.state)<1},C.createElement(o.RedoIcon,null))},Ve=()=>C.createElement(C.Fragment,null,C.createElement(He,null),C.createElement(qe,null)),He=()=>C.createElement(O,{"data-tooltip":"Undo","data-side":"top",disabled:!0},C.createElement(o.UndoIcon,null)),qe=()=>C.createElement(O,{"data-tooltip":"Redo","data-side":"top",disabled:!0},C.createElement(o.RedoIcon,null)),Ue=(e,t)=>{if("ArrowRight"!==t.key)return!1;const{selection:r,schema:n}=e.state,{code:o}=n.marks;if(!o.isInSet(r.$to.marks()))return!1;if(r.$to.node().nodeSize-2!==r.$to.parentOffset)return!1;const{state:a,dispatch:i}=e;return i(a.tr.insertText(" ",r.$to.pos).removeMark(r.$to.pos,r.$to.pos+1,o)),!0},je=new l.PluginKey("inline"),Ke=new l.Plugin({key:je,props:{handleKeyDown:(e,t)=>Ue(e,t)}}),Ge=()=>C.createElement(C.Fragment,null,C.createElement(Xe,null),C.createElement(Ze,null),C.createElement(Qe,null)),Xe=j({mark:"strong",Icon:o.BoldIcon,tooltip:oe("Bold Mod-B")}),Ze=j({mark:"em",Icon:o.ItalicIcon,tooltip:oe("Italic Mod-I")}),Qe=j({mark:"strike",Icon:o.StrikethroughIcon,tooltip:"Strike"}),Ye=()=>C.createElement(C.Fragment,null,C.createElement(O,{"data-tooltip":"Bold","data-side":"top",disabled:!0},C.createElement(o.BoldIcon,null)),C.createElement(O,{"data-tooltip":"Italic","data-side":"top",disabled:!0},C.createElement(o.ItalicIcon,null)),C.createElement(O,{"data-tooltip":"Strike","data-side":"top",disabled:!0},C.createElement(o.StrikethroughIcon,null)));function Je(e,t){const r=m.liftListItem(e.schema.nodes.list_item);return m.wrapInList(e.schema.nodes.bullet_list)(e,t)||r(e,t)}function et(e,t){const r=m.liftListItem(e.schema.nodes.list_item);return m.wrapInList(e.schema.nodes.ordered_list)(e,t)||r(e,t)}const tt=e=>C.createElement(C.Fragment,null,C.createElement(rt,d({},e)),C.createElement(nt,d({},e))),rt=U(Je,o.UnorderedListIcon,"Unordered List",oe("Unordered List Mod-Alt-8")),nt=U(et,o.OrderedListIcon,"Ordered List",oe("Ordered List Mod-Alt-7")),ot=e=>C.createElement(C.Fragment,null,C.createElement(at,d({},e)),C.createElement(it,d({},e))),at=()=>C.createElement(O,{"data-tooltip":"Unordered List",disabled:!0},C.createElement(o.UnorderedListIcon,null)),it=()=>C.createElement(O,{"data-tooltip":"Ordered List",disabled:!0},C.createElement(o.OrderedListIcon,null));function st(e,t){const{blockquote:r}=e.schema.nodes,{start:n,node:o}=h.findParentNodeOfType(r)(e.selection)||{};if(n&&o){const{tr:r}=e,a=r.doc.resolve(n+1).blockRange(r.doc.resolve(n+o.nodeSize-2));if(a)return!t||t(r.lift(a,0))}return i.wrapIn(e.schema.nodes.blockquote)(e,t)}const lt=U(st,o.QuoteIcon,"Blockquote","Blockquote"),ct=()=>S.default.createElement(O,{"data-tooltip":"Quote","data-side":"top",disabled:!0},S.default.createElement(o.QuoteIcon,null)),dt=(e,t,r,n,o)=>t.includes("tina_table_header_ext_top_left")?mt(e,r,n,o.doc):t.includes("tina_table_header_ext_left")?ut(e,r,n,o.doc):t.includes("tina_table_header_ext_top")?pt(e,r,n,o.doc):void 0,ut=(e,t,r,n)=>{const{width:o}=t,a=t.map.findIndex((t=>t===e-r.start));return new g.CellSelection(n.resolve(t.map[a+o-1]+r.start),n.resolve(e))},pt=(e,t,r,n)=>{const{width:o,height:a}=t,i=t.map.findIndex((t=>t===e-r.start));return new g.CellSelection(n.resolve(t.map[i+o*(a-1)]+r.start),n.resolve(e))},mt=(e,t,r,n)=>new g.CellSelection(n.resolve(t.map[t.map.length-1]+r.start),n.resolve(e)),ht=(e,t)=>{const r=g.TableMap.get(e.node),n=t.isColSelection&&t.isColSelection(),o=t.isRowSelection&&t.isRowSelection();let a=bt(e,n,o);return a=[...a,...ft(e,r,t,n)],a=[...a,...gt(e,r,t,o)],a},ft=(e,t,r,n)=>{const o=[],a=t.map;for(let i=0;i<t.width;i++){const t=document.createElement("div");t.classList.add("tina_table_header_ext_top"),n&&r.ranges.some((t=>t.$from.pos===e.start+a[i]+1))&&t.classList.add("tina_table_header_ext_top_selected"),o.push(f.Decoration.widget(e.start+a[i]+1,t))}return o},gt=(e,t,r,n)=>{const o=[],a=t.map;for(let i=0;i<t.height;i++){const s=document.createElement("div");s.classList.add("tina_table_header_ext_left"),n&&r.ranges.some((r=>r.$from.pos===e.start+a[i*t.width]+1))&&s.classList.add("tina_table_header_ext_left_selected"),o.push(f.Decoration.widget(e.start+a[i*t.width]+1,s))}return o},bt=(e,t,r)=>{const n=[],o=document.createElement("div");return o.classList.add("tina_table_header_ext_top_left"),t&&r&&o.classList.add("tina_table_header_ext_top_left_selected"),n.push(f.Decoration.widget(e.start+2,o)),n},kt=new l.PluginKey("table"),wt=new l.Plugin({key:kt,state:{init:()=>({deco:f.DecorationSet.empty}),apply(e,t,r,n){if(!1===e.getMeta("image_clicked"))return t;const{selection:o}=n;if(o){const{table:e}=n.schema.nodes,a=h.findParentNodeOfType(e)(o);if(a){const e=o===r.selection,i=(a&&a.node.nodeSize)===(t.selectedTable&&t.selectedTable.node.nodeSize)&&(a&&a.start)===(t.selectedTable&&t.selectedTable.start);if(e&&i)return t;const s=ht(a,o);if(s.length)return{deco:f.DecorationSet.create(n.doc,s),tableMap:g.TableMap.get(a.node),selectedTable:a}}}return{deco:f.DecorationSet.empty}}},props:{decorations(e){return this.getState(e).deco},handleClickOn(e,t,r,n,o,a){if(!a)return!1;const i=o.target.classList,{state:s,dispatch:l}=e,c=kt.getState(s),{tableMap:d,selectedTable:u}=c,p=dt(n,i.value,d,u,s);return p&&l(s.tr.setSelection(p)),!1}}}),yt=(e,t)=>t?e.createChecked(null,t):e.createAndFill(),vt=(e,t)=>{if(!t)return!0;const{table_cell:r,table_header:n,table_row:o,table:a}=e.schema.nodes,i=3,s=3,c=[],d=[];for(let l=0;l<s;l+=1)d.push(yt(n)),c.push(yt(r));const u=[];for(let l=0;l<i;l+=1)u.push(o.createChecked(null,0===l?d:c));const p=a.createChecked(null,u),{selection:m,tr:h}=e,{$from:f,$to:g}=m,b=f.pos-1,k=g.pos<e.doc.content.size?g.pos+1:g.pos;return t(h.replaceWith(b,k,p).setSelection(new l.TextSelection(h.doc.resolve(f.pos+1))).scrollIntoView()),!0};function xt(e,t){const{table:r,code_block:n}=e.schema.nodes,{selection:o}=e,a=o.$to.node(o.$to.depth);return(!a||a.type!==n)&&(!h.findParentNodeOfType(r)(o)&&vt(e,t))}const _t=U(xt,o.TableIcon,"Table","Table"),Et=()=>S.default.createElement(O,{"data-tooltip":"Table",disabled:!0},S.default.createElement(o.TableIcon,null));function Mt(e,t,r){const n=e.schema.nodes.image.createAndFill({src:r,alt:"",title:""});return t&&t(e.tr.replaceSelectionWith(n).scrollIntoView()),!0}function Ct(e,t,r){if(t){const n=e.schema.nodes.image,{tr:o}=e;r.forEach((e=>{const t=n.createAndFill({src:e,alt:"",title:""});o.replaceSelectionWith(t)})),t(o.scrollIntoView())}return!0}const St=e=>e;class $t{constructor(e,t,r=St){this.previewSrc=r,this.selectNode=()=>{this.img&&(this.img.style.outline="4px solid #0084FF",this.img.classList.add("tina-selected-image"))},this.deselectNode=()=>{this.img&&(this.img.style.outline="",this.img.classList.remove("tina-selected-image"))},this.destroy=()=>{this.deselectNode()},this.node=e,this.view=t,this.dom=document.createElement("span"),this.dom.classList.add("tinacms-image-wrapper"),this.img=document.createElement("img");const{src:n,align:o,alt:a,title:i,width:s,height:l}=e.attrs;this.updateImgSrc(n),l&&(this.img.style.height=l),s&&(this.img.style.width=s),o&&this.img.classList.add(`align-${o}`),a&&(this.img.alt=a),i&&(this.img.title=i),this.dom.appendChild(this.img)}async updateImgSrc(e){if(this.img)try{this.img.src=await this.previewSrc(e)}catch{this.img.src=e}}update(e){if(this.img){const{alt:t,title:r}=e.attrs;t&&(this.img.alt=t),r&&(this.img.title=r)}return!0}}const At=new l.PluginKey("image"),zt=(e,t,r)=>{t(e.tr.setSelection(new l.NodeSelection(e.tr.doc.resolve(r))))},It=(e,t,r)=>{const n=[];for(let o=0;o<t.files.length;o++){const e=t.files[o];e.type.match("image.*")&&n.push(e)}if(n.length){const{state:t,dispatch:o}=e;return o(t.tr.setMeta("loading_images",n.length)),r(n).then(((r=[])=>{o(t.tr.setMeta("loading_images",0)),Ct(t,o,r),e.focus()})),!0}return!1},Tt=({previewSrc:e,upload:t})=>new l.Plugin({key:At,state:{init:()=>({selectedImage:void 0}),apply(e,t,r,n){if(e.getMeta("loading_images")>0){const r=e.getMeta("loading_images"),o=document.createElement("div");for(let e=0;e<r;e++){const e=document.createElement("div");e.classList.add("image_loading_indicator"),o.appendChild(e)}return u(d({},t),{deco:f.DecorationSet.create(n.doc,[f.Decoration.widget(n.selection.$to.pos,o)])})}if(0===e.getMeta("loading_images"))return u(d({},t),{deco:void 0});if(t&&t.selectedImage){const{pos:r}=t.selectedImage;if(!e.doc.nodeAt(r))return u(d({},t),{selectedImage:void 0})}const o=e.getMeta("image_clicked");return o?u(d({},t),{selectedImage:o}):!1===o?u(d({},t),{selectedImage:void 0}):t}},props:{nodeViews:{image:(t,r)=>new $t(t,r,e)},decorations(e){return this.getState(e).deco},handleKeyDown(e,t){const{state:r,dispatch:n}=e,{selection:o,schema:a}=r;if("Escape"===t.key)n(r.tr.setMeta("image_clicked",!1));else{if("Backspace"===t.key&&o.$to.nodeBefore&&o.$to.nodeBefore.type===a.nodes.image)return zt(r,n,o.$to.pos-1),!0;if("Delete"===t.key&&o.$to.nodeAfter&&o.$to.nodeAfter.type===a.nodes.image)return zt(r,n,o.$to.pos),!0}return!1},handleClickOn(e,t,r,n,o,a){if(!a)return!1;const{state:i,dispatch:s}=e,{image:l}=e.state.schema.nodes;return r.type===l?s(i.tr.setMeta("image_clicked",{pos:n,node:r})):s(i.tr.setMeta("image_clicked",!1)),!1},handleDrop(e,r,n,o){if(o||!t)return!1;r.preventDefault();const a=r.dataTransfer;return!!a&&It(e,a,t)},handlePaste(e,r){if(!t)return!1;r.preventDefault();const n=r.clipboardData;return!!n&&It(e,n,t)}}}),Pt=({imageProps:e})=>{const r=n.useCMS(),a=t.useRef(),{editorView:i}=q();if(!e||!e.upload)return null;const{parse:s,mediaDir:l}=e,c=e=>{if(!i)return;const{state:t,dispatch:r}=i.view;Mt(t,r,e),i.view.focus()};async function d(e){var t,n;if(e){const o=(null==(n=null==(t=r.media)?void 0:t.store)?void 0:n.parse)||s;c(o(e))}}return S.default.createElement(S.default.Fragment,null,S.default.createElement(O,{title:"Image",ref:a,onClick:()=>{r.media.open({directory:l||"/",onSelect:d})}},S.default.createElement(o.MediaIcon,null)))},Lt=({uploadImages:e})=>e?S.default.createElement(O,{"data-testid":"image-menu","data-tooltip":"Image","data-side":"top",disabled:!0},S.default.createElement(o.MediaIcon,null)):null,Nt=()=>{const{editorView:e}=q(),r=e.view,n=At.getState(r.state);if(!n||!n.selectedImage)return null;const{node:o,pos:a}=n.selectedImage,{link:i}=r.state.schema.marks,s=o.marks.find((e=>e.type===i)),[c,p]=t.useState(o.attrs.title),[m,h]=t.useState(o.attrs.alt),[f,g]=t.useState(s&&s.attrs.title),[b,k]=t.useState(s&&s.attrs.href),{top:w,left:y}=r.coordsAtPos(a),[v,x]=t.useState(w),[_,E]=t.useState(y),M=t.useRef(),C=t.useRef(),$=t.useRef(),[A,z]=t.useState(!!s);function I(e){const t=document.getElementsByClassName("tina-selected-image")[0],r=document.getElementsByClassName("wysiwyg-wrapper")[0];if(t&&($.current!==t||e)&&M.current){$.current=t;const e=M.current.getBoundingClientRect();E(t.clientWidth/2+ee(t,r)-e.width/2),x(J(t,r))}}t.useEffect((()=>{const e=T.default((()=>I(!0)),10);return window.addEventListener("scroll",e),()=>{window.removeEventListener("scroll",e)}})),t.useEffect((()=>{g(s?s.attrs.title:""),k(s?s.attrs.href:""),z(!!s)}),[s]),t.useEffect((()=>{p(o.attrs.title),h(o.attrs.alt)}),[n.selectedImage.node]),t.useEffect((()=>{setTimeout((()=>{C.current&&C.current.focus()}))}),[C]),t.useEffect(I);const P=()=>{const{dispatch:e,state:t}=r,{image:n}=t.schema.nodes,{link:i}=t.schema.marks,{tr:s}=t;A&&(b||f)?s.addMark(a,a+1,i.create({href:b,title:f})):s.removeMark(a,a+1,i),s.setNodeMarkup(a,n,u(d({},o.attrs),{alt:m,title:c})).setSelection(new l.NodeSelection(s.doc.resolve(a))),e(s),L(),r.focus()},L=()=>{const{dispatch:e,state:t}=r;e(t.tr.setMeta("image_clicked",!1)),p(""),h(""),g(""),k(""),r.focus()},N=e=>{"Escape"===e.key&&L(),"Enter"===e.key&&P()};return S.default.createElement(Ot,{top:v,left:_,ref:M,onKeyDown:N},S.default.createElement(Dt,null,"Title"),S.default.createElement(Ft,{placeholder:"Enter Title",type:"text",ref:C,value:c,onChange:e=>p(e.target.value)}),S.default.createElement(Dt,null,"Alt"),S.default.createElement(Ft,{placeholder:"Enter Alt Text",type:"text",value:m,onChange:e=>h(e.target.value)}),S.default.createElement(Vt,null,S.default.createElement(Ut,{id:"toggleImageLink",onChange:()=>{z(!A),A||(g(""),k(""))},type:"checkbox"}),S.default.createElement(Ht,{htmlFor:"toggleImageLink",role:"switch"},"Insert Link",S.default.createElement(qt,{checked:A},S.default.createElement("span",null)))),A&&S.default.createElement(S.default.Fragment,null,S.default.createElement(Dt,null,"Link Title"),S.default.createElement(Ft,{placeholder:"Enter Link Title",type:"text",value:f,onChange:e=>g(e.target.value)}),S.default.createElement(Dt,null,"Link URL"),S.default.createElement(Ft,{placeholder:"Enter Link URL",type:"text",value:b,onChange:e=>k(e.target.value)})),S.default.createElement(Bt,null,S.default.createElement(Rt,{onClick:L},"Cancel"),S.default.createElement(Wt,{onClick:P},"Save")))},Ot=$.default.span`
  background-color: #f6f6f9;
  position: absolute;
  border-radius: var(--tina-radius-small);
  border: 1px solid var(--tina-color-grey-2);
  filter: drop-shadow(0px 4px 8px rgba(48, 48, 48, 0.1))
    drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.12));
  transform-origin: 50% 0;
  overflow: visible;
  padding: 12px;
  z-index: 10;
  width: 256px;
  left: ${({left:e})=>`${e}px`};
  top: ${({top:e})=>`${e}px`};
`,Dt=$.default.label`
  display: block;
  font-size: var(--tina-font-size-1);
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--tina-color-grey-8);
  margin-bottom: 3px;
`,Ft=$.default.input`
  position: relative;
  background-color: white;
  border-radius: var(--tina-radius-small);
  font-size: var(--tina-font-size-1);
  line-height: 1.35;
  transition: all 85ms ease-out;
  padding: 8px 12px;
  border: 1px solid var(--tina-color-grey-2);
  width: 100%;
  margin: 0 0 8px 0;
  outline: none;
  box-shadow: 0 0 0 2px transparent;

  &:hover {
    box-shadow: 0 0 0 2px var(--tina-color-grey-3);
  }

  &:focus {
    box-shadow: 0 0 0 2px var(--tina-color-primary);
  }

  &::placeholder {
    font-size: var(--tina-font-size-2);
    color: #cfd3d7;
  }
`,Bt=$.default.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
`,Wt=$.default.button`
  text-align: center;
  border: 0;
  border-radius: var(--tina-radius-big);
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);
  background-color: var(--tina-color-primary);
  color: white;
  font-weight: var(--tina-font-weight-regular);
  cursor: pointer;
  transition: all 85ms ease-out;
  font-size: var(--tina-font-size-0);
  padding: 8px 20px;
  margin-left: 8px;
  &:hover {
    background-color: var(--tina-color-primary-light);
  }
  &:active {
    background-color: var(--tina-color-primary-dark);
  }
`,Rt=$.default.button`
  text-align: center;
  border: 1px solid var(--tina-color-grey-2);
  border-radius: var(--tina-radius-big);
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);
  background-color: white;
  color: var(--tina-color-primary);
  font-weight: var(--tina-font-weight-regular);
  cursor: pointer;
  transition: all 85ms ease-out;
  font-size: var(--tina-font-size-0);
  padding: 8px 20px;
  margin-left: 8px;
  &:hover {
    background-color: var(--tina-color-grey-1);
    opacity: 1;
  }
  &:active {
    background-color: var(--tina-color-primary-dark);
  }
`,Vt=$.default.div`
  display: block;
  position: relative;
  margin: 0 0 8px 0;
`,Ht=$.default.label`
  background: none;
  padding: 0;
  opacity: ${e=>e.disabled?"0.4":"1"};
  outline: none;
  height: 28px;
  pointer-events: ${e=>e.disabled?"none":"inherit"};
  font-size: var(--tina-font-size-1);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.35;
  color: var(--tina-color-grey-8);
`,qt=$.default.div`
  position: relative;
  width: 48px;
  height: 28px;
  border-radius: var(--tina-radius-big);
  background-color: white;
  border: 1px solid var(--tina-color-grey-2);
  pointer-events: none;
  margin-left: -2px;
  span {
    position: absolute;
    border-radius: var(--tina-radius-big);
    left: 2px;
    top: 50%;
    width: calc(28px - 6px);
    height: calc(28px - 6px);
    background: ${e=>e.checked?"var(--tina-color-primary)":"var(--tina-color-grey-3)"};
    transform: translate3d(${e=>e.checked?"20px":"0"}, -50%, 0);
    transition: all 150ms ease-out;
  }
`,Ut=$.default.input`
  position: absolute;
  left: 0;
  top: 0;
  width: 48px;
  height: 28px;
  opacity: 0;
  margin: 0;
  cursor: ${e=>e.disabled?"not-allowed":"pointer"};
`,jt=()=>{const e=document.getElementsByClassName("image_loading_indicator");if(!e.length)return null;const t=[];for(let r=0;r<e.length;r++)t.push(A.default.createPortal(S.default.createElement(Kt,null),e[0]));return S.default.createElement(S.default.Fragment,null,t)},Kt=$.default((e=>{var t=p(e,[]);return S.default.createElement("div",d({},t),S.default.createElement(n.LoadingDots,{color:"var(--tina-color-primary)"}))}))`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 64px;
  background-color: rgba(100, 100, 100, 0.07);
`,Gt=/\.(jpe?g|png)/,Xt=/\bhttps?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:;%_\+.,~#?&//=]*)/g,Zt=function(e){const t=[];return e.forEach((function(e){if(e.isText){const r=e.text;let n,o=0;const a=e.type.schema.marks.link,i=e.type.schema.nodes.image,s=[];for(;n=Xt.exec(r);){const e=n.index,t=e+n[0].length;s.push({start:e,end:t})}s.forEach((({start:n,end:s})=>{let l;n>0&&t.push(e.cut(o,n));const c=r.slice(n,s);Gt.test(c)?(l={src:c,title:"",alt:""},t.push(i.create(l))):(l={href:c,title:c},t.push(e.cut(n,s).mark(a.create(l).addToSet(e.marks)))),o=s})),o<r.length&&t.push(e.cut(o))}else t.push(e.copy(Zt(e.content)))})),k.Fragment.fromArray(t)},Qt=new l.PluginKey("image");function Yt(){let e;return new l.Plugin({key:Qt,state:{init:()=>({showLinkForm:!1}),apply:(e,t,r)=>!1===e.getMeta("show_link_toolbar")?{show_link_toolbar:!1}:e.getMeta("show_link_toolbar")?{show_link_toolbar:!0}:t},props:{transformPasted:t=>e?t:new k.Slice(Zt(t.content),t.openStart,t.openEnd),handleKeyDown:(t,r)=>(e=r.shiftKey,!1),handleClickOn(e,t){const{dispatch:r,state:n}=e,{tr:o}=n;r(o.setMeta("show_link_toolbar",!1))}}})}function Jt(e,t){window.$cursor=e;let r=e.index(),n=e.indexAfter();r===e.parent.childCount&&(r--,n--);const o=t.isInSet(e.parent.child(r).marks);if(!o)return;const a=t=>o.isInSet(e.parent.child(t).marks);for(;r>0&&a(r-1);)r--;for(;n<e.parent.childCount&&a(n);)n++;let i=e.start(),s=i;for(let l=0;l<n;l++){const t=e.parent.child(l).nodeSize;l<r&&(i+=t),s+=t}return{from:i,to:s,mark:o}}function er(e){const{dispatch:t,state:r}=e;t(r.tr.setMeta("show_link_toolbar",!1))}function tr(e,t,r){if(t){const{selection:n,schema:o,tr:a}=e,i=Jt(n.$anchor,o.marks.link);i&&a.addMark(i.from,i.to,o.marks.link.create(r)),a.setMeta("show_link_toolbar",!1),t(a)}return!0}function rr(e,t){if(t){const{selection:r,schema:n,tr:o}=e,a=Jt(r.$anchor,n.marks.link);a&&o.removeMark(a.from,a.to,a.mark),o.setMeta("show_link_toolbar",!1),t(o)}return!0}const nr=(e,t)=>{const{schema:r,selection:n}=e,{marks:o}=r;if(n.empty&&!te(e,o.link))return!1;const a=e.tr.setMeta("show_link_toolbar",!0);if(!te(e,o.link)){const{$to:e,$from:t}=n;a.addMark(t.pos,e.pos,o.link.create({href:"",title:""}))}return t(a)},or=j({mark:"link",Icon:o.LinkIcon,tooltip:oe("Link Mod-K"),selectionOnly:!0,noMix:["code"],isDisabled:e=>{const{schema:t,selection:r}=e.state,{marks:n,nodes:o}=t;if(r.empty&&!te(e.state,n.link))return!0;const a=r.$from.node(),i=At.getState(e.state);return!!(null==i?void 0:i.selectedImage)||a&&a.type===o.code_block},onMenuOptionClick:e=>{const{state:t,dispatch:r}=e;return nr(t,r)}}),ar=()=>S.default.createElement(O,{"data-tooltip":"Link","data-side":"top",disabled:!0},S.default.createElement(o.LinkIcon,null));class ir extends C.Component{constructor(){super(...arguments),this.state={href:this.props.href||""},this.inputRef=C.createRef(),this.setHref=({target:{value:e}})=>this.setState((()=>({href:e}))),this.save=()=>this.props.onChange(this.state),this.onEnterSave=e=>{"Enter"===e.key&&this.save()},this.onEscapeCancel=e=>{27===e.keyCode&&this.closeModal()}}componentDidMount(){document.addEventListener("keydown",this.onEscapeCancel),this.inputRef.current&&this.inputRef.current.focus()}componentWillUnmount(){document.removeEventListener("keydown",this.onEscapeCancel)}componentDidUpdate(e){const{href:t}=this.props;t!==e.href&&this.setState((()=>({href:t})))}closeModal(){const{href:e}=this.state,{cancel:t,removeLink:r,href:n}=this.props;e||n||r(),t()}render(){const{removeLink:e,style:t={}}=this.props,{href:r}=this.state;return C.createElement(lr,{style:d({},t)},C.createElement(cr,null,"URL"),C.createElement(dr,{ref:this.inputRef,placeholder:"Enter URL",type:"text",value:r,onChange:this.setHref,onKeyPress:this.onEnterSave}),C.createElement(ur,null,C.createElement(mr,{onClick:e},"Delete"),C.createElement(pr,{onClick:this.save,disabled:!r},"Save")))}}const sr=a.keyframes`
  0% {
    transform: scale3d(0.5,0.5,1)
  }
  100% {
    transform: scale3d(1, 1, 1);
  }
`,lr=$.default.div`
  background-color: #f6f6f9;
  position: relative;
  height: max-content;
  border-radius: var(--tina-radius-small);
  border: 1px solid var(--tina-color-grey-2);
  filter: drop-shadow(0px 4px 8px rgba(48, 48, 48, 0.1))
    drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.12));
  transform-origin: 50% 0;
  animation: ${sr} 85ms ease-out both 1;
  overflow: visible;
  padding: 12px;
  z-index: 10;
`,cr=$.default.label`
  display: block;
  font-size: var(--tina-font-size-1);
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--tina-color-grey-8);
  margin-bottom: 3px;
`,dr=$.default.input`
  position: relative;
  background-color: white;
  border-radius: var(--tina-radius-small);
  font-size: var(--tina-font-size-1);
  line-height: 1.35;
  transition: all 85ms ease-out;
  padding: 8px 12px;
  border: 1px solid var(--tina-color-grey-2);
  width: 100%;
  margin: 0 0 8px 0;
  outline: none;
  box-shadow: 0 0 0 2px transparent;

  &:hover {
    box-shadow: 0 0 0 2px var(--tina-color-grey-3);
  }

  &:focus {
    box-shadow: 0 0 0 2px #0084ff;
  }

  &::placeholder {
    font-size: var(--tina-font-size-2);
    color: #cfd3d7;
  }
`,ur=$.default.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
`,pr=$.default.button`
  text-align: center;
  border: 0;
  border-radius: var(--tina-radius-big);
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);
  background-color: #0084ff;
  color: white;
  font-weight: var(--tina-font-weight-regular);
  cursor: pointer;
  transition: all 85ms ease-out;
  font-size: var(--tina-font-size-0);
  padding: 8px 20px;
  margin-left: 8px;
  &:hover {
    background-color: #2296fe;
  }
  &:active {
    background-color: #0574e4;
  }
  &:disabled {
    background-color: #d1d1d1;
    box-shadow: none;
  }
`,mr=$.default.button`
  text-align: center;
  border: 1px solid var(--tina-color-grey-2);
  border-radius: var(--tina-radius-big);
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);
  background-color: white;
  color: #0084ff;
  font-weight: var(--tina-font-weight-regular);
  cursor: pointer;
  transition: all 85ms ease-out;
  font-size: var(--tina-font-size-0);
  padding: 8px 20px;
  margin-left: 8px;
  &:hover {
    background-color: #f6f6f9;
    opacity: 1;
  }
  &:active {
    background-color: #0574e4;
  }
`,hr=240,fr=()=>{const{editorView:e}=q(),[r,n]=t.useState(void 0);if(!e)return null;const{view:o}=e,a=Qt.getState(o.state),{anchor:i,head:s}=o.state.selection,l=i<s?i:s,c=(o.state.selection.empty?o.domAtPos(l).node:o.domAtPos(l+1).node).parentNode,d=e=>{tr(o.state,o.dispatch,e),o.focus()},u=()=>{er(o),o.focus()},p=t.createRef();if(t.useEffect((()=>{if(!c||!p.current)return void n(void 0);const e=kr(c,p.current,hr),t=`calc(32px + ${J(c)-J(p.current)}px)`,r=wr(c,p.current);n({arrowOffset:r,left:e,top:t})}),[a]),!a.show_link_toolbar)return null;const{arrowOffset:m,left:h,top:f}=r||{},{state:g,dispatch:b}=o;let k="";const w=re(g,g.schema.marks.link);return w&&(k=w.attrs.href),C.createElement("div",{ref:p,style:{position:"absolute"}},r&&C.createElement(gr,null,C.createElement(br,{offset:m,top:f}),C.createElement(ir,{style:{left:h,top:f,width:`${hr}px`},removeLink:()=>rr(g,b),onChange:d,href:k,cancel:u})))},gr=$.default.div`
  position: relative;
`,br=$.default.div`
  position: absolute;
  top: ${e=>e.top};
  left: ${e=>e.offset};
  margin-top: 3px;
  transform: translate3d(-50%, -100%, 0);
  width: 16px;
  height: 13px;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  background-color: #f6f6f9;
  z-index: 100;
`;function kr(e,t,r){const n=e.offsetWidth,o=ee(e),a=t.parentElement.offsetWidth,i=ee(t),s=o-i+n/2-r/2;return s<-i?"-8px":s+r>a?`calc(${s-(s+r-a)}px + 8px)`:`${s}px`}function wr(e,t,r){const n=e.offsetWidth;return ee(e)-ee(t)+n/2+"px"}const yr=$.default.div`
  color: transparent;
  background: transparent;
  pointer-events: none;
  position: relative;
  display: block;
  height: ${e=>e.menuBoundingBox.height}px;
  width: ${e=>e.menuBoundingBox.width}px;
`,vr=$.default.div`
  position: relative;
  margin-bottom: 14px;
  z-index: var(--tina-z-index-1);

  ${e=>e.menuFixed&&a.css`
      position: fixed;
      width: ${e.menuBoundingBox.width}px;
      top: ${e.menuFixedTopOffset};
    `};
`,xr=$.default.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  justify-content: space-between;
  position: relative;
  top: 0;
  width: 100%;
  background-color: white;
  border-radius: var(--tina-radius-small);
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--tina-color-grey-2);
  overflow: hidden;
  z-index: var(--tina-z-index-0);
`,_r=({sticky:e=!0,menus:r,plugins:n,popups:o})=>{const[a,i]=t.useState(!1),s="undefined"!==typeof window,l=t.useRef(null),[c,d]=t.useState(null),[u,p]=t.useState(null),m="string"===typeof e?e:"0",h=t.useRef(0),f=t.useRef(0),{editorView:g}=q(),{mode:b}=W();t.useEffect((()=>{l.current&&e&&d(l.current.getBoundingClientRect())}),[l,g,b]),t.useEffect((()=>{if(!s||!l.current||!e)return;const t=l.current.parentElement;let r=!1;const n=()=>{if("number"===typeof u){const e=u+((null==t?void 0:t.offsetHeight)||0);h.current>u&&h.current<e?i(!0):i(!1)}f.current=window.requestAnimationFrame(n)},o=()=>{if(l.current){const e=a;i(!1),d(l.current.getBoundingClientRect()),i(e)}},c=T.default((()=>{h.current=window.scrollY,b()}),10,{leading:!0,trailing:!1}),g=T.default((()=>{cancelAnimationFrame(f.current),r=!1}),10);function b(){r||(f.current=window.requestAnimationFrame(n)),r=!0}function k(){if(t){const e=parseInt(m,10),r=J(t)-e;p(r)}}return"complete"!==document.readyState?window.addEventListener("load",k):setTimeout(k,10),window.addEventListener("scroll",c),window.addEventListener("scroll",g),window.addEventListener("resize",o),()=>{window.removeEventListener("scroll",c),window.removeEventListener("scroll",g),window.removeEventListener("resize",o),cancelAnimationFrame(f.current)}}),[l,c,u]);const k=S.default.useCallback((e=>{e.stopPropagation(),e.preventDefault()}),[]);return S.default.createElement(S.default.Fragment,null,a&&S.default.createElement(yr,{menuBoundingBox:c}),S.default.createElement(vr,{menuFixedTopOffset:m,menuFixed:a,menuBoundingBox:c,ref:l,"data-testid":"base-menubar"},S.default.createElement(X,null,S.default.createElement(xr,{onMouseDown:k},r,null==n?void 0:n.map((({name:e,MenuItem:t})=>S.default.createElement(t,{key:e,mode:b,editorView:g})))))),o)},Er=e=>{var t=e,{plugins:r,uploadImages:n}=t,o=p(t,["plugins","uploadImages"]);return S.default.createElement(_r,u(d({},o),{menus:[S.default.createElement(Me,null),S.default.createElement(Ye,null),S.default.createElement(ar,null),S.default.createElement(Lt,{uploadImages:n}),S.default.createElement(Et,null),S.default.createElement(ct,null),S.default.createElement($e,null),S.default.createElement(ot,null),S.default.createElement(Ve,null)],plugins:r}))},Mr=20,Cr=({imageProps:e,onChange:r,value:n,plugins:o,sticky:a})=>{const i=t.useRef(null),[s,l]=t.useState(n),{browserFocused:c}=N();return t.useEffect((()=>{const e=i.current;e&&(e.focus({preventScroll:!0}),e.setSelectionRange(e.value.length,e.value.length))}),[]),t.useEffect((()=>{const e=i.current;e&&(e.style.height="0",e.style.height=e.scrollHeight+Mr+"px")})),t.useEffect((()=>{const e=i.current===document.activeElement;c&&e||l(n)}),[n]),C.createElement(C.Fragment,null,C.createElement(Er,{sticky:a,uploadImages:null==e?void 0:e.upload,plugins:o}),C.createElement("textarea",{"data-testid":"markdown-editing-textarea",ref:i,value:s,onChange:e=>{const t=e.target.value;l(t),r(t)},onFocus:e=>{e.preventDefault(),e.target.focus({preventScroll:!0})},className:"w-full shadow-inner focus:shadow-outline focus:border-blue-500 block bg-white border border-gray-200 text-gray-600 focus:text-gray-900 rounded-md p-5 mb-5",style:{minHeight:"100px"}}))},Sr={parseDOM:[{tag:"code"}],toDOM:()=>["code"],excludes:"em strong strike"},$r={parseDOM:[{tag:"i"},{tag:"em"},{style:"font-style",getAttrs:e=>"italic"===e&&null}],toDOM:()=>["em"],excludes:"code"},Ar={attrs:{href:{},title:{default:null}},inclusive:!1,parseDOM:[{tag:"a[href]",getAttrs:e=>({href:e.getAttribute("href"),title:e.getAttribute("title")})}],toDOM:e=>["a",e.attrs],toDocument:e=>["a",e.attrs]},zr={parseDOM:[{tag:"strike"},{tag:"s"},{tag:"del"},{style:"text-decoration",getAttrs:e=>"line-through"===e&&null}],toDOM:()=>["s",0],excludes:"code"},Ir={parseDOM:[{tag:"strong"},{tag:"b",getAttrs:e=>"normal"!=e.style.fontWeight&&null},{style:"font-weight",getAttrs:e=>/^(bold(er)?|[5-9]\d{2,})$/.test(e)&&null}],toDOM:()=>["strong"],excludes:"code"},Tr={content:"block+"},Pr={content:"block+",group:"block",defining:!0,parseDOM:[{tag:"blockquote"}],toDOM:()=>["blockquote",0]},Lr={content:"list_item+",group:"block",attrs:{tight:{default:!1}},parseDOM:[{tag:"ul",getAttrs:e=>({tight:e.hasAttribute("data-tight")})}],toDOM:e=>["ul",{"data-tight":e.attrs.tight?"true":null},0]},Nr={content:"text*",attrs:{params:{default:""}},group:"block",code:!0,defining:!0,parseDOM:[{tag:"pre",preserveWhitespace:"full",getAttrs:e=>({params:e.getAttribute("data-params")})}],toDOM:e=>["pre",{"data-params":e.attrs.params},["code",0]]},Or={inline:!0,group:"inline",selectable:!1,parseDOM:[{tag:"br"}],toDOM:()=>["br"]};function Dr(e){const t={};for(const r in e)e[r]&&(t[`forestry-${r}`]=e[r]);return t}function Fr(e){const t={};for(const r in e)e[r]&&(t[r]=e[r]);return t}function Br(e){return function(t){return d(d({},e),Wr(t))}}function Wr(e){const t={},r=e.attributes;for(let n=0;n<r.length;n++){const e=r[n];e.value&&(t[e.name.startsWith("forestry-")?e.name.slice(9):e.name]=e.value)}return t}const Rr={attrs:{level:{default:1},class:{default:""},id:{default:""}},content:"inline*",marks:"_",group:"block",defining:!0,parseDOM:[{tag:"h1",getAttrs:Br({level:1})},{tag:"h2",getAttrs:Br({level:2})},{tag:"h3",getAttrs:Br({level:3})},{tag:"h4",getAttrs:Br({level:4})},{tag:"h5",getAttrs:Br({level:5})},{tag:"h6",getAttrs:Br({level:6})}],toDocument(e){const t=e.attrs,{level:r}=t;return["h"+r,Fr(p(t,["level"])),0]},toDOM(e){const t=e.attrs,{level:r}=t;return["h"+r,Dr(p(t,["level"])),0]}},Vr={group:"block",allowGapCursor:!0,parseDOM:[{tag:"hr"}],toDOM:()=>["hr"]},Hr={inline:!0,attrs:{src:{},align:{default:null},alt:{default:null},title:{default:null},width:{default:null},height:{default:null}},group:"inline",draggable:!0,allowGapCursor:!0,parseDOM:[{tag:"img[src]",getAttrs:e=>({src:e.getAttribute("src"),title:e.getAttribute("title"),alt:e.getAttribute("alt"),align:Ur(e),width:e.getAttribute("width"),height:e.getAttribute("height")})}],toDOM(e){const t={src:e.attrs.src};return e.attrs.title&&(t.title=e.attrs.title),e.attrs.alt&&(t.alt=e.attrs.alt),e.attrs.width&&(t.width=e.attrs.width),e.attrs.height&&(t.height=e.attrs.height),e.attrs.align&&(t.class=`align-${e.attrs.align}`),["img",t]}},qr=/align-([a-z]*)/;function Ur(e){const t=e.getAttribute("class")||"",r=qr.exec(t);return r&&r.length>1?r[1]:null}const jr={content:"paragraph block*",defining:!0,parseDOM:[{tag:"li"}],toDOM:()=>["li",0]},Kr={content:"list_item+",group:"block",attrs:{order:{default:1},tight:{default:!1}},parseDOM:[{tag:"ol",getAttrs:e=>({order:e.hasAttribute("start")?+(e.getAttribute("start")||0):1,tight:e.hasAttribute("data-tight")})}],toDOM:e=>["ol",{start:1==e.attrs.order?null:e.attrs.order,"data-tight":e.attrs.tight?"true":null},0]},Gr={content:"inline*",marks:"_",attrs:{class:{default:""},id:{default:""}},group:"block",parseDOM:[{tag:"p",getAttrs:Wr}],toDocument:e=>["p",Fr(e.attrs),0],toDOM:e=>["p",Dr(e.attrs),0]},Xr={group:"inline"},Zr=g.tableNodes({tableGroup:"block",cellContent:"inline*",cellAttributes:{}});Zr.table_cell=u(d({},Zr.table_cell),{marks:"_",attrs:u(d({},Zr.table_cell.attrs),{align:{default:null}}),toDOM(e){const t={};return e.attrs.align&&(t.style=`text-align: ${e.attrs.align};`),["td",t,0]}}),Zr.table_header=u(d({},Zr.table_header),{marks:"_",attrs:u(d({},Zr.table_header.attrs),{align:{default:null}}),toDOM(e){const t={};return e.attrs.align&&(t.style=`text-align: ${e.attrs.align};`),["th",t,0]}});const Qr={code:Sr,em:$r,link:Ar,strike:zr,strong:Ir},Yr=d({doc:Tr,paragraph:Gr,blockquote:Pr,bullet_list:Lr,code_block:Nr,hard_break:Or,heading:Rr,horizontal_rule:Vr,image:Hr,list_item:jr,ordered_list:Kr,text:Xr},Zr),Jr=()=>new k.Schema({nodes:Yr,marks:Qr});class en{}class tn{constructor(e,t){this.nodes=e,this.marks=t}serialize(e,t={}){const r=new rn(this.nodes,this.marks,t);return r.renderContent(e),r.out}}class rn{constructor(e,t,r){this.nodes=e,this.marks=t,this.delim=this.out="",this.closed=!1,this.inTightList=!1,this.options=r||{},"undefined"==typeof this.options.tightLists&&(this.options.tightLists=!1)}flushClose(e){if(this.closed){if(this.atBlank()||(this.out+="\n"),null==e&&(e=2),e>1){let t=this.delim;const r=/\s+$/.exec(t);r&&(t=t.slice(0,t.length-r[0].length));for(let n=1;n<e;n++)this.out+=t+"\n"}this.closed=!1}}wrapBlock(e,t,r,n){const o=this.delim;this.write(t||e),this.delim+=e,n(),this.delim=o,this.closeBlock(r)}atBlank(){return/(^|\n)$/.test(this.out)}ensureNewLine(){this.atBlank()||(this.out+="\n")}write(e){this.flushClose(),this.delim&&this.atBlank()&&(this.out+=this.delim),e&&(this.out+=e)}closeBlock(e){this.closed=e}text(e,t,r){const n=e.split("\n");for(let o=0;o<n.length;o++){const e=this.atBlank()||this.closed;this.write();let a=!1!==t?this.esc(n[o],e):n[o];a=r?r(a):a,this.out+=a,o!=n.length-1&&(this.out+="\n")}}render(e,t,r,n){if("number"==typeof t)throw new Error("!");this.nodes[e.type.name](this,e,t,r,n)}renderContent(e){e.forEach(((t,r,n)=>this.render(t,e,n)))}renderInline(e,t){const r=[];let n="";const o=(o,a,i=0)=>{let s=o?o.marks:[];const l=s.findIndex((e=>"code"===e.type.name));l>=0&&s.length>1&&(s=[...s.slice(0,l),...s.slice(l+1,s.length),s[l]]);let c=n;if(n="",o&&o.isText&&s.some(((e,t,r)=>{const n=this.marks[e.type.name];return!(!n||!n.expelEnclosingWhitespace)}))&&/^(\s*)(.*?)(\s*)$/.test(o.text||"")){const[,e,t,a]=Array.from(/^(\s*)(.*?)(\s*)$/.exec(o.text||"")||[]);c+=e,n=a,(e||a)&&((o=t?o.withText(t):null)||(s=r))}const d=s.length&&s[s.length-1],u=d&&!1===this.marks[d.type.name].escape,p=s.length-(u?1:0);e:for(let e=0;e<p;e++){const t=s[e];if(!this.marks[t.type.name].mixable)break;for(let n=0;n<r.length;n++){const o=r[n];if(!this.marks[o.type.name].mixable)break;if(t.eq(o)){e>n?s=s.slice(0,n).concat(t).concat(s.slice(n,e)).concat(s.slice(e+1,p)):n>e&&(s=s.slice(0,e).concat(s.slice(e+1,n)).concat(t).concat(s.slice(n,p)));continue e}}}let m=0;for(;m<Math.min(r.length,p)&&s[m].eq(r[m]);)++m;for(;m<r.length;)this.text(this.markString(r.pop(),!1,o),!1);if(c&&this.text(c),o){for(;r.length<p;){const e=s[r.length];r.push(e),this.text(this.markString(e,!0,o),!1)}u&&o.isText&&d?this.text(this.markString(d,!1,o)+o.text+this.markString(d,!0,o),!1,t):this.render(o,e,i,t)}};e.forEach(o),o(null)}renderList(e,t,r){this.closed&&this.closed.type==e.type?this.flushClose(3):this.inTightList&&this.flushClose(1);const n=this.options.tightLists,o=this.inTightList;this.inTightList=!!n,e.forEach(((o,a,i)=>{i&&n&&this.flushClose(1),this.wrapBlock(t,r(i),e,(()=>this.render(o,e,i)))})),this.inTightList=o}esc(e,t){return e=e.replace(/[`\\~\[\]]/g,"\\$&"),t&&(e=e.replace(/^[#\-*+]/,"\\$&").replace(/^(\d+)\./,"$1\\.")),e}quote(e){const t=-1==e.indexOf('"')?'""':-1==e.indexOf("'")?"''":"()";return t[0]+e+t[1]}repeat(e,t){let r="";for(let n=0;n<t;n++)r+=e;return r}markString(e,t,r){const n=this.marks[e.type.name],o=t?n.open:n.close;return"string"==typeof o?o:o(this,e,r)}getEnclosingWhitespace(e){return{leading:(e.match(/^(\s+)/)||[])[0],trailing:(e.match(/(\s+)$/)||[])[0]}}}const nn=r(29208),on={"text-align:left":"left","text-align:center":"center","text-align:right":"right"},an={left:":---",center:":---:",right:"---:"},sn={blockquote:{block:"blockquote"},paragraph:{block:"paragraph"},list_item:{block:"list_item"},bullet_list:{block:"bullet_list"},ordered_list:{block:"ordered_list",getAttrs:e=>({order:+e.attrGet("order")||1})},heading:{block:"heading",getAttrs:e=>({level:+e.tag.slice(1)})},code_block:{block:"code_block"},fence:{block:"code_block",getAttrs:e=>({params:e.info||""})},hr:{node:"horizontal_rule"},image:{node:"image",getAttrs:e=>({src:e.attrGet("src"),title:e.attrGet("title")||null,alt:e.children[0]&&e.children[0].content||null,width:e.attrGet("width")||null,height:e.attrGet("height")||null})},table:{block:"table"},table_row:{block:"table_row"},table_cell:{block:"table_cell",getAttrs(e){let t="";if(e.attrs)for(let r=0;r<e.attrs.length;r++)"style"===e.attrs[r][0]&&(t=e.attrs[r][1]);return{align:on[t]}}},table_header:{block:"table_header",getAttrs(e){let t="";if(e.attrs)for(let r=0;r<e.attrs.length;r++)"style"===e.attrs[r][0]&&(t=e.attrs[r][1]);return{align:on[t]}}},hardbreak:{node:"hard_break"},em:{mark:"em"},strike:{mark:"strike"},strong:{mark:"strong"},link:{mark:"link",getAttrs:e=>({href:e.attrGet("href"),title:e.attrGet("title")||null})},code_inline:{mark:"code"}},ln={blockquote(e,t){e.wrapBlock("> ",null,t,(()=>e.renderContent(t)))},code_block(e,t){t.attrs.params?(e.write("```"+t.attrs.params+"\n"),e.text(t.textContent,!1),e.ensureNewLine(),e.write("```"),e.closeBlock(t)):e.wrapBlock("    ",null,t,(()=>e.text(t.textContent,!1)))},heading(e,t){/\n/.test(t.textContent)&&t.attrs.level<3?(e.renderInline(t),e.write("\n"),e.write(1===t.attrs.level?"=":"-")):(e.write(e.repeat("#",t.attrs.level)+" "),e.renderInline(t)),e.closeBlock(t)},horizontal_rule(e,t){e.write(t.attrs.markup||"***"),e.closeBlock(t)},bullet_list(e,t){e.renderList(t,"  ",(()=>(t.attrs.bullet||"*")+" "))},ordered_list(e,t){const r=t.attrs.order||1,n=String(r+t.childCount-1).length,o=e.repeat(" ",n+2);e.renderList(t,o,(t=>{const o=String(r+t);return e.repeat(" ",n-o.length)+o+". "}))},list_item(e,t){e.renderContent(t)},paragraph(e,t,r,n){e.renderInline(t),e.closeBlock(t)},image(e,t){let r="";(t.attrs.height||t.attrs.width)&&(r=` =${t.attrs.width||""}x${t.attrs.height||""}`);const n=e.esc(t.attrs.alt||""),o=e.esc(t.attrs.src),a=t.attrs.title?" "+e.quote(t.attrs.title):"";e.write(`![${n}](${o}${a}${r})`)},hard_break(e,t,r,n){if(r&&"number"===typeof n)for(let o=n+1;o<r.childCount;o++)if(r.child(o).type!=t.type)return void e.write("  \n")},text(e,t,r,n,o){"string"===typeof t.text&&e.text(t.text,!0,o)},table(e,t){let r=!0;t.forEach((t=>{const n="table_cell"===t.content.child(0).type.name;if(r&&n){e.write("|");for(let r=0;r<t.childCount;r++){const n=t.content.child(r).attrs.align,o=an[n]||"---";e.write(` ${o} |`)}e.write("\n"),r=!1}ln.table_row(e,t)})),e.closeBlock(t)},table_row(e,t){e.write("|"),e.renderContent(t),e.write("\n")},table_cell(e,t){e.write(" "),e.renderInline(t,(e=>e.replace(/[\|]/g,"\\$&"))),e.write(" |")},table_header(e,t){ln.table_cell(e,t)}},cn={em:{open:"_",close:"_",mixable:!0,expelEnclosingWhitespace:!0},strong:{open:(e,t,r)=>nn(r,"text","").endsWith("*")?t.openedWith="__":"**",close(e,t,r){if(t.openedWith){const e=t.openedWith;return t.openedWith=null,e}return nn(r,"text","").endsWith("*")?"__":"**"},mixable:!0,expelEnclosingWhitespace:!0},link:{open:"[",close:(e,t)=>"]("+e.esc(t.attrs.href)+(t.attrs.title?" "+e.quote(t.attrs.title):"")+")"},strike:{open:"~~",close:"~~",mixable:!0,expelEnclosingWhitespace:!0},code:{open:"`",close:"`",escape:!1}};function dn(e){const t={};return e.nodes.blockquote&&(t.blockquote=sn.blockquote),e.nodes.paragraph&&(t.paragraph=sn.paragraph),e.nodes.list_item&&(t.list_item=sn.list_item),e.nodes.bullet_list&&(t.bullet_list=sn.bullet_list),e.nodes.ordered_list&&(t.ordered_list=sn.ordered_list),e.nodes.heading&&(t.heading=sn.heading),e.nodes.code_block&&(t.code_block=sn.code_block,t.fence=sn.fence),e.nodes.horizontal_rule&&(t.hr=sn.hr),e.nodes.image&&(t.image=sn.image),e.nodes.hard_break&&(t.hardbreak=sn.hardbreak),e.nodes.ordered_list&&(t.ordered_list=sn.ordered_list),e.nodes.bullet_list&&(t.bullet_list=sn.bullet_list),e.nodes.list_item&&(t.list_item=sn.list_item),e.nodes.table&&(t.table=sn.table,t.thead={ignore:!0},t.th=sn.table_header,t.tbody={ignore:!0},t.tr=sn.table_row,t.td=sn.table_cell),e.marks.em&&(t.em=sn.em),e.marks.strong&&(t.strong=sn.strong),e.marks.link&&(t.link=sn.link),e.marks.code&&(t.code_inline=sn.code_inline),e.marks.strike&&(t.strike=sn.strike),t}function un(e){const t={};return e.nodes.blockquote&&(t.blockquote=ln.blockquote),e.nodes.paragraph&&(t.paragraph=ln.paragraph),e.nodes.list_item&&(t.list_item=ln.list_item),e.nodes.bullet_list&&(t.bullet_list=ln.bullet_list),e.nodes.ordered_list&&(t.ordered_list=ln.ordered_list),e.nodes.heading&&(t.heading=ln.heading),e.nodes.code_block&&(t.code_block=ln.code_block),e.nodes.horizontal_rule&&(t.horizontal_rule=ln.horizontal_rule),e.nodes.image&&(t.image=ln.image),e.nodes.hard_break&&(t.hard_break=ln.hard_break),e.nodes.ordered_list&&(t.ordered_list=ln.ordered_list),e.nodes.bullet_list&&(t.bullet_list=ln.bullet_list),e.nodes.list_item&&(t.list_item=ln.list_item),e.nodes.table&&(t.table=ln.table,t.table_header=ln.table_header,t.table_row=ln.table_row,t.table_cell=ln.table_cell),t.text=ln.text,t}function pn(e){return e.marks.em,e.marks.strong,e.marks.link,e.marks.code,cn}function mn(e){return new tn(un(e),pn(e))}function hn(e,t,r){let n;const o=t,a={ok:!1,pos:t};for(n=e.charCodeAt(t);t<r&&n>=48&&n<=57||37===n;)n=e.charCodeAt(++t);return a.ok=!0,a.pos=t,a.value=Number(e.slice(o,t)),a}function fn(e,t,r){let n;const o={ok:!1,pos:0};if(t>=r)return o;if(n=e.charCodeAt(t),61!==n)return o;if(t++,n=e.charCodeAt(t),120!==n&&(n<48||n>57))return o;const a=hn(e,t,r);if(t=a.pos,n=e.charCodeAt(t),120!==n)return o;const i=hn(e,++t,r);return t=i.pos,o.width=a.value,o.height=i.value,o.pos=t,o.ok=!0,o}function gn(e,t,r){const n=e.utils.isSpace,o=e.utils.unescapeAll,a=t.src,i=t.posMax;let s,l;const c=0,d=r,u={ok:!1,pos:0,lines:0,str:""};if(60===a.charCodeAt(r)){for(r++;r<i;){if(s=a.charCodeAt(r),10===s||n(s))return u;if(62===s)return u.pos=r+1,u.str=o(a.slice(d+1,r)),u.ok=!0,u;92===s&&r+1<i?r+=2:r++}return u}for(l=0;r<i;){if(s=a.charCodeAt(r),61==s||34==s||39==s){r--;break}if(s<32||127===s)break;if(92===s&&r+1<i)r+=2;else{if(40===s&&l++,41===s){if(0===l)break;l--}r++}}return d===r||0!==l||(u.str=o(a.slice(d,r)),u.lines=c,u.pos=r,u.ok=!0),u}function bn(e){return function(t,r){let n,o,a,i,s,l,c,d,u,p,m=null,h=null,f="";const g=t.pos,b=t.posMax;if(33!==t.src.charCodeAt(t.pos))return!1;if(91!==t.src.charCodeAt(t.pos+1))return!1;const k=t.pos+2,w=e.helpers.parseLinkLabel(t,t.pos+1,!1);if(w<0)return!1;if(i=w+1,i<b&&40===t.src.charCodeAt(i)){for(i++;i<b&&(o=t.src.charCodeAt(i),32===o||10===o);i++);if(i>=b)return!1;for(p=i,l=gn(e,t,i),l.ok&&(f=l.str,t.md.validateLink(f)?i=l.pos:f=""),p=i;i<b&&(o=t.src.charCodeAt(i),32===o||10===o);i++);if(l=e.helpers.parseLinkTitle(t.src,i,t.posMax),i<b&&p!==i&&l.ok)for(c=l.str,i=l.pos;i<b&&(o=t.src.charCodeAt(i),32===o||10===o);i++);else c="";if(i-1>=0&&(o=t.src.charCodeAt(i-1),32===o&&(l=fn(t.src,i,t.posMax),l.ok)))for(m=l.width,h=l.height,i=l.pos;i<b&&(o=t.src.charCodeAt(i),32===o||10===o);i++);if(i>=b||41!==t.src.charCodeAt(i))return t.pos=g,!1;i++}else{if("undefined"===typeof t.env.references)return!1;for(;i<b&&(o=t.src.charCodeAt(i),32===o||10===o);i++);if(i<b&&91===t.src.charCodeAt(i)?(p=i+1,i=e.helpers.parseLinkLabel(t,i),i>=0?a=t.src.slice(p,i++):i=w+1):i=w+1,a||(a=t.src.slice(k,w)),s=t.env.references[e.utils.normalizeReference(a)],!s)return t.pos=g,!1;f=s.href,c=s.title}if(!r){t.pos=k,t.posMax=w;const e=new t.md.inline.State(t.src.slice(k,w),t.md,t.env,u=[]);e.md.inline.tokenize(e),d=t.push("image","img",0),d.attrs=n=[["src",f],["alt",""]],d.children=u,c&&n.push(["title",c]),null!==m&&n.push(["width",m]),null!==h&&n.push(["height",h])}return t.pos=i,t.posMax=b,!0}}function kn(e){e.inline.ruler.before("emphasis","image",bn(e))}function wn(e){return function(t,r){const n=t.md.utils.normalizeReference,o=t.md.utils.isSpace;let a,i,s,l,c,d,u,p,m="",h=t.pos,f=!0;const g=t.pos,b=t.posMax;if(91!==t.src.charCodeAt(t.pos))return!1;const k=t.pos+1,w=t.md.helpers.parseLinkLabel(t,t.pos,!0);if(w<0)return!1;if(l=w+1,l<b&&40===t.src.charCodeAt(l)){for(f=!1,l++;l<b&&(i=t.src.charCodeAt(l),o(i)||10===i);l++);if(l>=b)return!1;for(h=l,c=gn(e,t,l),c.ok&&(m=c.str,t.md.validateLink(m)?l=c.pos:m=""),h=l;l<b&&(i=t.src.charCodeAt(l),o(i)||10===i);l++);if(c=t.md.helpers.parseLinkTitle(t.src,l,t.posMax),l<b&&h!==l&&c.ok)for(u=c.str,l=c.pos;l<b&&(i=t.src.charCodeAt(l),o(i)||10===i);l++);else u="";(l>=b||41!==t.src.charCodeAt(l))&&(f=!0),l++}if(f){if("undefined"===typeof t.env.references)return!1;if(l<b&&91===t.src.charCodeAt(l)?(h=l+1,l=t.md.helpers.parseLinkLabel(t,l),l>=0?s=t.src.slice(h,l++):l=w+1):l=w+1,s||(s=t.src.slice(k,w)),d=t.env.references[n(s)],!d)return t.pos=g,!1;m=d.href,u=d.title}return r||(t.pos=k,t.posMax=w,p=t.push("link_open","a",1),p.attrs=a=[["href",m]],u&&a.push(["title",u]),t.md.inline.tokenize(t),p=t.push("link_close","a",-1)),t.pos=l,t.posMax=b,!0}}function yn(e){e.inline.ruler.before("emphasis","link",wn(e))}const vn={strike:"s"};function xn(e,t){if(e.isText&&t.isText&&k.Mark.sameSet(e.marks,t.marks))return e.copy(e.text+t.text)}class _n{constructor(e,t){this.schema=e,this.stack=[{type:e.topNodeType,content:[]}],this.marks=k.Mark.none,this.tokenHandlers=t}top(){return this.stack[this.stack.length-1]}push(e){this.stack.length&&this.top().content.push(e)}addText(e){if(!e)return;const t=this.top().content,r=t[t.length-1],n=this.schema.text(e,this.marks);let o;r&&(o=xn(r,n))?t[t.length-1]=o:t.push(n)}openMark(e){this.marks=e.addToSet(this.marks)}closeMark(e){this.marks=e.removeFromSet(this.marks)}parseTokens(e){for(let t=0;t<e.length;t++){const r=e[t],n=this.tokenHandlers[r.type];if(!n)throw new Error("Token type `"+r.type+"` not supported by Markdown parser");n(this,r)}}addNode(e,t,r){const n=e.createAndFill(t,r,this.marks);return n?(this.push(n),n):null}openNode(e,t){this.stack.push({type:e,attrs:t,content:[]})}closeNode(){this.marks.length&&(this.marks=k.Mark.none);const e=this.stack.pop();if(e)return this.addNode(e.type,e.attrs,e.content)}}function En(e,t){return e.getAttrs?e.getAttrs(t):e.attrs instanceof Function?e.attrs(t):e.attrs}function Mn(e){return"code_inline"==e||"code_block"==e||"fence"==e}function Cn(e){return"\n"==e[e.length-1]?e.slice(0,e.length-1):e}function Sn(){}function $n(e,t){const r=Object.create(null);for(const n in t){const o=t[n];if(o.block){const t=e.nodeType(o.block);Mn(n)?r[n]=(e,r)=>{e.openNode(t,En(o,r)),e.addText(Cn(r.content)),e.closeNode()}:(r[n+"_open"]=(e,r)=>e.openNode(t,En(o,r)),r[n+"_close"]=e=>e.closeNode())}else if(o.node){const t=e.nodeType(o.node);r[n]=(e,r)=>e.addNode(t,En(o,r))}else if(o.mark){const t=e.marks[o.mark];Mn(n)?r[n]=(e,r)=>{e.openMark(t.create(En(o,r))),e.addText(Cn(r.content)),e.closeMark(t)}:(r[(vn[n]||n)+"_open"]=(e,r)=>e.openMark(t.create(En(o,r))),r[(vn[n]||n)+"_close"]=e=>e.closeMark(t))}else{if(!o.ignore)throw new RangeError("Unrecognized parsing spec "+JSON.stringify(o));Mn(n)?r[n]=Sn:(r[n+"_open"]=Sn,r[n+"_close"]=Sn)}}return r.text=(e,t)=>e.addText(t.content),r.inline=(e,t)=>e.parseTokens(t.children),r.softbreak=e=>e.addText("\n"),r}class An{constructor(e,t,r){this.tokens=r,this.schema=e,this.tokenizer=t,this.tokenHandlers=$n(e,r)}parse(e){const t=new _n(this.schema,this.tokenHandlers);let r;t.parseTokens(this.tokenizer.parse(e,{}));do{r=t.closeNode()}while(t.stack.length);return r}}const zn=r(9980);function In(e){const t=zn({html:!1});return t.use(kn),t.use(yn),new An(e,t,dn(e))}class Tn extends en{constructor(e){super(),this.parser=null,this.serializer=null,this.schema=e}static fromSchema(e){return Tn.commonMarkFromSchema(e)}static commonMarkFromSchema(e){const t=new Tn(e);return t.parser=In(e),t.serializer=mn(e),t}nodeFromString(e){return this.parser.parse(e)}stringFromNode(e){return this.serializer.serialize(e,{tightLists:!0})}}class Pn extends k.DOMSerializer{static nodesFromSchema(e){const t=Ln(e.nodes);return t.text||(t.text=e=>e.text),t}static marksFromSchema(e){return Ln(e.marks)}}function Ln(e){const t={};for(const r in e){const n=e[r].spec.toDocument,o=e[r].spec.toDOM;n?t[r]=n:o&&(t[r]=o)}return t}class Nn extends en{constructor(e){super(),this.schema=e,this.parser=k.DOMParser.fromSchema(e),this.serializer=Pn.fromSchema(e)}static fromSchema(e){return new Nn(e)}nodeFromString(e){let t;try{t=window.document.createRange().createContextualFragment(e)}catch(r){t=(new DOMParser).parseFromString(e,"text/html")}return this.parser.parse(t)}stringFromNode(e){const t=document.createElement("div");return t.appendChild(this.serializer.serializeFragment(e.content)),t.innerHTML}}const On=(e,t="markdown")=>"html"===t?Nn.fromSchema(e):Tn.fromSchema(e),Dn=new l.PluginKey("common"),Fn=new l.Plugin({key:Dn,state:{init:()=>({editorFocused:!1}),apply:(e,t)=>!1===e.getMeta("editor_focused")?{editorFocused:!1}:e.getMeta("editor_focused")?{editorFocused:!0}:t},props:{handleScrollToSelection:()=>!0,handleDOMEvents:{focus(e){const{state:t,dispatch:r}=e;return r(t.tr.setMeta("editor_focused",!0)),!1},blur(e){const{state:t,dispatch:r}=e;return r(t.tr.setMeta("editor_focused",!1)),!1}}}});function Bn(e){return t=>t.__type===e}function Wn(e,t){return t.filter(Bn(e))}function Rn(e,t){const r=Vn(e,e.schema.nodes.blockquote);if(!r)return!1;const n=_.liftTarget(r);return!!n&&(t&&t(e.tr.lift(r,n)),!0)}const Vn=(e,t)=>{const{$from:r,$to:n}=e.selection;return r.blockRange(n,(e=>e.type==t))};function Hn(e,t){const r=e.schema.nodes.horizontal_rule;return t&&t(e.tr.replaceSelectionWith(r.create()).scrollIntoView()),!0}const qn=e=>{const t=e.nodes.hard_break;return i.chainCommands(i.exitCode,((e,r)=>(r(e.tr.replaceSelectionWith(t.create()).scrollIntoView()),!0)))},Un=e=>t=>ie(t.nodes.heading,{level:e},t.nodes.paragraph,null),jn=[{__type:"wysiwyg:keymap",name:"Mod-z",command:()=>c.undo},{__type:"wysiwyg:keymap",name:"Backspace",command:()=>x.undoInputRule},{__type:"wysiwyg:keymap",name:"Mod-Shift-z",command:()=>c.redo},{__type:"wysiwyg:keymap",name:"Mod-y",command:()=>c.redo,unlessMac:!0},{__type:"wysiwyg:keymap",name:"Tab",command:()=>Gn},{__type:"wysiwyg:keymap",name:"Shift-Tab",command:()=>Xn},{__type:"wysiwyg:keymap",name:"Mod-b",ifMark:"strong",command:e=>i.toggleMark(e.marks.strong)},{__type:"wysiwyg:keymap",name:"Mod-i",ifMark:"em",command:e=>i.toggleMark(e.marks.em)},{__type:"wysiwyg:keymap",name:"Mod-k",ifMark:"link",command:()=>function(e,t){return nr(e,t)}},{__type:"wysiwyg:keymap",name:"Mod-Enter",command:qn,ifNode:"hard_break"},{__type:"wysiwyg:keymap",name:"Shift-Enter",command:qn,ifNode:"hard_break"},{__type:"wysiwyg:keymap",name:"Ctrl-Enter",command:qn,ifNode:"hard_break",ifMac:!0},{__type:"wysiwyg:keymap",name:"Mod-Alt-1",command:Un(1),ifNode:"heading"},{__type:"wysiwyg:keymap",name:"Mod-Alt-2",command:Un(2),ifNode:"heading"},{__type:"wysiwyg:keymap",name:"Mod-Alt-3",command:Un(3),ifNode:"heading"},{__type:"wysiwyg:keymap",name:"Mod-Alt-4",command:Un(4),ifNode:"heading"},{__type:"wysiwyg:keymap",name:"Mod-Alt-5",command:Un(5),ifNode:"heading"},{__type:"wysiwyg:keymap",name:"Mod-Alt-6",command:Un(6),ifNode:"heading"},{__type:"wysiwyg:keymap",name:"Backspace",command:()=>ae,ifNode:"heading"},{__type:"wysiwyg:keymap",name:"Mod-Alt-7",command:()=>et,ifNode:"ordered_list"},{__type:"wysiwyg:keymap",name:"Mod-Alt-8",command:()=>Je,ifNode:"bullet_list"},{__type:"wysiwyg:keymap",name:"Mod-Alt-9",command:e=>m.liftListItem(e.nodes.list_item),onCondition:e=>!(!e.nodes.bullet_list&&!e.nodes.ordered_list)},{__type:"wysiwyg:keymap",name:"Mod-Alt-0",command:e=>i.setBlockType(e.nodes.code_block),ifNode:"code_block"},{__type:"wysiwyg:keymap",name:"ArrowLeft",command:()=>Kn("left"),ifNodes:["code_block","table"]},{__type:"wysiwyg:keymap",name:"ArrowRight",command:()=>Kn("right"),ifNodes:["code_block","table"]},{__type:"wysiwyg:keymap",name:"ArrowUp",command:()=>Kn("up"),ifNodes:["code_block","table"]},{__type:"wysiwyg:keymap",name:"ArrowDown",command:()=>Kn("down"),ifNodes:["code_block","table"]},{__type:"wysiwyg:keymap",name:"Mod-0",ifMark:"code",command:e=>i.toggleMark(e.marks.code)},{__type:"wysiwyg:keymap",name:"Mod->",ifNode:"blockquote",command:e=>i.wrapIn(e.nodes.blockquote)},{__type:"wysiwyg:keymap",name:"Mod-<",ifNode:"blockquote",command:()=>Rn},{__type:"wysiwyg:keymap",name:"Mod-Alt-9",ifNode:"paragraph",command:e=>i.setBlockType(e.nodes.paragraph)},{__type:"wysiwyg:keymap",name:"Shift-Ctrl-0",ifNode:"paragraph",command:e=>i.setBlockType(e.nodes.paragraph)},{__type:"wysiwyg:keymap",name:"Mod-Enter",ifNode:"horizontal_rule",command:()=>Hn},{__type:"wysiwyg:keymap",name:"Enter",ifNode:"list_item",command:e=>m.splitListItem(e.nodes.list_item)},{__type:"wysiwyg:keymap",name:"Tab",ifNode:"list_item",command:e=>m.sinkListItem(e.nodes.list_item)},{__type:"wysiwyg:keymap",name:"Shift-Tab",ifNode:"list_item",command:e=>m.liftListItem(e.nodes.list_item)}];function Kn(e){return(t,r,n)=>{if(n.endOfTextblock(e)){const n="left"==e||"up"==e?-1:1,o=t.selection.$head,a=l.Selection.near(t.doc.resolve(n>0?o.after():o.before()),n);if(a.$head){const{name:e}=a.$head.parent.type;if("code_block"==e||"table_header"===e||"table_cell"===e)return r(t.tr.setSelection(a)),!0}}return!1}}const Gn=Zn(1),Xn=Zn(-1);function Zn(e){return(t,r)=>{const{table:n}=t.schema.nodes;return!!h.findParentNodeOfType(n)(t.selection)&&(I.goToNextCell(1*e)(t,r),!0)}}const Qn="undefined"!=typeof navigator&&/Mac/.test(navigator.platform);function Yn(e){const t=d({},i.baseKeymap);function r(e,r){t[e]&&(r=i.chainCommands(r,t[e])),t[e]=r}return r("Enter",i.chainCommands(i.createParagraphNear,i.liftEmptyBlock,i.splitBlock)),Wn("wysiwyg:keymap",jn).forEach((t=>{let n=!1;t.unlessMac&&Qn&&(n=!0),t.ifMark&&!e.marks[t.ifMark]&&(n=!0),t.ifNode&&!e.nodes[t.ifNode]&&(n=!0),t.ifNodes&&!t.ifNodes.some((t=>e.nodes[t]))&&(n=!0),t.onCondition&&!t.onCondition(e)&&(n=!0),n||r(t.name,t.command(e))})),t}function Jn(e,t){return function(r,n,o,a,i){const s=t instanceof Function?t(o):t,l=r.tr,c=o[1].length,d=2;if(o[d]){const e=a+1+c,t=e+o[d].length,n=[e-1,e],s=[t,t+(eo(r,t)?0:1)];l.delete(...s),l.delete(...n),i=a+o[d].length+c}return l.addMark(a+c,i,e.create(s)),l.removeStoredMark(e),n&&n(l),l}}function eo(e,t){try{return e.doc.textBetween(t+1,t+2)}catch(r){return""}}const to="\\*",ro=e=>new RegExp(`${e}${e}([^\r\n\t\f${e}} ](.*[^\r\n\t\f${e} ])?)${e}${e}`),no=e=>new RegExp(`(^|[^${e}])${e}([^\r\n\t\f${e} ](.*[^\r\n\t\f${e} ])?)${e}`),oo=ro(to),ao=no(to),io=ro("~"),so=no("_"),lo=no("`");function co(e){const t=[];let r,n;return(r=e.nodes.blockquote)&&t.push(wo(r)),(r=e.nodes.ordered_list)&&t.push(yo(r)),(r=e.nodes.bullet_list)&&t.push(xo(r)),(r=e.nodes.code_block)&&t.push(_o(r)),(r=e.nodes.heading)&&t.push(Eo(r,6)),(r=e.nodes.horizontal_rule)&&t.push(vo(r)),(n=e.marks.strong)&&(t.push(mo(n)),t.push(fo(n))),(n=e.marks.strike)&&t.push(ho(n)),(n=e.marks.em)&&(t.push(go(n)),t.push(bo(n))),(n=e.marks.code)&&t.push(ko(n)),t}function uo(e,t,r){return new x.InputRule(e,((e,n,o,a)=>{const i=r instanceof Function?r(n):r,s=e.tr;if(n[1]){const e=o+n[0].indexOf(n[1]),t=e+n[1].length;t<a&&s.delete(t,a),e>o&&s.delete(o,e),a=o+n[1].length}return s.addMark(o,a,t.create(i)),s.removeStoredMark(t),s}))}function po(e,t,r){const n=Jn(t,r);return new x.InputRule(e,((e,t,r,o)=>n(e,null,t,r,o)))}function mo(e){return uo(oo,e,{})}function ho(e){return uo(io,e,{})}function fo(e){return uo(ro("_"),e,{})}function go(e){return po(ao,e,{})}function bo(e){return po(so,e,{})}function ko(e){return po(lo,e,{})}function wo(e){return x.wrappingInputRule(/^\s*>\s$/,e)}function yo(e){return x.wrappingInputRule(/^(\d+)\.\s$/,e,(e=>({order:+e[1]})),((e,t)=>t.childCount+t.attrs.order==+e[1]))}function vo(e){return new x.InputRule(/^(---|___|\*\*\*)$/,((t,r,n,o)=>t.tr.replaceRangeWith(n,o,e.create())))}function xo(e){return x.wrappingInputRule(/^\s*([-+*])\s$/,e)}function _o(e){return x.textblockTypeInputRule(/^```([a-zA-Z]*)? $/,e,(e=>{const t=e[1];return t?{params:t}:{}}))}function Eo(e,t){return x.textblockTypeInputRule(new RegExp("^(#{1,"+t+"})\\s$"),e,(e=>({level:e[1].length})))}function Mo(e){return x.inputRules({rules:co(e)})}function Co(e,t,r,n){const o=[Fn,Ke,Mo(e),v.keymap(Yn(e)),c.history(),Yt(),w.dropCursor({width:2,color:"rgb(0, 132, 255)"}),y.gapCursor(),g.tableEditing(),wt,Fe];return n&&o.push(Tt(n)),l.EditorState.create({schema:e,doc:t.nodeFromString(r),plugins:o})}const So=(e,t,r,n,o)=>{const a=Jr(),i=On(a,o);if(!t)return{};const s=new f.EditorView(t,{state:Co(a,i,e.value,n),dispatchTransaction(t){const n=s.state.apply(t);s.updateState(n),r({view:s}),t.docChanged&&!t.getMeta("input-update")&&e.onChange(i.stringFromNode(t.doc))}}),{state:c,dispatch:d}=s,{tr:u,doc:p}=c;return d(u.setSelection(new l.TextSelection(p.resolve(p.content.size)||0))),s.focus(),r({view:s}),{translator:i}};function $o(e,t,r){const n=t.nodeFromString(r);if(!n)return;const{state:o,dispatch:a}=e,{tr:i}=o;a(i.setSelection(new l.TextSelection(i.doc.resolve(0),i.doc.resolve(o.doc.nodeSize-2))).replaceSelectionWith(n).setMeta("input-update",!0))}const Ao=(e,t)=>{const{state:r,dispatch:n}=e,{selection:o}=r,{table:a,table_cell:i,table_header:s}=r.schema.nodes,l=h.findParentNodeOfType(i)(r.selection),c=h.findParentNodeOfType(s)(r.selection),d=l||c;if(!d)return;const u=d.node.attrs.align===t?void 0:t,p=h.findParentNodeOfType(a)(r.selection);if(!p)return;const m=g.TableMap.get(p.node),f=Object.entries(m.map).find((e=>e[1]>o.head-p.start));if(!f)return;const b=(parseInt(f[0])-1)%m.width;n(h.forEachCellInColumn(b,((e,t)=>h.setCellAttrs(e,{align:u})(t)))(r.tr)),e.focus()};var zo=()=>{const{editorView:e}=q();if(!e)return null;const{state:t,dispatch:r}=e.view;if(document.getElementsByClassName("tina_table_header_ext_top_left_selected")[0])return null;const n=document.getElementsByClassName("tina_table_header_ext_top_selected")[0],a=document.getElementsByClassName("tina_table_header_ext_left");let i;for(let o=1;o<a.length;o++)a[o].classList.contains("tina_table_header_ext_left_selected")&&(i=a[o]);if(!n&&!i)return null;const{view:s}=e;return C.createElement(C.Fragment,null,n&&z.createPortal(C.createElement(Io,null,C.createElement(o.IconButton,{onClick:()=>Ao(s,"left"),size:"small",variant:"primary"},C.createElement(o.AlignLeft,{className:"w-5/6 h-auto"})),C.createElement(o.IconButton,{onClick:()=>Ao(s,"center"),size:"small",variant:"primary"},C.createElement(o.AlignCenter,{className:"w-5/6 h-auto"})),C.createElement(o.IconButton,{onClick:()=>Ao(s,"right"),size:"small",variant:"primary"},C.createElement(o.AlignRight,{className:"w-5/6 h-auto"})),C.createElement(o.IconButton,{onClick:()=>{g.deleteColumn(t,r),s.focus()},size:"small",variant:"primary"},C.createElement(o.TrashIcon,{className:"w-5/6 h-auto"}))),n),i&&z.createPortal(C.createElement(To,null,C.createElement(o.IconButton,{onClick:()=>{g.deleteRow(t,r),s.focus()},size:"small",variant:"primary"},C.createElement(o.TrashIcon,{className:"w-5/6 h-auto"}))),i))};const Io=$.default.span`
  display: flex;
  left: 50%;
  position: absolute;
  top: -8px;
  transform: translate3d(-50%, -100%, 0);
  button:not(:first-of-type) {
    margin-left: 10px;
  }
`,To=$.default.span`
  position: absolute;
  top: 50%;
  left: -8px;
  transform: translate3d(-100%, -50%, 0);
`,Po=1,Lo=12;var No=({index:e,marker:r,tableHeight:n,view:a})=>{const{state:i,dispatch:s}=a,l=e=>{s(h.addColumnAt(e)(i.tr)),a.focus()},[c,d]=t.useState(!1);return t.useEffect((()=>{r.style.zIndex=c?"1000":"1"}),[c]),z.createPortal(S.default.createElement(S.default.Fragment,null,S.default.createElement(Oo,{onMouseEnter:()=>d(!0),onMouseLeave:()=>d(!1)},c?S.default.createElement(Fo,null,S.default.createElement(o.IconButton,{onClick:()=>{l(e),d(!1)},size:"small",variant:"primary"},S.default.createElement(o.AddIcon,null))):S.default.createElement(Do,null)),c&&S.default.createElement(Bo,{height:n})),r)};const Oo=$.default.div`
  top: -7px;
  position: absolute;
  right: 0;
  padding: 8px;
  transform: translate3d(50%, -100%, 0);
  user-select: none;
`,Do=$.default.div`
  background: #e1ddec;
  border-radius: 50%;
  height: 4px;
  width: 4px;
`,Fo=$.default.span`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
`,Bo=$.default.div`
  position: absolute;
  background: #0574e4;
  top: ${-1*Po}px;
  z-index: 1000;
  right: ${-1*Po}px;
  width: ${2*Po}px;
  height: ${({height:e})=>e+Lo-Po+"px"};
`,Wo=1,Ro=12;var Vo=({index:e,marker:r,tableWidth:n,view:a})=>{const{state:i,dispatch:s}=a,l=e=>{if(e>1)s(h.addRowAt(e,!0)(i.tr));else{const{table:e,table_cell:t,table_row:r}=i.schema.nodes,n=h.findParentNodeOfType(e)(i.selection);if(!n)return;const o=g.TableMap.get(n.node),a=n.start+o.map[o.width]-1,l=h.getCellsInRow(0)(i.selection);if(!l)return;const c=null==l?void 0:l.map((e=>t.createAndFill(d({},e.node.attrs))));s(i.tr.insert(a,r.create(null,c)))}a.focus()},[c,u]=t.useState(!1);return t.useEffect((()=>{r.style.zIndex=c?"1000":"1"}),[c]),z.createPortal(S.default.createElement(S.default.Fragment,null,S.default.createElement(Ho,{onMouseEnter:()=>u(!0),onMouseLeave:()=>u(!1)},c&&e>0?S.default.createElement(Uo,null,S.default.createElement(o.IconButton,{onClick:()=>l(e),size:"small",variant:"primary"},S.default.createElement(o.AddIcon,{className:"w-5/6 h-auto"}))):S.default.createElement(qo,null)),c&&S.default.createElement(jo,{width:n})),r)};const Ho=$.default.div`
  left: -7px;
  position: absolute;
  bottom: 0;
  padding: 8px;
  transform: translate3d(-100%, 50%, 0);
  user-select: none;
`,qo=$.default.div`
  background: #e1ddec;
  border-radius: 50%;
  height: 4px;
  width: 4px;
`,Uo=$.default.span`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate3d(-50%, -50%, 0);
`,jo=$.default.div`
  position: absolute;
  background: #0574e4;
  left: ${-1*Wo}px;
  z-index: var(--tina-z-index-1);
  bottom: ${-1*Wo}px;
  height: ${2*Wo}px;
  width: ${({width:e})=>e+Ro-Wo+"px"};
`;var Ko=()=>{const{editorView:e}=q();if(!e)return null;const t=document.getElementsByClassName("tina_table_header_ext_top_left");if(!t.length)return null;const r=t[0].closest("table");if(!r)return null;const{height:n,width:o}=r.getBoundingClientRect(),a=document.getElementsByClassName("tina_table_header_ext_top"),i=[t[0]];for(let d=0;d<a.length;d++)i.push(a[d]);const s=document.getElementsByClassName("tina_table_header_ext_left"),l=[t[0]];for(let d=0;d<s.length;d++)l.push(s[d]);const{view:c}=e;return S.default.createElement(S.default.Fragment,null,i.map(((e,t)=>S.default.createElement(No,{key:`add-column-menu-${t}`,index:t,marker:e,tableHeight:n,view:c}))),l.map(((e,t)=>S.default.createElement(Vo,{key:`add-row-menu-${t}`,index:t,marker:e,tableWidth:o,view:c}))))},Go=()=>{const{editorView:e}=q();if(!e)return null;const{view:t}=e,r=()=>{const{state:e,dispatch:r}=t;g.deleteTable(e,r),t.focus()},n=document.getElementsByClassName("tina_table_header_ext_top_left_selected");if(!n.length)return null;const a=n[0].closest("table");if(!a)return null;const{height:i,width:s}=a.getBoundingClientRect();return A.default.createPortal(S.default.createElement(Xo,{height:i,width:s},S.default.createElement(o.IconButton,{onClick:r,size:"small",variant:"primary"},S.default.createElement(o.TrashIcon,null))),n[0])};const Xo=$.default.div`
  background-color: #ffffff;
  border-radius: 2px;
  cursor: default;
  padding: 0px 4px;
  position: absolute;
  top: ${({height:e})=>`${e+24}px`};
  left: ${({width:e})=>e/2-8+"px"};
`,Zo=()=>C.createElement(C.Fragment,null,C.createElement(zo,null),C.createElement(Ko,null),C.createElement(Go,null)),Qo=e=>{var t=e,{plugins:r,imageProps:n}=t,o=p(t,["plugins","imageProps"]);const{editorView:a}=q();return a?S.default.createElement(_r,u(d({},o),{menus:[S.default.createElement(de,{key:"BlockMenu"}),S.default.createElement(Ge,{key:"InlineMenu"}),S.default.createElement(or,{key:"LinkMenu"}),S.default.createElement(Pt,{key:"ImageMenu",imageProps:n}),S.default.createElement(_t,{key:"TableMenu"}),S.default.createElement(lt,{key:"QuoteMenu"}),S.default.createElement(Se,{key:"CodeBlockMenu"}),S.default.createElement(tt,{key:"ListMenu"}),S.default.createElement(Be,{key:"HistoryMenu"})],popups:[S.default.createElement(Zo,{key:"TablePopups"}),S.default.createElement(Nt,{key:"ImageEditPopup"}),S.default.createElement(fr,{key:"LinkFormPopup"}),S.default.createElement(jt,{key:"ImageLoader"})],plugins:r})):null},Yo=a.css`
  white-space: pre-wrap;

  .CodeMirror {
    font-family: monospace;
    height: auto;
    width: 100%;
    border-radius: 5px;
    margin-bottom: 16px;
    color: black;
    direction: ltr;
  }

  .CodeMirror-lines {
    padding: 4px 0; /* Vertical padding around content */
  }
  .CodeMirror pre.CodeMirror-line,
  .CodeMirror pre.CodeMirror-line-like {
    padding: 0 4px; /* Horizontal padding of content */
  }

  .CodeMirror-scrollbar-filler,
  .CodeMirror-gutter-filler {
    background-color: white; /* The little square between H and V scrollbars */
  }

  /* GUTTER */

  .CodeMirror-gutters {
    border-right: 1px solid #ddd;
    background-color: #f7f7f7;
    white-space: nowrap;
  }
  .CodeMirror-linenumbers {
  }
  .CodeMirror-linenumber {
    padding: 0 3px 0 5px;
    min-width: 20px;
    text-align: right;
    color: #999;
    white-space: nowrap;
  }

  .CodeMirror-guttermarker {
    color: black;
  }
  .CodeMirror-guttermarker-subtle {
    color: #999;
  }

  /* CURSOR */

  .CodeMirror-cursor {
    border-left: 1px solid black;
    border-right: none;
    width: 0;
  }
  /* Shown when moving in bi-directional text */
  .CodeMirror div.CodeMirror-secondarycursor {
    border-left: 1px solid silver;
  }
  .cm-fat-cursor .CodeMirror-cursor {
    width: auto;
    border: 0 !important;
    background: #7e7;
  }
  .cm-fat-cursor div.CodeMirror-cursors {
    z-index: 1;
  }
  .cm-fat-cursor-mark {
    background-color: rgba(20, 255, 20, 0.5);
    -webkit-animation: blink 1.06s steps(1) infinite;
    -moz-animation: blink 1.06s steps(1) infinite;
    animation: blink 1.06s steps(1) infinite;
  }
  .cm-animate-fat-cursor {
    width: auto;
    border: 0;
    -webkit-animation: blink 1.06s steps(1) infinite;
    -moz-animation: blink 1.06s steps(1) infinite;
    animation: blink 1.06s steps(1) infinite;
    background-color: #7e7;
  }
  @-moz-keyframes blink {
    0% {
    }
    50% {
      background-color: transparent;
    }
    100% {
    }
  }
  @-webkit-keyframes blink {
    0% {
    }
    50% {
      background-color: transparent;
    }
    100% {
    }
  }
  @keyframes blink {
    0% {
    }
    50% {
      background-color: transparent;
    }
    100% {
    }
  }

  /* Can style cursor different in overwrite (non-insert) mode */
  .CodeMirror-overwrite .CodeMirror-cursor {
  }

  .cm-tab {
    display: inline-block;
    text-decoration: inherit;
  }

  .CodeMirror-rulers {
    position: absolute;
    left: 0;
    right: 0;
    top: -50px;
    bottom: 0;
    overflow: hidden;
  }
  .CodeMirror-ruler {
    border-left: 1px solid #ccc;
    top: 0;
    bottom: 0;
    position: absolute;
  }

  /* DEFAULT THEME */

  .cm-s-default .cm-header {
    color: blue;
  }
  .cm-s-default .cm-quote {
    color: #090;
  }
  .cm-negative {
    color: #d44;
  }
  .cm-positive {
    color: #292;
  }
  .cm-header,
  .cm-strong {
    font-weight: bold;
  }
  .cm-em {
    font-style: italic;
  }
  .cm-link {
    text-decoration: underline;
  }
  .cm-strikethrough {
    text-decoration: line-through;
  }

  .cm-s-default .cm-keyword {
    color: #708;
  }
  .cm-s-default .cm-atom {
    color: #219;
  }
  .cm-s-default .cm-number {
    color: #164;
  }
  .cm-s-default .cm-def {
    color: #00f;
  }
  .cm-s-default .cm-variable,
  .cm-s-default .cm-punctuation,
  .cm-s-default .cm-property,
  .cm-s-default .cm-operator {
  }
  .cm-s-default .cm-variable-2 {
    color: #05a;
  }
  .cm-s-default .cm-variable-3,
  .cm-s-default .cm-type {
    color: #085;
  }
  .cm-s-default .cm-comment {
    color: #a50;
  }
  .cm-s-default .cm-string {
    color: #a11;
  }
  .cm-s-default .cm-string-2 {
    color: #f50;
  }
  .cm-s-default .cm-meta {
    color: #555;
  }
  .cm-s-default .cm-qualifier {
    color: #555;
  }
  .cm-s-default .cm-builtin {
    color: #30a;
  }
  .cm-s-default .cm-bracket {
    color: #997;
  }
  .cm-s-default .cm-tag {
    color: #170;
  }
  .cm-s-default .cm-attribute {
    color: #00c;
  }
  .cm-s-default .cm-hr {
    color: #999;
  }
  .cm-s-default .cm-link {
    color: #00c;
  }

  .cm-s-default .cm-error {
    color: #f00;
  }
  .cm-invalidchar {
    color: #f00;
  }

  .CodeMirror-composing {
    border-bottom: 2px solid;
  }

  /* Default styles for common addons */

  div.CodeMirror span.CodeMirror-matchingbracket {
    color: #0b0;
  }
  div.CodeMirror span.CodeMirror-nonmatchingbracket {
    color: #a22;
  }
  .CodeMirror-matchingtag {
    background: rgba(255, 150, 0, 0.3);
  }
  .CodeMirror-activeline-background {
    background: #e8f2ff;
  }

  /* STOP */

  /* The rest of this file contains styles related to the mechanics of
    the editor. You probably shouldn't touch them. */

  .CodeMirror {
    position: relative;
    overflow: hidden;
    background: white;
  }

  .CodeMirror-scroll {
    overflow: scroll !important; /* Things will break if this is overridden */
    /* 30px is the magic margin used to hide the element's real scrollbars */
    /* See overflow: hidden in .CodeMirror */
    margin-bottom: -30px;
    margin-right: -30px;
    padding-bottom: 30px;
    height: 100%;
    outline: none; /* Prevent dragging from highlighting the element */
    position: relative;
  }
  .CodeMirror-sizer {
    position: relative;
    min-height: auto;
    border-right: 30px solid transparent;
  }

  /* The fake, visible scrollbars. Used to force redraw during scrolling
    before actual scrolling happens, thus preventing shaking and
    flickering artifacts. */
  .CodeMirror-vscrollbar,
  .CodeMirror-hscrollbar,
  .CodeMirror-scrollbar-filler,
  .CodeMirror-gutter-filler {
    position: absolute;
    z-index: 6;
    display: none;
  }
  .CodeMirror-vscrollbar {
    right: 0;
    top: 0;
    overflow-x: hidden;
    overflow-y: scroll;
  }
  .CodeMirror-hscrollbar {
    bottom: 0;
    left: 0;
    overflow-y: hidden;
    overflow-x: scroll;
  }
  .CodeMirror-scrollbar-filler {
    right: 0;
    bottom: 0;
  }
  .CodeMirror-gutter-filler {
    left: 0;
    bottom: 0;
  }

  .CodeMirror-gutters {
    position: absolute;
    left: 0;
    top: 0;
    min-height: 100%;
    z-index: 3;
  }
  .CodeMirror-gutter {
    white-space: normal;
    height: 100%;
    display: inline-block;
    vertical-align: top;
    margin-bottom: -30px;
  }
  .CodeMirror-gutter-wrapper {
    position: absolute;
    z-index: 4;
    background: none !important;
    border: none !important;
  }
  .CodeMirror-gutter-background {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 4;
  }
  .CodeMirror-gutter-elt {
    position: absolute;
    cursor: default;
    z-index: 4;
  }
  .CodeMirror-gutter-wrapper ::selection {
    background-color: transparent;
  }
  .CodeMirror-gutter-wrapper ::-moz-selection {
    background-color: transparent;
  }

  .CodeMirror-lines {
    cursor: text;
    min-height: 1px; /* prevents collapsing before first draw */
  }
  .CodeMirror pre.CodeMirror-line,
  .CodeMirror pre.CodeMirror-line-like {
    /* Reset some styles that the rest of the page might have set */
    -moz-border-radius: 0;
    -webkit-border-radius: 0;
    border-radius: 0;
    border-width: 0;
    background: transparent;
    font-family: inherit;
    font-size: inherit;
    margin: 0;
    white-space: pre;
    word-wrap: normal;
    line-height: inherit;
    z-index: 2;
    position: relative;
    overflow: visible;
    -webkit-tap-highlight-color: transparent;
    -webkit-font-variant-ligatures: contextual;
    font-variant-ligatures: contextual;
  }
  .CodeMirror-wrap pre.CodeMirror-line,
  .CodeMirror-wrap pre.CodeMirror-line-like {
    word-wrap: break-word;
    white-space: pre-wrap;
    word-break: normal;
  }

  .CodeMirror-linebackground {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 0;
  }

  .CodeMirror-linewidget {
    position: relative;
    z-index: 2;
    padding: 0.1px; /* Force widget margins to stay inside of the container */
  }

  .CodeMirror-widget {
  }

  .CodeMirror-rtl pre {
    direction: rtl;
  }

  .CodeMirror-code {
    outline: none;
  }

  /* Force content-box sizing for the elements where we expect it */
  .CodeMirror-scroll,
  .CodeMirror-sizer,
  .CodeMirror-gutter,
  .CodeMirror-gutters,
  .CodeMirror-linenumber {
    -moz-box-sizing: content-box;
    box-sizing: content-box;
  }

  .CodeMirror-measure {
    position: absolute;
    width: 100%;
    height: 0;
    overflow: hidden;
    visibility: hidden;
  }

  .CodeMirror-cursor {
    position: absolute;
    pointer-events: none;
  }
  .CodeMirror-measure pre {
    position: static;
  }

  div.CodeMirror-cursors {
    visibility: hidden;
    position: relative;
    z-index: 3;
  }
  div.CodeMirror-dragcursors {
    visibility: visible;
  }

  .CodeMirror-focused div.CodeMirror-cursors {
    visibility: visible;
  }

  .CodeMirror-selected {
    background: #d9d9d9;
  }
  .CodeMirror-focused .CodeMirror-selected {
    background: #d7d4f0;
  }
  .CodeMirror-crosshair {
    cursor: crosshair;
  }
  .CodeMirror-line::selection,
  .CodeMirror-line > span::selection,
  .CodeMirror-line > span > span::selection {
    background: #d7d4f0;
  }
  .CodeMirror-line::-moz-selection,
  .CodeMirror-line > span::-moz-selection,
  .CodeMirror-line > span > span::-moz-selection {
    background: #d7d4f0;
  }

  .cm-searching {
    background-color: #ffa;
    background-color: rgba(255, 255, 0, 0.4);
  }

  /* Used to force a border model for a node */
  .cm-force-border {
    padding-right: 0.1px;
  }

  @media print {
    /* Hide the cursor when printing */
    .CodeMirror div.CodeMirror-cursors {
      visibility: hidden;
    }
  }

  /* See issue #2901 */
  .cm-tab-wrap-hack:after {
    content: '';
  }

  /* Help users use markselection to safely style text background */
  span.CodeMirror-selectedtext {
    background: none;
  }
`,Jo=8,ea=6,ta=1,ra=12,na=`\n  .ProseMirror {\n    display: block\n  }\n  .ProseMirror .tableWrapper {\n    overflow-x: auto;\n  }\n  .ProseMirror .column-resize-handle {\n    position: absolute;\n    right: -2px;\n    top: 0;\n    bottom: 0;\n    width: 4px;\n    z-index: 20;\n    background-color: #adf;\n    pointer-events: none;\n  }\n  .ProseMirror.resize-cursor {\n    cursor: ew-resize;\n    cursor: col-resize;\n  }\n  /* Give selected cells a blue overlay */\n  .ProseMirror .selectedCell:after {\n    z-index: 2;\n    position: absolute;\n    content: '';\n    left: 0;\n    right: 0;\n    top: 0;\n    bottom: 0;\n    background: rgba(0, 132, 255, 0.25);\n    /* This provides a bullet-proof border for selected cells even with border collapsing */\n    box-shadow: 0 0 0 1px #0574E4;\n    pointer-events: none;\n  }\n  .ProseMirror:focus {\n    outline: 0px solid transparent;\n  }\n  .ProseMirror p {\n    min-height: 18px;\n  }\n  .ProseMirror table {\n    border-collapse: collapse;\n    table-layout: fixed;\n    display: inline-table;\n    margin: 32px 0 32px 0;\n    overflow: visible;\n    width: 100%;\n  }\n  .ProseMirror th {\n    background-color: #F6F6F9;\n  }\n  .ProseMirror tr {\n    height: 40px;\n  }\n  .ProseMirror table td,\n  .ProseMirror table th {\n    border: 1px solid #E1DDEC;\n    padding: ${ea}px ${Jo}px;\n    position: relative;\n    vertical-align: top;\n    box-sizing: border-box;\n  }\n  .ProseMirror .tina_table_header_ext_top {\n    background: #F6F6F9;\n    border: 1px solid #E1DDEC;\n    position: absolute;\n    height: ${ra}px;\n    width: calc(100% + ${2*ta}px);\n    transform: translate(${-1*(ta+Jo)}px, ${-1*(ra+ea)}px);\n    cursor: pointer;\n    z-index: 1;\n    user-select: none;\n    box-sizing: border-box;\n  }\n  .ProseMirror div.tina_table_header_ext_top_selected {\n    background: #0084ff;\n    border-color: #0574E4;\n    z-index: 10;\n  }\n  .ProseMirror .tina_table_header_ext_left {\n    background: #F6F6F9;\n    border: 1px solid #E1DDEC;\n    position: absolute;\n    height: calc(100% + ${2*ta}px);\n    width: ${ra}px;\n    transform: translate(${-1*(ra+Jo)}px, ${-1*(ta+ea)}px);\n    cursor: pointer;\n    z-index: 1;\n    user-select: none;\n    box-sizing: border-box;\n  }\n  .ProseMirror div.tina_table_header_ext_left_selected {\n    background: #0084ff;\n    border-color: #0574E4;\n    z-index: 10;\n  }\n  .ProseMirror .tina_table_header_ext_top_left {\n    background: #F6F6F9;\n    border: 1px solid #E1DDEC;\n    position: absolute;\n    height: ${ra}px;\n    width: ${ra}px;\n    transform: translate(${-1*(ra+Jo)}px, ${-1*(ra+ea)}px);\n    border-radius: 5px 0 0 0;\n    z-index: 1;\n    cursor: pointer;\n    user-select: none;\n    box-sizing: border-box;\n  }\n  .ProseMirror div.tina_table_header_ext_top_left_selected {\n    background: #0084ff;\n    border-color: #0574E4;\n    z-index: 10;\n  }\n  .ProseMirror .selectedCell {\n    border-color: transparent;\n  }\n`,oa=a.css`
  .ProseMirror .tinacms-image-wrapper {
    display: inline-block;
    margin: 1em 0;
  }

  ${na}
`,aa=$.default((e=>{var r=e,{input:n,plugins:o,sticky:a,format:i,imageProps:s}=r,l=p(r,["input","plugins","sticky","format","imageProps"]);const c=t.useRef(null),[m,h]=t.useState(),[f,g]=t.useState(),{browserFocused:b}=N();return t.useEffect((()=>{const{translator:e}=So(n,c.current,h,s,i);return g(e),()=>{m&&m.view.destroy()}}),[c]),t.useEffect((()=>{const e=m&&m.view,t=document.getElementsByClassName("ProseMirror")[0];!e||(t===document.activeElement||t.contains(document.activeElement))&&b||$o(e,f,n.value)}),[n.value]),C.createElement(C.Fragment,null,C.createElement("link",{rel:"stylesheet",href:"https://codemirror.net/lib/codemirror.css"}),C.createElement(H,{translator:f,editorView:m},C.createElement(Qo,{sticky:a,imageProps:s,plugins:o})),C.createElement(ia,null,C.createElement("div",u(d({},l),{ref:c}))))}))`
  ${Yo}${oa}
`,ia=({children:e})=>C.createElement("div",{className:"prose shadow-inner focus:shadow-outline focus:border-blue-500 block w-full bg-white border border-gray-200 text-gray-600 focus:text-gray-900 rounded-md p-5 mb-5",style:{minHeight:"100px",maxWidth:"100%"}},e),sa={name:"wysiwygModeToggle",MenuItem:()=>C.createElement(R,null)},la=({imageProps:e,input:t,form:r,plugins:o=[],format:a="markdown",sticky:i,className:s})=>{const l=n.useCMS(),{value:c,onChange:d}=t,u="markdown"===a?[...o,sa]:o,p=da(l,r,e);return C.createElement(F,null,C.createElement(B,null,(({mode:e})=>C.createElement(L,null,"markdown"===e?C.createElement(Cr,{value:c,onChange:d,imageProps:p,plugins:u,sticky:i}):C.createElement(aa,{input:{value:c,onChange:d},plugins:u,sticky:i,format:a,imageProps:p,className:s})))))},ca=e=>e.id;function da(e,t,r){return C.useMemo((()=>{const n=(null==r?void 0:r.parse)||ca,o=(null==r?void 0:r.uploadDir)&&t?r.uploadDir(t.values):"";return{upload:async t=>{const r=t.map((e=>({directory:o,file:e})));return(await e.media.persist(r)).map((e=>n?n(e):e.filename))},previewSrc:t=>e.media.previewSrc(t),mediaDir:o,parse:n}}),[e.media.store,null==r?void 0:r.uploadDir,null==r?void 0:r.previewSrc,null==r?void 0:r.upload])}const ua=e=>S.default.createElement(la,u(d({},e),{sticky:!1,format:"html",imageProps:e.field.imageProps})),pa={__type:"field",name:"html",Component:ua,parse:e=>e||""},ma=n.wrapFieldsWithMeta((e=>S.default.createElement(la,u(d({},e),{sticky:!1,format:"markdown",imageProps:e.field.imageProps})))),ha={__type:"field",name:"markdown",Component:ma,parse:e=>e||""};e.HTMLField=ua,e.HtmlFieldPlugin=pa,e.MarkdownField=ma,e.MarkdownFieldPlugin=ha,e.Wysiwyg=la,Object.defineProperty(e,"__esModule",{value:!0}),e[Symbol.toStringTag]="Module"}(t,r(67294),r(4193),r(81246),r(8797),r(42778),r(73935),r(76922),r(26021),r(74465),r(69124),r(98780),r(99132),r(91296),r(32230),r(97920),r(9151),r(21658),r(40896),r(21081))}}]);