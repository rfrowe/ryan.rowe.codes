(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[492],{13214:function(e,n,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/blog/[slug]",function(){return t(59531)}])},25151:function(e,n,t){"use strict";t.d(n,{Z:function(){return S}});var r=t(35944),o=t(9008),c=t(86449),i=t(93336),a=t(99078),u=t(46646);function l(e,n){(null==n||n>e.length)&&(n=e.length);for(var t=0,r=new Array(n);t<n;t++)r[t]=e[t];return r}function s(e,n){return function(e){if(Array.isArray(e))return e}(e)||function(e,n){var t=null==e?null:"undefined"!==typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=t){var r,o,c=[],i=!0,a=!1;try{for(t=t.call(e);!(i=(r=t.next()).done)&&(c.push(r.value),!n||c.length!==n);i=!0);}catch(u){a=!0,o=u}finally{try{i||null==t.return||t.return()}finally{if(a)throw o}}return c}}(e,n)||function(e,n){if(!e)return;if("string"===typeof e)return l(e,n);var t=Object.prototype.toString.call(e).slice(8,-1);"Object"===t&&e.constructor&&(t=e.constructor.name);if("Map"===t||"Set"===t)return Array.from(t);if("Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return l(e,n)}(e,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}var f=function(e){var n=e.className,t=e.css,o=s((0,c.r)(),2),l=o[0],f=o[1],d="light"===l?"dark":"light",m="light"===d?u.Z:a.Z;return(0,r.tZ)(i.Z,{color:"primary",className:n,css:t,"aria-label":"switch to ".concat(d," mode"),onClick:f,children:(0,r.tZ)(m,{})})},d=t(70917),m=t(25449),h=t(50891),p=t(8298),b=t(1094),y=t(85295),_=t(10155),v=t(94914),w=t(79172),Z=t(11163),g=function(e){return(0,d.iv)({marginRight:e.spacing(1)})},O=function(e){return(0,d.iv)({flexGrow:1,margin:"0 ".concat(e.spacing(2))})},k=function(e){return(0,d.iv)({marginLeft:e.spacing(1)})};function C(e){var n=e.children,t=(0,p.Z)({threshold:25});return(0,r.tZ)(b.Z,{appear:!1,direction:"down",in:!t,children:n})}var E=function(){var e,n="/"===(0,Z.useRouter)().pathname;return(0,r.BX)(r.HY,{children:[(0,r.tZ)(C,{children:(0,r.tZ)(y.Z,{css:(0,d.iv)({background:"transparent"}),children:(0,r.BX)(_.Z,{component:"nav",children:[(0,r.tZ)(f,{css:[g,function(e){return(0,d.iv)({color:e.palette.action.active})}]}),(0,r.tZ)(v.Z,{href:"https://github.com/rfrowe",css:g,children:(0,r.tZ)(i.Z,{children:(0,r.tZ)(m.Z,{})})}),(0,r.tZ)(v.Z,{href:"mailto:ryan@rowe.codes",css:g,children:(0,r.tZ)(i.Z,{children:(0,r.tZ)(h.Z,{})})}),(0,r.tZ)(w.Z,{css:O,children:(0,r.tZ)(v.Z,{href:"/",children:(0,r.tZ)("h2",{css:(e=n,(0,d.iv)({display:e?"none":"inherit"})),children:"ryan.rowe.codes"})})}),(0,r.tZ)(v.Z,{href:"/blog",css:k,children:"Blog"}),(0,r.tZ)(v.Z,{href:"/about",css:k,children:"About"})]})})}),(0,r.tZ)(_.Z,{})]})},j=t(214),P=t.n(j),S=function(e){var n=e.title,t=void 0===n?"Ryan Rowe Codes":n,c=e.children;return(0,r.BX)("div",{className:P().container,children:[(0,r.BX)(o.default,{children:[(0,r.tZ)("title",{children:t}),(0,r.tZ)("link",{rel:"icon",href:"/favicon.ico"})]}),(0,r.BX)("main",{className:P().main,children:[(0,r.tZ)(E,{}),c]})]})}},59531:function(e,n,t){"use strict";t.r(n),t.d(n,{__N_SSG:function(){return v},default:function(){return w}});var r={};t.r(r),t.d(r,{MDXContext:function(){return l},MDXProvider:function(){return m},useMDXComponents:function(){return f},withMDXComponents:function(){return s}});var o=t(35944),c=t(25151),i=t(67294),a=t(85893),u=t.t(a,2);const l=i.createContext({});function s(e){return function(n){const t=f(n.components);return i.createElement(e,{...n,allComponents:t})}}function f(e){const n=i.useContext(l);return i.useMemo((()=>"function"===typeof e?e(n):{...n,...e}),[n,e])}const d={};function m({components:e,children:n,disableParentContext:t}){let r=f(e);return t&&(r=e||d),i.createElement(l.Provider,{value:r},n)}function h({compiledSource:e,frontmatter:n,scope:t,components:o={},lazy:c}){const[a,l]=(0,i.useState)(!c||"undefined"===typeof window);(0,i.useEffect)((()=>{if(c){const e=window.requestIdleCallback((()=>{l(!0)}));return()=>window.cancelIdleCallback(e)}}),[]);const s=(0,i.useMemo)((()=>{const o=Object.assign({opts:{...r,...u}},{frontmatter:n},t),c=Object.keys(o),i=Object.values(o),a=Reflect.construct(Function,c.concat(`${e}`));return a.apply(a,i).default}),[t,e]);if(!a)return i.createElement("div",{dangerouslySetInnerHTML:{__html:""},suppressHydrationWarning:!0});const f=i.createElement(m,{components:o},i.createElement(s,null));return c?i.createElement("div",null,f):f}"undefined"!==typeof window&&(window.requestIdleCallback=window.requestIdleCallback||function(e){var n=Date.now();return setTimeout((function(){e({didTimeout:!1,timeRemaining:function(){return Math.max(0,50-(Date.now()-n))}})}),1)},window.cancelIdleCallback=window.cancelIdleCallback||function(e){clearTimeout(e)});var p=t(71213);function b(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function y(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{},r=Object.keys(t);"function"===typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(t).filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})))),r.forEach((function(n){b(e,n,t[n])}))}return e}function _(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},c=Object.keys(e);for(r=0;r<c.length;r++)t=c[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(r=0;r<c.length;r++)t=c[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var v=!0,w=function(e){var n=(0,p.useTina)(e.query),r=n.data.getPostDocument.data.body,a=_(n.data.getPostDocument.data,["body"]),u=(0,i.useRef)(!1),l=(0,i.useState)(e.mdx),s=l[0],f=l[1];(0,i.useEffect)((function(){u.current?Promise.all([t.e(880),t.e(772),t.e(344)]).then(t.bind(t,17344)).then((function(e){return(0,e.serialize)(r)})).then(f):u.current=!0}),[r]);var d=(0,i.useMemo)((function(){return(0,o.tZ)(h,y({},s,{scope:y({},a,{markdown:r})}))}),[s,r,a]);return(0,o.tZ)(c.Z,{title:a.title,children:d})}},214:function(e){e.exports={container:"Home_container__bCOhY",main:"Home_main__nLjiQ",footer:"Home_footer____T7K",title:"Home_title__T09hD",description:"Home_description__41Owk",code:"Home_code__suPER",grid:"Home_grid__GxQ85",card:"Home_card___LpL1",logo:"Home_logo__27_tb"}}},function(e){e.O(0,[403,774,888,179],(function(){return n=13214,e(e.s=n);var n}));var n=e.O();_N_E=n}]);