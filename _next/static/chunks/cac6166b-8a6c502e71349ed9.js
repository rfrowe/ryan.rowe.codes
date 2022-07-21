(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[894],{81246:function(e,t,n){var a=Object.defineProperty,r=Object.defineProperties,i=Object.getOwnPropertyDescriptors,l=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,s=Object.prototype.propertyIsEnumerable,c=(e,t,n)=>t in e?a(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,d=(e,t)=>{for(var n in t||(t={}))o.call(t,n)&&c(e,n,t[n]);if(l)for(var n of l(t))s.call(t,n)&&c(e,n,t[n]);return e},m=(e,t)=>r(e,i(t)),u=(e,t)=>{var n={};for(var a in e)o.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&l)for(var a of l(e))t.indexOf(a)<0&&s.call(e,a)&&(n[a]=e[a]);return n};!function(e,t,a,r,i,l,o,s,c,p,g,f,h,w,v,b,x,y,E,k,C,N,L,M,z,H,T,S,F,P,B,_,V,I,R,O){"use strict";function $(e){return e&&"object"===typeof e&&"default"in e?e:{default:e}}function D(e){if(e&&e.__esModule)return e;var t={__proto__:null,[Symbol.toStringTag]:"Module"};return e&&Object.keys(e).forEach((function(n){if("default"!==n){var a=Object.getOwnPropertyDescriptor(e,n);Object.defineProperty(t,n,a.get?a:{enumerable:!0,get:function(){return e[n]}})}})),t.default=e,Object.freeze(t)}var A=D(t),j=$(t),Z=$(r),K=$(i),G=$(l),U=$(g),Y=$(T),W=$(V),q=$(I),X=$(O);const J=({children:e})=>{const[n,a]=t.useState(null),r=t.useCallback((e=>{null!==e&&a(e)}),[]);return A.createElement(A.Fragment,null,A.createElement("div",{id:"modal-root",className:"tina-tailwind",ref:r}),A.createElement(Q.Provider,{value:{portalNode:n}},e))},Q=A.createContext(null);function ee(){const e=A.useContext(Q);if(!e)throw new Error("No Modal Container context provided");return e}const te=({children:e})=>A.createElement("div",{className:"fixed inset-0 z-modal w-screen h-screen"},e,A.createElement("div",{className:"fixed -z-1 inset-0 opacity-80 bg-gradient-to-br from-gray-800 via-gray-900 to-black"})),ne=e=>{const{portalNode:t}=ee();return t?a.createPortal(A.createElement(te,null,A.createElement("div",d({},e))),t):null},ae=({children:e})=>A.createElement("div",{className:"w-full flex justify-between gap-4 items-center px-5 pb-5 rounded-b-md"},e),re=Z.default.div`
  padding: ${e=>e.padded?"var(--tina-padding-big)":"0"};
  margin: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 160px;

  &:last-child {
    border-radius: 0 0 5px 5px;
  }
`,ie=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M14.9524 4.89689L14.9524 26.8016H16.7461L16.7461 4.89689H14.9524Z"}),A.createElement("path",{d:"M4.8969 16.7461H26.8016L26.8016 14.9523H4.89689L4.8969 16.7461Z"}))},le=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M9.125 24H22.875V26H9.125V24ZM5 18H27V20H5V18ZM5 6H27V8H5V6ZM9.125 12H22.875V14H9.125V12Z",fill:"inherit"}))},oe=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M5 24H20.125V26H5V24ZM5 18H27V20H5V18ZM5 6H27V8H5V6ZM5 12H20.125V14H5V12Z",fill:"inherit"}))},se=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M11.875 24H27V26H11.875V24ZM5 18H27V20H5V18ZM5 6H27V8H5V6ZM11.875 12H27V14H11.875V12Z",fill:"inherit"}))},ce=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M5 6.2684L24.7316 26L26 24.7316L6.2684 5L5 6.2684Z"}),A.createElement("path",{d:"M6.2684 26L26 6.2684L24.7316 5L5 24.7316L6.2684 26Z"}))},de=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 4 14",fill:"#828282",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M2 5.5C1.5625 5.5 1.21875 5.65625 0.9375 5.9375C0.625 6.25 0.5 6.59375 0.5 7C0.5 7.4375 0.625 7.78125 0.9375 8.0625C1.21875 8.375 1.5625 8.5 2 8.5C2.40625 8.5 2.75 8.375 3.0625 8.0625C3.34375 7.78125 3.5 7.4375 3.5 7C3.5 6.59375 3.34375 6.25 3.0625 5.9375C2.75 5.65625 2.40625 5.5 2 5.5ZM0.5 2.25C0.5 1.84375 0.625 1.5 0.9375 1.1875C1.21875 0.90625 1.5625 0.75 2 0.75C2.40625 0.75 2.75 0.90625 3.0625 1.1875C3.34375 1.5 3.5 1.84375 3.5 2.25C3.5 2.6875 3.34375 3.03125 3.0625 3.3125C2.75 3.625 2.40625 3.75 2 3.75C1.5625 3.75 1.21875 3.625 0.9375 3.3125C0.625 3.03125 0.5 2.6875 0.5 2.25ZM0.5 11.75C0.5 11.3438 0.625 11 0.9375 10.6875C1.21875 10.4062 1.5625 10.25 2 10.25C2.40625 10.25 2.75 10.4062 3.0625 10.6875C3.34375 11 3.5 11.3438 3.5 11.75C3.5 12.1875 3.34375 12.5312 3.0625 12.8125C2.75 13.125 2.40625 13.25 2 13.25C1.5625 13.25 1.21875 13.125 0.9375 12.8125C0.625 12.5312 0.5 12.1875 0.5 11.75Z"}))},me=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M4 10H28V8H4V10Z"}),A.createElement("path",{d:"M4 17H28V15H4V17Z"}),A.createElement("path",{d:"M4 24H28V22H4V24Z"}))},ue=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M24.3324 8.96875C24.754 9.42578 25 9.95312 25 10.5859C25 11.2188 24.754 11.7461 24.3324 12.168L11.9634 24.543L7.85212 25C7.57101 25 7.36018 24.9297 7.21962 24.7188C7.04392 24.543 6.97365 24.332 7.00878 24.0508L7.46559 20.043L19.8346 7.66797C20.2562 7.24609 20.7833 7 21.4158 7C22.0483 7 22.5754 7.24609 23.0322 7.66797L24.3324 8.96875ZM11.1903 22.9258L20.3968 13.7148L18.2884 11.6055L9.08199 20.8164L8.80088 23.207L11.1903 22.9258ZM23.1376 10.9727C23.243 10.8672 23.3133 10.7266 23.3133 10.5859C23.3133 10.4453 23.243 10.3047 23.1376 10.1641L21.8375 8.86328C21.6969 8.75781 21.5564 8.6875 21.4158 8.6875C21.2753 8.6875 21.1347 8.75781 21.0293 8.86328L19.4832 10.4102L21.5915 12.5195L23.1376 10.9727Z"}))},pe=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M6.708 10.5L5.5 11.7654L14.2939 20.9773C14.9597 21.6747 16.0412 21.6737 16.7061 20.9773L25.5 11.7654L24.292 10.5L15.5 19.7098L6.708 10.5Z"}))},ge=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M25.292 21.5L26.5 20.2346L17.7061 11.0227C17.0403 10.3253 15.9588 10.3263 15.2939 11.0227L6.5 20.2346L7.708 21.5L16.5 12.2901L25.292 21.5Z"}))},fe=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M21 7.208L19.7346 6L10.5227 14.7939C9.82527 15.4597 9.82626 16.5412 10.5227 17.2061L19.7346 26L21 24.792L11.7901 16L21 7.208Z"}))},he=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M11 24.792L12.2654 26L21.4773 17.2061C22.1747 16.5403 22.1737 15.4588 21.4773 14.7939L12.2654 6L11 7.208L20.2099 16L11 24.792Z"}))},we=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M24.95,25.85H13.01c-0.5,0-0.9-0.4-0.9-0.9V13.01c0-0.5,0.4-0.9,0.9-0.9h11.94c0.5,0,0.9,0.4,0.9,0.9v11.94\n      C25.85,25.45,25.45,25.85,24.95,25.85z M13.91,24.05h10.14V13.91H13.91V24.05z"}),A.createElement("path",{d:"M9.93,19.89H7.05c-0.5,0-0.9-0.4-0.9-0.9V7.05c0-0.5,0.4-0.9,0.9-0.9h11.94c0.5,0,0.9,0.4,0.9,0.9v2.89h-1.8V7.95H7.95\n      v10.14h1.99V19.89z"}))},ve=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M15 22C15 23.1 14.1 24 13 24C11.9 24 11 23.1 11 22C11 20.9 11.9 20 13 20C14.1 20 15 20.9 15 22ZM13 14C11.9 14 11 14.9 11 16C11 17.1 11.9 18 13 18C14.1 18 15 17.1 15 16C15 14.9 14.1 14 13 14ZM13 8C11.9 8 11 8.9 11 10C11 11.1 11.9 12 13 12C14.1 12 15 11.1 15 10C15 8.9 14.1 8 13 8ZM19 12C20.1 12 21 11.1 21 10C21 8.9 20.1 8 19 8C17.9 8 17 8.9 17 10C17 11.1 17.9 12 19 12ZM19 14C17.9 14 17 14.9 17 16C17 17.1 17.9 18 19 18C20.1 18 21 17.1 21 16C21 14.9 20.1 14 19 14ZM19 20C17.9 20 17 20.9 17 22C17 23.1 17.9 24 19 24C20.1 24 21 23.1 21 22C21 20.9 20.1 20 19 20Z"}))},be=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M21 7.208L19.7346 6L10.5227 14.7939C9.82527 15.4597 9.82626 16.5412 10.5227 17.2061L19.7346 26L21 24.792L11.7901 16L21 7.208Z"}))},xe=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M11 24.792L12.2654 26L21.4773 17.2061C22.1747 16.5403 22.1737 15.4588 21.4773 14.7939L12.2654 6L11 7.20799L20.2099 16L11 24.792Z"}))},ye=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M20.8 14.3867C22.0933 13.4933 23 12.0267 23 10.6667C23 7.65334 20.6667 5.33334 17.6667 5.33334H9.33333V24H18.72C21.5067 24 23.6667 21.7333 23.6667 18.9467C23.6667 16.92 22.52 15.1867 20.8 14.3867V14.3867ZM13.3333 8.66667H17.3333C18.44 8.66667 19.3333 9.56 19.3333 10.6667C19.3333 11.7733 18.44 12.6667 17.3333 12.6667H13.3333V8.66667ZM18 20.6667H13.3333V16.6667H18C19.1067 16.6667 20 17.56 20 18.6667C20 19.7733 19.1067 20.6667 18 20.6667Z"}))},Ee=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M12.5333 22.1333L6.40001 16L12.5333 9.86667L10.6667 8L2.66667 16L10.6667 24L12.5333 22.1333ZM19.4667 22.1333L25.6 16L19.4667 9.86667L21.3333 8L29.3333 16L21.3333 24L19.4667 22.1333V22.1333Z"}))},ke=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M15.5 23.0129L8.88889 23.0129L8.88889 9.10324L15.5 9.10324L15.5 7.11615L8.88889 7.11615C7.85 7.11615 7 8.01034 7 9.10324L7 23.0129C7 24.1058 7.85 25 8.88889 25L15.5 25L15.5 23.0129Z"}),A.createElement("path",{d:"M18.6961 12.4912L21.1328 15.0645L12 15.0645L12 17.0516L21.1328 17.0516L18.6961 19.6249L20.0278 21.0258L24.75 16.0581L20.0278 11.0903L18.6961 12.4912Z"}))},Ce=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M12 5.33334V9.33334H18.6667V25.3333H22.6667V9.33334H29.3333V5.33334H12ZM4 16H8V25.3333H12V16H16V12H4V16Z"}))},Ne=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M13.3333 5.33334V9.33334H16.28L11.72 20H8V24H18.6667V20H15.72L20.28 9.33334H24V5.33334H13.3333Z"}))},Le=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"currentColor",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M26 20V8C26 6.9 25.1 6 24 6H12C10.9 6 10 6.9 10 8V20C10 21.1 10.9 22 12 22H24C25.1 22 26 21.1 26 20ZM15 16L17.03 18.71L20 15L24 20H12L15 16ZM6 10V24C6 25.1 6.9 26 8 26H22V24H8V10H6Z"}))},Me=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M2.66667 22.6667H5.33333V23.3333H4V24.6667H5.33333V25.3333H2.66667V26.6667H6.66667V21.3333H2.66667V22.6667ZM4 10.6667H5.33333V5.33334H2.66667V6.66667H4V10.6667ZM2.66667 14.6667H5.06667L2.66667 17.4667V18.6667H6.66667V17.3333H4.26667L6.66667 14.5333V13.3333H2.66667V14.6667ZM9.33333 6.66667V9.33334H28V6.66667H9.33333ZM9.33333 25.3333H28V22.6667H9.33333V25.3333ZM9.33333 17.3333H28V14.6667H9.33333V17.3333Z"}))},ze=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"currentColor",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M24.7021 13.8628L24.0959 12.4533C24.0959 12.4533 25.5063 9.34049 25.3804 9.22033L23.5152 7.43748C23.3853 7.3142 20.2046 8.73502 20.2046 8.73502L18.7364 8.1553C18.7364 8.1553 17.4403 5 17.2622 5H14.629C14.4469 5 13.2457 8.16271 13.2457 8.16271L11.7807 8.74321C11.7807 8.74321 8.53338 7.393 8.40784 7.51277L6.54507 9.29875C6.41594 9.42125 7.89851 12.4724 7.89851 12.4724L7.29273 13.8788C7.29273 13.8788 4 15.1209 4 15.2883V17.8143C4 17.9903 7.3003 19.1415 7.3003 19.1415L7.90608 20.5467C7.90608 20.5467 6.49724 23.6572 6.62079 23.7765L8.48595 25.5641C8.61189 25.6854 11.795 24.265 11.795 24.265L13.264 24.847C13.264 24.847 14.5601 28 14.739 28H17.373C17.5551 28 18.7555 24.8373 18.7555 24.8373L20.2257 24.2552C20.2257 24.2552 23.467 25.607 23.5922 25.4888L25.4581 23.7028C25.5872 23.5788 24.1015 20.5292 24.1015 20.5292L24.7057 19.1228C24.7057 19.1228 28 17.8791 28 17.7094V15.1841C28.0008 15.0105 24.7021 13.8628 24.7021 13.8628ZM19.8479 16.4984C19.8479 18.5306 18.1222 20.1855 16.0012 20.1855C13.8818 20.1855 12.1537 18.5306 12.1537 16.4984C12.1537 14.4679 13.8818 12.8161 16.0012 12.8161C18.123 12.8169 19.8479 14.4679 19.8479 16.4984Z"}))},He=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 24 24",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M4 21h15.893c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zm0-2v-5h4v5H4zM14 7v5h-4V7h4zM8 7v5H4V7h4zm2 12v-5h4v5h-4zm6 0v-5h3.894v5H16zm3.893-7H16V7h3.893v5z"}))},Te=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"currentColor",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M18.6466 14.5553C19.9018 13.5141 20.458 7.36086 21.0014 5.14903C21.5447 2.9372 23.7919 3.04938 23.7919 3.04938C23.7919 3.04938 23.2085 4.06764 23.4464 4.82751C23.6844 5.58738 25.3145 6.26662 25.3145 6.26662L24.9629 7.19622C24.9629 7.19622 24.2288 7.10204 23.7919 7.9785C23.355 8.85496 24.3392 17.4442 24.3392 17.4442C24.3392 17.4442 21.4469 22.7275 21.4469 24.9206C21.4469 27.1136 22.4819 28.9515 22.4819 28.9515H21.0296C21.0296 28.9515 18.899 26.4086 18.462 25.1378C18.0251 23.8669 18.1998 22.596 18.1998 22.596C18.1998 22.596 15.8839 22.4646 13.8303 22.596C11.7767 22.7275 10.4072 24.498 10.16 25.4884C9.91287 26.4787 9.81048 28.9515 9.81048 28.9515H8.66211C7.96315 26.7882 7.40803 26.0129 7.70918 24.9206C8.54334 21.8949 8.37949 20.1788 8.18635 19.4145C7.99321 18.6501 6.68552 17.983 6.68552 17.983C7.32609 16.6741 7.97996 16.0452 10.7926 15.9796C13.6052 15.914 17.3915 15.5965 18.6466 14.5553Z"}),A.createElement("path",{d:"M11.1268 24.7939C11.1268 24.7939 11.4236 27.5481 13.0001 28.9516H14.3511C13.0001 27.4166 12.8527 23.4155 12.8527 23.4155C12.1656 23.6399 11.3045 24.3846 11.1268 24.7939Z"}))},Se=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M16.9 4.2V6.9H25V8.7H7V6.9H15.1V4.2H16.9ZM7.77201 10.5H24.2279L22.4102 24.1332C22.2853 25.0698 21.4406 25.8 20.4977 25.8H11.5022C10.5561 25.8 9.71404 25.0653 9.58977 24.1332L7.77201 10.5ZM22.172 12.3H9.82791L11.3739 23.8953C11.3788 23.9318 11.4569 24 11.5022 24H20.4977C20.5432 24 20.6209 23.9328 20.6259 23.8953L22.172 12.3Z"}))},Fe=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M5.33333 14C4.22667 14 3.33333 14.8933 3.33333 16C3.33333 17.1067 4.22667 18 5.33333 18C6.44 18 7.33333 17.1067 7.33333 16C7.33333 14.8933 6.44 14 5.33333 14ZM5.33333 6C4.22667 6 3.33333 6.89333 3.33333 8C3.33333 9.10667 4.22667 10 5.33333 10C6.44 10 7.33333 9.10667 7.33333 8C7.33333 6.89333 6.44 6 5.33333 6ZM5.33333 22C4.22667 22 3.33333 22.9067 3.33333 24C3.33333 25.0933 4.24 26 5.33333 26C6.42667 26 7.33333 25.0933 7.33333 24C7.33333 22.9067 6.44 22 5.33333 22ZM9.33333 25.3333H28V22.6667H9.33333V25.3333ZM9.33333 17.3333H28V14.6667H9.33333V17.3333ZM9.33333 6.66667V9.33333H28V6.66667H9.33333Z"}))},Pe=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M16.6667 10.6667C13.1333 10.6667 9.93333 11.9867 7.46667 14.1333L2.66667 9.33334V21.3333H14.6667L9.84 16.5067C11.6933 14.96 14.0533 14 16.6667 14C21.3867 14 25.4 17.08 26.8 21.3333L29.96 20.2933C28.1067 14.7067 22.8667 10.6667 16.6667 10.6667Z"}))},Be=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M24.5333 14.1333C22.0667 11.9867 18.8667 10.6667 15.3333 10.6667C9.13333 10.6667 3.89333 14.7067 2.05333 20.2933L5.2 21.3333C6.6 17.08 10.6 14 15.3333 14C17.9333 14 20.3067 14.96 22.16 16.5067L17.3333 21.3333H29.3333V9.33334L24.5333 14.1333Z"}))},_e=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M15.3012 6.23952L11.0607 10.4801L10 9.41943L14.2406 5.17886C14.9213 4.49816 16.0233 4.48258 16.7196 5.17886L20.9602 9.41943L19.8995 10.4801L15.6589 6.23952C15.5561 6.13671 15.4039 6.13689 15.3012 6.23952Z"}),A.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M15.6988 25.8732L19.9393 21.6326L21 22.6933L16.7594 26.9339C16.0787 27.6146 14.9767 27.6301 14.2804 26.9339L10.0398 22.6933L11.1005 21.6326L15.3411 25.8732C15.4439 25.976 15.5961 25.9758 15.6988 25.8732Z"}),A.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M14.6569 27.1127V17.799L16.1569 17.799V27.1127L14.6569 27.1127Z"}),A.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M14.6569 14.3137V5L16.1569 5V14.3137L14.6569 14.3137Z"}))},Ve=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M25.7605 15.3012L21.5199 11.0607L22.5806 10L26.8211 14.2406C27.5018 14.9213 27.5174 16.0233 26.8211 16.7196L22.5806 20.9602L21.5199 19.8995L25.7605 15.6589C25.8633 15.5561 25.8631 15.4039 25.7605 15.3012Z"}),A.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M6.12679 15.6988L10.3674 19.9393L9.3067 21L5.06613 16.7594C4.38543 16.0787 4.36985 14.9767 5.06613 14.2804L9.3067 10.0398L10.3674 11.1005L6.12679 15.3411C6.02398 15.4439 6.02416 15.5961 6.12679 15.6988Z"}),A.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M4.88727 14.6569L14.201 14.6569L14.201 16.1569L4.88727 16.1569L4.88727 14.6569Z"}),A.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M17.6863 14.6569L27 14.6569L27 16.1569L17.6863 16.1569L17.6863 14.6569Z"}))},Ie=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"currentColor",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M17.3 25.1V19.9H21.2L16 13.4L10.8 19.9H14.7V25.1H17.3Z"}),A.createElement("path",{d:"M9.5 25.1H12.1V22.5H9.5C7.3498 22.5 5.6 20.7502 5.6 18.6C5.6 16.7748 7.1587 15.0172 9.0749 14.6805L9.8302 14.5479L10.0798 13.8225C10.9937 11.1562 13.2635 9.49996 16 9.49996C19.5841 9.49996 22.5 12.4159 22.5 16V17.3H23.8C25.2339 17.3 26.4 18.4661 26.4 19.9C26.4 21.3339 25.2339 22.5 23.8 22.5H19.9V25.1H23.8C26.6678 25.1 29 22.7678 29 19.9C28.998 18.7347 28.6056 17.6036 27.8855 16.6874C27.1654 15.7713 26.1591 15.1228 25.0272 14.8456C24.4591 10.371 20.628 6.89996 16 6.89996C12.4172 6.89996 9.305 8.99426 7.8841 12.295C5.0917 13.1296 3 15.766 3 18.6C3 22.1841 5.9159 25.1 9.5 25.1Z"}))},Re=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"none",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M12.625 13.3846H19.375C21.2358 13.3846 22.75 14.8342 22.75 16.6154C22.75 18.3966 21.2358 19.8462 19.375 19.8462H16V22H19.375C22.4766 22 25 19.5845 25 16.6154C25 13.6463 22.4766 11.2308 19.375 11.2308H12.625V8L7 12.3077L12.625 16.6154V13.3846Z",fill:"inherit"}))},Oe=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M5.2 16C5.2 13.72 7.05333 11.8667 9.33333 11.8667H14.6667V9.33334H9.33333C5.65333 9.33334 2.66666 12.32 2.66666 16C2.66666 19.68 5.65333 22.6667 9.33333 22.6667H14.6667V20.1333H9.33333C7.05333 20.1333 5.2 18.28 5.2 16ZM10.6667 17.3333H21.3333V14.6667H10.6667V17.3333ZM22.6667 9.33334H17.3333V11.8667H22.6667C24.9467 11.8667 26.8 13.72 26.8 16C26.8 18.28 24.9467 20.1333 22.6667 20.1333H17.3333V22.6667H22.6667C26.3467 22.6667 29.3333 19.68 29.3333 16C29.3333 12.32 26.3467 9.33334 22.6667 9.33334Z"}))},$e=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M25 16.5C25 15.3419 23.9909 14.4 22.75 14.4H21.625V10.25C21.625 7.35515 19.1016 5 16 5C12.8984 5 10.375 7.35515 10.375 10.25V14.4H9.25C8.00912 14.4 7 15.3419 7 16.5V23.9C7 25.0581 8.00912 26 9.25 26H22.75C23.9909 26 25 25.0581 25 23.9V16.5ZM12.625 10.25C12.625 8.5133 14.1392 7.1 16 7.1C17.8608 7.1 19.375 8.5133 19.375 10.25V14.4H12.625V10.25Z",fill:"inherit"}))},De=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M8.00001 22.6667H12L14.6667 17.3333V9.33334H6.66667V17.3333H10.6667L8.00001 22.6667ZM18.6667 22.6667H22.6667L25.3333 17.3333V9.33334H17.3333V17.3333H21.3333L18.6667 22.6667Z"}))},Ae=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M16 22.6667C20.4133 22.6667 24 19.08 24 14.6667V4H20.6667V14.6667C20.6667 17.24 18.5733 19.3333 16 19.3333C13.4267 19.3333 11.3333 17.24 11.3333 14.6667V4H8.00001V14.6667C8.00001 19.08 11.5867 22.6667 16 22.6667ZM6.66667 25.3333V28H25.3333V25.3333H6.66667Z"}))},je=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M16.578 26a14.1 14.1 0 01-4.535-.75A12.299 12.299 0 018 22.889l2.628-3.028a13.437 13.437 0 002.83 1.722c.982.426 2.051.64 3.206.64.924 0 1.637-.158 2.137-.473.52-.333.78-.787.78-1.361v-.056c0-.117-.01-.228-.03-.333H24c-.003.952-.186 1.804-.549 2.556a5.478 5.478 0 01-1.53 1.888c-.655.5-1.435.89-2.34 1.167-.905.26-1.906.389-3.003.389zm-3.993-9H29v-3H17.265a71.646 71.646 0 01-1.843-.5c-.558-.167-1-.343-1.328-.528-.327-.185-.558-.389-.693-.61a1.905 1.905 0 01-.174-.834v-.056c0-.481.212-.88.636-1.194.443-.334 1.097-.5 1.964-.5.866 0 1.733.176 2.599.528a14.16 14.16 0 012.657 1.388l2.31-3.222a11.94 11.94 0 00-3.436-1.833C18.724 6.213 17.367 6 15.884 6c-1.04 0-1.992.139-2.859.417-.866.277-1.617.676-2.252 1.194a5.537 5.537 0 00-1.444 1.861c-.347.704-.52 1.5-.52 2.39v.055c0 .804.107 1.498.322 2.083H4v3h8.585z"}))},Ze=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M28.0035 7H4.01374C2.91056 7 2 7.988 2 9.185V23.796C2 25.012 2.91056 26 4.01374 26H27.986C29.1067 26 29.9998 25.012 29.9998 23.815V9.185C30.0173 7.988 29.1067 7 28.0035 7ZM17.7597 22.2H14.2576V16.5L11.6309 20.148L9.00432 16.5V22.2H5.50216V10.8H9.00432L11.6309 14.6L14.2576 10.8H17.7597V22.2ZM22.9954 23.15L18.6352 16.5H21.2619V10.8H24.764V16.5H27.3906L22.9954 23.15Z"}))},Ke=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M16 29.3333C17.4666 29.3333 18.6666 28.1333 18.6666 26.6666H13.3333C13.3333 27.3739 13.6143 28.0522 14.1144 28.5523C14.6145 29.0524 15.2927 29.3333 16 29.3333ZM24 21.3333V14.6666C24 10.5733 21.8133 7.14665 18 6.23998V5.33331C18 4.22665 17.1066 3.33331 16 3.33331C14.8933 3.33331 14 4.22665 14 5.33331V6.23998C10.1733 7.14665 7.99998 10.56 7.99998 14.6666V21.3333L5.33331 24V25.3333H26.6666V24L24 21.3333Z",fill:"inherit"}))},Ge=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M16 2.66669C8.64802 2.66669 2.66669 8.64802 2.66669 16C2.66669 23.352 8.64802 29.3334 16 29.3334C23.352 29.3334 29.3334 23.352 29.3334 16C29.3334 8.64802 23.352 2.66669 16 2.66669ZM17.3334 22.6667H14.6667V14.6667H17.3334V22.6667ZM17.3334 12H14.6667V9.33335H17.3334V12Z",fill:"inherit"}))},Ue=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M31.2176 28.768L16.9664 2.1568C16.8686 1.98698 16.7278 1.84593 16.5581 1.74786C16.3884 1.64978 16.1959 1.59814 16 1.59814C15.804 1.59814 15.6115 1.64978 15.4419 1.74786C15.2722 1.84593 15.1314 1.98698 15.0336 2.1568L0.783977 28.768C0.688907 28.9338 0.639554 29.1219 0.640959 29.3131C0.642365 29.5042 0.694478 29.6916 0.791977 29.856C0.991977 30.1936 1.35518 30.4 1.74878 30.4H30.2512C30.4442 30.4003 30.6339 30.3503 30.8017 30.2549C30.9695 30.1595 31.1095 30.022 31.208 29.856C31.3054 29.6916 31.3576 29.5044 31.3593 29.3133C31.361 29.1222 31.3121 28.9341 31.2176 28.768V28.768ZM17.6 27.2H14.4V24H17.6V27.2ZM17.6 21.6H14.4V11.2H17.6V21.6Z",fill:"inherit"}))},Ye=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M22.276 3.05736C22.1524 2.9333 22.0055 2.83491 21.8437 2.76787C21.6819 2.70082 21.5085 2.66643 21.3334 2.66669H10.6667C10.4916 2.66643 10.3181 2.70082 10.1563 2.76787C9.99455 2.83491 9.84763 2.9333 9.72402 3.05736L3.05736 9.72402C2.9333 9.84763 2.83491 9.99455 2.76787 10.1563C2.70082 10.3181 2.66643 10.4916 2.66669 10.6667V21.3334C2.66669 21.688 2.80669 22.0267 3.05736 22.276L9.72402 28.9427C9.84763 29.0667 9.99455 29.1651 10.1563 29.2322C10.3181 29.2992 10.4916 29.3336 10.6667 29.3334H21.3334C21.688 29.3334 22.0267 29.1934 22.276 28.9427L28.9427 22.276C29.0667 22.1524 29.1651 22.0055 29.2322 21.8437C29.2992 21.6819 29.3336 21.5085 29.3334 21.3334V10.6667C29.3336 10.4916 29.2992 10.3181 29.2322 10.1563C29.1651 9.99455 29.0667 9.84763 28.9427 9.72402L22.276 3.05736ZM17.3334 22.6667H14.6667V20H17.3334V22.6667ZM17.3334 17.3334H14.6667V9.33336H17.3334V17.3334Z",fill:"inherit"}))},We=e=>{var t=u(e,[]);return A.createElement("svg",d({viewBox:"0 0 32 32",fill:"currentColor",xmlns:"http://www.w3.org/2000/svg"},t),A.createElement("path",{d:"M22.6328 19.163V11.997C22.6281 10.391 21.613 8 18.8359 8V6L15.0484 9L18.8359 12V10C20.5677 10 20.7306 11.539 20.7391 12V19.163C19.3756 19.597 18.3719 20.92 18.3719 22.5C18.3719 24.43 19.8585 26 21.686 26C23.5134 26 25 24.43 25 22.5C25 20.92 23.9963 19.597 22.6328 19.163ZM21.686 24C20.9029 24 20.2656 23.327 20.2656 22.5C20.2656 21.673 20.9029 21 21.686 21C22.469 21 23.1063 21.673 23.1063 22.5C23.1063 23.327 22.469 24 21.686 24ZM13.6281 9.5C13.6281 7.57 12.1415 6 10.314 6C8.48659 6 7 7.57 7 9.5C7 11.08 8.00368 12.403 9.36718 12.837V19.163C8.00368 19.597 7 20.92 7 22.5C7 24.43 8.48659 26 10.314 26C12.1415 26 13.6281 24.43 13.6281 22.5C13.6281 20.92 12.6244 19.597 11.2609 19.163V12.837C12.6244 12.403 13.6281 11.08 13.6281 9.5ZM8.89374 9.5C8.89374 8.673 9.53098 8 10.314 8C11.0971 8 11.7344 8.673 11.7344 9.5C11.7344 10.327 11.0971 11 10.314 11C9.53098 11 8.89374 10.327 8.89374 9.5ZM11.7344 22.5C11.7344 23.327 11.0971 24 10.314 24C9.53098 24 8.89374 23.327 8.89374 22.5C8.89374 21.673 9.53098 21 10.314 21C11.0971 21 11.7344 21.673 11.7344 22.5Z"}))},qe=e=>{var t=u(e,[]);return j.default.createElement("svg",d({xmlns:"http://www.w3.org/2000/svg",viewBox:"2 2 20 20"},t),j.default.createElement("path",{d:"M20,5h-8.586L9.707,3.293C9.52,3.105,9.265,3,9,3H4C2.897,3,2,3.897,2,5v14c0,1.103,0.897,2,2,2h16c1.103,0,2-0.897,2-2V7 C22,5.897,21.103,5,20,5z M4,19V7h7h1h8l0.002,12H4z"}))},Xe=e=>{var t=u(e,[]);return j.default.createElement("svg",d({xmlns:"http://www.w3.org/2000/svg",viewBox:"2 2 20 20"},t),j.default.createElement("path",{d:"M19.903,8.586c-0.049-0.106-0.11-0.207-0.196-0.293l-6-6c-0.086-0.086-0.187-0.147-0.293-0.196 c-0.03-0.014-0.062-0.022-0.094-0.033c-0.084-0.028-0.17-0.046-0.259-0.051C13.04,2.011,13.021,2,13,2H6C4.897,2,4,2.897,4,4v16 c0,1.103,0.897,2,2,2h12c1.103,0,2-0.897,2-2V9c0-0.021-0.011-0.04-0.013-0.062c-0.005-0.089-0.022-0.175-0.051-0.259 C19.926,8.647,19.917,8.616,19.903,8.586z M16.586,8H14V5.414L16.586,8z M6,20V4h6v5c0,0.553,0.447,1,1,1h5l0.002,10H6z"}),j.default.createElement("path",{d:"M8 12H16V14H8zM8 16H16V18H8zM8 8H10V10H8z"}))},Je=e=>{var t=u(e,[]);return A.createElement("svg",d({xmlns:"http://www.w3.org/2000/svg",fill:"currentColor",className:"bi bi-circle",viewBox:"0 0 16 16"},t),A.createElement("path",{d:"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"}))},Qe=e=>{var t=u(e,[]);return A.createElement("svg",d({xmlns:"http://www.w3.org/2000/svg",fill:"currentColor",className:"bi bi-check-circle-fill",viewBox:"0 0 16 16"},t),A.createElement("path",{d:"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"}))},et=({children:e,close:t})=>A.createElement("div",{className:"h-14 flex items-center justify-between px-5 border-b border-gray-200 m-0"},A.createElement(tt,null,e),t&&A.createElement(nt,{onClick:t},A.createElement(ce,null))),tt=({children:e})=>A.createElement("h2",{className:"text-gray-600 font-medium text-base leading-none m-0"},e),nt=Z.default.div`
  display: flex;
  align-items: center;
  fill: var(--tina-color-grey-5);
  cursor: pointer;
  transition: fill 85ms ease-out;
  svg {
    width: 24px;
    height: auto;
  }
  &:hover {
    fill: var(--tina-color-grey-8);
  }
`,at=r.keyframes`
  0% {
    transform: translate3d( -2rem, 0, 0 );
    opacity: 0;
  }

  100% {
    transform: translate3d( 0, 0, 0 );
    opacity: 1;
  }
`,rt=Z.default.div`
  display: flex;
  flex-direction: column;
  z-index: var(--tina-z-index-0);
  overflow: visible;
  background-color: #fff;
  border-radius: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 1500px;
  height: 100%;
  animation: ${at} 150ms ease-out 1;

  ${re} {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 721px) {
    width: calc(100% - 170px);
  }
`,it=rt,lt=r.keyframes`
  0% {
    transform: translate3d( 0, -2rem, 0 );
    opacity: 0;
  }

  100% {
    transform: translate3d( 0, 0, 0 );
    opacity: 1;
  }
`,ot=Z.default.div`
  display: block;
  z-index: var(--tina-z-index-0);
  overflow: visible; /* Keep this as "visible", select component needs to overflow */
  background-color: var(--tina-color-grey-1);
  border-radius: var(--tina-radius-small);
  margin: 40px auto;
  width: 460px;
  max-width: 90%;
  animation: ${lt} 150ms ease-out 1;
`,st=ot;class ct{constructor(e){this.events=e,this.plugins={}}getType(e){return this.plugins[e]=this.plugins[e]||new dt(e,this.events)}findOrCreateMap(e){return this.getType(e)}add(e){this.findOrCreateMap(e.__type).add(e)}remove(e){this.findOrCreateMap(e.__type).remove(e)}all(e){return this.findOrCreateMap(e).all()}}class dt{constructor(e,t){this.__type=e,this.events=t,this.__plugins={}}add(e){const t=e;t.__type||(t.__type=this.__type),this.__plugins[t.name]=t,this.events.dispatch({type:`plugin:add:${this.__type}`})}all(){return Object.keys(this.__plugins).map((e=>this.__plugins[e]))}find(e){return this.__plugins[e]}remove(e){const t="string"===typeof e?e:e.name,n=this.__plugins[t];return delete this.__plugins[t],this.events.dispatch({type:`plugin:remove:${this.__type}`}),n}subscribe(e){return this.events.subscribe(`plugin:*:${this.__type}`,e)}}class mt{constructor(){this.listeners=new Set}subscribe(e,t){let n;n="string"===typeof e?[e]:e;const a=n.map((e=>new ut(e,t)));return a.forEach((e=>this.listeners.add(e))),()=>{a.forEach((e=>this.listeners.delete(e)))}}dispatch(e){this.listeners&&Array.from(this.listeners.values()).forEach((t=>t.handleEvent(e)))}}class ut{constructor(e,t){this.eventPattern=e,this.callback=t}handleEvent(e){return!!this.watchesEvent(e)&&(this.callback(e),!0)}watchesEvent(e){if("*"===this.eventPattern)return!0;const t=e.type.split(":"),n=this.eventPattern.split(":");let a=0,r=!1;for(;!r&&a<n.length;){const e="*"===n[a],i=n[a]===t[a];r=!(e||i),a++}return!r}}class pt{constructor(){this.accept="*"}async persist(e){return e.map((({directory:e,file:t})=>({id:t.name,type:"file",directory:e,filename:t.name})))}async previewSrc(e){return e}async list(){return{items:[],nextOffset:0}}async delete(){}}class gt{constructor(e,t){this.store=e,this.events=t,this._pageSize=20,this.previewSrc=async(e,t="",n={})=>{try{this.events.dispatch({type:"media:preview:start",src:e,fieldName:t,formValues:n});const a=await this.store.previewSrc(e,t,n);return this.events.dispatch({type:"media:preview:success",src:e,url:a,fieldName:t,formValues:n}),a}catch(a){throw this.events.dispatch({type:"media:preview:failure",src:e,error:a,fieldName:t,formValues:n}),a}}}get isConfigured(){return!(this.store instanceof pt)}get pageSize(){return this._pageSize}set pageSize(e){this._pageSize=e,this.events.dispatch({type:"media:pageSize",pageSize:e})}open(e={}){this.events.dispatch(d({type:"media:open"},e))}get accept(){return this.store.accept}async persist(e){try{this.events.dispatch({type:"media:upload:start",uploaded:e});const t=await this.store.persist(e);return this.events.dispatch({type:"media:upload:success",uploaded:e,media:t}),t}catch(t){throw this.events.dispatch({type:"media:upload:failure",uploaded:e,error:t}),t}}async delete(e){try{this.events.dispatch({type:"media:delete:start",media:e}),await this.store.delete(e),this.events.dispatch({type:"media:delete:success",media:e})}catch(t){throw this.events.dispatch({type:"media:delete:failure",media:e,error:t}),t}}async list(e){try{this.events.dispatch(d({type:"media:list:start"},e));const t=await this.store.list(e);return this.events.dispatch(m(d({type:"media:list:success"},e),{media:t})),t}catch(t){throw this.events.dispatch(m(d({type:"media:list:failure"},e),{error:t})),t}}}class ft extends Error{constructor(e){super(e.message),this.ERR_TYPE="MediaListError",this.title=e.title,this.docsLink=e.docsLink}}class ht{constructor(e){this.events=e,this._flags=new Map}get(e){return this._flags.get(e)}set(e,t){this._flags.set(e,t),this.events.dispatch({type:"flag:set",key:e,value:t})}}const wt=class{constructor(e={}){this._enabled=!1,this.api={},this.unsubscribeHooks={},this.events=new mt,this.media=new gt(new pt,this.events),this.enable=()=>{this._enabled=!0,this.events.dispatch(wt.ENABLED)},this.disable=()=>{this._enabled=!1,this.events.dispatch(wt.DISABLED)},this.toggle=()=>{this.enabled?this.disable():this.enable()},this.plugins=new ct(this.events),this.flags=new ht(this.events),e.media&&(this.media.store=e.media),e.mediaOptions&&e.mediaOptions.pageSize&&(this.media.pageSize=e.mediaOptions.pageSize),e.plugins&&e.plugins.forEach((e=>this.plugins.add(e))),e.apis&&Object.entries(e.apis).forEach((([e,t])=>this.registerApi(e,t))),e.enabled&&this.enable()}registerApi(e,t){if(this.unsubscribeHooks[e]&&this.unsubscribeHooks[e](),t.events instanceof mt){const n=t.events.subscribe("*",this.events.dispatch),a=this.events.subscribe("*",(e=>t.events.dispatch(e)));this.unsubscribeHooks[e]=()=>{n(),a()}}this.api[e]=t}get enabled(){return this._enabled}get disabled(){return!this._enabled}};let vt=wt;vt.ENABLED={type:"cms:enable"},vt.DISABLED={type:"cms:disable"};class bt{constructor(e,t={}){this.events=e,this.map=t,this.alerts=new Map,this.mapEventToAlert=e=>{const t=this.map[e.type];if(t){let n;n="function"===typeof t?t:()=>t;const{level:a,message:r,timeout:i}=n(e);this.add(a,r,i)}},this.events.subscribe("*",this.mapEventToAlert)}setMap(e){this.map=d(d({},this.map),e)}add(e,t,n=3e3){const a={level:e,message:t,timeout:n,id:`${t}|${Date.now()}`};this.alerts.set(a.id,a),this.events.dispatch({type:"alerts:add",alert:a});let r=null;const i=()=>{clearTimeout(r),this.dismiss(a)};return r=setTimeout(i,a.timeout),i}dismiss(e){this.alerts.delete(e.id),this.events.dispatch({type:"alerts:remove",alert:e})}subscribe(e){const t=this.events.subscribe("alerts",e);return()=>t()}get all(){return Array.from(this.alerts.values())}info(e,t){return this.add("info",e,t)}success(e,t){return this.add("success",e,t)}warn(e,t){return this.add("warn",e,t)}error(e,t){return this.add("error",e,t)}}function xt(){const[e,t]=A.useState(!1),a={google:{families:["Inter:400,600"]},loading:()=>{t(!0)}};return A.useEffect((()=>{if(!e)return n(75933).load(a)}),[]),null}function yt(){return A.createElement(A.Fragment,null,A.createElement(xt,null),A.createElement(kt,null))}const Et=r.css`
  :root {
    --tina-color-primary-light: #2296fe;
    --tina-color-primary: #0084ff;
    --tina-color-primary-dark: #0574e4;
    --tina-color-error-light: #eb6337;
    --tina-color-error: #ec4815;
    --tina-color-error-dark: #dc4419;
    --tina-color-warning-light: #f5e06e;
    --tina-color-warning: #e9d050;
    --tina-color-warning-dark: #d3ba38;
    --tina-color-success-light: #57c355;
    --tina-color-success: #3cad3a;
    --tina-color-success-dark: #249a21;
    --tina-color-grey-0: #ffffff;
    --tina-color-grey-1: #f6f6f9;
    --tina-color-grey-2: #edecf3;
    --tina-color-grey-3: #e1ddec;
    --tina-color-grey-4: #b2adbe;
    --tina-color-grey-5: #918c9e;
    --tina-color-grey-6: #716c7f;
    --tina-color-grey-7: #565165;
    --tina-color-grey-8: #433e52;
    --tina-color-grey-9: #363145;
    --tina-color-grey-10: #252336;
    --tina-color-indicator: var(--tina-color-primary);

    --tina-radius-small: 5px;
    --tina-radius-big: 24px;

    --tina-padding-small: 12px;
    --tina-padding-big: 20px;

    --tina-font-size-0: 12px;
    --tina-font-size-1: 13px;
    --tina-font-size-2: 15px;
    --tina-font-size-3: 16px;
    --tina-font-size-4: 18px;
    --tina-font-size-5: 20px;
    --tina-font-size-6: 22px;
    --tina-font-size-7: 26px;
    --tina-font-size-8: 32px;

    --tina-font-family: 'Inter', sans-serif;

    --tina-font-weight-regular: 400;
    --tina-font-weight-bold: 600;

    --tina-shadow-big: 0px 2px 3px rgba(0, 0, 0, 0.05),
      0 4px 12px rgba(0, 0, 0, 0.1);
    --tina-shadow-small: 0px 2px 3px rgba(0, 0, 0, 0.12);

    --tina-timing-short: 85ms;
    --tina-timing-medium: 150ms;
    --tina-timing-long: 250ms;

    --tina-z-index-0: 0;
    --tina-z-index-1: 10;
    --tina-z-index-2: 20;
    --tina-z-index-3: 30;
    --tina-z-index-4: 40;
    --tina-z-index-5: 50;

    --tina-sidebar-width: 340px;
    --tina-sidebar-header-height: 60px;
    --tina-toolbar-height: 62px;
  }
`,kt=r.createGlobalStyle`
  ${Et};
`,Ct=e=>{var t=e,{variant:n="secondary",size:a="medium",busy:r,disabled:i,rounded:l="full",children:o,className:s}=t,c=u(t,["variant","size","busy","disabled","rounded","children","className"]);const m="icon-parent inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center inline-flex justify-center transition-all duration-150 ease-out ",p={primary:"shadow text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500",secondary:"shadow text-gray-500 hover:text-blue-500 bg-gray-50 hover:bg-white border border-gray-200",white:"shadow text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-200",ghost:"text-gray-500 hover:text-blue-500 hover:shadow border border-transparent hover:border-gray-200 bg-transparent"},g=r?"busy":i?"disabled":"default",f={disabled:"pointer-events-none\topacity-30 cursor-not-allowed",busy:"pointer-events-none opacity-70 cursor-wait",default:""},h={full:"rounded-full",left:"rounded-l-full",right:"rounded-r-full"},w={small:"text-xs h-8 px-3",medium:"text-sm h-10 px-4",custom:""};return A.createElement("button",d({className:`${m} ${p[n]} ${w[a]} ${f[g]} ${h[l]} ${s}`},c),o)},Nt=e=>{var t=e,{variant:n="secondary",size:a="medium",busy:r,disabled:i,children:l,className:o}=t,s=u(t,["variant","size","busy","disabled","children","className"]);const c="icon-parent inline-flex items-center border border-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center inline-flex justify-center transition-all duration-150 ease-out rounded-full ",m={primary:"shadow text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500",secondary:"shadow text-gray-500 hover:text-blue-500 bg-gray-50 hover:bg-white border border-gray-200",white:"shadow text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-200",ghost:"text-gray-500 hover:text-blue-500 hover:shadow border border-transparent hover:border-gray-200 bg-transparent"},p=r?"busy":i?"disabled":"default",g={disabled:"pointer-events-none\topacity-30 cursor-not-allowed",busy:"pointer-events-none opacity-70 cursor-wait",default:""},f={small:"h-7 w-7",medium:"h-9 w-9",custom:""};return A.createElement("button",d({className:`${c} ${m[n]} ${f[a]} ${g[p]} ${o}`},s),l)};function Lt(e){var t=e,{Component:n,props:a}=t,r=u(t,["Component","props"]);return m(d({__type:"screen",layout:"popup"},r),{Component:e=>j.default.createElement(n,d(d({},e),a))})}const Mt="useCMS could not find an instance of CMS",zt=A.createContext(null);function Ht(){const e=A.useContext(zt);if(!e)throw new Error(Mt);const[,t]=A.useState(e.enabled);return A.useEffect((()=>e.events.subscribe("cms",(()=>{t(e.enabled)}))),[e]),e}class Tt{constructor(e){var t=e,{id:n,label:a,fields:r,actions:i,buttons:l,reset:s,loadInitialValues:c,onChange:p}=t,g=u(t,["id","label","fields","actions","buttons","reset","loadInitialValues","onChange"]);this.loading=!1,this.subscribe=(e,t)=>this.finalForm.subscribe(e,t),this.handleSubmit=async(e,t,n)=>{try{const a=await this.onSubmit(e,t,n);return t.initialize(e),a}catch(a){return{[o.FORM_ERROR]:a}}},this.submit=()=>this.finalForm.submit();const f=g.initialValues||{};if(this.__type=g.__type||"form",this.id=n,this.label=a,this.fields=r||[],this.onSubmit=g.onSubmit,this.finalForm=o.createForm(m(d({},g),{initialValues:f,onSubmit:this.handleSubmit,mutators:d(m(d({},K.default),{setFieldData:G.default}),g.mutators)})),this._reset=s,this.actions=i||[],this.buttons=l||{save:"Save",reset:"Reset"},this.updateFields(this.fields),c&&(this.loading=!0,c().then((e=>{this.updateInitialValues(e)})).finally((()=>{this.loading=!1}))),p){let e=!0;this.subscribe((t=>{e?e=!1:p(t)}),{values:!0})}}get name(){return this.id}get values(){if(!this.loading)return this.finalForm.getState().values||this.initialValues}get initialValues(){return this.finalForm.getState().initialValues}get pristine(){return this.finalForm.getState().pristine}get dirty(){return this.finalForm.getState().dirty}get submitting(){return this.finalForm.getState().submitting}get valid(){return this.finalForm.getState().valid}async reset(){this._reset&&await this._reset(),this.finalForm.reset()}updateFields(e){this.fields=e}change(e,t){return this.finalForm.change(e,t)}get mutators(){return this.finalForm.mutators}updateValues(e){this.finalForm.batch((()=>{this.finalForm.getState().active?Ft(this.finalForm,e):St(this.finalForm,e)}))}updateInitialValues(e){this.finalForm.batch((()=>{const t=this.values||{};this.finalForm.initialize(e),this.finalForm.getState().active?Ft(this.finalForm,t):St(this.finalForm,t)}))}}function St(e,t){Object.entries(t).forEach((([t,n])=>{e.change(t,n)}))}function Ft(e,t,n){const a=e.getState().active;Object.entries(t).forEach((([t,r])=>{const i=n?`${n}.${t}`:t;"object"===typeof r?"string"===typeof a&&a.startsWith(i)?Ft(e,r,i):e.change(i,r):i!==a&&e.change(i,r)}))}const Pt=Bt;function Bt(e){const t=Ht();let n;n=Array.isArray(e)?e:[e],A.useEffect((()=>(n.forEach((e=>{e&&t.plugins.add(e)})),()=>{n.forEach((e=>{e&&t.plugins.remove(e)}))})),[t.plugins,...n])}function _t(e,t,n){const a=Ht();A.useEffect((function(){return a.events.subscribe(e,t)}),n)}const Vt=_t;function It(e){const t=Ht();return{dispatch:n=>t.events.dispatch(m(d({},n),{type:e})),subscribe:n=>t.events.subscribe(e,n)}}function Rt(e,t={}){const[n,a]=Ot(e,t);return Bt(a),[n,a]}function Ot(e,t={}){var n=e,{loadInitialValues:a}=n,r=u(n,["loadInitialValues"]);r.initialValues=r.initialValues||t.values;const[,i]=A.useState(r.initialValues),[l,o]=A.useState((()=>$t(r,(e=>{i(e.values)}))));A.useEffect((function(){l.id!==r.id&&o($t(r,(e=>{i(e.values)})))}),[r.id]);const[s,c]=A.useState((()=>!!a)),d=A.useCallback((async()=>{a&&(c(!0),await a().then((e=>{l.updateInitialValues(e)})).finally((()=>{c(!1)})))}),[l,c]);return A.useEffect((()=>{d()}),[l,d]),_t("unstable:reload-form-data",(async()=>{await d(),await l.reset()}),[d,l]),Dt(l,t.fields),At(l,t.label),jt(l,t.values),[l?l.values:r.initialValues,l,s]}function $t(e,t){const n=new Tt(e);return n.subscribe(t,{values:!0}),n}function Dt(e,t){A.useEffect((()=>{"undefined"!==typeof t&&e.updateFields(t)}),[e,t])}function At(e,t){A.useEffect((()=>{"undefined"!==typeof t&&(e.label=t)}),[e,t])}function jt(e,t){A.useEffect((()=>{"undefined"!==typeof t&&e.updateValues(t)}),[e,t])}function Zt(e,t){const[,n]=A.useState(0);A.useEffect((()=>e.subscribe((()=>{n((e=>e+1)),t&&t()}))))}function Kt(e,n){t.useEffect((()=>{if(!e)return;let t=!0;return e.subscribe((e=>{t?t=!1:n(e)}),{values:!0})}),[n,e])}function Gt(e,t){return n=>(Pt(t),A.createElement(e,d({},n)))}const Ut=Gt;function Yt(e,n){Bt(t.useMemo((()=>Lt(e)),n))}const Wt=({screen:e,close:t})=>A.createElement(qt,{name:e.name,close:t,layout:e.layout},A.createElement(e.Component,{close:t})),qt=({children:e,name:t,close:n,layout:a})=>{let r;switch(a){case"popup":default:r=st;break;case"fullscreen":r=it}return A.createElement(ne,null,A.createElement(r,null,A.createElement(et,{close:n},t),A.createElement(re,null,e)))},Xt="shadow-inner focus:shadow-outline focus:border-blue-500 block text-base px-3 py-2 text-gray-600 w-full bg-white border border-gray-200 focus:text-gray-900 rounded-md",Jt=e=>{var t=u(e,[]);return A.createElement("input",d({type:"text",className:Xt},t))},Qt=e=>{var t=u(e,[]);return A.createElement("textarea",m(d({className:"shadow-inner text-base px-3 py-2 text-gray-600 resize-y focus:shadow-outline focus:border-blue-500 block w-full border-gray-200 focus:text-gray-900 rounded-md"},t),{style:{minHeight:"160px"}}))},en=e=>{var t=e,{onDismiss:n,escape:a,click:r,disabled:i,allowClickPropagation:l,document:o}=t,s=u(t,["onDismiss","escape","click","disabled","allowClickPropagation","document"]);const c=tn({onDismiss:n,escape:a,click:r,disabled:i,allowClickPropagation:l,document:o});return A.createElement("div",d({ref:c},s))};function tn({onDismiss:e,escape:n=!1,click:a=!1,disabled:r=!1,allowClickPropagation:i=!1,document:l}){const o=t.useRef();return t.useEffect((()=>{const t=l?[document,l]:[document],s=e=>{e.stopPropagation(),e.stopImmediatePropagation(),e.preventDefault()},c=t=>{r||o.current.contains(t.target)||(console.log("did not click main content",t.target,o.current),i||s(t),e(t))},d=t=>{r||27===t.keyCode&&(t.stopPropagation(),e(t))};return a&&t.forEach((e=>e.body.addEventListener("click",c))),n&&t.forEach((e=>e.addEventListener("keydown",d))),()=>{t.forEach((e=>{e.body.removeEventListener("click",c),e.removeEventListener("keydown",d)}))}}),[a,l,n,r,e]),o}var nn,an;(an=nn||(nn={})).Hex="hex",an.RGB="rgb";const rn=function(e){return"#"+((1<<24)+(e.r<<16)+(e.g<<8)+e.b).toString(16).slice(1)};function ln(e){if(!e)return null;const t=c.get(e);if(!t)return null;const n=t.value;return{r:n[0],g:n[1],b:n[2],a:n[3]}}const on={[nn.RGB]:{getLabel:e=>`R${e.r} G${e.g} B${e.b}`,getValue(e){const t=[e.r,e.g,e.b,e.a];return c.to.rgb(t)},parse:ln},[nn.Hex]:{getLabel:e=>rn(e),getValue(e){const t=[e.r,e.g,e.b,e.a];return c.to.hex(t)},parse:ln}};function sn({form:e,fields:t}){const n=Ht(),[a,r]=A.useState([]),i=A.useCallback((()=>{const e=n.plugins.getType("field").all();r(e)}),[r]);return A.useEffect((()=>i()),[]),Vt("plugin:add:field",(()=>i()),[]),A.createElement(dn,null,t.map((t=>A.createElement(cn,{field:t,form:e,fieldPlugins:a}))))}const cn=({field:e,form:t,fieldPlugins:n})=>{if(A.useEffect((()=>{t.mutators.setFieldData(e.name,{tinaField:e})}),[t,e]),null===e.component)return null;const a=n.find((t=>t.name===e.component));let r;a&&a.type&&(r=a.type);const i=mn("parse",e,a),l=mn("validate",e,a);let o=e.format;!o&&a&&a.format&&(o=a.format);let s=e.defaultValue;return!i&&a&&a.defaultValue&&(s=a.defaultValue),A.createElement(p.Field,{name:e.name,key:e.name,type:r,parse:i?(t,n)=>i(t,n,e):void 0,format:o?(t,n)=>o(t,n,e):void 0,defaultValue:s,validate:(t,n,a)=>{if(l)return l(t,n,a,e)}},(n=>"string"!==typeof e.component&&null!==e.component?A.createElement(e.component,m(d({},n),{form:t.finalForm,tinaForm:t,field:e})):a?A.createElement(a.Component,m(d({},n),{form:t.finalForm,tinaForm:t,field:e})):A.createElement("p",null,"Unrecognized field type")))},dn=Z.default.div`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  white-space: nowrap;
  overflow-x: visible !important;
`;function mn(e,t,n){let a=t[e];return!a&&n&&n[e]&&(a=n[e]),a}const un=p.Form,pn=({form:e,children:t})=>{const[n,a]=A.useState(0);return A.useEffect((()=>{a((e=>e+1))}),[e]),A.createElement(un,{form:e.finalForm,key:`${n}: ${e.id}`},t)},gn=A.createContext(!1);function fn({form:e,children:n}){const[a,r]=t.useState(!1);return e?A.createElement(gn.Provider,{value:a},A.createElement(pn,{form:e},(()=>n({isEditing:a,setIsEditing:r})))):A.createElement(gn.Provider,{value:a},n({isEditing:a,setIsEditing:r}))}function hn(e){var n=e,{Component:a,children:r}=n,i=u(n,["Component","children"]);return t.useContext(gn)?A.createElement(p.Field,d({},i),(({input:e,meta:t})=>A.createElement(a,d({input:e,meta:t},i)))):r||null}hn.propTypes={name:U.default.string,type:U.default.string,Component:U.default.any.isRequired,children:U.default.any};const wn=({dotSize:e=8,color:t="white"})=>A.createElement("div",null,A.createElement(bn,{dotSize:e,color:t}),A.createElement(bn,{dotSize:e,color:t}),A.createElement(bn,{dotSize:e,color:t})),vn=r.keyframes`
  0% { transform: scale(0.1); }
  50% { transform: scale(1); }
  90% { transform: scale(0.1); }
  100% { transform: scale(0.1); }
`,bn=Z.default.span`
  animation: ${vn} 2s linear infinite;
  display: inline-block;
  margin-right: 4px;
  :nth-child(2) {
    animation-delay: 0.3s;
  }
  :nth-child(3) {
    animation-delay: 0.5s;
  }
  ${({color:e,dotSize:t})=>r.css`
      background: ${e};
      width: ${t}px;
      height: ${t}px;
      border-radius: ${t}px;
    `}
`,xn=A.createContext((()=>null));function yn(){return t.useContext(xn)}const En=({children:e})=>{const t=A.useRef(null),n=A.useRef(0),r=A.useCallback((e=>t.current?a.createPortal(e.children({zIndexShift:n.current+=1}),t.current):null),[t,n]);return A.createElement(xn.Provider,{value:r},A.createElement("div",{ref:t,style:{position:"relative",width:"100%",flex:"1 1 0%",overflow:"hidden"}},e))},kn=e=>{var t=e,{pristine:n,reset:a,children:r}=t,i=u(t,["pristine","reset","children"]);const[l,o]=A.useState(!1);return A.createElement(A.Fragment,null,A.createElement(Ct,d({onClick:()=>{o((e=>!e))},disabled:n},i),r),l&&A.createElement(Cn,{reset:a,close:()=>o(!1)}))},Cn=({close:e,reset:t})=>A.createElement(ne,null,A.createElement(st,null,A.createElement(et,{close:e},"Reset"),A.createElement(re,{padded:!0},A.createElement("p",null,"Are you sure you want to reset all changes?")),A.createElement(ae,null,A.createElement(Ct,{style:{flexGrow:2},onClick:e},"Cancel"),A.createElement(Ct,{style:{flexGrow:3},variant:"primary",onClick:async()=>{await t(),e()}},"Reset")))),Nn=({actions:e,form:n})=>{const[a,r]=t.useState(!1);return A.createElement(A.Fragment,null,A.createElement(Ln,{onClick:()=>r((e=>!e))}),A.createElement(Mn,{open:a},A.createElement(en,{click:!0,escape:!0,disabled:!a,onDismiss:()=>{r((e=>!e))}},e.map(((e,t)=>A.createElement(e,{form:n,key:t}))))))},Ln=Z.default((e=>A.createElement("button",d({},e),A.createElement(de,null))))`
  height: 64px;
  width: 40px;
  align-self: stretch;
  background-color: transparent;
  background-position: center;
  background-size: auto 18px;
  background-repeat: no-repeat;
  border: 0;
  margin: 0 -16px 0 8px;
  outline: none;
  cursor: pointer;
  transition: opacity 85ms ease-out;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    background-color: var(--tina-color-grey-1);
    fill: var(--tina-color-grey-8);
  }
`,Mn=Z.default.div`
  min-width: 192px;
  border-radius: var(--tina-radius-big);
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  bottom: var(--tina-padding-big);
  right: var(--tina-padding-big);
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 85ms ease-out;
  transform-origin: 100% 100%;
  box-shadow: var(--tina-shadow-big);
  background-color: white;
  overflow: hidden;
  z-index: var(--tina-z-index-1);
  ${e=>e.open&&r.css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, -28px, 0) scale3d(1, 1, 1);
    `};
`,zn=Z.default.button`
  position: relative;
  text-align: center;
  font-size: var(--tina-font-size-1);
  padding: 0 12px;
  height: 40px;
  font-weight: var(--tina-font-weight-regular);
  width: 100%;
  background: none;
  cursor: pointer;
  outline: none;
  border: 0;
  transition: all var(--tina-timing-medium) ease-out;
  &:hover {
    color: var(--tina-color-primary);
    background-color: var(--tina-color-grey-1);
  }
  &:not(:last-child) {
    border-bottom: 1px solid var(--tina-color-grey-2);
  }
`,Hn=()=>A.createElement(In,null,A.createElement(_n,null,"\ud83e\udd14"),A.createElement("h3",null,"Hey, you don't have any fields added to this form."),A.createElement("p",null,A.createElement(Rn,{href:"https://tinacms.org/docs/fields",target:"_blank"},A.createElement(_n,null,"\ud83d\udcd6")," Field Setup Guide"))),Tn=e=>{var t=e,{form:n,onPristineChange:a}=t;const r=!!u(t,["form","onPristineChange"]).hideFooter,[i,l]=A.useState(0);A.useEffect((()=>{l((e=>e+1))}),[n]);const o=n.finalForm,s=A.useCallback((e=>{if(!e.destination||!o)return;const t=e.type;o.mutators.move(t,e.source.index,e.destination.index)}),[n]);return A.useEffect((()=>{const e=e=>{e.preventDefault(),e.returnValue=""},t=o.subscribe((({pristine:t})=>{a&&a(t),t?window.removeEventListener("beforeunload",e):window.addEventListener("beforeunload",e)}),{pristine:!0});return()=>{window.removeEventListener("beforeunload",e),t()}}),[o]),Bn({finalForm:o,tinaForm:n}),A.createElement(p.Form,{form:o,key:`${i}: ${n.id}`,onSubmit:n.onSubmit},(({handleSubmit:e,pristine:t,invalid:a,submitting:i})=>A.createElement(A.Fragment,null,A.createElement(f.DragDropContext,{onDragEnd:s},A.createElement(En,null,A.createElement(Pn,{id:n.id},n&&n.fields.length?A.createElement(sn,{form:n,fields:n.fields}):A.createElement(Hn,null))),!r&&A.createElement("div",{className:"relative flex-none w-full h-16 px-6 bg-white border-t border-gray-100\tflex items-center justify-center"},A.createElement("div",{className:"flex-1 w-full flex justify-between gap-4 items-center max-w-form"},n.reset&&A.createElement(kn,{pristine:t,reset:async()=>{o.reset(),await n.reset()},style:{flexGrow:1}},n.buttons.reset),A.createElement(Ct,{onClick:()=>e(),disabled:t||i||a,busy:i,variant:"primary",style:{flexGrow:3}},i&&A.createElement(wn,null),!i&&n.buttons.save),n.actions.length>0&&A.createElement(Nn,{form:n,actions:n.actions})))))))},Sn=({form:e,label:t})=>{const[n,a]=A.useState(0);A.useEffect((()=>{a((e=>e+1))}),[e]);const r=e.finalForm,i=A.useCallback((e=>{if(!e.destination||!r)return;const t=e.type;r.mutators.move(t,e.source.index,e.destination.index)}),[e]);return A.createElement(J,null,A.createElement(p.Form,{form:r,key:`${n}: ${e.id}`,onSubmit:e.onSubmit},(({handleSubmit:n,pristine:a,invalid:l,submitting:o})=>A.createElement(f.DragDropContext,{onDragEnd:i},A.createElement("div",{className:"w-full h-screen flex flex-col items-center"},A.createElement("div",{className:"px-6 py-4 w-full bg-white border-b border-gray-150 shadow-sm sticky flex flex-wrap gap-x-6 gap-y-3 justify-between items-center"},t&&A.createElement("h4",{className:"font-bold text-lg opacity-80"},t),A.createElement("div",{className:"flex flex-1 gap-4 items-center justify-end"},A.createElement(Fn,{pristine:a}),e.reset&&A.createElement(kn,{pristine:a,reset:async()=>{r.reset(),await e.reset()},style:{flexBasis:"7rem"}},e.buttons.reset),A.createElement(Ct,{onClick:()=>n(),disabled:a||o||l,busy:o,variant:"primary",style:{flexBasis:"10rem"}},o&&A.createElement(wn,null),!o&&e.buttons.save),e.actions.length>0&&A.createElement(Nn,{form:e,actions:e.actions}))),A.createElement(En,null,A.createElement(Pn,{id:e.id},e&&e.fields.length?A.createElement(sn,{form:e,fields:e.fields}):A.createElement(Hn,null))))))))},Fn=({pristine:e})=>A.createElement("div",{className:"flex flex-0 items-center"},!e&&A.createElement(A.Fragment,null,A.createElement("span",{className:"w-3 h-3 flex-0 rounded-full bg-yellow-400 border border-yellow-500 mr-2"})," ",A.createElement("p",{className:"text-gray-700 text-sm leading-tight whitespace-nowrap"},"Unsaved Changes")),e&&A.createElement(A.Fragment,null,A.createElement("span",{className:"w-3 h-3 flex-0 rounded-full bg-green-300 border border-green-400 mr-2"})," ",A.createElement("p",{className:"text-gray-500 text-sm leading-tight whitespace-nowrap"},"No Changes"))),Pn=({children:e,id:t})=>A.createElement("div",{"data-test":`form:${t}`,className:"h-full overflow-y-auto max-h-full bg-gray-50 pt-6 px-6 pb-2"},A.createElement("div",{className:"w-full flex justify-center"},A.createElement("div",{className:"w-full max-w-form"},e))),Bn=({finalForm:e,tinaForm:t})=>{const[n,a]=A.useState({}),[r,i]=A.useState(null),{subscribe:l}=e;A.useEffect((()=>{l((({values:e})=>{a(e)}),{values:!0})}),[l,a]);const s=Ht();A.useEffect((()=>{if("reset"===(null==r?void 0:r.name))s.events.dispatch({type:"forms:reset",value:null,mutationType:r.mutationType,formId:t.id}),i(null);else if(null==r?void 0:r.name){const e=r.field.value,a=o.getIn(n,null==r?void 0:r.name);s.events.dispatch({type:"forms:fields:onChange",value:a,previousValue:e,mutationType:r.mutationType,formId:t.id,field:r.field}),i(null)}}),[JSON.stringify(n),s]);const{change:c,reset:m}=e,p=e.mutators,{insert:g,move:f,remove:h}=p,w=u(p,["insert","move","remove"]),v=(t,n)=>{i({name:t,field:e.getFieldState(t),mutationType:n})};A.useMemo((()=>{e.reset=e=>(v("reset",{type:"reset"}),m(e)),e.change=(e,t)=>(v(e.toString(),{type:"change"}),c(e,t)),e.mutators=d({insert:(...e)=>{v(e[0],{type:"insert",at:e[1]}),g(...e)},move:(...e)=>{v(e[0],{type:"move",from:e[1],to:e[2]}),f(...e)},remove:(...e)=>{v(e[0],{type:"remove",at:e[1]}),h(...e)}},w)}),[JSON.stringify(n)])},_n=Z.default.span`
  font-size: 40px;
  line-height: 1;
  display: inline-block;
`,Vn=r.keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`,In=Z.default.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--tina-padding-big) var(--tina-padding-big) 64px
    var(--tina-padding-big);
  width: 100%;
  height: 100%;
  overflow-y: auto;
  animation-name: ${Vn};
  animation-delay: 300ms;
  animation-timing-function: ease-out;
  animation-iteration-count: 1;
  animation-fill-mode: both;
  animation-duration: 150ms;
  > *:first-child {
    margin: 0 0 var(--tina-padding-big) 0;
  }
  > ${_n} {
    display: block;
  }
  h3 {
    font-size: var(--tina-font-size-5);
    font-weight: normal;
    display: block;
    margin: 0 0 var(--tina-padding-big) 0;
    ${_n} {
      font-size: 1em;
    }
  }
  p {
    display: block;
    margin: 0 0 var(--tina-padding-big) 0;
  }
`,Rn=Z.default.a`
  text-align: center;
  border: 0;
  border-radius: var(--tina-radius-big);
  border: 1px solid var(--tina-color-grey-2);
  box-shadow: var(--tina-shadow-small);
  font-weight: var(--tina-font-weight-regular);
  cursor: pointer;
  font-size: var(--tina-font-size-0);
  transition: all var(--tina-timing-short) ease-out;
  background-color: white;
  color: var(--tina-color-grey-8);
  padding: var(--tina-padding-small) var(--tina-padding-big)
    var(--tina-padding-small) 56px;
  position: relative;
  text-decoration: none;
  display: inline-block;
  ${_n} {
    font-size: 24px;
    position: absolute;
    left: var(--tina-padding-big);
    top: 50%;
    transform-origin: 50% 50%;
    transform: translate3d(0, -50%, 0);
    transition: all var(--tina-timing-short) ease-out;
  }
  &:hover {
    color: var(--tina-color-primary);
    ${_n} {
      transform: translate3d(0, -50%, 0);
    }
  }
`,On=function(e){return!e||.299*e.r+.587*e.g+.114*e.b>186?"#000000":"#ffffff"},$n=Z.default((e=>{var t=e,{colorRGBA:n,colorFormat:a,unselectable:r}=t,i=u(t,["colorRGBA","colorFormat","unselectable"]);return A.createElement("div",d({},i),A.createElement("div",{className:"swatch-inner"},n?on[a].getLabel(n):"Click to add color"))}))`
  background: var(--tina-color-grey-2);
  border-radius: var(--tina-radius-big);
  box-shadow: var(--tina-shadow-small);
  cursor: pointer;
  width: 100%;
  margin: 0;

  > div {
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: var(--tina-font-size-1);
    font-weight: bold;

    width: 100%;
    height: 40px;
    border-radius: var(--tina-radius-big);
    box-shadow: inset 0 0 1px 1px rgba(0, 0, 0, 0.075);
    background: ${e=>e.colorRGBA?`rgba(${e.colorRGBA.r}, ${e.colorRGBA.g}, ${e.colorRGBA.b}, ${e.colorRGBA.a})`:"#fff"};
    color: ${e=>On(e.colorRGBA)};
    transition: all var(--tina-timing-short) ease-out;
  }

  &:hover {
    > div {
      opacity: 0.6;
    }
  }
`,Dn=r.keyframes`
  0% {
    transform: translate3d(-50%, 0, 0) scale3d(0.5,0.5,1)
  }
  100% {
    transform: translate3d(-50%, 8px, 0) scale3d(1, 1, 1);
  }
`,An=r.keyframes`
  0% {
    transform: translate3d(-50%, -100%, 0) scale3d(0.5,0.5,1)
  }
  100% {
    transform: translate3d(-50%, calc(-100% - 8px), 0) scale3d(1, 1, 1);
  }
`,jn=Z.default.div`
  position: fixed;
  top: ${e=>e.triggerBoundingBox?e.triggerBoundingBox.bottom:"0"}px;
  left: ${e=>e.triggerBoundingBox?e.triggerBoundingBox.left+e.triggerBoundingBox.width/2:"0"}px;
  transform: translate3d(-50%, 8px, 0) scale3d(1, 1, 1);
  transform-origin: 50% 0;
  animation: ${Dn} 85ms ease-out both 1;
  z-index: var(--tina-z-index-5);

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    margin-top: 1px;
    transform: translate3d(-50%, -100%, 0);
    width: 18px;
    height: 14px;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    background-color: var(--tina-color-grey-3);
    z-index: var(--tina-z-index-1);
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    margin-top: 2px;
    transform: translate3d(-50%, -100%, 0);
    width: 16px;
    height: 13px;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    background-color: white;
    z-index: var(--tina-z-index-2);
  }

  ${e=>e.openTop&&r.css`
      top: ${e.triggerBoundingBox?e.triggerBoundingBox.top:"0"}px;
      transform: translate3d(-50%, calc(-100% - 8px), 0) scale3d(1, 1, 1);
      animation: ${An} 85ms ease-out both 1;
      transform-origin: 50% 100%;

      &:before,
      &:after {
        top: auto;
        bottom: 0;
        transform: translate3d(-50%, 100%, 0);
        clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
      }

      &:before {
        margin-top: 0;
        margin-bottom: 1px;
      }

      &:after {
        margin-top: 0;
        margin-bottom: 2px;
      }
    `};
`,Zn=Z.default.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: var(--tina-z-index-1);
`,Kn=Z.default.div`
  position: relative;
`,Gn="transparent",Un=["#D0021B","#F5A623","#F8E71C","#8B572A","#7ED321","#417505","#BD10E0","#9013FE","#4A90E2","#50E3C2","#B8E986","#000000","#4A4A4A","#9B9B9B","#FFFFFF"],Yn={sketch:e=>A.createElement(s.SketchPicker,{presetColors:e.presetColors,color:e.color,onChange:e.onChange,disableAlpha:e.disableAlpha,width:e.width}),block:e=>A.createElement(s.BlockPicker,{colors:e.presetColors,color:e.color,onChange:e.onChange,width:e.width})},Wn=({colorFormat:e,userColors:n=Un,widget:a="sketch",input:r})=>{const i=yn(),l=A.useRef(null),[o,s]=t.useState(null),[c,u]=t.useState(!1),p=()=>{l.current&&s(l.current.getBoundingClientRect())};A.useEffect((()=>{if(o){const e=o.top+o.height/2,t=window.innerHeight;u(e>t/2)}}),[o]),A.useEffect((()=>{const e=100;let t=!1;setTimeout((()=>{p()}),e);const n=()=>{clearTimeout(t),t=setTimeout(p,e)};return window.addEventListener("resize",n),()=>{window.removeEventListener("resize",n)}}),[l.current]);const g=Yn[a];if(!g)throw new Error("You must specify a widget type.");const[f,h]=t.useState(!1),w=(e||nn.Hex).toLowerCase(),v=r.value?on[w].parse(r.value):null,b=e=>{const t=e.hex===Gn?null:m(d({},e.rgb),{a:1});r.onChange(t?on[w].getValue(t):null)},x=e=>{e.stopPropagation();const t=!f;h(t),t&&p()};return A.createElement(Kn,{ref:l},A.createElement($n,{onClick:x,colorRGBA:v,colorFormat:w}),f&&A.createElement(i,null,(({zIndexShift:e})=>A.createElement(jn,{openTop:c,triggerBoundingBox:o,style:{zIndex:5e3+e}},A.createElement(en,{click:!0,escape:!0,disabled:!f,onDismiss:x},A.createElement(g,{presetColors:[...n,Gn],color:v||{r:0,g:0,b:0,a:0},onChange:b,disableAlpha:!0,width:"240px"}))))))},qn=({input:e,field:t,name:n,disabled:a=!1})=>{const r=!(!e.value&&!e.checked);let i=null;if(t.toggleLabels){const e="object"===typeof t.toggleLabels&&"true"in t.toggleLabels&&"false"in t.toggleLabels&&t.toggleLabels;i={true:e?e.true:"Yes",false:e?e.false:"No"}}return A.createElement(Xn,null,i&&A.createElement("span",null,i.false),A.createElement(Jn,{hasToggleLabels:null!==i},A.createElement(ta,d({id:n,type:"checkbox"},e)),A.createElement(Qn,{htmlFor:n,role:"switch",disabled:a},A.createElement(ea,{checked:r},A.createElement("span",null)))),i&&A.createElement("span",null,i.true))},Xn=Z.default.div`
  display: flex;
  align-items: center;

  > span {
    color: var(--tina-color-grey-8);
  }
`,Jn=Z.default.div`
  position: relative;
  width: 48px;
  height: 28px;
  margin: ${e=>e.hasToggleLabels?"0 10px":"0"};
`,Qn=Z.default.label`
  background: none;
  padding: 0;
  opacity: ${e=>e.disabled?"0.4":"1"};
  outline: none;
  width: 48px;
  height: 28px;
  pointer-events: ${e=>e.disabled?"none":"inherit"};
`,ea=Z.default.div`
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
    background: ${e=>e.checked?"var(--tina-color-primary)":"var(--tina-color-grey-4)"};
    border: 1px solid
      ${e=>e.checked?"var(--tina-color-primary-dark)":"var(--tina-color-grey-5)"};
    transform: translate3d(${e=>e.checked?"20px":"0"}, -50%, 0);
    transition: all 150ms ease-out;
    box-shadow: var(--tina-shadow-big);
  }
`,ta=e=>{var t=e,{disabled:n}=t,a=u(t,["disabled"]);return A.createElement("input",d({className:"absolute left-0 top-0 w-12 h-8 opacity-0 m-0 "+(n?"cursor-not-allowed pointer-events-none":"cursor-pointer z-20")},a))};var na={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},aa=j.default.createContext&&j.default.createContext(na),ra=function(){return ra=Object.assign||function(e){for(var t,n=1,a=arguments.length;n<a;n++)for(var r in t=arguments[n])Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e},ra.apply(this,arguments)},ia=function(e,t){var n={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var r=0;for(a=Object.getOwnPropertySymbols(e);r<a.length;r++)t.indexOf(a[r])<0&&Object.prototype.propertyIsEnumerable.call(e,a[r])&&(n[a[r]]=e[a[r]])}return n};function la(e){return e&&e.map((function(e,t){return j.default.createElement(e.tag,ra({key:t},e.attr),la(e.child))}))}function oa(e){return function(t){return j.default.createElement(sa,ra({attr:ra({},e.attr)},t),la(e.child))}}function sa(e){var t=function(t){var n,a=e.attr,r=e.size,i=e.title,l=ia(e,["attr","size","title"]),o=r||t.size||"1em";return t.className&&(n=t.className),e.className&&(n=(n?n+" ":"")+e.className),j.default.createElement("svg",ra({stroke:"currentColor",fill:"currentColor",strokeWidth:"0"},t.attr,a,l,{className:n,style:ra(ra({color:e.color||t.color},t.style),e.style),height:o,width:o,xmlns:"http://www.w3.org/2000/svg"}),i&&j.default.createElement("title",null,i),e.children)};return void 0!==aa?j.default.createElement(aa.Consumer,null,(function(e){return t(e)})):t(na)}function ca(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",d:"M0 0h24v24H0V0z"}},{tag:"path",attr:{d:"M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"}}]})(e)}function da(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",d:"M0 0h24v24H0V0z"}},{tag:"path",attr:{d:"M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46a.5.5 0 00-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.488.488 0 0014 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1a.566.566 0 00-.18-.03c-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46a.5.5 0 00.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"}}]})(e)}function ma(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",d:"M0 0h24v24H0V0z"}},{tag:"path",attr:{d:"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"}}]})(e)}function ua(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",d:"M0 0h24v24H0V0z"}},{tag:"path",attr:{d:"M20 4v12H8V4h12m0-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 9.67l1.69 2.26 2.48-3.1L19 15H9zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"}}]})(e)}function pa(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",d:"M0 0h24v24H0V0z",opacity:".87"}},{tag:"path",attr:{d:"M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z"}}]})(e)}const ga="shadow appearance-none bg-white text-gray-600 block pl-3 pr-7 py-2 truncate w-full text-base cursor-pointer border-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md",fa=({input:e,field:t,options:n})=>{const a=n||t.options;return A.createElement("div",{className:"relative group"},A.createElement("select",d({id:e.name,value:e.value,onChange:e.onChange,className:ga},e),a?a.map(ha).map(wa):A.createElement("option",null,e.value)),A.createElement(ca,{className:"absolute top-1/2 right-3 w-6 h-auto -translate-y-1/2 text-gray-300 group-hover:text-blue-500 transition duration-150 ease-out"}))};function ha(e){return"object"===typeof e?e:{value:e,label:e}}function wa(e){return A.createElement("option",{key:e.value,value:e.value},e.label)}const va=({input:e,field:t,options:n})=>{const[a,r]=A.useState(null),i=n||t.options,l={};A.useEffect((()=>{r(l[`radio_${e.value}`])}),[e.value]);const o=e=>"object"===typeof e?e:{value:e,label:e},s=n=>{const a=`field-${t.name}-option-${n.value}`,r=n.value===e.value;return A.createElement(Ea,{key:n.value,variant:t.variant,ref:e=>{l[`radio_${n.value}`]=e}},A.createElement("input",{type:"radio",id:a,name:e.name,value:n.value,onChange:t=>e.onChange(t.target.value),checked:r}),A.createElement(ka,{htmlFor:a,checked:r,variant:t.variant},A.createElement(ba,{variant:t.variant},n.label)))};return A.createElement(ya,{id:e.name,direction:t.direction,variant:t.variant},"button"===t.variant&&A.createElement(xa,{width:null==a?void 0:a.offsetWidth,height:null==a?void 0:a.offsetHeight,left:null==a?void 0:a.offsetLeft,top:null==a?void 0:a.offsetTop,hasValue:!!e.value}),i?i.map(o).map(s):e.value)},ba=Z.default.span`
  ${e=>"button"===e.variant?"position: relative;":""}
`,xa=Z.default.div`
  position: absolute;
  ${e=>e.width?`width: ${e.width}px;`:""};
  ${e=>e.height?`height: ${e.width}px;`:""};
  ${e=>e.left?`left: ${e.left}px;`:""};
  ${e=>e.top?`top: ${e.top}px;`:""}
  ${e=>`transform: scale(${e.hasValue?"1":"0"});`}
  transition: all 85ms ease-out;
  backface-visibility: hidden;
  background-color: var(--tina-color-primary);
  box-shadow: var(--tina-shadow-small);
  border-radius: var(--tina-radius-big);
  height: calc(40px - 6px);
  pointer-events: none;
`,ya=Z.default.div`
  display: flex;
  padding-top: 4px;
  ${e=>"button"===e.variant?"\n    min-height: calc(40px + 2px);\n    background-color: var(--tina-color-grey-0);\n    border-radius: var(--tina-radius-big);\n    box-shadow: var(--tina-shadow-small);\n    background-color: var(--tina-color-grey-0);\n    border: 1px solid var(--tina-color-grey-2);\n    color: var(--tina-color-primary);\n    padding: 3px;\n    box-shadow: 0 0 0 0 var(--tina-color-grey-3);\n    transition: all 85ms ease-out;\n    gap: 3px;\n    &:hover {\n      box-shadow: 0 0 0 2px var(--tina-color-grey-3);\n    }\n    &:focus-within, &:active {\n      box-shadow: 0 0 0 2px var(--tina-color-primary);\n    }\n  ":"\n    gap: 12px;\n    flex-wrap: wrap;\n  "}
  ${e=>"vertical"===e.direction?"flex-direction: column;":""}
`,Ea=Z.default.div`
  ${e=>"button"===e.variant?"\n      \n    flex: 1;\n    ":""}
  & > input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
`,ka=Z.default.label`
  display: flex;
  align-items: center;
  font-size: var(--tina-font-size-1);
  ${e=>"button"===e.variant?"\n    flex: 1;\n    text-align: center;\n    border-radius: var(--tina-radius-big);\n    border: 1px solid var(--tina-color-grey-2);\n    color: var(--tina-color-primary);\n    font-weight: var(--tina-font-weight-regular);\n    cursor: pointer;\n    font-size: var(--tina-font-size-1);\n    height: calc(40px - 6px);\n    padding: 0 var(--tina-padding-small);\n    transition: all 85ms ease-out;\n    margin: 0;\n    border: none;\n    text-align: center;\n    justify-content: center;\n    input:checked + & {\n      color: var(--tina-color-grey-0);\n    }\n    &:hover {\n      background-color: var(--tina-color-grey-1);\n    }\n    &:active {\n      background-color: var(--tina-color-grey-2);\n    }\n  ":`\n  &:before {\n    content: '';\n    display: block;\n    width: 16px;\n    height: 16px;\n    margin-right: 4px;\n    border-radius: var(--tina-radius-big);\n    background-color: var(--tina-color-primary);\n    border: 1px solid var(${e=>e.checked?"--tina-color-primary":"--tina-color-grey-2"});\n    box-shadow: 0 0 0 0 var(--tina-color-grey-3), inset 0 0 0 8px white;\n    transition: all 85ms ease-out;\n  }\n  &:hover:before {\n    box-shadow: 0 0 0 2px var(--tina-color-grey-3), inset 0 0 0 8px white;\n  }\n  input:focus + &:before {\n    border: 1px solid var(--tina-color-grey-2);\n    box-shadow: 0 0 0 2px var(--tina-color-primary), inset 0 0 0 8px white;\n  }\n  input:checked + &:before {\n    border: 1px solid var(--tina-color-primary);\n    box-shadow: 0 0 0 0 var(--tina-color-primary), inset 0 0 0 4px white;\n  }\n  input:checked:focus + &:before {\n    border: 1px solid var(--tina-color-grey-2);\n    box-shadow: 0 0 0 2px var(--tina-color-primary), inset 0 0 0 4px white;\n  }\n  `}
`,Ca=({input:e,field:t,options:n,disabled:a=!1})=>{const r=n||t.options,i=e=>"object"===typeof e?e:{value:e,label:e},l=n=>{const r=`field-${t.name}-option-${n.value}`,i=!!e.value&&e.value.includes(n.value);return A.createElement(La,{key:n.value},A.createElement("input",{type:"checkbox",name:e.name,id:r,value:n.value,checked:i,disabled:a,onChange:t=>{!0===t.target.checked?e.onChange([...e.value,t.target.value]):e.onChange([...e.value.filter((e=>e!==t.target.value))])}}),A.createElement(Ma,{htmlFor:r,checked:i},!0===i?A.createElement(Qe,{className:"w-5 h-auto text-black"}):A.createElement(Je,{className:"w-5 h-auto text-black"}),A.createElement(za,null,n.label)))};return A.createElement(Na,{id:e.name},null==r?void 0:r.map(i).map(l))},Na=Z.default.div`
  display: flex;
  flex-direction: column;
  padding-top: 4px;
  min-height: calc(40px + 2px);
  background-color: var(--tina-color-grey-0);
  border-radius: var(--tina-radius-big);
  box-shadow: var(--tina-shadow-small);
  background-color: var(--tina-color-grey-0);
  border: 1px solid var(--tina-color-grey-2);
  color: var(--tina-color-primary);
  padding: 3px;
  box-shadow: 0 0 0 0 var(--tina-color-grey-3);
  transition: all 85ms ease-out;
  gap: 3px;
  &:hover {
    box-shadow: 0 0 0 2px var(--tina-color-grey-3);
  }
  &:focus-within,
  &:active {
    box-shadow: 0 0 0 2px var(--tina-color-primary);
  }
`,La=Z.default.div`
  flex: 1;

  & > input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
}
`,Ma=Z.default.label`
  display: flex;
  align-items: center;
  font-size: var(--tina-font-size-1);
  flex: 1;
  border-radius: var(--tina-radius-big);
  border: 1px solid var(--tina-color-grey-2);
  color: var(--tina-color-primary);
  font-weight: var(--tina-font-weight-regular);
  cursor: pointer;
  font-size: var(--tina-font-size-1);
  height: calc(40px - 6px);
  padding: 0 var(--tina-padding-small);
  transition: all 85ms ease-out;
  margin: 0;
  border: none;
  svg {
    margin-right: 5px;
  }
`,za=Z.default.span`
  position: relative;
`,Ha=e=>{var t=u(e,[]);return A.createElement("input",d({className:Xt},t))},Ta=({onChange:e,value:t,step:n})=>A.createElement(Ha,{type:"number",step:n,value:t,onChange:e});function Sa(){return Ht()}const Fa=Z.default.div`
  border-radius: var(--tina-radius-small);
  flex: 1;
  display: flex;
  flex-direction: column;
  outline: none;
  cursor: pointer;
`,Pa=Z.default.div`
  text-align: center;
  border-radius: var(--tina-radius-small);
  border: 1px solid var(--tina-color-grey-3);
  background-color: var(--tina-color-grey-2);
  color: var(--tina-color-grey-4);
  line-height: 1.35;
  padding: 12px 0;
  font-size: var(--tina-font-size-2);
  font-weight: var(--tina-font-weight-regular);
  transition: all 85ms ease-out;
  &:hover {
    opacity: 0.6;
  }
`,Ba=Z.default.img`
  max-width: 100%;
  min-height: 100px;
  border-radius: var(--tina-radius-small);
  transition: opacity var(--tina-timing-short) ease-out;
  margin: 0;
  display: block;
  background-color: #e1ddec;
  background-size: auto;
  background-position: center center;
  background-repeat: no-repeat;
  ${e=>{var t,n;return(null==e?void 0:e.src)&&((null==(t=null==e?void 0:e.src)?void 0:t.includes("png"))||(null==(n=null==e?void 0:e.src)?void 0:n.includes("svg")))?r.css`
          background-image: none;
        `:r.css`
          background-image: url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='40px' height='50px' viewBox='0 0 40 50' style='enable-background:new 0 0 40 50;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Cdefs%3E%3C/defs%3E%3Cpath class='st0' d='M16.09,24.97c-3.31,0.55-6.16-2.09-5.57-5.16c0.34-1.73,1.82-3.14,3.68-3.5c3.39-0.66,6.37,2.11,5.67,5.25 C19.48,23.28,17.96,24.66,16.09,24.97z M1.88,26.75c0-7.69,0-15.38,0-23.07C2,3.64,1.97,3.53,1.99,3.45c0.5-1.7,1.64-2.82,3.48-3.31 C5.57,0.12,5.71,0.14,5.75,0c7.31,0,14.63,0,21.94,0c0.03,0.1,0.12,0.08,0.2,0.1c0.96,0.2,1.77,0.63,2.47,1.28 c2.72,2.52,5.44,5.05,8.16,7.57c0.68,0.63,1.14,1.38,1.37,2.24c0.02,0.08-0.02,0.19,0.11,0.23c0,5.11,0,10.22,0,15.34h-4.76 c0-3.38,0-6.75,0-10.13c0-0.35-0.1-0.43-0.46-0.43c-3.21,0.01-6.42,0.01-9.63,0.01c-1.65,0-2.62-0.9-2.62-2.42 c0-2.94-0.01-5.89,0.01-8.83c0-0.46-0.14-0.54-0.6-0.53c-4.91,0.02-9.83,0.02-14.74,0c-0.44,0-0.57,0.09-0.57,0.52 c0.02,6.21,0.01,12.42,0.01,18.63c0,1.06,0,2.12,0,3.18H1.88z M27.28,11.46c0,0.31,0.14,0.34,0.41,0.34c2.25-0.01,4.5,0,6.75-0.01 c0.09,0,0.2,0.04,0.24,0c-2.46-2.28-4.92-4.56-7.39-6.85C27.29,7.1,27.3,9.28,27.28,11.46z M33.37,29.61c0,5.18-0.01,10.37,0,15.55 c0,0.35-0.1,0.43-0.46,0.43c-9.23-0.01-18.46-0.01-27.69,0c-0.44,0-0.45-0.17-0.45-0.48c0.01-5.17,0-10.33,0-15.5H0 c0,5.6,0,11.19,0,16.79c0.17,0.09,0.15,0.26,0.19,0.4c0.57,1.85,2.39,3.18,4.47,3.19c9.6,0.01,19.2,0.01,28.81,0 c2.08,0,3.89-1.33,4.47-3.19c0.04-0.14,0.02-0.31,0.19-0.4c0-5.6,0-11.19,0-16.79H33.37z M29.75,42.62c0.34,0,0.44-0.06,0.44-0.4 c-0.01-3.68-0.01-4.6-0.01-8.28c0-0.25-0.08-0.43-0.28-0.6c-0.62-0.55-1.22-1.13-1.83-1.69c-0.79-0.73-1.36-0.74-2.15-0.01 c-2.71,2.52-5.43,5.03-8.13,7.55c-0.26,0.25-0.39,0.24-0.65,0c-1.13-1.08-2.28-2.13-3.43-3.19c-0.7-0.65-1.31-0.65-2.01,0 c-1.16,1.07-2.31,2.15-3.48,3.22c-0.2,0.19-0.29,0.37-0.29,0.64c0.01,1.69,0.03,0.61,0,2.3c-0.01,0.41,0.14,0.46,0.53,0.46 c3.52-0.01,7.05-0.01,10.57-0.01C22.6,42.61,26.17,42.61,29.75,42.62z'/%3E%3C/svg%3E");
        `}}
`,_a=Z.default(Nt)`
  top: 8px;
  right: 8px;
  position: absolute;
  &:not(:hover) {
    fill: var(--tina-color-grey-0);
    background-color: transparent;
    border-color: transparent;
  }
`,Va=Z.default.div`
  position: relative;
  overflow: hidden;
  &:hover {
    ${Ba} {
      opacity: 0.6;
    }
  }
`,Ia=({onDrop:e,onClear:t,onClick:n,value:a,previewSrc:r,loading:i})=>{const l=Sa(),{getRootProps:o,getInputProps:s}=h.useDropzone({accept:l.media.accept||"image/*",onDrop:e,noClick:!!n});return A.createElement(Fa,m(d({},o()),{onClick:n}),A.createElement("input",d({},s())),a?A.createElement(Va,null,i?A.createElement(Oa,null):A.createElement(A.Fragment,null,A.createElement(Ba,{src:r}),t&&A.createElement(Ra,{onClick:e=>{e.stopPropagation(),t()}}))):A.createElement(Va,null,i?A.createElement(Oa,null):A.createElement(Pa,null,"Drag 'n' drop a file here,",A.createElement("br",null),"or click to select a file")))},Ra=({onClick:e})=>A.createElement(_a,{onClick:e},A.createElement(Se,{className:"w-5/6 h-auto"})),Oa=()=>A.createElement($a,null,A.createElement(wn,null)),$a=Z.default.div`
  padding: 16px;
  width: 100%;
  min-height: 96px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;function Da(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"}}]})(e)}function Aa(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M13 19v-4h3l-4-5-4 5h3v4z"}},{tag:"path",attr:{d:"M7 19h2v-2H7c-1.654 0-3-1.346-3-3 0-1.404 1.199-2.756 2.673-3.015l.581-.102.192-.558C8.149 8.274 9.895 7 12 7c2.757 0 5 2.243 5 5v1h1c1.103 0 2 .897 2 2s-.897 2-2 2h-3v2h3c2.206 0 4-1.794 4-4a4.01 4.01 0 0 0-3.056-3.888C18.507 7.67 15.56 5 12 5 9.244 5 6.85 6.611 5.757 9.15 3.609 9.792 2 11.82 2 14c0 2.757 2.243 5 5 5z"}}]})(e)}function ja(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"m7 17.013 4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.583v4.43zM18.045 4.458l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58zM9 13.417l6.03-5.973 1.586 1.586-6.029 5.971L9 15.006v-1.589z"}},{tag:"path",attr:{d:"M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2z"}}]})(e)}function Za(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M19.002 3h-14c-1.103 0-2 .897-2 2v4h2V5h14v14h-14v-4h-2v4c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.898-2-2-2z"}},{tag:"path",attr:{d:"m11 16 5-4-5-4v3.001H3v2h8z"}}]})(e)}function Ka(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M5.559 8.855c.166 1.183.789 3.207 3.087 4.079C11 13.829 11 14.534 11 15v.163c-1.44.434-2.5 1.757-2.5 3.337 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-1.58-1.06-2.903-2.5-3.337V15c0-.466 0-1.171 2.354-2.065 2.298-.872 2.921-2.896 3.087-4.079C19.912 8.441 21 7.102 21 5.5 21 3.57 19.43 2 17.5 2S14 3.57 14 5.5c0 1.552 1.022 2.855 2.424 3.313-.146.735-.565 1.791-1.778 2.252-1.192.452-2.053.953-2.646 1.536-.593-.583-1.453-1.084-2.646-1.536-1.213-.461-1.633-1.517-1.778-2.252C8.978 8.355 10 7.052 10 5.5 10 3.57 8.43 2 6.5 2S3 3.57 3 5.5c0 1.602 1.088 2.941 2.559 3.355zM17.5 4c.827 0 1.5.673 1.5 1.5S18.327 7 17.5 7 16 6.327 16 5.5 16.673 4 17.5 4zm-4 14.5c0 .827-.673 1.5-1.5 1.5s-1.5-.673-1.5-1.5.673-1.5 1.5-1.5 1.5.673 1.5 1.5zM6.5 4C7.327 4 8 4.673 8 5.5S7.327 7 6.5 7 5 6.327 5 5.5 5.673 4 6.5 4z"}}]})(e)}function Ga(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M12.707 17.293 8.414 13H18v-2H8.414l4.293-4.293-1.414-1.414L4.586 12l6.707 6.707z"}}]})(e)}function Ua(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"}}]})(e)}function Ya(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M4 21a1 1 0 0 0 .24 0l4-1a1 1 0 0 0 .47-.26L21 7.41a2 2 0 0 0 0-2.82L19.42 3a2 2 0 0 0-2.83 0L4.3 15.29a1.06 1.06 0 0 0-.27.47l-1 4A1 1 0 0 0 3.76 21 1 1 0 0 0 4 21zM18 4.41 19.59 6 18 7.59 16.42 6zM5.91 16.51 15 7.41 16.59 9l-9.1 9.1-2.11.52z"}}]})(e)}function Wa(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M10 11H7.101l.001-.009a4.956 4.956 0 0 1 .752-1.787 5.054 5.054 0 0 1 2.2-1.811c.302-.128.617-.226.938-.291a5.078 5.078 0 0 1 2.018 0 4.978 4.978 0 0 1 2.525 1.361l1.416-1.412a7.036 7.036 0 0 0-2.224-1.501 6.921 6.921 0 0 0-1.315-.408 7.079 7.079 0 0 0-2.819 0 6.94 6.94 0 0 0-1.316.409 7.04 7.04 0 0 0-3.08 2.534 6.978 6.978 0 0 0-1.054 2.505c-.028.135-.043.273-.063.41H2l4 4 4-4zm4 2h2.899l-.001.008a4.976 4.976 0 0 1-2.103 3.138 4.943 4.943 0 0 1-1.787.752 5.073 5.073 0 0 1-2.017 0 4.956 4.956 0 0 1-1.787-.752 5.072 5.072 0 0 1-.74-.61L7.05 16.95a7.032 7.032 0 0 0 2.225 1.5c.424.18.867.317 1.315.408a7.07 7.07 0 0 0 2.818 0 7.031 7.031 0 0 0 4.395-2.945 6.974 6.974 0 0 0 1.053-2.503c.027-.135.043-.273.063-.41H22l-4-4-4 4z"}}]})(e)}function qa(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z"}}]})(e)}function Xa(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"}}]})(e)}const Ja=(e,t)=>{const[n,a]=A.useState(void 0);return A.useEffect((()=>{const n=async()=>{const n=await e.api.tina.request("\n        query($id: String!) {\n          node(id:$id) {\n            ... on Document {\n              sys {\n                collection {\n                  name\n                }\n                breadcrumbs\n              }\n            }\n          }\n        }",{variables:{id:t}});a(n.node)};e&&t?n():a(void 0)}),[e,t]),n},Qa=({cms:e,id:t,children:n})=>{const a=Ja(e,t);return a?A.createElement(A.Fragment,null,n(a)):null},er=({input:e,field:t,options:n})=>{const a=Sa(),r=!1!==a.flags.get("tina-admin"),i=n||t.options;return A.createElement("div",null,A.createElement("div",{className:"relative group"},A.createElement("select",d({id:e.name,value:e.value,onChange:e.onChange,className:ga},e),i?i.map(tr).map(nr):A.createElement("option",null,e.value)),A.createElement(ca,{className:"absolute top-1/2 right-3 w-6 h-auto -translate-y-1/2 text-gray-300 group-hover:text-blue-500 transition duration-150 ease-out"})),r&&A.createElement(Qa,{cms:a,id:e.value},(e=>A.createElement("a",{href:`/admin#/collections/${e.sys.collection.name}/${e.sys.breadcrumbs.join("/")}`,className:"text-gray-700 hover:text-blue-500 flex items-center uppercase text-sm mt-2 mb-2 leading-none"},A.createElement(ja,{className:"h-5 w-auto opacity-80 mr-2"}),"Edit in CMS"))))};function tr(e){return"object"===typeof e?e:{value:e,label:e}}function nr(e){return A.createElement("option",{key:e.value,value:e.value},e.label)}function ar(e){return oa({tag:"svg",attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z"}}]})(e)}function rr(e){return t=>A.createElement(ir,{name:t.input.name,label:t.field.label,description:t.field.description,error:t.meta.error},A.createElement(e,d({},t)))}const ir=e=>{var t=e,{name:n,label:a,description:r,error:i,margin:l=!0,children:o}=t,s=u(t,["name","label","description","error","margin","children"]);const{dispatch:c}=It("field:hover"),{dispatch:m}=It("field:focus");return A.createElement(lr,d({margin:l,onMouseOver:()=>c({fieldName:n}),onMouseOut:()=>c({fieldName:null}),onClick:()=>m({fieldName:n})},s),A.createElement(or,{htmlFor:n},a||n,r&&A.createElement(sr,null,r)),o,i&&A.createElement(cr,null,i))},lr=e=>{var t=e,{margin:n,children:a}=t,r=u(t,["margin","children"]);return A.createElement("div",d({className:"relative "+(n?"mb-5":"")},r),a)},or=Z.default.label`
  all: unset;
  font-family: 'Inter', sans-serif;
  display: block;
  font-size: var(--tina-font-size-1);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.35;
  color: var(--tina-color-grey-8);
  margin-bottom: 8px;
  text-overflow: ellipsis;
  width: 100%;
  overflow: hidden;
`,sr=Z.default.span`
  all: unset;
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: var(--tina-font-size-0);
  font-style: italic;
  font-weight: lighter;
  color: var(--tina-color-grey-6);
  padding-top: 4px;
  white-space: normal;
  margin: 0;
`,cr=Z.default.span`
  display: block;
  color: red;
  font-size: var(--tina-font-size-1);
  margin-top: 8px;
  font-weight: var(--tina-font-weight-regular);
`,dr=rr((({tinaForm:e,field:t})=>{const n=Ht(),[a,r]=A.useState(!1);return A.createElement(A.Fragment,null,A.createElement(ur,{onClick:()=>{!0!==e.finalForm.getState().invalid?r((e=>!e)):n.alerts.error("Cannot navigate away from an invalid form.")}},t.label||t.name),A.createElement(mr,{isExpanded:a,setExpanded:r,field:t,tinaForm:e}))})),mr=function({setExpanded:e,isExpanded:t,tinaForm:n,field:a}){const r=Ht(),i=yn(),l=A.useMemo((()=>a.fields.map((e=>m(d({},e),{name:`${a.name}.${e.name}`})))),[a.fields,a.name]);return A.createElement(i,null,(({zIndexShift:i})=>A.createElement(hr,{isExpanded:t,style:{zIndex:i+1e3}},A.createElement(pr,{onClick:()=>{!0!==n.finalForm.getState().invalid?e(!1):r.alerts.error("Cannot navigate away from an invalid form.")}},a.label||a.name),A.createElement(gr,{id:n.id},t?A.createElement(sn,{form:n,fields:l}):null))))},ur=({onClick:e,children:t})=>A.createElement("div",{className:"pt-1 mb-5"},A.createElement("button",{onClick:e,className:"group px-4 py-3 bg-white hover:bg-gray-50 shadow focus:shadow-outline focus:border-blue-500 w-full border border-gray-100 hover:border-gray-200 text-gray-500 hover:text-blue-400 focus:text-blue-500 rounded-md flex justify-between items-center gap-2"},A.createElement("span",{className:"text-left text-base font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1"},t)," ",A.createElement(Ya,{className:"h-6 w-auto transition-opacity duration-150 ease-out opacity-80 group-hover:opacity-90"}))),pr=({onClick:e,children:t})=>A.createElement("button",{className:"relative z-40 group text-left w-full bg-white hover:bg-gray-50 py-2 border-t border-b shadow-sm\n       border-gray-100 px-6 -mt-px",onClick:e},A.createElement("div",{className:"flex items-center justify-between gap-3 text-xs tracking-wide font-medium text-gray-700 group-hover:text-blue-400 uppercase max-w-form mx-auto"},t,A.createElement(ar,{className:"h-auto w-5 inline-block opacity-70 -mt-0.5 -mx-0.5"}))),gr=({id:e,children:t})=>A.createElement("div",{style:{flex:"1 1 0%",width:"100%",overflowY:"auto",background:"var(--tina-color-grey-1)"}},A.createElement(Pn,{id:e},t)),fr=r.keyframes`
  0% {
    transform: translate3d( 100%, 0, 0 );
  }
  100% {
    transform: translate3d( 0, 0, 0 );
  }
`,hr=Z.default.div`
  position: absolute;
  width: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  z-index: var(--tina-z-index-1);
  pointer-events: ${e=>e.isExpanded?"all":"none"};

  > * {
    ${e=>e.isExpanded&&r.css`
        animation-name: ${fr};
        animation-duration: 150ms;
        animation-delay: 0;
        animation-iteration-count: 1;
        animation-timing-function: ease-out;
        animation-fill-mode: backwards;
      `};

    ${e=>!e.isExpanded&&r.css`
        transition: transform 150ms ease-out;
        transform: translate3d(100%, 0, 0);
      `};
  }
`;function wr(e){return A.createElement("div",null,"Subfield: ",e.field.label||e.field.name)}const vr={name:"group",Component:dr},br=({tinaForm:e,form:t,field:n,input:a})=>{const r=A.useCallback((()=>{let e={};e="function"===typeof n.defaultItem?n.defaultItem():n.defaultItem||{},t.mutators.insert(n.name,0,e)}),[t,n]),i=a.value||[],l=A.useCallback((e=>n.itemProps?n.itemProps(e):{}),[n.itemProps]);return A.createElement(A.Fragment,null,A.createElement(Nr,null,A.createElement(Lr,null,A.createElement(Cr,null,n.label||n.name),n.description&&A.createElement(sr,null,n.description)),A.createElement(Nt,{onClick:r,variant:"primary",size:"small"},A.createElement(ie,{className:"w-5/6 h-auto"}))),A.createElement(Mr,null,A.createElement(Hr,null,A.createElement(f.Droppable,{droppableId:n.name,type:n.name},(t=>A.createElement("div",{ref:t.innerRef},0===i.length&&A.createElement(xr,null),i.map(((t,a)=>A.createElement(yr,d({key:a,tinaForm:e,field:n,item:t,index:a},l(t))))),t.placeholder))))))},xr=()=>A.createElement(zr,null,"There are no items"),yr=e=>{var t=e,{tinaForm:n,field:a,index:r,item:i,label:l}=t,o=u(t,["tinaForm","field","index","item","label"]);const s=Ht(),c=yn(),[m,p]=A.useState(!1),g=A.useCallback((()=>{n.mutators.remove(a.name,r)}),[n,a,r]),h=l||(a.label||a.name)+" Item",{dispatch:w}=It("field:hover"),{dispatch:v}=It("field:focus");return A.createElement(f.Draggable,{type:a.name,draggableId:`${a.name}.${r}`,index:r},((e,t)=>A.createElement(A.Fragment,null,A.createElement(Tr,d(d(d({ref:e.innerRef,isDragging:t.isDragging},e.draggableProps),e.dragHandleProps),o),A.createElement(Sr,null),A.createElement(Er,{onMouseOver:()=>w({fieldName:`${a.name}.${r}`}),onMouseOut:()=>w({fieldName:null}),onClick:()=>{!0!==n.finalForm.getState().invalid?(p(!0),v({fieldName:`${a.name}.${r}`})):s.alerts.error("Cannot navigate away from an invalid form.")}},A.createElement(Cr,null,h)),A.createElement(kr,{onClick:g})),A.createElement(c,null,(({zIndexShift:e})=>A.createElement(Fr,{isExpanded:m,setExpanded:p,field:a,index:r,tinaForm:n,itemTitle:h,zIndexShift:e}))))))},Er=Z.default.div`
  flex: 1 1 0;
  min-width: 0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
`,kr=({onClick:e})=>A.createElement("button",{className:"w-8 h-10 flex items-center justify-center hover:text-red-500",onClick:e},A.createElement(Se,{className:""})),Cr=Z.default.span`
  margin: 0;
  font-size: var(--tina-font-size-1);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.35;
  flex: 1 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--tina-color-grey-8);
  transition: all 85ms ease-out;
  text-align: left;

  ${e=>e.error&&r.css`
      color: var(--tina-color-error) !important;
    `};
`,Nr=Z.default.div`
  position: relative;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  ${sr} {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`,Lr=Z.default.div`
  line-height: 1;
`,Mr=({children:e})=>A.createElement("div",{className:"relative mb-6 rounded-md bg-gray-100 shadow"},e),zr=Z.default.div`
  text-align: center;
  border-radius: var(--tina-radius-small);
  background-color: var(--tina-color-grey-2);
  color: var(--tina-color-grey-4);
  line-height: 1.35;
  padding: 12px 0;
  font-size: var(--tina-font-size-2);
  font-weight: var(--tina-font-weight-regular);
`,Hr=Z.default.div``,Tr=Z.default.div`
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  background-color: white;
  border: 1px solid var(--tina-color-grey-2) !important;
  margin: 0 0 -1px 0;
  overflow: visible;
  line-height: 1.35;
  padding: 0;
  font-size: var(--tina-font-size-2);
  font-weight: var(--tina-font-weight-regular);

  ${Cr} {
    color: var(--tina-color-grey-8);
    align-self: center;
    max-width: 100%;
  }

  svg {
    fill: var(--tina-color-grey-3);
    width: 20px;
    height: auto;
    transition: fill 85ms ease-out;
  }

  &:hover {
    svg {
      fill: var(--tina-color-grey-8);
    }
    ${Cr} {
      color: var(--tina-color-primary);
    }
  }

  &:first-child {
    border-radius: 4px 4px 0 0;
  }

  &:last-child {
    border-radius: 0 0 4px 4px;
    &:first-child {
      border-radius: var(--tina-radius-small);
    }
  }

  ${e=>e.isDragging&&r.css`
      border-radius: var(--tina-radius-small);
      box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);

      svg {
        fill: var(--tina-color-grey-8);
      }
      ${Cr} {
        color: var(--tina-color-primary);
      }

      ${Sr} {
        svg:first-child {
          opacity: 0;
        }
        svg:last-child {
          opacity: 1;
        }
      }
    `};
`,Sr=Z.default((function(e){var t=u(e,[]);return A.createElement("div",d({},t),A.createElement(ve,{className:"w-7 h-auto"}),A.createElement(_e,{className:"w-7 h-auto"}))}))`
  margin: 0;
  flex: 0 0 auto;
  width: 32px;
  position: relative;
  fill: inherit;
  padding: 12px 0;
  transition: all 85ms ease-out;
  &:hover {
    background-color: var(--tina-color-grey-1);
    cursor: grab;
  }
  svg {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 20px;
    height: 20px;
    transform: translate3d(-50%, -50%, 0);
    transition: all 85ms ease-out;
  }
  svg:last-child {
    opacity: 0;
  }
  *:hover > & {
    svg:first-child {
      opacity: 0;
    }
    svg:last-child {
      opacity: 1;
    }
  }
`,Fr=function({setExpanded:e,isExpanded:t,tinaForm:n,field:a,index:r,itemTitle:i,zIndexShift:l}){const o=Ht(),s=A.useMemo((()=>a.fields.map((e=>m(d({},e),{name:`${a.name}.${r}.${e.name}`})))),[a.fields,a.name,r]);return A.createElement(hr,{isExpanded:t,style:{zIndex:l+1e3}},A.createElement(pr,{onClick:()=>{!0!==n.finalForm.getState().invalid?e(!1):o.alerts.error("Cannot navigate away from an invalid form.")}},i),A.createElement(gr,{id:n.id},t?A.createElement(sn,{form:n,fields:s}):null))},Pr=br,Br={name:"group-list",Component:Pr},_r=({templates:e,addItem:t})=>{const n=A.useMemo((()=>Object.entries(e).length>6),[e]),[a,r]=A.useState(""),i=A.useMemo((()=>Object.entries(e).filter((([e,t])=>t.label&&t.label.toLowerCase().includes(a.toLowerCase())||e.toLowerCase().includes(a.toLowerCase())))),[a]);return A.createElement(w.Popover,null,(({open:e})=>A.createElement(A.Fragment,null,A.createElement(w.Popover.Button,{as:A.Fragment},A.createElement(Nt,{variant:e?"secondary":"primary",size:"small",className:e?"rotate-45 pointer-events-none":""},A.createElement(ie,{className:"w-5/6 h-auto"}))),A.createElement("div",{className:"transform translate-y-full absolute -bottom-1 right-0 z-50"},A.createElement(w.Transition,{enter:"transition duration-150 ease-out",enterFrom:"transform opacity-0 -translate-y-2",enterTo:"transform opacity-100 translate-y-0",leave:"transition duration-75 ease-in",leaveFrom:"transform opacity-100 translate-y-0",leaveTo:"transform opacity-0 -translate-y-2"},A.createElement(w.Popover.Panel,{className:"relative overflow-hidden rounded-lg shadow-lg bg-white border border-gray-100"},(({close:e})=>A.createElement("div",{className:"min-w-[192px] max-h-[24rem] overflow-y-auto flex flex-col w-full h-full"},n&&A.createElement("div",{className:"sticky top-0 bg-gray-50 p-2 border-b border-gray-100 z-10"},A.createElement("input",{type:"text",className:"bg-white text-xs rounded-sm border border-gray-100 shadow-inner py-1 px-2 w-full block placeholder-gray-200",onClick:e=>{e.stopPropagation(),e.preventDefault()},value:a,onChange:e=>{r(e.target.value)},placeholder:"Filter..."})),0===i.length&&A.createElement("span",{className:"relative text-center text-xs px-2 py-3 text-gray-300 bg-gray-50 italic"},"No matches found"),i.length>0&&i.map((([n,a])=>A.createElement("button",{className:"relative text-center text-xs py-2 px-4 border-l-0 border-t-0 border-r-0 border-b border-gray-50 w-full outline-none transition-all ease-out duration-150 hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50",key:n,onClick:()=>{t(n,a),r(""),e()}},a.label?a.label:n)))))))))))},Vr=({templates:e,addItem:t,label:n})=>{const a=yn(),[r,i]=A.useState(!1),l=A.useMemo((()=>Object.entries(e).length>6),[e]),[o,s]=A.useState(""),c=A.useMemo((()=>Object.entries(e).filter((([e,t])=>t.label&&t.label.toLowerCase().includes(o.toLowerCase())||e.toLowerCase().includes(o.toLowerCase())))),[o]),d=A.useMemo((()=>[...new Set(Object.entries(e).filter((([e,t])=>!!t.category&&t.category)).map((([e,t])=>t.category)))]),[e]),m=A.useMemo((()=>Object.entries(e).filter((([e,t])=>!t.category)).length>0),[e]),u=A.useMemo((()=>c.filter((([e,t])=>!t.category))),[c]),p=(e,n)=>{e&&n&&t(e,n),s(""),i(!1)};return A.createElement(A.Fragment,null,A.createElement(Nt,{variant:r?"secondary":"primary",size:"small",className:r?"rotate-45 pointer-events-none":"",onClick:()=>i(!r)},A.createElement(ie,{className:"w-5/6 h-auto"})),A.createElement(a,null,(({zIndexShift:e})=>A.createElement(w.Transition,{show:r},A.createElement(w.Transition.Child,{as:A.Fragment,enter:"transform transition-all ease-out duration-200",enterFrom:"opacity-0 -translate-x-1/2",enterTo:"opacity-100 translate-x-0",leave:"transform transition-all ease-in duration-150",leaveFrom:"opacity-100 translate-x-0",leaveTo:"opacity-0 -translate-x-1/2"},A.createElement("div",{className:"absolute left-0 top-0 z-panel h-full w-full transform bg-gray-50",style:{zIndex:e+1e3}},A.createElement(pr,{onClick:()=>{i(!1)}},n," \u2060\u2013 Add New"),A.createElement("div",{className:"h-full overflow-y-auto max-h-full bg-gray-50 pt-4 px-6 pb-12"},A.createElement("div",{className:"w-full flex justify-center"},A.createElement("div",{className:"w-full max-w-form"},l&&A.createElement("div",{className:"block relative group mb-1"},A.createElement("input",{type:"text",className:"shadow-inner focus:shadow-outline focus:border-blue-400 focus:outline-none block text-sm pl-2.5 pr-8 py-1.5 text-gray-600 w-full bg-white border border-gray-200 focus:text-gray-900 rounded-md placeholder-gray-400 hover:placeholder-gray-600 transition-all ease-out duration-150",onClick:e=>{e.stopPropagation(),e.preventDefault()},value:o,onChange:e=>{s(e.target.value)},placeholder:"Search"}),""===o?A.createElement(Xa,{className:"absolute right-3 top-1/2 -translate-y-1/2 w-5 h-auto text-blue-500 opacity-70 group-hover:opacity-100 transition-all ease-out duration-150"}):A.createElement("button",{onClick:()=>{s("")},className:"outline-none focus:outline-none bg-transparent border-0 p-0 m-0 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-all ease-out duration-150"},A.createElement(ma,{className:"w-5 h-auto text-gray-600"}))),0===u.length&&0===d.length&&A.createElement($r,null,"No blocks to display."),u.length>0&&0===d.length&&A.createElement(Rr,{className:"pt-3"},u.map((([e,t])=>A.createElement(Or,{close:p,name:e,template:t})))),d.map(((e,t)=>A.createElement(Ir,{key:t,templates:c.filter((([t,n])=>!(!n.category||n.category!==e))),category:e,isLast:t===d.length-1&&!m,close:p}))),m&&0===u.length&&A.createElement("div",{className:"relative text-gray-500 block text-left w-full text-base font-bold tracking-wide py-2 truncate pointer-events-none opacity-50"},"Uncategorized"),u.length>0&&d.length>0&&A.createElement(Ir,{templates:u,category:"Uncategorized",close:p,isLast:!0}))))))))))},Ir=({category:e,templates:t,close:n,isLast:a=!1})=>A.createElement(w.Disclosure,{defaultOpen:!0,as:"div",className:"left-0 right-0 relative"},(({open:r})=>A.createElement(A.Fragment,null,A.createElement(w.Disclosure.Button,{className:`relative block group text-left w-full text-base font-bold tracking-wide py-2 truncate ${0===t.length?"pointer-events-none":""} ${!a&&(!r||0===t.length)&&"border-b border-gray-100"}`},A.createElement("span",{className:"text-gray-500 group-hover:text-gray-800 transition-all ease-out duration-150 "+(0===t.length?"opacity-50":"")},e),t.length>0&&A.createElement(ca,{className:"absolute top-1/2 right-0 w-6 h-auto -translate-y-1/2 text-gray-300 origin-center group-hover:text-blue-500 transition-all duration-150 ease-out "+(r?"":"-rotate-90 opacity-70 group-hover:opacity-100")})),A.createElement(w.Transition,{enter:"transition duration-100 ease-out",enterFrom:"transform scale-95 opacity-0",enterTo:"transform scale-100 opacity-100",leave:"transition duration-75 ease-out",leaveFrom:"transform scale-100 opacity-100",leaveTo:"transform scale-95 opacity-0"},A.createElement(w.Disclosure.Panel,null,t.length>0&&A.createElement(Rr,null,t.map((([e,t])=>A.createElement(Or,{close:n,name:e,template:t}))))))))),Rr=({children:e,className:t=""})=>A.createElement("div",{className:`w-full mb-1 -mt-2 ${t}`,style:{columns:"320px",columnGap:"16px"}},e),Or=({close:e,name:t,template:n})=>A.createElement("button",{className:"mb-2 mt-2 group relative text-xs font-bold border border-gray-100 w-full outline-none transition-all ease-out duration-150 hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50 rounded-md bg-white shadow overflow-hidden",style:{breakInside:"avoid",transform:"translateZ(0)"},key:t,onClick:()=>{e(t,n)}},n.previewSrc&&A.createElement("img",{src:n.previewSrc,className:"w-full h-auto transition-all ease-out duration-150 group-hover:opacity-50"}),A.createElement("span",{className:"relative flex justify-between items-center gap-4 w-full px-4 text-left "+(n.previewSrc?"py-2 border-t border-gray-100 ":"py-3")},n.label?n.label:t,A.createElement(ie,{className:"w-5 h-auto group-hover:text-blue-500 opacity-30 transition-all ease-out duration-150 group-hover:opacity-80"}))),$r=({children:e})=>A.createElement("div",{className:"block relative text-gray-300 italic py-1"},e),Dr=({tinaForm:e,form:t,field:n,input:a})=>{const r=A.useCallback(((e,a)=>{let r={};r="function"===typeof a.defaultItem?a.defaultItem():a.defaultItem||{},r._template=e,t.mutators.insert(n.name,0,r)}),[n.name,t.mutators]),i=a.value||[];return A.createElement(A.Fragment,null,A.createElement(Nr,null,A.createElement(Lr,null,A.createElement(Cr,null,n.label||n.name),n.description&&A.createElement(sr,null,n.description)),!n.visualSelector&&A.createElement(_r,{templates:n.templates,addItem:r}),n.visualSelector&&A.createElement(Vr,{label:n.label||n.name,templates:n.templates,addItem:r})),A.createElement(Mr,null,A.createElement(f.Droppable,{droppableId:n.name,type:n.name},(t=>A.createElement("div",{ref:t.innerRef,className:"edit-page--list-parent"},0===i.length&&A.createElement(Ar,null),i.map(((t,a)=>{const r=n.templates[t._template];if(!r)return A.createElement(Zr,{key:a,index:a,field:n,tinaForm:e});const i=e=>r.itemProps?r.itemProps(e):{};return A.createElement(jr,d({key:a,block:t,template:r,index:a,field:n,tinaForm:e},i(t)))})),t.placeholder)))))},Ar=()=>A.createElement(Kr,null,"There are no items"),jr=({label:e,tinaForm:t,field:n,index:a,template:r,block:i})=>{const l=Ht(),o=yn(),[s,c]=A.useState(!1),m=A.useCallback((()=>{t.mutators.remove(n.name,a)}),[t,n,a]),{dispatch:u}=It("field:hover"),{dispatch:p}=It("field:focus");return A.createElement(f.Draggable,{key:a,type:n.name,draggableId:`${n.name}.${a}`,index:a},((g,f)=>A.createElement(A.Fragment,null,A.createElement(Tr,d(d({ref:g.innerRef,isDragging:f.isDragging},g.draggableProps),g.dragHandleProps),A.createElement(Ur,null),A.createElement(Gr,{onClick:()=>{!0!==t.finalForm.getState().invalid?(c(!0),p({fieldName:`${n.name}.${a}`})):l.alerts.error("Cannot navigate away from an invalid form.")},onMouseOver:()=>u({fieldName:`${n.name}.${a}`}),onMouseOut:()=>u({fieldName:null})},A.createElement(Cr,null,e||r.label)),A.createElement(kr,{onClick:m})),A.createElement(o,null,(({zIndexShift:l})=>A.createElement(Yr,{zIndexShift:l,isExpanded:s,setExpanded:c,field:n,item:i,index:a,tinaForm:t,label:e||r.label,template:r}))))))},Zr=({tinaForm:e,field:t,index:n})=>{const a=A.useCallback((()=>{e.mutators.remove(t.name,n)}),[e,t,n]);return A.createElement(f.Draggable,{key:n,type:t.name,draggableId:`${t.name}.${n}`,index:n},((e,t)=>A.createElement(Tr,d(d({ref:e.innerRef,isDragging:t.isDragging},e.draggableProps),e.dragHandleProps),A.createElement(Ur,null),A.createElement(Gr,null,A.createElement(Cr,{error:!0},"Invalid Block")),A.createElement(kr,{onClick:a}))))},Kr=Z.default.div`
  text-align: center;
  border-radius: var(--tina-radius-small);
  background-color: var(--tina-color-grey-2);
  color: var(--tina-color-grey-4);
  line-height: 1.35;
  padding: 12px 0;
  font-size: var(--tina-font-size-2);
  font-weight: var(--tina-font-weight-regular);
`,Gr=Z.default.div`
  flex: 1 1 0;
  min-width: 0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
`,Ur=Z.default((function(e){var t=u(e,[]);return A.createElement("div",d({},t),A.createElement(ve,{className:"w-7 h-auto"}),A.createElement(_e,{className:"w-7 h-auto"}))}))`
  margin: 0;
  flex: 0 0 auto;
  width: 32px;
  position: relative;
  fill: inherit;
  padding: 12px 0;
  transition: all 85ms ease-out;
  &:hover {
    background-color: var(--tina-color-grey-1);
    cursor: grab;
  }
  svg {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 20px;
    height: 20px;
    transform: translate3d(-50%, -50%, 0);
    transition: all var(--tina-timing-short) ease-out;
  }
  svg:last-child {
    opacity: 0;
  }
  *:hover > & {
    svg:first-child {
      opacity: 0;
    }
    svg:last-child {
      opacity: 1;
    }
  }
`,Yr=function({setExpanded:e,isExpanded:t,tinaForm:n,field:a,index:r,label:i,template:l,zIndexShift:o}){const s=Ht(),c=A.useMemo((()=>l.fields?l.fields.map((e=>m(d({},e),{name:`${a.name}.${r}.${e.name}`}))):[]),[a.name,r,l.fields]);return A.createElement(hr,{isExpanded:t,style:{zIndex:o+1e3}},A.createElement(pr,{onClick:()=>{!0!==n.finalForm.getState().invalid?e(!1):s.alerts.error("Cannot navigate away from an invalid form.")}},i),A.createElement(gr,{id:n.id},t?A.createElement(sn,{form:n,fields:c}):null))},Wr=Dr,qr={name:"blocks",Component:Wr},Xr=e=>e||"",Jr=rr((({input:e,field:t})=>A.createElement(Wn,{colorFormat:t.colorFormat,userColors:t.colors,widget:t.widget,input:e}))),Qr={name:"color",Component:Jr,parse:Xr},ei=({tinaForm:e,form:t,field:n,input:a})=>{const r=A.useCallback((()=>{let e="";"function"===typeof n.defaultItem?e=n.defaultItem():"undefined"!==typeof n.defaultItem&&(e=n.defaultItem),t.mutators.insert(n.name,0,e)}),[t,n]),i=a.value||[],l=A.useCallback((e=>n.itemProps?n.itemProps(e):{}),[n.itemProps]);return A.createElement(A.Fragment,null,A.createElement(li,null,A.createElement(oi,null,A.createElement(ii,null,n.label||n.name),n.description&&A.createElement(sr,null,n.description)),A.createElement(Nt,{onClick:r,variant:"primary",size:"small"},A.createElement(ie,{className:"w-5/6 h-auto"}))),A.createElement(si,null,A.createElement(di,null,A.createElement(f.Droppable,{droppableId:n.name,type:n.name},(t=>A.createElement("div",{ref:t.innerRef},0===i.length&&A.createElement(ti,null),i.map(((t,a)=>A.createElement(ni,d({key:a,tinaForm:e,field:n,item:t,index:a},l(t))))),t.placeholder))))))},ti=()=>A.createElement(ci,null,"There are no items"),ni=e=>{var t=e,{tinaForm:n,field:a,index:r,item:i,label:l}=t,o=u(t,["tinaForm","field","index","item","label"]);const s=A.useCallback((()=>{n.mutators.remove(a.name,r)}),[n,a,r]),c=[m(d({type:a.type,list:a.list},a.field),{label:"Value",name:a.name+"."+r})];return A.createElement(f.Draggable,{type:a.name,draggableId:`${a.name}.${r}`,index:r},((e,t)=>A.createElement(A.Fragment,null,A.createElement(mi,d(d(d({ref:e.innerRef,isDragging:t.isDragging},e.draggableProps),e.dragHandleProps),o),A.createElement(ai,null,A.createElement(sn,{form:n,fields:c})),A.createElement(ri,null,A.createElement(pi,null),A.createElement(ui,{onClick:s},A.createElement(Se,{className:"w-7 h-auto"})))))))},ai=Z.default.div`
  flex: 1;
  display: flex;
  align-items: center;

  label {
    display: none;
  }
`,ri=Z.default.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-height: 84px;
`,ii=Z.default.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  font-size: var(--tina-font-size-1);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.35;
  flex: 1 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--tina-color-grey-8);
  transition: all 85ms ease-out;
  text-align: left;

  ${e=>e.error&&r.css`
      color: var(--tina-color-error) !important;
    `};
`,li=Z.default.div`
  position: relative;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  ${sr} {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`,oi=Z.default.div`
  line-height: 1;
`,si=Z.default.div`
  max-height: initial;
  position: relative;
  height: auto;
  margin-bottom: 24px;
  border-radius: var(--tina-radius-small);
  background-color: var(--tina-color-grey-2);
`,ci=Z.default.div`
  text-align: center;
  border-radius: var(--tina-radius-small);
  background-color: var(--tina-color-grey-2);
  color: var(--tina-color-grey-4);
  line-height: 1.35;
  padding: 12px 0;
  font-size: var(--tina-font-size-2);
  font-weight: var(--tina-font-weight-regular);
`,di=Z.default.div``,mi=Z.default.div`
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  background-color: white;
  border: 1px solid var(--tina-color-grey-2);
  margin: 0 0 -1px 0;
  overflow: visible;
  line-height: 1.35;
  padding: 0;
  font-size: var(--tina-font-size-2);
  font-weight: var(--tina-font-weight-regular);

  ${ii} {
    color: var(--tina-color-grey-8);
    align-self: center;
    max-width: 100%;
  }

  ${dn} {
    padding: var(--tina-padding-small) calc(var(--tina-padding-small) / 2)
      var(--tina-padding-small) var(--tina-padding-small);
    display: flex;
    align-items: center;
  }

  /* @ts-ignore FIXME twind */
  /* FieldWrapper {
    margin: 0;
    flex: 1;
  } */

  svg {
    fill: var(--tina-color-grey-4);
    transition: fill 85ms ease-out;
  }

  &:hover {
    svg {
      fill: var(--tina-color-grey-8);
    }
    ${ii} {
      color: var(--tina-color-primary);
    }
  }

  &:first-child {
    border-radius: 4px 4px 0 0;
  }

  &:nth-last-child(2) {
    border-radius: 0 0 4px 4px;
    &:first-child {
      border-radius: var(--tina-radius-small);
    }
  }

  ${e=>e.isDragging&&r.css`
      border-radius: var(--tina-radius-small);
      box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);

      svg {
        fill: var(--tina-color-grey-8);
      }
      ${ii} {
        color: var(--tina-color-primary);
      }

      ${pi} {
        svg:first-child {
          opacity: 0;
        }
        svg:last-child {
          opacity: 1;
        }
      }
    `};
`,ui=Z.default.button`
  text-align: center;
  flex: 1 0 auto;
  border: 0;
  background: transparent;
  cursor: pointer;
  width: 38px;
  height: 36px;
  padding: 0 4px 5px 0;
  margin: 0;
  transition: all 85ms ease-out;
  svg {
    width: 24px;
    height: 24px;
    transition: all 85ms ease-out;
  }
  &:hover {
    background-color: var(--tina-color-grey-1);
  }
`,pi=Z.default((function(e){var t=u(e,[]);return A.createElement("div",d({},t),A.createElement(_e,{className:"w-7 h-auto"}))}))`
  margin: 0;
  flex: 1 0 auto;
  width: 38px;
  height: 36px;
  padding: 5px 4px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  fill: inherit;
  transition: all 85ms ease-out;
  &:hover {
    background-color: var(--tina-color-grey-1);
    cursor: grab;
  }
  svg {
    width: 24px;
    height: 24px;
    transition: all 85ms ease-out;
  }
`,gi=ei,fi={name:"list",Component:gi};function hi(e,n,a,r){const i=Ht(),l=r||i.media.previewSrc,[{src:o,loading:s},c]=t.useState({src:"",loading:!0});return t.useEffect((()=>{let t=!1,r="";return(async()=>{try{r=await l(e,n,a)}catch{}t||c({src:r,loading:!1})})(),()=>{t=!0}}),[e]),[o,s]}const wi=rr((e=>{const n=Ht(),{form:a,field:r}=e,{name:i,value:l}=e.input,[o,s]=hi(l,i,a.getState().values,r.previewSrc),[c,d]=t.useState(!1);let m;async function u(t){var a,r;if(t){const i="function"===typeof(null==(r=null==(a=null==n?void 0:n.media)?void 0:a.store)?void 0:r.parse)?n.media.store.parse(t):t;e.input.onChange(i)}}e.field.clearable&&(m=()=>e.input.onChange(""));const p=e.field.uploadDir||(()=>"");return A.createElement(Ia,{value:l,previewSrc:o,loading:c||s,onClick:()=>{const t=p(e.form.getState().values);n.media.open({allowDelete:!0,directory:t,onSelect:u})},onDrop:async([t])=>{d(!0);const a=p(e.form.getState().values),[r]=await n.media.persist([{directory:a,file:t}]);if(r)try{await u(r)}catch(i){console.error("Error uploading media asset: ",i)}finally{d(!1)}},onClear:m})})),vi={name:"image",Component:wi,parse:Xr},bi=e=>v.unwrapList(e),xi=(e,t)=>{if(e.selection){const n=v.getParent(e,e.selection);if(!n)return;const[a]=n;!v.isElement(a)||v.isType(e,a,v.ELEMENT_CODE_BLOCK)||v.isType(e,a,v.ELEMENT_CODE_LINE)||t()}},yi=(e,t)=>{xi(e,(()=>v.toggleList(e,{type:t})))},Ei=[{mode:"block",type:v.ELEMENT_H1,match:"# ",preFormat:bi},{mode:"block",type:v.ELEMENT_H2,match:"## ",preFormat:bi},{mode:"block",type:v.ELEMENT_H3,match:"### ",preFormat:bi},{mode:"block",type:v.ELEMENT_H4,match:"#### ",preFormat:bi},{mode:"block",type:v.ELEMENT_H5,match:"##### ",preFormat:bi},{mode:"block",type:v.ELEMENT_H6,match:"###### ",preFormat:bi},{mode:"block",type:v.ELEMENT_BLOCKQUOTE,match:"> ",preFormat:bi},{mode:"block",type:v.ELEMENT_CODE_BLOCK,match:"```",triggerAtBlockStart:!1,preFormat:bi,format:e=>{v.insertEmptyCodeBlock(e,{defaultType:v.getPlatePluginType(e,v.ELEMENT_DEFAULT),insertNodesOptions:{select:!0}})}}],ki=[{mode:"block",type:v.ELEMENT_LI,match:["* ","- "],preFormat:bi,format:e=>yi(e,v.ELEMENT_UL)},{mode:"block",type:v.ELEMENT_LI,match:["1. ","1) "],preFormat:bi,format:e=>yi(e,v.ELEMENT_OL)},{mode:"block",type:v.ELEMENT_TODO_LI,match:"[] "},{mode:"block",type:v.ELEMENT_TODO_LI,match:"[x] ",format:e=>v.setNodes(e,{type:v.ELEMENT_TODO_LI,checked:!0},{match:t=>b.Editor.isBlock(e,t)})}],Ci=[{mode:"mark",type:[v.MARK_BOLD,v.MARK_ITALIC],match:"***"},{mode:"mark",type:[v.MARK_UNDERLINE,v.MARK_ITALIC],match:"__*"},{mode:"mark",type:[v.MARK_UNDERLINE,v.MARK_BOLD],match:"__**"},{mode:"mark",type:[v.MARK_UNDERLINE,v.MARK_BOLD,v.MARK_ITALIC],match:"___***"},{mode:"mark",type:v.MARK_BOLD,match:"**"},{mode:"mark",type:v.MARK_UNDERLINE,match:"__"},{mode:"mark",type:v.MARK_ITALIC,match:"*"},{mode:"mark",type:v.MARK_ITALIC,match:"_"},{mode:"mark",type:v.MARK_STRIKETHROUGH,match:"~~"},{mode:"mark",type:v.MARK_SUPERSCRIPT,match:"^"},{mode:"mark",type:v.MARK_SUBSCRIPT,match:"~"},{mode:"mark",type:v.MARK_HIGHLIGHT,match:"=="},{mode:"mark",type:v.MARK_HIGHLIGHT,match:"\u2261"},{mode:"mark",type:v.MARK_CODE,match:"`"}],Ni=[...Ei,...ki,...Ci,...v.autoformatSmartQuotes,...v.autoformatPunctuation,...v.autoformatLegal,...v.autoformatLegalHtml,...v.autoformatArrow,...v.autoformatMath],Li={types:[v.ELEMENT_BLOCKQUOTE,v.ELEMENT_TODO_LI],defaultType:v.ELEMENT_PARAGRAPH},Mi={editableProps:{spellCheck:!1,autoFocus:!1,placeholder:"Type\u2026",style:{padding:"15px"}},options:v.createPlateOptions(),components:v.createPlateComponents({[v.ELEMENT_CODE_BLOCK]:v.withProps(v.CodeBlockElement,{styles:{root:[r.css`
            background-color: #111827;
            code {
              color: white;
            }
          `]}})}),indent:{validTypes:[]},resetBlockType:{rules:[m(d({},Li),{hotkey:"Enter",predicate:v.isBlockAboveEmpty}),m(d({},Li),{hotkey:"Backspace",predicate:v.isSelectionAtBlockStart})]},trailingBlock:{type:v.ELEMENT_PARAGRAPH},softBreak:{rules:[{hotkey:"shift+enter"},{hotkey:"enter",query:{allow:[v.ELEMENT_CODE_BLOCK,v.ELEMENT_BLOCKQUOTE,v.ELEMENT_TD]}}]},exitBreak:{rules:[{hotkey:"mod+enter"},{hotkey:"mod+shift+enter",before:!0},{hotkey:"enter",query:{start:!0,end:!0,allow:v.KEYS_HEADING}}]},selectOnBackspace:{allow:[v.ELEMENT_IMAGE,v.ELEMENT_HR]},autoformat:{rules:Ni},forceLayout:{rules:[]}};function zi(e){const t=e.title||"format list bulleted";return j.default.createElement("svg",{height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M7 5h14v2H7V5z",fill:"currentColor"}),j.default.createElement("path",{d:"M4 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",fill:"currentColor"}),j.default.createElement("path",{d:"M7 11h14v2H7v-2zm0 6h14v2H7v-2zm-3 2.5c.82 0 1.5-.68 1.5-1.5s-.67-1.5-1.5-1.5-1.5.68-1.5 1.5.68 1.5 1.5 1.5z",fill:"currentColor"}),j.default.createElement("path",{d:"M4 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",fill:"currentColor"})))}function Hi(e){const t=e.title||"format size";return j.default.createElement("svg",{height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z",fill:"currentColor"})))}function Ti(e){const t=e.title||"format list numbered";return j.default.createElement("svg",{height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z",fill:"currentColor"})))}function Si(e){const t=e.title||"format quote";return j.default.createElement("svg",{height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z",fill:"currentColor"})))}function Fi(e){const t=e.title||"insert link";return j.default.createElement("svg",{height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",fill:"currentColor"})))}function Pi(e){const t=e.title||"code";return j.default.createElement("svg",{height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",fill:"currentColor"})))}function Bi(e){const t=e.title||"image";return j.default.createElement("svg",{height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M19 5v14H5V5h14zm0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z",fill:"currentColor"})))}function _i(e){const t=e.title||"format bold";return j.default.createElement("svg",{height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z",fill:"currentColor"})))}function Vi(e){const t=e.title||"format italic";return j.default.createElement("svg",{height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z",fill:"currentColor"})))}function Ii(e){const t=e.title||"keyboard arrow down";return j.default.createElement("svg",{height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z",fill:"currentColor"})))}const Ri=Z.default.div`
  display: flex;
  align-items: center;

  svg {
    transform: rotate(-90deg);
    transition: transform 150ms ease-out;
    margin-right: -4px;
    margin-left: 2px;
  }

  ${e=>e.open&&r.css`
      svg {
        transform: rotate(0deg);
      }
    `};
`,Oi=({showButton:e,onAdd:t,templates:n})=>{const[a,r]=A.useState(!1);return A.createElement("span",{style:{position:"relative"}},e?A.createElement(Ct,{onClick:e=>{e.stopPropagation(),e.preventDefault(),r((e=>!e))},variant:"primary",size:"small"},A.createElement(Ri,{open:a},"Embed ",A.createElement(Ii,null))):A.createElement("span",null),A.createElement($i,{open:a},A.createElement(en,{click:!0,escape:!0,onDismiss:()=>r(!1),disabled:!a},A.createElement(Di,null,n.length>0?n.map((e=>A.createElement(Ai,{key:e.name,onClick:()=>{t(e),r(!1)}},e.label))):A.createElement("div",{className:"px-5 py-2 text-sm opacity-70"},"No templates provided"," ")))))},$i=Z.default.div`
  min-width: 192px;
  border-radius: var(--tina-radius-big);
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 100% 0;
  box-shadow: var(--tina-shadow-big);
  background-color: white;
  overflow: hidden;
  z-index: var(--tina-z-index-1);
  ${e=>e.open&&r.css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 36px, 0) scale3d(1, 1, 1);
    `};
`,Di=Z.default.div`
  display: flex;
  flex-direction: column;
`,Ai=e=>{var t=e,{children:n}=t,a=u(t,["children"]);return A.createElement("button",d({className:"relative text-center text-sm p-2 w-full border-b border-gray-50 outline-none transition-all ease-out duration-150 hover:text-blue-500 hover:bg-gray-50"},a),n)},ji=({children:e,icon:t})=>{const[n,a]=A.useState(!1);return A.createElement("span",{style:{position:"relative"}},A.createElement("button",{className:"p-2 border-b-0",onClick:e=>{e.stopPropagation(),e.preventDefault(),a(!0)}},t),A.createElement(Zi,{open:n},A.createElement(en,{click:!0,escape:!0,onDismiss:()=>a(!1),disabled:!n},e)))},Zi=Z.default.div`
  border-radius: var(--tina-radius-small);
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 0 0;
  box-shadow: var(--tina-shadow-big);
  background-color: white;
  overflow: hidden;
  z-index: var(--tina-z-index-1);

  ${e=>e.open&&r.css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 36px, 0) scale3d(1, 1, 1);
    `};
`,Ki=Z.default.div`
  z-index: 30;
  padding-top: 6px;
  position: relative;
  width: 100%;
`,Gi=Z.default.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  background: var(--tina-color-grey-0);
  color: var(--tina-color-grey-10);
  margin: 0;
  border-radius: var(--tina-radius-small);
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--tina-color-grey-2);
  margin-bottom: 14px;

  svg {
    width: 20px;
    height: auto;
  }

  span[class*='ToolbarButton'],
  button {
    padding: 8px;
    border: none;
    border-right: 1px solid var(--tina-color-grey-2);
    width: auto;
    height: auto;
    border-left: none;
    margin: 0 0 -1px 0;
    flex-grow: 1;
    max-width: 48px;
    transition: background 150ms ease-out;

    &:first-child {
      border-radius: var(--tina-radius-small) 0 0 var(--tina-radius-small);
    }

    &:last-child {
      border-radius: 0 var(--tina-radius-small) var(--tina-radius-small) 0;
    }

    &:not(disabled):hover {
      background: var(--tina-color-grey-1);
      color: var(--tina-color-primary);
    }
  }
`,Ui=Z.default.div`
  position: absolute;
  top: -34px;
  right: 0px;
`,Yi=({name:e,templates:t})=>{const n=Ht(),a=v.usePlateEditorRef(e),r={showButton:!0,onAdd:e=>{b.Transforms.insertNodes(a,[{type:e.inline?"mdxJsxTextElement":"mdxJsxFlowElement",name:e.name,props:e.defaultItem,ordered:!1,children:[{type:"text",text:""}]}])},templates:t},[i,l]=j.default.useState(null),[o,s]=j.default.useState(null);return j.default.useEffect((()=>{o&&(b.Transforms.insertNodes(a,[{type:"img",url:o.src||o.previewSrc,alt:"",caption:"",children:[{type:"text",text:""}]}],{at:i}),s(null))}),[o]),j.default.createElement(Ki,null,j.default.createElement(Gi,null,j.default.createElement(ji,{icon:j.default.createElement(Hi,null)},j.default.createElement(v.BlockToolbarButton,{type:v.getPlatePluginType(a,v.ELEMENT_H1),icon:j.default.createElement("strong",null,"H1")}),j.default.createElement(v.BlockToolbarButton,{type:v.getPlatePluginType(a,v.ELEMENT_H2),icon:j.default.createElement("strong",null,"H2")}),j.default.createElement(v.BlockToolbarButton,{type:v.getPlatePluginType(a,v.ELEMENT_H3),icon:j.default.createElement("strong",null,"H3")}),j.default.createElement(v.BlockToolbarButton,{type:v.getPlatePluginType(a,v.ELEMENT_H4),icon:j.default.createElement("strong",null,"H4")}),j.default.createElement(v.BlockToolbarButton,{type:v.getPlatePluginType(a,v.ELEMENT_H5),icon:j.default.createElement("strong",null,"H5")}),j.default.createElement(v.BlockToolbarButton,{type:v.getPlatePluginType(a,v.ELEMENT_H6),icon:j.default.createElement("strong",null,"H6")})),j.default.createElement("span",{"data-test":"quoteButton"},j.default.createElement(v.BlockToolbarButton,{type:v.getPlatePluginType(a,v.ELEMENT_BLOCKQUOTE),icon:j.default.createElement(Si,null)})),j.default.createElement("span",{"data-test":"codeBlockButton"},j.default.createElement(v.CodeBlockToolbarButton,{type:v.getPlatePluginType(a,v.ELEMENT_CODE_BLOCK),icon:j.default.createElement(Pi,null)})),j.default.createElement(v.LinkToolbarButton,{icon:j.default.createElement(Fi,null)}),j.default.createElement(v.ToolbarButton,{icon:j.default.createElement(Bi,null),onMouseDown:()=>{l(a.selection),n.media.open({allowDelete:!0,onSelect:e=>{s(e)}})}}),j.default.createElement(v.ListToolbarButton,{type:v.getPlatePluginType(a,v.ELEMENT_UL),icon:j.default.createElement(zi,null)}),j.default.createElement(v.ListToolbarButton,{type:v.getPlatePluginType(a,v.ELEMENT_OL),icon:j.default.createElement(Ti,null)}),j.default.createElement("span",{"data-test":"boldButton"},j.default.createElement(v.MarkToolbarButton,{type:v.getPlatePluginType(a,v.MARK_BOLD),icon:j.default.createElement(_i,null)})),j.default.createElement(v.MarkToolbarButton,{type:v.getPlatePluginType(a,v.MARK_ITALIC),icon:j.default.createElement(Vi,null)})),j.default.createElement(Ui,null,j.default.createElement(Oi,d({},r))))},Wi=({tinaForm:e,children:t})=>{const[n,a]=A.useState(!1);return A.createElement(A.Fragment,null,A.createElement(Xi,{onClick:()=>a(!n)},t),A.createElement(qi,{isExpanded:n,setExpanded:a,field:{label:"Image",name:"Image"},tinaForm:e}))},qi=function({setExpanded:e,isExpanded:t,tinaForm:n,field:a}){const r=yn();return A.createElement(r,null,(({zIndexShift:r})=>A.createElement(tl,{isExpanded:t,style:{zIndex:r+1e3}},A.createElement(Ji,{onClick:()=>e(!1)},A.createElement(be,null)," ",A.createElement("span",null,a.label||a.name)),A.createElement(Qi,null,t?A.createElement(Tn,{form:n,hideFooter:!0}):null))))},Xi=Z.default.span`
  position: relative;
  cursor: pointer;
  display: block;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--tina-color-grey-2);
  border-left: 3px solid var(--tina-color-primary);
  border-radius: var(--tina-radius-small);
  overflow: visible;
  line-height: 1.35;
  padding: 12px;
  margin: 8px 0;
  color: var(--tina-color-grey-10);
  background-color: white;

  svg {
    width: 24px;
    height: auto;
    fill: var(--tina-color-grey-3);
    transition: all var(--tina-timing-short) ease-out;
  }

  &:hover {
    svg {
      fill: var(--tina-color-grey-8);
    }
    color: #0084ff;
  }
`,Ji=Z.default.span`
  position: relative;
  width: 100%;
  cursor: pointer;
  background-color: white;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding: 6px 18px 6px 18px;
  font-size: var(--tina-font-size-3);
  transition: color var(--tina-timing-medium) ease-out;
  user-select: none;
  border-bottom: 1px solid var(--tina-color-grey-2);
  margin: 0;
  span {
    flex: 1 1 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  svg {
    flex: 0 0 auto;
    width: 24px;
    fill: var(--tina-color-grey-3);
    height: auto;
    transform: translate3d(-4px, 0, 0);
    transition: transform var(--tina-timing-medium) ease-out;
  }
  :hover {
    color: var(--tina-color-primary);
    svg {
      fill: var(--tina-color-grey-8);
      transform: translate3d(-7px, 0, 0);
      transition: transform var(--tina-timing-medium) ease-out;
    }
  }
`,Qi=Z.default.span`
  background: var(--tina-color-grey-1);
  position: relative;
  flex-direction: column;
  display: flex;
  flex: 1 1 auto;
  overflow-y: auto;
`,el=r.keyframes`
  0% {
    transform: translate3d( 100%, 0, 0 );
  }
  100% {
    transform: translate3d( 0, 0, 0 );
  }
`,tl=Z.default.span`
  position: absolute;
  width: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  z-index: var(--tina-z-index-1);
  pointer-events: ${e=>e.isExpanded?"all":"none"};

  > * {
    ${e=>e.isExpanded&&r.css`
        animation-name: ${el};
        animation-duration: 150ms;
        animation-delay: 0;
        animation-iteration-count: 1;
        animation-timing-function: ease-out;
        animation-fill-mode: backwards;
      `};

    ${e=>!e.isExpanded&&r.css`
        transition: transform 150ms ease-out;
        transform: translate3d(100%, 0, 0);
      `};
  }
`;function nl(e,t){const n=e.split(","),a=n[0].match(/:(.*?);/)[1],r=atob(n[1]);let i=r.length;const l=new Uint8Array(i);for(;i--;)l[i]=r.charCodeAt(i);return new File([l],t,{type:a})}const al=e=>{const t=v.usePlateEditorRef(e.name),n=x.useFocused(),a=x.useSelected(),r=Ht(),[i,l]=j.default.useState({caption:e.element.caption,url:e.element.url,alt:e.element.alt,children:[{text:""}]});j.default.useEffect((()=>{(async()=>{if(e.element.url&&e.element.url.startsWith("data")){const t=nl(e.element.url,"tina-upload"),n=await r.media.persist([{directory:"",file:t}]);l(m(d({},i),{url:n[0].src||n[0].previewSrc}))}b.Transforms.setNodes(t,i,{at:x.ReactEditor.findPath(t,e.element)})})()}),[t,JSON.stringify(i)]);const o=e.element.name+Math.floor(100*Math.random()),s=j.default.useMemo((()=>new Tt({id:o,label:o,initialValues:{url:e.element.url,caption:e.element.caption,alt:e.element.alt},onChange:({values:e})=>{l(e)},onSubmit:()=>{},fields:[{name:"url",label:"Source",component:"image"},{name:"caption",label:"Caption",component:"text"},{name:"alt",label:"Alt",component:"text"}]})),[l]);return j.default.createElement("span",m(d({},e.attributes),{style:{display:"block",boxShadow:a&&n?"0 0 0 3px #B4D5FF":"none"}}),j.default.createElement("span",{style:{userSelect:"none"},contentEditable:!1},j.default.createElement(Wi,{tinaForm:s},j.default.createElement("img",{style:{width:"100%"},src:i.url,alt:e.element.alt}),j.default.createElement("span",{style:{display:"block",margin:"8px auto 0",textAlign:"center"}},i.caption))),e.children)},rl=()=>({pluginKeys:"img",voidTypes:v.getPlatePluginTypes("img"),inlineTypes:v.getPlatePluginTypes("img"),renderElement:v.getRenderElement("img")}),il=({inline:e,tinaForm:t,field:n})=>{const[a,r]=A.useState(!1);return n?A.createElement(A.Fragment,null,e?A.createElement(ol,{onClick:()=>r(!a)},n.label||n.name):A.createElement(sl,{onClick:()=>r(!a)},n.label||n.name),A.createElement(ll,{isExpanded:a,setExpanded:r,field:n,tinaForm:t})):null},ll=function({setExpanded:e,isExpanded:t,tinaForm:n,field:a}){const r=yn();return A.createElement(r,null,(({zIndexShift:r})=>A.createElement(ul,{isExpanded:t,style:{zIndex:r+1e3}},A.createElement(cl,{onClick:()=>e(!1)},A.createElement(be,null)," ",A.createElement("span",null,a.label||a.name)),A.createElement(dl,null,t?A.createElement(Tn,{form:n,hideFooter:!0}):null))))},ol=({onClick:e,children:t})=>A.createElement("button",{onClick:e,className:"group mx-0.5 px-2 py-0.5 bg-white hover:bg-gray-50 shadow focus:shadow-outline focus:border-blue-500 border border-gray-100 hover:border-gray-200 text-gray-500 hover:text-blue-400 focus:text-blue-500 rounded-md inline-flex justify-between items-center gap-2"},A.createElement("span",{className:"text-left font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1"},t)," ",A.createElement(Ya,{className:"h-5 w-auto transition-opacity duration-150 ease-out opacity-80 group-hover:opacity-90"})),sl=({onClick:e,children:t})=>A.createElement("div",{className:"pt-1 mb-5"},A.createElement("button",{onClick:e,className:"group px-4 py-3 bg-white hover:bg-gray-50 shadow focus:shadow-outline focus:border-blue-500 w-full border border-gray-100 hover:border-gray-200 text-gray-500 hover:text-blue-400 focus:text-blue-500 rounded-md flex justify-between items-center gap-2"},A.createElement("span",{className:"text-left font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1"},t)," ",A.createElement(Ya,{className:"h-6 w-auto transition-opacity duration-150 ease-out opacity-80 group-hover:opacity-90"}))),cl=Z.default.div`
  position: relative;
  width: 100%;
  cursor: pointer;
  background-color: white;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding: 6px 18px 6px 18px;
  font-size: var(--tina-font-size-3);
  transition: color var(--tina-timing-medium) ease-out;
  user-select: none;
  border-bottom: 1px solid var(--tina-color-grey-2);
  margin: 0;
  span {
    flex: 1 1 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  svg {
    flex: 0 0 auto;
    width: 24px;
    fill: var(--tina-color-grey-3);
    height: auto;
    transform: translate3d(-4px, 0, 0);
    transition: transform var(--tina-timing-medium) ease-out;
  }
  :hover {
    color: var(--tina-color-primary);
    svg {
      fill: var(--tina-color-grey-8);
      transform: translate3d(-7px, 0, 0);
      transition: transform var(--tina-timing-medium) ease-out;
    }
  }
`,dl=Z.default.div`
  background: var(--tina-color-grey-1);
  position: relative;
  flex-direction: column;
  display: flex;
  flex: 1 1 auto;
  overflow-y: auto;
`,ml=r.keyframes`
  0% {
    transform: translate3d( 100%, 0, 0 );
  }
  100% {
    transform: translate3d( 0, 0, 0 );
  }
`,ul=Z.default.div`
  position: absolute;
  width: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  z-index: var(--tina-z-index-1);
  pointer-events: ${e=>e.isExpanded?"all":"none"};

  > * {
    ${e=>e.isExpanded&&r.css`
        animation-name: ${ml};
        animation-duration: 150ms;
        animation-delay: 0;
        animation-iteration-count: 1;
        animation-timing-function: ease-out;
        animation-fill-mode: backwards;
      `};

    ${e=>!e.isExpanded&&r.css`
        transition: transform 150ms ease-out;
        transform: translate3d(100%, 0, 0);
      `};
  }
`,pl=e=>{const t=v.usePlateEditorRef(e.name),n=x.useFocused(),a=x.useSelected(),r=e.element.props,i=e.templates.find((t=>t.name===e.element.name)),l=e.element.name+Math.floor(100*Math.random()),o=j.default.useMemo((()=>new Tt({id:l,label:l,initialValues:r,onChange:({values:n})=>{if("mdxJsxTextElement"===e.element.type){const a={props:n};b.Transforms.setNodes(t,a,{match:e=>"mdxJsxTextElement"===e.type,at:x.ReactEditor.findPath(t,e.element)})}else{const a={props:n};b.Transforms.setNodes(t,a,{at:x.ReactEditor.findPath(t,e.element)})}},onSubmit:()=>{},fields:i?i.fields:[]})),[]);return j.default.createElement(gl,m(d({as:e.inline?"span":"div"},e.attributes),{style:{boxShadow:a&&n?"0 0 0 3px #B4D5FF":"none"}}),j.default.createElement(gl,{as:e.inline?"span":"div",style:{userSelect:"none"},contentEditable:!1},j.default.createElement(il,{inline:e.inline,tinaForm:o,field:i})),e.children)},gl=Z.default.div``,fl=()=>({pluginKeys:"mdxJsxFlowElement",voidTypes:v.getPlatePluginTypes("mdxJsxFlowElement"),renderElement:v.getRenderElement("mdxJsxFlowElement")}),hl=()=>({pluginKeys:"mdxJsxTextElement",voidTypes:v.getPlatePluginTypes("mdxJsxTextElement"),inlineTypes:v.getPlatePluginTypes("mdxJsxTextElement"),renderElement:v.getRenderElement("mdxJsxTextElement")}),wl=v.createPlateOptions(),vl=e=>{var t;return e.children?[...null==(t=e.children)?void 0:t.map(xl),{type:"p",children:[{type:"text",text:""}]}]:[{type:"p",children:[{type:"text",text:""}]}]},bl=rr((e=>{const t=j.default.useMemo((()=>JSON.stringify(e.input.value)),[]),[n,a]=j.default.useState(0);j.default.useEffect((()=>{t===JSON.stringify(e.input.value)&&a((e=>e+1))}),[JSON.stringify(e.input.value)]);const r=e.field.templates,i=e.input.name,l=v.createPlateComponents({img:e=>j.default.createElement(al,m(d({},e),{name:i})),mdxJsxTextElement:e=>j.default.createElement(pl,m(d({},e),{templates:r,inline:!0})),mdxJsxFlowElement:e=>j.default.createElement(pl,m(d({},e),{templates:r,inline:!1}))}),o=[rl(),fl(),hl(),v.createReactPlugin(),v.createHistoryPlugin(),v.createHorizontalRulePlugin(),v.createParagraphPlugin(),v.createBlockquotePlugin(),v.createCodeBlockPlugin(),v.createHeadingPlugin(),v.createLinkPlugin(),v.createListPlugin(),v.createImagePlugin(),v.createBoldPlugin(),v.createItalicPlugin(),v.createUnderlinePlugin(),v.createStrikethroughPlugin(),v.createCodePlugin(),...v.createBasicMarkPlugins(),v.createIndentPlugin(Mi.indent),v.createAutoformatPlugin(Mi.autoformat),v.createResetNodePlugin(Mi.resetBlockType),v.createSoftBreakPlugin(Mi.softBreak),v.createExitBreakPlugin(Mi.exitBreak),v.createNormalizeTypesPlugin(Mi.forceLayout),v.createTrailingBlockPlugin(Mi.trailingBlock),v.createSelectOnBackspacePlugin(Mi.selectOnBackspace)];return j.default.createElement(j.default.Fragment,null,j.default.createElement(Yi,{name:e.input.name,templates:r}),j.default.createElement(yl,null,j.default.createElement(v.Plate,{id:e.input.name,initialValue:vl(e.input.value),key:n,plugins:o,components:l,options:wl,onChange:t=>{e.input.onChange({type:"root",children:t})}})))})),xl=e=>["mdxJsxFlowElement","mdxJsxTextElement","img"].includes(e.type)?m(d({},e),{children:[{type:"text",text:""}]}):e.children?e.children.length>0?m(d({},e),{children:e.children.map(xl)}):m(d({},e),{children:[{type:"text",text:""}]}):e,yl=({children:e})=>j.default.createElement("div",{className:"prose shadow-inner focus:shadow-outline focus:border-blue-500 block w-full bg-white border border-gray-200 text-gray-600 focus:text-gray-900 rounded-md p-5 mb-5",style:{minHeight:"100px",maxWidth:"100%"}},e);function El(e){return A.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor","aria-hidden":"true"},e),A.createElement("path",{fillRule:"evenodd",d:"M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z",clipRule:"evenodd"}))}function kl(...e){return e.filter(Boolean).join(" ")}const Cl=()=>([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,(e=>(e^crypto.getRandomValues(new Uint8Array(1))[0]&15>>e/4).toString(16)));function Nl({label:e,items:n}){return j.default.createElement(w.Menu,{as:"div",className:"relative inline-block text-left z-20"},j.default.createElement("div",null,j.default.createElement(w.Menu.Button,{className:"inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"},e,j.default.createElement(El,{className:"-mr-1 ml-2 h-4 w-4","aria-hidden":"true"}))),j.default.createElement(w.Transition,{as:t.Fragment,enter:"transition ease-out duration-100",enterFrom:"transform opacity-0 scale-95",enterTo:"transform opacity-100 scale-100",leave:"transition ease-in duration-75",leaveFrom:"transform opacity-100 scale-100",leaveTo:"transform opacity-0 scale-95"},j.default.createElement(w.Menu.Items,{className:"origin-top-right absolute right-0 mt-2 w-32 h-64 overflow-scroll rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"},j.default.createElement("div",{className:"py-1"},n.map((e=>j.default.createElement(w.Menu.Item,{key:e.key},(({active:t})=>j.default.createElement("button",{onClick:e.onClick,className:kl(t?"bg-gray-100 text-gray-900":"text-gray-700","block px-4 py-2 text-xs w-full text-right")},e.render)))))))))}const Ll=e=>{var t=e,{attributes:n,editor:a,element:r}=t,i=u(t,["attributes","editor","element"]);const l=e=>{const t=x.ReactEditor.findPath(a,r);y.setNodes(a,{lang:e},{at:t})},o=Object.entries(N.CODE_BLOCK_LANGUAGES).map((([e,t])=>({key:e,onClick:()=>l(e),render:t})));return j.default.createElement("div",{className:"relative mb-2 mt-0.5"},j.default.createElement("div",{style:{userSelect:"none"},contentEditable:!1,className:"absolute top-1 right-1"},j.default.createElement("div",{className:"flex w-full"},j.default.createElement("div",null),j.default.createElement(Nl,{label:N.CODE_BLOCK_LANGUAGES[r.lang]||"Language",items:o}))),j.default.createElement("pre",m(d({},n),{className:"pt-10 m-0"}),j.default.createElement("code",d({},i))))},Ml="mt-0.5",zl="font-normal",Hl=()=>({[z.ELEMENT_H1]:e=>{var t=e,{attributes:n,editor:a,element:r,className:i}=t,l=u(t,["attributes","editor","element","className"]);return j.default.createElement("h1",d(d({className:kl(zl,Ml,i,"text-4xl font-medium")},n),l))},[z.ELEMENT_H2]:e=>{var t=e,{attributes:n,editor:a,element:r,className:i}=t,l=u(t,["attributes","editor","element","className"]);return j.default.createElement("h2",d(d({className:kl(zl,Ml,i,"text-3xl font-medium")},n),l))},[z.ELEMENT_H3]:e=>{var t=e,{attributes:n,editor:a,element:r,className:i}=t,l=u(t,["attributes","editor","element","className"]);return j.default.createElement("h3",d(d({className:kl(zl,Ml,i,"text-2xl font-semibold")},n),l))},[z.ELEMENT_H4]:e=>{var t=e,{attributes:n,editor:a,element:r,className:i}=t,l=u(t,["attributes","editor","element","className"]);return j.default.createElement("h4",d(d({className:kl(zl,Ml,i,"text-xl font-bold")},n),l))},[z.ELEMENT_H5]:e=>{var t=e,{attributes:n,editor:a,element:r,className:i}=t,l=u(t,["attributes","editor","element","className"]);return j.default.createElement("h5",d(d({className:kl(zl,Ml,i,"text-lg font-bold")},n),l))},[z.ELEMENT_H6]:e=>{var t=e,{attributes:n,editor:a,element:r,className:i}=t,l=u(t,["attributes","editor","element","className"]);return j.default.createElement("h6",d(d({className:kl(zl,Ml,i,"text-base font-bold")},n),l))},[C.ELEMENT_PARAGRAPH]:e=>{var t=e,{attributes:n,className:a,editor:r,element:i}=t,l=u(t,["attributes","className","editor","element"]);return j.default.createElement("p",d(d({className:kl(Ml,a,"text-base font-normal")},n),l))},[L.ELEMENT_BLOCKQUOTE]:e=>{var t=e,{className:n,attributes:a,editor:r,element:i}=t,l=u(t,["className","attributes","editor","element"]);return j.default.createElement("blockquote",d(d({className:kl("not-italic",Ml,n)},a),l))},[N.ELEMENT_CODE_BLOCK]:e=>j.default.createElement(Ll,d({},e)),[M.ELEMENT_UL]:e=>{var t=e,{attributes:n,editor:a,className:r,element:i}=t,l=u(t,["attributes","editor","className","element"]);return j.default.createElement("ul",d(d({className:kl(Ml,r)},n),l))},[M.ELEMENT_LI]:e=>{var t=e,{attributes:n,editor:a,className:r,element:i}=t,l=u(t,["attributes","editor","className","element"]);return j.default.createElement("li",d(d({className:kl(Ml,r)},n),l))},[M.ELEMENT_OL]:e=>{var t=e,{attributes:n,editor:a,className:r,element:i}=t,l=u(t,["attributes","editor","className","element"]);return j.default.createElement("ol",d(d({className:kl(Ml,r)},n),l))},[M.ELEMENT_LI]:e=>{var t=e,{attributes:n,className:a,editor:r,element:i}=t,l=u(t,["attributes","className","editor","element"]);return j.default.createElement("li",d(d({className:kl("mt-0 mb-1",a)},n),l))},[M.ELEMENT_LIC]:e=>{var t=e,{attributes:n,editor:a,element:r,className:i}=t,l=u(t,["attributes","editor","element","className"]);return j.default.createElement("span",d(d({className:kl(i)},n),l))},[k.ELEMENT_LINK]:e=>{var t=e,{attributes:n,editor:a,element:r,nodeProps:i,className:l}=t,o=u(t,["attributes","editor","element","nodeProps","className"]);return j.default.createElement("a",d(d({className:kl(l)},n),o))},[H.MARK_CODE]:e=>{var t=e,{editor:n,leaf:a,text:r,attributes:i,className:l}=t,o=u(t,["editor","leaf","text","attributes","className"]);return j.default.createElement("code",d(d({className:kl("bg-gray-100 p-1 rounded-sm",l)},i),o))},[H.MARK_ITALIC]:e=>{var t=e,{editor:n,leaf:a,text:r}=t,i=u(t,["editor","leaf","text"]);return j.default.createElement("em",d(d({},i.attributes),i))},[H.MARK_BOLD]:e=>{var t=e,{editor:n,leaf:a,text:r}=t,i=u(t,["editor","leaf","text"]);return j.default.createElement("strong",d(d({},i.attributes),i))},[E.ELEMENT_HR]:e=>{var t=e,{attributes:n,className:a,editor:r,element:i,children:l}=t,o=u(t,["attributes","className","editor","element","children"]);const s=x.useSelected();return j.default.createElement("div",d(d({className:kl(a,"cursor-pointer relative border bg-gray-200 my-4")},n),o),l,s&&j.default.createElement("span",{className:"absolute h-4 -top-2 inset-0 ring-2 ring-blue-100 ring-inset rounded-md z-10 pointer-events-none"}))}}),Tl=({name:e})=>({heading:j.default.createElement(Pl,null),link:j.default.createElement(Vl,null),quote:j.default.createElement(_l,null),image:j.default.createElement(Ol,null),ul:j.default.createElement(Fl,null),ol:j.default.createElement(Bl,null),code:j.default.createElement(Il,null),codeBlock:j.default.createElement(Rl,null),bold:j.default.createElement($l,null),italic:j.default.createElement(Dl,null)}[e]),Sl=({title:e})=>j.default.createElement(j.default.Fragment,null,e&&j.default.createElement("span",{className:"sr-only"},e),j.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},j.default.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"})));function Fl(e){const t=e.title||"format list bulleted";return j.default.createElement("svg",{className:"h-5 w-5",height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M7 5h14v2H7V5z",fill:"currentColor"}),j.default.createElement("path",{d:"M4 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",fill:"currentColor"}),j.default.createElement("path",{d:"M7 11h14v2H7v-2zm0 6h14v2H7v-2zm-3 2.5c.82 0 1.5-.68 1.5-1.5s-.67-1.5-1.5-1.5-1.5.68-1.5 1.5.68 1.5 1.5 1.5z",fill:"currentColor"}),j.default.createElement("path",{d:"M4 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",fill:"currentColor"})))}function Pl(e){const t=e.title||"format size";return j.default.createElement("svg",{height:"24",width:"24",className:"h-5 w-5",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z",fill:"currentColor"})))}function Bl(e){const t=e.title||"format list numbered";return j.default.createElement("svg",{className:"h-5 w-5",height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z",fill:"currentColor"})))}function _l(e){const t=e.title||"format quote";return j.default.createElement("svg",{height:"24",className:"h-5 w-5",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z",fill:"currentColor"})))}function Vl(e){const t=e.title||"insert link";return j.default.createElement("svg",{height:"24",className:"h-5 w-5",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",fill:"currentColor"})))}function Il(e){const t=e.title||"code";return j.default.createElement("svg",{className:"h-5 w-5",height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",fill:"currentColor"})))}function Rl(e){return e.title,j.default.createElement("svg",{className:"h-5 w-5",stroke:"currentColor",fill:"currentColor",strokeWidth:0,viewBox:"0 0 16 16",height:"1em",width:"1em",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("path",{d:"M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"}),j.default.createElement("path",{d:"M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z"}))}function Ol(e){const t=e.title||"image";return j.default.createElement("svg",{className:"h-5 w-5",height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M19 5v14H5V5h14zm0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z",fill:"currentColor"})))}function $l(e){const t=e.title||"format bold";return j.default.createElement("svg",{className:"h-5 w-5",height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z",fill:"currentColor"})))}function Dl(e){const t=e.title||"format italic";return j.default.createElement("svg",{className:"h-5 w-5",height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},j.default.createElement("title",null,t),j.default.createElement("g",{fill:"none"},j.default.createElement("path",{d:"M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z",fill:"currentColor"})))}function Al({className:e=""}){return j.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",className:`h-4 w-4 ${e}`,viewBox:"0 0 20 20",fill:"currentColor"},j.default.createElement("path",{fillRule:"evenodd",d:"M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z",clipRule:"evenodd"}))}const jl=e=>{const t=yn(),n=j.default.useMemo((()=>Cl()),[e.id]),a=j.default.useMemo((()=>new Tt(m(d({},e),{id:n,onChange:({values:t})=>{e.onChange(t)},onSubmit:()=>{}}))),[n]);return j.default.createElement(t,null,(({zIndexShift:t})=>j.default.createElement(hr,{isExpanded:!0,style:{zIndex:t+1e3}},j.default.createElement(pr,{onClick:e.onClose},e.label),j.default.createElement(Tn,{form:a,hideFooter:!0}))))},Zl=(e,t)=>{const n=x.ReactEditor.findPath(e,t),a=x.ReactEditor.toDOMNode(e,e);a&&(a.focus(),setTimeout((()=>{b.Transforms.select(e,n)}),1))},Kl=(e,t)=>{const n=x.ReactEditor.findPath(e,t);b.Transforms.removeNodes(e,{at:n})},Gl=(e,t)=>{const n=x.useSelected();j.default.useEffect((()=>{const a=a=>{n&&Y.default(e,a)&&(a.preventDefault(),t())};return document.addEventListener("keydown",a),()=>document.removeEventListener("keydown",a)}),[n])},Ul=(e,t)=>{const[n,a]=j.default.useState(!1);return{isExpanded:n,handleClose:()=>{a(!1),Zl(e,t)},handleRemove:()=>{Kl(e,t)},handleSelect:e=>{e.preventDefault(),a(!0)}}},Yl=j.default.createContext({templates:[]}),Wl=()=>{const{templates:e}=j.default.useContext(Yl);return e},ql=({inline:e,children:t})=>{const n=e?"span":"div";return j.default.createElement(n,{contentEditable:!1,style:{userSelect:"none"},className:"relative"},t)},Xl=({attributes:e,children:t,element:n,onChange:a,editor:r})=>{const i=x.useSelected(),{handleClose:l,handleRemove:o,handleSelect:s,isExpanded:c}=Ul(r,n);Gl("enter",(()=>{y.insertNodes(r,[{type:C.ELEMENT_PARAGRAPH,children:[{text:""}]}])})),Gl("space",(()=>{y.insertNodes(r,[{text:" "}],{match:e=>{if(b.Element.isElement(e)&&e.type===Ho)return!0},select:!0})}));const m=Wl().find((e=>e.name===n.name)),u={activeTemplate:m,element:n,editor:r,onChange:a,onClose:l};return m?j.default.createElement("span",d({},e),t,j.default.createElement(ql,{inline:!0},j.default.createElement("span",{style:{margin:"0 0.5px"},className:"relative inline-flex shadow-sm rounded-md leading-none"},i&&j.default.createElement("span",{className:"absolute inset-0 ring-2 ring-blue-100 ring-inset rounded-md z-10 pointer-events-none"}),j.default.createElement("span",{style:{fontWeight:"inherit"},className:"cursor-pointer relative inline-flex items-center justify-start px-2 py-0.5 rounded-l-md border border-gray-200 bg-white  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",onMouseDown:s},m.label||m.name),j.default.createElement(eo,{onOpen:s,onRemove:o})),c&&j.default.createElement(Ql,d({},u)))):null},Jl=({attributes:e,children:t,element:n,editor:a,onChange:r})=>{const i=x.useSelected(),{handleClose:l,handleRemove:o,handleSelect:s,isExpanded:c}=Ul(a,n);Gl("enter",(()=>{y.insertNodes(a,[{type:C.ELEMENT_PARAGRAPH,children:[{text:""}]}])}));const u=Wl().find((e=>e.name===n.name)),p={activeTemplate:u,element:n,editor:a,onChange:r,onClose:l};return u?j.default.createElement("div",m(d({},e),{className:"w-full my-2"}),t,j.default.createElement(ql,{inline:!1},j.default.createElement("span",{className:"relative w-full inline-flex shadow-sm rounded-md"},i&&j.default.createElement("span",{className:"absolute inset-0 ring-2 ring-blue-100 ring-inset rounded-md z-10 pointer-events-none"}),j.default.createElement("span",{onMouseDown:s,className:"cursor-pointer w-full relative inline-flex items-center justify-start px-4 py-2 rounded-l-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"},u.label||u.name),j.default.createElement(eo,{onOpen:s,onRemove:o})),c&&j.default.createElement(Ql,d({},p)))):null},Ql=({editor:e,element:t,activeTemplate:n,onClose:a,onChange:r})=>{const i=[...x.ReactEditor.findPath(e,t),n.name].join(".");return j.default.createElement(jl,{id:i,label:n.label,fields:n.fields,initialValues:t.props,onChange:r,onClose:a})},eo=({onOpen:e,onRemove:t})=>j.default.createElement(w.Popover,{as:"span",className:"-ml-px relative block"},j.default.createElement(w.Popover.Button,{as:"span",className:"cursor-pointer h-full relative inline-flex items-center px-1 py-0.5 rounded-r-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"},j.default.createElement(Sl,{title:"Open options"})),j.default.createElement(w.Transition,{as:j.default.Fragment,enter:"transition ease-out duration-100",enterFrom:"transform opacity-0 scale-95",enterTo:"transform opacity-100 scale-100",leave:"transition ease-in duration-75",leaveFrom:"transform opacity-100 scale-100",leaveTo:"transform opacity-0 scale-95"},j.default.createElement("div",{className:"z-30 origin-top-right absolute right-0 mt-2 -mr-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"},j.default.createElement("div",{className:"py-1"},j.default.createElement("span",{onClick:e,className:kl("cursor-pointer text-left w-full block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900")},"Edit"),j.default.createElement("button",{onMouseDown:e=>{e.preventDefault(),t()},className:kl("cursor-pointer text-left w-full block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900")},"Remove"))))),to=({inline:e,children:t})=>{const n=e?"span":"div";return j.default.createElement(n,{contentEditable:!1,style:{userSelect:"none"},className:"relative"},t)},no=({attributes:e,children:t,element:n,editor:a,onChange:r})=>{const i=x.useSelected(),{handleClose:l,handleRemove:o,handleSelect:s,isExpanded:c}=Ul(a,n);return Gl("enter",(()=>{y.insertNodes(a,[{type:C.ELEMENT_PARAGRAPH,children:[{text:""}]}])})),j.default.createElement("div",m(d({},e),{className:"w-full mb-2"}),t,j.default.createElement(to,{inline:!1},j.default.createElement("span",{className:"relative w-full inline-flex shadow-sm rounded-md"},i&&j.default.createElement("span",{className:"z-10 absolute inset-0 ring-2 ring-blue-100 ring-inset rounded-md pointer-events-none"}),j.default.createElement("div",{className:"z-10"},j.default.createElement(Ra,{onClick:e=>{e.stopPropagation(),o()}})),j.default.createElement("span",{onMouseDown:s,style:{minHeight:"50px"},className:"cursor-pointer flex items-center justify-center rounded-md w-full relative bg-gray-100 overflow-hidden"},n.url?j.default.createElement("img",{className:"my-0",src:n.url,title:n.caption,alt:n.alt}):j.default.createElement("span",{className:"absolute inset-0 flex items-center justify-center text-gray-300"},j.default.createElement("span",null,"Click to add an image")))),c&&j.default.createElement(ao,{onChange:r,initialValues:n,onClose:l,element:n})))},ao=e=>j.default.createElement(jl,{id:"image-form",label:"Image",fields:[{label:"URL",name:"url",component:"image",clearable:!0},{label:"Caption",name:"caption",component:"text"},{label:"Alt",name:"alt",component:"text"}],initialValues:e.initialValues,onChange:e.onChange,onClose:e.onClose}),ro="img",io=y.createPluginFactory({key:ro,isVoid:!0,isInline:!1,isElement:!0,component:e=>{const t=t=>{const n=x.ReactEditor.findPath(e.editor,e.element);y.setNodes(e.editor,t,{at:n})};return j.default.createElement(no,m(d({},e),{onChange:t}))}}),lo=e=>{Lo(e,{type:ro,children:[{text:""}],url:"",caption:"",alt:""}),b.Editor.normalize(e,{force:!0})},oo=e=>M.unwrapList(e),so=(e,t)=>{if(e.selection){const n=y.getParent(e,e.selection);if(!n)return;const[a]=n;!y.isElement(a)||y.isType(e,a,N.ELEMENT_CODE_BLOCK)||y.isType(e,a,N.ELEMENT_CODE_LINE)||t()}},co=(e,t)=>{so(e,(()=>M.toggleList(e,{type:t})))},mo=[{mode:"block",type:z.ELEMENT_H1,match:"# ",preFormat:oo},{mode:"block",type:z.ELEMENT_H2,match:"## ",preFormat:oo},{mode:"block",type:z.ELEMENT_H3,match:"### ",preFormat:oo},{mode:"block",type:z.ELEMENT_H4,match:"#### ",preFormat:oo},{mode:"block",type:z.ELEMENT_H5,match:"##### ",preFormat:oo},{mode:"block",type:z.ELEMENT_H6,match:"###### ",preFormat:oo},{mode:"block",type:L.ELEMENT_BLOCKQUOTE,match:"> ",preFormat:oo},{mode:"block",type:N.ELEMENT_CODE_BLOCK,match:"```",triggerAtBlockStart:!1,preFormat:oo,format:e=>{N.insertEmptyCodeBlock(e,{defaultType:y.getPluginType(e,y.ELEMENT_DEFAULT),insertNodesOptions:{select:!0}})}},{mode:"block",type:E.ELEMENT_HR,match:["---","\u2014-","___ "],format:e=>{y.setNodes(e,{type:E.ELEMENT_HR}),y.insertNodes(e,{type:y.ELEMENT_DEFAULT,children:[{text:""}]})}}],uo=[{mode:"block",type:M.ELEMENT_LI,match:["* ","- "],preFormat:oo,format:e=>co(e,M.ELEMENT_UL)},{mode:"block",type:M.ELEMENT_LI,match:["1. ","1) "],preFormat:oo,format:e=>co(e,M.ELEMENT_OL)},{mode:"block",type:M.ELEMENT_TODO_LI,match:"[] "},{mode:"block",type:M.ELEMENT_TODO_LI,match:"[x] ",format:e=>y.setNodes(e,{type:M.ELEMENT_TODO_LI,checked:!0},{match:t=>b.Editor.isBlock(e,t)})}],po=[{mode:"mark",type:[H.MARK_BOLD,H.MARK_ITALIC],match:"***"},{mode:"mark",type:H.MARK_BOLD,match:"**"},{mode:"mark",type:H.MARK_ITALIC,match:"*"},{mode:"mark",type:H.MARK_ITALIC,match:"_"},{mode:"mark",type:H.MARK_CODE,match:"`"}],go=[...mo,...uo,...po],fo=(e,t)=>{var{options:n}=t,a=n,{level:r}=a,i=u(a,["level"]);const{normalizeNode:l}=e;return e.normalizeNode=([t,n])=>{const a=y.getLastNode(e,r),o=null==a?void 0:a[0];if(!(!o||[To,Ho,ro].includes(o.type)&&y.queryNode(a,i)))return l([t,n]);{const t=a?b.Path.next(a[1]):[0];y.insertNodes(e,{type:C.ELEMENT_PARAGRAPH,children:[{text:""}]},{at:t})}},e},ho="trailingBlock",wo=y.createPluginFactory({key:ho,withOverrides:fo,options:{level:0},then:e=>({type:y.getPluginType(e,y.ELEMENT_DEFAULT)})}),vo=e=>{const{deleteBackward:t,insertBreak:n}=e;return e.insertBreak=()=>{if(!e.selection||!b.Range.isCollapsed(e.selection))return n();const t=b.Path.parent(e.selection.anchor.path),a=b.Node.get(e,t);b.Editor.isVoid(e,a)?b.Editor.insertNode(e,{type:"p",children:[{text:""}]}):n()},e.deleteBackward=n=>{if(!e.selection||!b.Range.isCollapsed(e.selection)||0!==e.selection.anchor.offset)return t(n);const a=b.Path.parent(e.selection.anchor.path),r=b.Node.get(e,a);if(0===b.Node.string(r).length&&b.Path.hasPrevious(a)){const t=b.Path.previous(a),n=b.Node.get(e,t);if(b.Editor.isVoid(e,n))return b.Transforms.removeNodes(e),void b.Editor.normalize(e,{force:!0})}t(n)},e},bo=[z.ELEMENT_H1,z.ELEMENT_H2,z.ELEMENT_H3,z.ELEMENT_H3,z.ELEMENT_H4,z.ELEMENT_H5,z.ELEMENT_H6,C.ELEMENT_PARAGRAPH],xo={types:[L.ELEMENT_BLOCKQUOTE,z.ELEMENT_H1,z.ELEMENT_H2,z.ELEMENT_H3,z.ELEMENT_H3,z.ELEMENT_H4,z.ELEMENT_H5,z.ELEMENT_H6],defaultType:C.ELEMENT_PARAGRAPH},yo=y.createPluginFactory({key:"WITH_CORRECT_NODE_BEHAVIOR",withOverrides:vo}),Eo=[wo(),yo(),F.createAutoformatPlugin({options:{rules:go}}),P.createExitBreakPlugin({options:{rules:[{hotkey:"mod+enter"},{hotkey:"mod+shift+enter",before:!0},{hotkey:"enter",query:{start:!0,end:!0,allow:z.KEYS_HEADING}}]}}),B.createResetNodePlugin({options:{rules:[m(d({},xo),{hotkey:"Enter",predicate:y.isBlockAboveEmpty}),m(d({},xo),{hotkey:"Backspace",predicate:y.isSelectionAtBlockStart})]}}),P.createSoftBreakPlugin({options:{rules:[{hotkey:"shift+enter"},{hotkey:"enter",query:{allow:[N.ELEMENT_CODE_BLOCK,L.ELEMENT_BLOCKQUOTE]}}]}})],ko=[z.createHeadingPlugin(),C.createParagraphPlugin(),N.createCodeBlockPlugin(),L.createBlockquotePlugin(),H.createBoldPlugin(),H.createItalicPlugin(),H.createUnderlinePlugin(),H.createCodePlugin(),M.createListPlugin(),E.createHorizontalRulePlugin(),S.createNodeIdPlugin()],Co=e=>[To,Ho,ro].includes(e.type)?m(d({},e),{children:[{type:"text",text:""}]}):e.children?e.children.length?m(d({},e),{children:e.children.map(Co)}):m(d({},e),{children:[{text:""}]}):e,No=(e,t)=>{y.insertNodes(e,[t]),setTimeout((()=>{b.Transforms.move(e)}),1)},Lo=(e,t)=>{const n=x.ReactEditor.toDOMNode(e,e);n&&(n.focus(),setTimeout((()=>{Mo(e)?(console.log("itsempty"),y.setNodes(e,t)):y.insertNodes(e,[t])}),1))},Mo=e=>{var t;if(!e.selection)return!1;const[n]=b.Editor.node(e,e.selection),a=e.selection.focus,r=y.getBlockAbove(e);return!b.Node.string(n)&&!(null==(t=n.children)?void 0:t.some((t=>b.Editor.isInline(e,t))))&&b.Editor.isStart(e,a,r[1])},zo={isNodeActive:(e,t)=>{const n=y.getPluginType(e,t);return!!(null==e?void 0:e.selection)&&y.someNode(e,{match:{type:n}})},isMarkActive:(e,t)=>!!(null==e?void 0:e.selection)&&y.isMarkActive(e,t),isListActive:(e,t)=>{const n=!!(null==e?void 0:e.selection)&&M.getListItemEntry(e);return!!n&&n.list[0].type===t},currentNodeSupportsMDX:e=>y.findNode(e,{match:{type:bo}}),normalize:Co},Ho="mdxJsxTextElement",To="mdxJsxFlowElement",So=e=>{const t=t=>{const n=x.ReactEditor.findPath(e.editor,e.element);y.setNodes(e.editor,{props:t},{at:n})};return e.inline?j.default.createElement(Xl,m(d({},e),{onChange:t})):j.default.createElement(Jl,m(d({},e),{onChange:t}))},Fo=y.createPluginFactory({key:Ho,isInline:!0,isVoid:!0,isElement:!0,component:e=>j.default.createElement(So,m(d({},e),{inline:!0}))}),Po=y.createPluginFactory({key:To,isVoid:!0,isElement:!0,component:e=>j.default.createElement(So,m(d({},e),{inline:!1}))}),Bo=(e,t)=>{const n=!t.inline;zo.currentNodeSupportsMDX(e)&&(n?(Lo(e,{type:To,name:t.name,children:[{text:""}],props:t.defaultItem?t.defaultItem:{}}),b.Editor.normalize(e,{force:!0})):No(e,{type:Ho,name:t.name,children:[{text:""}],props:t.defaultItem?t.defaultItem:{}}))},_o=e=>{const t={type:"a",url:"",title:"",children:[{text:""}]};if(y.isCollapsed(e.selection)){const[,t]=y.getAbove(e,{match:t=>!b.Editor.isEditor(t)&&b.Element.isElement(t)&&y.getPluginType(e,k.ELEMENT_LINK)});b.Transforms.select(e,t)}if(Io(e)){const[n]=Oo(e);t.url=n[0].url,t.title=n[0].title,Ro(e)}y.wrapNodes(e,t,{split:!0})},Vo=e=>{const t=y.useEditorState(),n=j.default.useMemo((()=>t.selection),[]),a=e=>{const a=y.getNodes(t,{match:e=>!b.Editor.isEditor(e)&&b.Element.isElement(e)&&e.type===k.ELEMENT_LINK,at:n});if(a)for(const[,n]of a)y.setNodes(t,e,{match:e=>!b.Editor.isEditor(e)&&b.Element.isElement(e)&&e.type===k.ELEMENT_LINK,at:n})},[r]=Oo(t);return j.default.createElement(jl,{id:"link-form",label:"Link",fields:[{label:"URL",name:"url",component:"text"},{label:"Title",name:"title",component:"text"}],initialValues:{url:r?r[0].url:"",title:r?r[0].title:""},onChange:a,onClose:e.onClose})},Io=e=>{const[t]=Oo(e);return!!t},Ro=(e,t)=>{y.unwrapNodes(e,{match:e=>!b.Editor.isEditor(e)&&b.Element.isElement(e)&&e.type===k.ELEMENT_LINK,at:t||void 0})},Oo=e=>y.getNodes(e,{match:e=>!b.Editor.isEditor(e)&&b.Element.isElement(e)&&e.type===k.ELEMENT_LINK}),$o=({hidden:e,label:n,active:a,onMouseDown:r,icon:i,options:l,name:o,isLastItem:s=!1})=>{const c=y.useEditorState(),[d,m]=j.default.useState(null);j.default.useEffect((()=>{c.selection&&m(c.selection)}),[JSON.stringify(c.selection)]);const[u,p]=j.default.useState(!1);if(l)return j.default.createElement(w.Popover,{as:"div",className:"relative z-10 w-full"},j.default.createElement(w.Popover.Button,{as:"span",className:"cursor-pointer w-full inline-flex justify-center items-center px-2 py-2 rounded-l-md border-l border-b border-t border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 "+(s?"border-r rounded-r-md":"border-r-0"),onMouseDown:e=>{e.preventDefault()}},j.default.createElement("span",{className:"sr-only"},"Open options"),j.default.createElement(Pl,null)),j.default.createElement(w.Transition,{as:t.Fragment,enter:"transition ease-out duration-100",enterFrom:"transform opacity-0 scale-95",enterTo:"transform opacity-100 scale-100",leave:"transition ease-in duration-75",leaveFrom:"transform opacity-100 scale-100",leaveTo:"transform opacity-0 scale-95"},j.default.createElement("div",{className:"origin-top-left absolute left-0 mt-2 -mr-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"},j.default.createElement("div",{className:"py-2 prose"},l))));if("image"===i)return j.default.createElement("span",{className:"relative"},j.default.createElement("span",{"data-test":`${o}Button`,className:`cursor-pointer w-full inline-flex relative justify-center items-center px-2 py-2 border-l border-b border-t border-r-0 border-gray-200 text-sm font-medium  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${a?"bg-gray-50 text-blue-500":"bg-white text-gray-600"} ${s?"border-r rounded-r-md":"border-r-0"}`,style:{visibility:e?"hidden":"visible",pointerEvents:e?"none":"auto"},onMouseDown:e=>{e.preventDefault(),lo(c)}},j.default.createElement("span",{className:"sr-only"},n),j.default.createElement(Tl,{name:i})));if("link"===i){const t=!c.selection||y.isCollapsed(c.selection)&&!Io(c);return j.default.createElement("span",{className:"relative"},j.default.createElement("span",{"data-test":`${o}Button`,className:`cursor-pointer w-full inline-flex relative justify-center items-center px-2 py-2 border-l border-b border-t border-r-0 border-gray-200 text-sm font-medium  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${a?"bg-gray-50 text-blue-500":t?"bg-gray-50 text-gray-300":"bg-white text-gray-600"} ${s?"border-r rounded-r-md":"border-r-0"}`,style:{visibility:e?"hidden":"visible",pointerEvents:e?"none":"auto"},onMouseDown:e=>{e.preventDefault(),t||(_o(c),p((e=>!e)))}},j.default.createElement("span",{className:"sr-only"},n),j.default.createElement(Tl,{name:i})),u&&j.default.createElement(Vo,{selection:d,onClose:e=>{p(!1)},onChange:e=>console.log(e)}))}return j.default.createElement("span",{"data-test":`${o}Button`,className:`cursor-pointer w-full inline-flex relative justify-center items-center px-2 py-2 border-l border-b border-t border-r-0 border-gray-200 text-sm font-medium  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${a?"bg-gray-50 text-blue-500":"bg-white text-gray-600"} ${s?"border-r rounded-r-md":"border-r-0"}`,style:{visibility:e?"hidden":"visible",pointerEvents:e?"none":"auto"},onMouseDown:r},j.default.createElement("span",{className:"sr-only"},n),j.default.createElement(Tl,{name:i}))},Do=({editor:e,templates:n})=>j.default.createElement(w.Popover,{as:"span",className:"relative z-10 block",style:{width:"85px"}},(({open:a})=>j.default.createElement(j.default.Fragment,null,j.default.createElement(w.Popover.Button,{as:"span",onMouseDown:e=>{e.preventDefault()},className:"cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md border  text-sm font-medium transition-all ease-out duration-150 hover:bg-blue-500 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 "+(a?"bg-gray-50 border-gray-200 text-blue-500":"text-white border-blue-500 bg-blue-500")},j.default.createElement("span",{className:"text-sm font-semibold tracking-wide align-baseline mr-1"},"Embed"),j.default.createElement(Al,{className:"origin-center transition-all ease-out duration-150 "+(a?"rotate-45":"")})),j.default.createElement(w.Transition,{as:t.Fragment,enter:"transition ease-out duration-100",enterFrom:"transform opacity-0 scale-95",enterTo:"transform opacity-100 scale-100",leave:"transition ease-in duration-75",leaveFrom:"transform opacity-100 scale-100",leaveTo:"transform opacity-0 scale-95"},j.default.createElement("div",{className:"origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1 max-h-[10rem] overflow-scroll"},n.map((t=>j.default.createElement("span",{key:t.name,onMouseDown:n=>{n.preventDefault(),Bo(e,t)},className:"hover:bg-gray-50 hover:text-blue-500 cursor-pointer pointer-events-auto px-4 py-2 text-sm w-full flex items-center"},t.name)))))))),Ao=({toolbarItems:e,itemsShown:n,showEmbed:a})=>A.createElement(w.Popover,{as:"span",className:"relative z-10 block w-full"},A.createElement(w.Popover.Button,{"data-test":"popoverRichTextButton",as:"span",className:"cursor-pointer relative w-full justify-center inline-flex border border-gray-200 focus:border-blue-500 items-center px-2 py-2 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 pointer-events-auto "+(a?"rounded-none":"rounded-r-md"),onMouseDown:e=>{e.preventDefault()}},A.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},A.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"}))),A.createElement(w.Transition,{as:t.Fragment,enter:"transition ease-out duration-100",enterFrom:"transform opacity-0 scale-95",enterTo:"transform opacity-100 scale-100",leave:"transition ease-in duration-75",leaveFrom:"transform opacity-100 scale-100",leaveTo:"transform opacity-0 scale-95"},A.createElement("div",{className:"origin-top-right absolute right-0 mt-2 -mr-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1"},e.map(((e,t)=>t<n-1?null:A.createElement("span",{"data-test":`${e.name}OverflowButton`,key:e.name,onMouseDown:t=>{t.preventDefault(),e.onMouseDown(t)},className:kl(e.active?"bg-gray-50 text-blue-500":"bg-white text-gray-600","hover:bg-gray-50 hover:text-blue-500 cursor-pointer pointer-events-auto px-4 py-2 text-sm w-full flex items-center")},A.createElement("div",{className:"mr-2 opacity-80"},A.createElement(Tl,{name:e.name}))," ",e.label)))))),jo=(e,t)=>{j.default.useEffect((()=>{const n=new ResizeObserver((e=>{for(const n of e)t(n)}));return e.current&&n.observe(e.current),()=>n.disconnect()}),[e.current])},Zo=({children:e,position:t})=>{const n=A.useRef(),a=y.useEditorState(),{selection:r}=a;return A.useEffect((()=>{const e=n.current;if(e){if(!r||!x.ReactEditor.isFocused(a)||b.Range.isCollapsed(r)||""===b.Editor.string(a,r))return e.classList.add("hidden"),void e.classList.remove("block");e.classList.add("block"),e.classList.remove("hidden"),(async()=>{if(n.current){const e=window.getSelection().getRangeAt(0),{x:a,y:r}=await _.computePosition(e,n.current,{placement:t||"top",middleware:[_.flip(),_.shift()]});Object.assign(n.current.style,{left:`${a}px`,top:`${r}px`})}})()}}),[JSON.stringify(r),n.current]),A.createElement("div",{ref:n,className:"absolute z-10"},e)},Ko=[{name:z.ELEMENT_H1,render:A.createElement("h1",{className:"my-0 text-4xl font-medium"},"Heading 1")},{name:z.ELEMENT_H2,render:A.createElement("h2",{className:"my-0 text-3xl font-medium"},"Heading 2")},{name:z.ELEMENT_H3,render:A.createElement("h3",{className:"my-0 text-2xl font-semibold"},"Heading 3")},{name:z.ELEMENT_H4,render:A.createElement("h4",{className:"my-0 text-xl font-bold"},"Heading 4")},{name:z.ELEMENT_H5,render:A.createElement("h5",{className:"my-0 text-lg font-bold"},"Heading 5")},{name:z.ELEMENT_H6,render:A.createElement("h6",{className:"my-0 text-base font-bold"},"Heading 6")},{name:C.ELEMENT_PARAGRAPH,render:A.createElement("p",{className:"my-0"},"Paragraph")}],Go=40,Uo=85;function Yo({templates:e}){const t=e.length>0,n=A.useRef(null),a=y.useEditorState(),r=zo.isMarkActive(a,H.MARK_BOLD),i=zo.isMarkActive(a,H.MARK_CODE),l=zo.isMarkActive(a,H.MARK_ITALIC),o=zo.isNodeActive(a,k.ELEMENT_LINK),s=zo.isListActive(a,M.ELEMENT_UL),c=zo.isListActive(a,M.ELEMENT_OL),d=zo.isNodeActive(a,N.ELEMENT_CODE_BLOCK),m=zo.isNodeActive(a,L.ELEMENT_BLOCKQUOTE),u=zo.isNodeActive(a,ro),p=[{name:"heading",label:"Heading",active:!1,options:Ko.map((e=>A.createElement("span",{key:e.name,onMouseDown:y.getPreventDefaultHandler(y.toggleNodeType,a,{activeType:e.name}),className:kl("hover:bg-gray-100 hover:text-gray-900 cursor-pointer block px-4 py-2 text-sm w-full text-left")},e.render)))},{name:"link",label:"Link",active:o},{name:"image",label:"Image",active:u},{name:"quote",label:"Quote",active:m,onMouseDown:y.getPreventDefaultHandler(y.toggleNodeType,a,{activeType:L.ELEMENT_BLOCKQUOTE})},{name:"ul",label:"Bullet List",active:s,onMouseDown:y.getPreventDefaultHandler(M.toggleList,a,{type:M.ELEMENT_UL})},{name:"ol",label:"List",active:c,onMouseDown:y.getPreventDefaultHandler(M.toggleList,a,{type:M.ELEMENT_OL})},{name:"code",label:"Code",active:i,onMouseDown:y.getPreventDefaultHandler(y.toggleMark,a,{key:H.MARK_CODE})},{name:"codeBlock",label:"Code Block",active:d,onMouseDown:y.getPreventDefaultHandler(N.insertEmptyCodeBlock,a,{insertNodesOptions:{select:!0}})},{name:"bold",label:"Bold",active:r,onMouseDown:y.getPreventDefaultHandler(y.toggleMark,a,{key:H.MARK_BOLD})},{name:"italic",label:"Italic",active:l,onMouseDown:y.getPreventDefaultHandler(y.toggleMark,a,{key:H.MARK_ITALIC})}],[g,f]=A.useState(p.length);return jo(n,(e=>{const n=(e.target.getBoundingClientRect().width-(t?Uo:0))/Go;f(Math.floor(n))})),A.createElement("div",{className:"sticky -top-4 inline-flex shadow rounded-md mb-2 z-50 max-w-full",style:{width:`${p.length*Go+(t?Uo:0)}px`}},A.createElement("div",{ref:n,className:"grid w-full",style:{gridTemplateColumns:t?`1fr ${Uo}px`:"1fr"}},A.createElement("div",{className:"grid",style:{gridTemplateColumns:`repeat(auto-fit, minmax(${Go}px, 1fr))`,gridTemplateRows:"auto",gridAutoRows:0}},p.map(((e,n)=>{const a=n+1===g,r=n+1>g;return g<p.length&&a?A.createElement(Ao,{key:e.name,itemsShown:g,toolbarItems:p,showEmbed:t}):A.createElement($o,{key:e.name,name:e.name,hidden:r,active:e.active,onMouseDown:e.onMouseDown,label:e.label,options:e.options,icon:e.name,isLastItem:a&&!t})}))),t&&A.createElement(Do,{templates:e,editor:a})))}const Wo=()=>{const e=y.useEditorState(),t=zo.isNodeActive(e,k.ELEMENT_LINK);return A.createElement(Zo,{position:"bottom"},t&&A.createElement("button",{onMouseDown:t=>{t.preventDefault(),Ro(e)},className:"mt-2 cursor-pointer hover:bg-gray-100 border border-gray-200 rounded-md bg-gray-100 text-gray-600 py-1 px-2"},"Clear"))};function qo(e,t){switch(t.type){case"selectItem":return m(d({},e),{activeIndex:t.value,status:"selected"});case"updateValue":const n=t.value.toLocaleLowerCase(),a=""===n?e.initialTemplates:e.activeTemplates.filter((e=>e.name.toLocaleLowerCase().startsWith(n)||e.label.toLocaleLowerCase().startsWith(n)));return 0===a.length?m(d({},e),{activeTemplates:a,activeIndex:0,value:t.value,status:"cancelled"}):m(d({},e),{activeTemplates:a,activeIndex:0,value:t.value});case"selectCurrentItem":return m(d({},e),{status:"selected"});case"move":if("down"===t.value)return e.activeIndex===e.activeTemplates.length-1?m(d({},e),{activeIndex:0}):m(d({},e),{activeIndex:e.activeIndex+1});if("up"===t.value)return 0===e.activeIndex?m(d({},e),{activeIndex:e.activeTemplates.length-1}):m(d({},e),{activeIndex:e.activeIndex-1});throw new Error(`Unexpected value for move action ${t.value}`);default:return d({},e)}}function Xo(e){const t=Wl(),[n,a]=j.default.useReducer(qo,{activeIndex:0,status:"pending",value:e.value,initialTemplates:t,activeTemplates:t});j.default.useEffect((()=>{"selected"===n.status&&e.onValue(n.activeTemplates[n.activeIndex]),"cancelled"===n.status&&e.onCancel()}),[n.status]),j.default.useEffect((()=>{a({type:"updateValue",value:e.value})}),[e.value]),Gl("escape",(()=>{e.onCancel()})),Gl("enter",(()=>{a({type:"selectCurrentItem"})})),Gl("ArrowDown",(()=>{a({type:"move",value:"down"})})),Gl("ArrowUp",(()=>{a({type:"move",value:"up"})}));const r=j.default.useRef();return Jo(r,(()=>e.onCancel())),j.default.createElement("span",{ref:r,className:"block w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none max-h-[10rem] overflow-scroll"},j.default.createElement("span",{className:"block py-1"},0===n.activeTemplates.length&&j.default.createElement("span",{className:"block px-4 py-2 text-sm text-left w-full text-gray-500"},"No matches found"),n.activeTemplates.map(((e,t)=>j.default.createElement("span",{key:e.key,className:"block"},j.default.createElement("span",{onMouseDown:e=>{e.preventDefault(),a({type:"selectItem",value:t})},className:kl(t===n.activeIndex?"bg-gray-50 text-gray-900":"text-gray-700","cursor-pointer truncate block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 hover:text-gray-900")},e.label||e.name))))))}function Jo(e,t){j.default.useEffect((()=>{const n=n=>{e.current&&!e.current.contains(n.target)&&t(n)};return document.addEventListener("mousedown",n),document.addEventListener("touchstart",n),()=>{document.removeEventListener("mousedown",n),document.removeEventListener("touchstart",n)}}),[e,t])}const Qo="maybe_mdx",es=e=>void 0!==ts(e),ts=e=>y.findNode(e,{match:{type:y.getPluginType(e,Qo)}}),ns=e=>{const{type:t}=y.getPlugin(e,Qo),{insertText:n}=e;return e.insertText=a=>es(e)?b.Transforms.insertText(e,a):e.selection&&"/"===a&&zo.currentNodeSupportsMDX(e)?void y.insertNodes(e,{type:t,children:[{type:"text",text:"/"}]}):n(a),e},as=y.createPluginFactory({key:Qo,isElement:!0,isInline:!0,withOverrides:ns,component:e=>j.default.createElement(rs,d({},e))}),rs=e=>{var t;const n=j.default.useRef(),a=j.default.useRef(),r=x.useFocused(),i=x.useSelected(),l=()=>{y.unwrapNodes(e.editor,{match:e=>b.Element.isElement(e)&&e.type===Qo})},o=t=>{b.Transforms.removeNodes(e.editor,{match:e=>{if(b.Element.isElement(e)&&e.type===Qo)return!0}}),Bo(e.editor,t)},s=null==(t=e.element.children[0])?void 0:t.text,c=s.slice(1),{selection:u}=e.editor;return j.default.useEffect((()=>{i&&r||y.unwrapNodes(e.editor,{at:u,match:e=>b.Element.isElement(e)&&e.type===Qo})}),[r,i,JSON.stringify(u)]),j.default.useEffect((()=>{s.startsWith("/")||y.unwrapNodes(e.editor,{match:e=>b.Element.isElement(e)&&e.type===Qo})}),[s]),j.default.useEffect((()=>{a.current&&(async()=>{if(a.current){const{x:e,y:t}=await _.computePosition(n.current,a.current,{placement:"bottom-start",middleware:[_.flip(),_.shift()]});a.current&&Object.assign(a.current.style,{left:`${e}px`,top:`${t}px`})}})()}),[JSON.stringify(u),a.current,n.current]),j.default.createElement("span",m(d({},e.attributes),{ref:n,className:`${e.className}`}),e.children,i&&j.default.createElement("span",{ref:a,className:"block absolute z-50",contentEditable:!1,style:{userSelect:"none"}},j.default.createElement(Xo,{value:c,onValue:o,onCancel:l})))},is=rr((e=>{const t=j.default.useMemo((()=>{var t,n;return(null==(n=null==(t=e.input.value)?void 0:t.children)?void 0:n.length)?e.input.value.children.map(zo.normalize):[{type:"p",children:[{type:"text",text:""}]}]}),[]),n=j.default.useMemo((()=>y.createPlugins([...Eo,...ko,Po(),Fo(),io(),k.createLinkPlugin(),as()],{components:Hl()})),[]),a=[e.tinaForm.id,e.input.name].join("."),r=j.default.useMemo((()=>Cl()),[a]);return j.default.createElement(Yl.Provider,{value:{templates:e.field.templates}},j.default.createElement("div",{className:"with-toolbar"},j.default.createElement("div",{className:kl("min-h-[100px]","max-w-full prose relative shadow-inner focus:shadow-outline focus:border-blue-500 block w-full bg-white border border-gray-200 text-gray-600 focus:text-gray-900 rounded-md px-3 py-2 mb-5")},j.default.createElement(y.Plate,{id:r,initialValue:t,plugins:n,onChange:t=>{e.input.onChange({type:"root",children:t})}},j.default.createElement(Yo,{templates:e.field.templates,inlineOnly:!1}),j.default.createElement(ls,{form:e.form,initialValue:t}),j.default.createElement(Wo,null)))))})),ls=({form:e,initialValue:t})=>{const n=y.usePlateEditorState();return j.default.useMemo((()=>{const{reset:a}=e;e.reset=e=>(n.children=t,a(e))}),[]),null},os={name:"rich-text",Component:e=>!1===Ht().flags.get("rich-text-alt")?j.default.createElement(bl,d({},e)):j.default.createElement(is,d({},e))},ss=e=>e&&+e,cs=rr((({input:e,field:t})=>A.createElement(Ta,m(d({},e),{step:t.step})))),ds={name:"number",Component:cs,parse:ss},ms=rr(fa),us={name:"select",type:"select",Component:ms,parse:Xr,validate(e,t,n,a){if(a.required&&!e)return"Required"}},ps=rr(va),gs={name:"radio-group",Component:ps},fs=rr((({input:e})=>A.createElement(Qt,d({},e)))),hs={name:"textarea",Component:fs,parse:Xr},ws=rr((({input:e,field:t})=>A.createElement(Jt,m(d({},e),{placeholder:t.placeholder})))),vs={name:"text",Component:ws,validate(e,t,n,a){if(a.required&&!e)return"Required"},parse:Xr},bs=rr(qn),xs={name:"toggle",type:"checkbox",Component:bs},ys=rr((({input:e,field:t,form:n,tinaForm:a})=>{const[r,i]=A.useState(""),l=A.useCallback((e=>{var a,r;(null==(r=null==(a=n.getFieldState(t.name))?void 0:a.value)?void 0:r.includes(e))||e.length&&(n.mutators.insert(t.name,0,e),i(""))}),[n,t.name]),o=e.value||[];return A.createElement(A.Fragment,null,A.createElement(Jt,{value:r,onChange:e=>i(e.target.value),placeholder:t.placeholder,onKeyPress:e=>{","!==e.key&&"Enter"!==e.key||(e.preventDefault(),l(r))}}),A.createElement(Es,null,o.map(((e,n)=>A.createElement(ks,{key:e,tinaForm:a,field:t,index:n},e)))))})),Es=Z.default.span`
  display: flex;
  flex-wrap: wrap;
  margin: 4px -4px 0 -4px;
`,ks=Z.default((e=>{var t=e,{tinaForm:n,field:a,index:r,children:i}=t,l=u(t,["tinaForm","field","index","children"]);const o=A.useCallback((()=>{n.mutators.remove(a.name,r)}),[n,a,r]);return A.createElement("span",d({},l),A.createElement("span",null,i),A.createElement("button",{className:"text-center flex-shrink-0 border-0 bg-transparent p-2 flex items-center justify-center cursor-pointer",onClick:o},A.createElement(ce,{className:"w-4 h-auto"})))}))`
  border-radius: var(--tina-radius-small);
  box-shadow: var(--tina-shadow-small);
  background-color: var(--tina-color-grey-0);
  border: 1px solid var(--tina-color-grey-2);
  display: flex;
  align-items: center;
  font-size: var(--tina-font-size-2);
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  line-height: 1;
  color: var(--tina-color-grey-8);
  padding: 0 0 0 10px;
  margin: 4px;
  text-overflow: ellipsis;
  overflow: hidden;

  span {
    max-width: calc(var(--tina-sidebar-width) - 50px);
    flex-shrink: 1;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`,Cs={name:"tags",Component:ys,parse:Xr},Ns="MMM DD, YYYY",Ls="h:mm A",Ms=(e,t,n)=>{const a=Hs(n.dateFormat),r=Ts(n.timeFormat),i="string"===typeof r?`${a} ${r}`:a;if("string"===typeof e){const t=q.default(e);return t.isValid()?t.format(i):e}return q.default(e).format(i)},zs=e=>{const t=new Date(e);return isNaN(t.getTime())?e:new Date(e).toISOString()};function Hs(e){return"string"===typeof e?e:Ns}function Ts(e){return"string"===typeof e?e:e?Ls:void 0}const Ss=rr((e=>{var{input:n,field:a}=e,r=a,{dateFormat:i,timeFormat:l}=r,o=u(r,["dateFormat","timeFormat"]);const[s,c]=t.useState(!1),m=t.useRef(null);return t.useEffect((()=>{const e=e=>{m.current&&e.target&&(m.current.contains(e.target)?c(!0):c(!1))};return document.addEventListener("mouseup",e,!1),()=>{document.removeEventListener("mouseup",e,!1)}}),[document]),A.createElement(Fs,{ref:m},A.createElement(W.default,d({value:n.value,onFocus:n.onFocus,onChange:n.onChange,open:s,dateFormat:i||Ns,timeFormat:l||!1,inputProps:{className:Xt}},o)))})),Fs=Z.default.div`
  .rdt {
    position: relative;
  }
  .rdtPicker {
    display: none;
    position: absolute;
    width: 100%;
    max-width: 350px;
    padding: 4px;
    margin-top: 4px;
    z-index: 99999 !important;
    background: var(--tina-color-grey-0);
    border-radius: var(--tina-radius-small);
    box-shadow: var(--tina-shadow-big);
    border: 1px solid var(--tina-color-grey-2);
  }
  .rdtOpen .rdtPicker {
    display: block;
  }
  .rdtStatic .rdtPicker {
    box-shadow: none;
    position: static;
  }
  .rdtPicker .rdtTimeToggle {
    text-align: center;
  }
  .rdtPicker table {
    width: 100%;
    margin: 0;
  }
  .rdtPicker td,
  .rdtPicker th {
    text-align: center;
    height: 28px;
  }
  .rdtPicker td {
    cursor: pointer;
  }
  .rdtPicker td.rdtDay:hover,
  .rdtPicker td.rdtHour:hover,
  .rdtPicker td.rdtMinute:hover,
  .rdtPicker td.rdtSecond:hover,
  .rdtPicker .rdtTimeToggle:hover {
    background: var(--tina-color-grey-2);
    color: var(--tina-color-primary);
    border-radius: var(--tina-radius-small);
    cursor: pointer;

    &:active {
      background: var(--tina-color-primary);
      color: var(--tina-color-grey-0);
      border-radius: var(--tina-radius-small);
    }
  }
  .rdtPicker td.rdtOld,
  .rdtPicker td.rdtNew {
    color: var(--tina-color-grey-6);
  }
  .rdtPicker td.rdtToday {
    position: relative;
  }
  .rdtPicker td.rdtToday:before {
    content: '';
    display: inline-block;
    border-left: 7px solid transparent;
    border-bottom: 7px solid var(--tina-color-primary);
    border-radius: 20px;
    border-top-color: rgba(0, 0, 0, 0.2);
    position: absolute;
    bottom: 4px;
    right: 4px;
  }
  .rdtPicker td.rdtActive,
  .rdtPicker td.rdtActive:hover {
    background-color: var(--tina-color-primary);
    color: var(--tina-color-grey-0);
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  }
  .rdtPicker td.rdtActive.rdtToday:before {
    border-bottom-color: var(--tina-color-grey-0);
  }
  .rdtPicker td.rdtDisabled,
  .rdtPicker td.rdtDisabled:hover {
    background: none;
    color: var(--tina-color-grey-6);
    cursor: not-allowed;
  }
  .rdtPicker td span.rdtOld {
    color: var(--tina-color-grey-6);
  }
  .rdtPicker td span.rdtDisabled,
  .rdtPicker td span.rdtDisabled:hover {
    background: none;
    color: var(--tina-color-grey-6);
    cursor: not-allowed;
  }
  .rdtPicker th {
    border-bottom: 1px solid var(--tina-color-grey-1);
  }
  .rdtPicker .dow {
    width: 14.2857%;
    border-bottom: none;
    cursor: default;
  }
  .rdtPicker th.rdtSwitch {
    width: 100px;
  }
  .rdtPicker th.rdtNext,
  .rdtPicker th.rdtPrev {
    font-size: 21px;
    vertical-align: top;
  }
  .rdtPrev span,
  .rdtNext span {
    display: block;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
    -khtml-user-select: none; /* Konqueror */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none;
  }
  .rdtPicker th.rdtDisabled,
  .rdtPicker th.rdtDisabled:hover {
    background: none;
    color: var(--tina-color-grey-6);
    cursor: not-allowed;
  }
  .rdtPicker thead tr:first-child th {
    cursor: pointer;
  }
  .rdtPicker thead tr:first-child th:hover {
    background: var(--tina-color-grey-2);
    color: var(--tina-color-primary);
    border-radius: var(--tina-radius-small);
  }
  .rdtPicker tfoot {
    border-top: 1px solid var(--tina-color-grey-1);
  }
  .rdtPicker button {
    border: none;
    background: none;
    cursor: pointer;
  }
  .rdtPicker button:hover {
    background: var(--tina-color-grey-2);
    color: var(--tina-color-primary);
    border-radius: var(--tina-radius-small);
  }
  .rdtPicker thead button {
    width: 100%;
    height: 100%;
  }
  td.rdtMonth,
  td.rdtYear {
    height: 50px;
    width: 25%;
    cursor: pointer;
  }
  td.rdtMonth:hover,
  td.rdtYear:hover {
    background: var(--tina-color-grey-2);
    color: var(--tina-color-primary);
    border-radius: var(--tina-radius-small);
  }
  .rdtCounters {
    display: inline-block;
  }
  .rdtCounters > div {
    float: left;
  }
  .rdtCounter {
    height: 100px;
  }
  .rdtCounter {
    width: 40px;
  }
  .rdtCounterSeparator {
    line-height: 100px;
  }
  .rdtCounter .rdtBtn {
    height: 40%;
    line-height: 40px;
    cursor: pointer;
    display: block;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
    -khtml-user-select: none; /* Konqueror */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none;
  }
  .rdtCounter .rdtBtn:hover {
    background: var(--tina-color-grey-2);
    color: var(--tina-color-primary);
    border-radius: var(--tina-radius-small);
  }
  .rdtCounter .rdtCount {
    height: 20%;
    font-size: 1.2em;
  }
  .rdtMilli {
    vertical-align: middle;
    padding-left: 8px;
    width: 48px;
  }
  .rdtMilli input {
    width: 100%;
    font-size: 1.2em;
    margin-top: 37px;
  }
  .rdtTime td {
    cursor: default;
  }
`,Ps={__type:"field",name:"date",Component:Ss,format:Ms,parse:zs},Bs=rr(Ca),_s={name:"checkbox-group",Component:Bs},Vs=rr(er),Is={name:"reference",type:"reference",Component:Vs,parse:Xr},Rs=()=>A.createElement(Ds,null,A.createElement(Os,null,"\ud83d\udd0e"),A.createElement("p",{className:"mb-4"},"Tina didn't find ",A.createElement("br",null),"any queries to ",A.createElement("br",null),"generate forms for."),A.createElement("p",null,A.createElement(As,{href:"https://tina.io/docs/tinacms-context/",target:"_blank"},A.createElement(Os,null,"\ud83d\udcd6")," Contextual Editing"))),Os=Z.default.span`
  font-size: 40px;
  line-height: 1;
  display: inline-block;
`,$s=r.keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`,Ds=Z.default.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--tina-padding-big) var(--tina-padding-big) 64px
    var(--tina-padding-big);
  width: 100%;
  height: 100%;
  overflow-y: auto;
  animation-name: ${$s};
  animation-delay: 300ms;
  animation-timing-function: ease-out;
  animation-iteration-count: 1;
  animation-fill-mode: both;
  animation-duration: 150ms;
  > *:first-child {
    margin: 0 0 var(--tina-padding-big) 0;
  }
  > ${Os} {
    display: block;
  }
  h3 {
    font-size: var(--tina-font-size-5);
    font-weight: normal;
    display: block;
    margin: 0 0 var(--tina-padding-big) 0;
    ${Os} {
      font-size: 1em;
    }
  }
  p {
    display: block;
    margin: 0 0 var(--tina-padding-big) 0;
  }
`,As=Z.default.a`
  text-align: center;
  border: 0;
  border-radius: var(--tina-radius-big);
  border: 1px solid var(--tina-color-grey-2);
  box-shadow: var(--tina-shadow-small);
  font-weight: var(--tina-font-weight-regular);
  cursor: pointer;
  font-size: var(--tina-font-size-0);
  transition: all var(--tina-timing-short) ease-out;
  background-color: white;
  color: var(--tina-color-grey-8);
  padding: var(--tina-padding-small) var(--tina-padding-big)
    var(--tina-padding-small) 56px;
  position: relative;
  text-decoration: none;
  display: inline-block;
  ${Os} {
    font-size: 24px;
    position: absolute;
    left: var(--tina-padding-big);
    top: 50%;
    transform-origin: 50% 50%;
    transform: translate3d(0, -50%, 0);
    transition: all var(--tina-timing-short) ease-out;
  }
  &:hover {
    color: var(--tina-color-primary);
    ${Os} {
      transform: translate3d(0, -50%, 0);
    }
  }
`;class js{constructor(e,t={}){var n,a;this.events=e,this._isOpen=!1,this.position="displace",this.buttons={save:"Save",reset:"Reset"},this.position=t.position||"displace",this.placeholder=t.placeholder||Rs,(null==(n=t.buttons)?void 0:n.save)&&(this.buttons.save=t.buttons.save),(null==(a=t.buttons)?void 0:a.reset)&&(this.buttons.reset=t.buttons.reset)}get isOpen(){return this._isOpen}set isOpen(e){this._isOpen!==e&&(this._isOpen=e,e?this.events.dispatch({type:"sidebar:opened"}):this.events.dispatch({type:"sidebar:closed"}))}subscribe(e){const t=this.events.subscribe("sidebar",e);return()=>t()}}const Zs=({hidden:e=!1,forms:t,setActiveFormId:n})=>A.createElement(w.Transition,{appear:!0,show:!e,enter:"transition-all ease-out duration-150",enterFrom:"opacity-0 -translate-x-1/2",enterTo:"opacity-100",leave:"transition-all ease-out duration-150",leaveFrom:"opacity-100",leaveTo:"opacity-0 -translate-x-1/2"},A.createElement("ul",{className:"pt-16"},t.sort(Ks).map(((e,a)=>A.createElement("li",{key:e.id,className:"relative px-6 py-2"},A.createElement("button",{onClick:()=>n(e.id),className:"w-full h-full bg-transparent border-none text-lg text-gray-700 hover:text-blue-500 transition-all ease-out duration-150 flex items-center gap-2 p-1 m-0"},A.createElement(Ya,{className:"opacity-70 w-5 h-auto fill-current"}),e.label),a!==t.length-1&&A.createElement("hr",{className:"absolute bottom-0 left-0 border-t border-gray-100 w-full"})))))),Ks=(e,t)=>t.id<e.id?-1:t.id>e.id?1:0,Gs=({children:e})=>{const[n,a]=t.useState(""),r=Ht(),i=r.plugins.getType("form"),{setFormIsPristine:l}=A.useContext(wc);function o(){1===i.all().length&&a(i.all()[0].id)}Zt(i,(()=>{o()})),A.useEffect((()=>{o()}),[]);const s=i.all(),c=s.length>1,d=i.find(n),m=!!d;if(!s.length)return A.createElement(A.Fragment,null," ",e," ");if(c&&!d)return A.createElement(Zs,{isEditing:m,forms:s,setActiveFormId:a});const u=r.plugins.all("form:meta");return A.createElement(A.Fragment,null,d&&A.createElement(Ws,{isEditing:m,isMultiform:c},c&&A.createElement(qs,{activeForm:d,setActiveFormId:a}),!c&&A.createElement(Xs,{activeForm:d}),u&&u.map((e=>A.createElement(A.Fragment,{key:e.name},A.createElement(e.Component,null)))),A.createElement(Tn,{form:d,onPristineChange:l})))},Us=Z.default.div`
  display: block;
  margin: 0 auto;
  width: 100%;
`;Z.default.div`
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;
  border-top: 1px solid var(--tina-color-grey-2);
  background-color: var(--tina-color-grey-1);

  ${Us} {
    height: 100%;
  }
`;const Ys=r.keyframes`
  0% {
    transform: translate3d( 100%, 0, 0 );
  }
  100% {
    transform: translate3d( 0, 0, 0 );
  }
`,Ws=Z.default.div`
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  overflow: hidden;
  height: 100%;
  width: 100%;
  position: relative;
  background: white;

  > * {
    transform: translate3d(100%, 0, 0);
  }

  ${e=>e.isEditing&&r.css`
      > * {
        transform: none;
        animation-name: ${Ys};
        animation-duration: 150ms;
        animation-delay: 0;
        animation-iteration-count: 1;
        animation-timing-function: ease-out;
      }
    `};
`,qs=({activeForm:e,setActiveFormId:t})=>{const n=Ht(),{sidebarWidth:a,formIsPristine:r}=A.useContext(wc);return A.createElement("div",{className:"py-4 border-b border-gray-200 bg-white "+(a>xc?"px-6":"px-20")},A.createElement("div",{className:"max-w-form mx-auto flex flex-col items-start justify-center min-h-[2.5rem]"},A.createElement("button",{className:"pointer-events-auto text-xs mb-1 text-gray-400 hover:text-blue-500 hover:underline transition-all ease-out duration-150 font-medium flex items-center justify-start gap-0.5",onClick:()=>{!0===e.finalForm.getState().invalid?n.alerts.error("Cannot navigate away from an invalid form."):t("")}},A.createElement(Da,{className:"h-auto w-5 inline-block opacity-70 -mt-0.5 -mx-0.5"}),"Return to Form List"),A.createElement("span",{className:"block w-full text-xl mb-[6px] text-gray-700 font-medium leading-tight"},e.label||e.name),A.createElement(Fn,{pristine:r})))},Xs=({activeForm:e})=>{const{sidebarWidth:t,formIsPristine:n}=A.useContext(wc);return A.createElement("div",{className:"py-4 border-b border-gray-200 bg-white "+(t>xc?"px-6":"px-20")},A.createElement("div",{className:"max-w-form mx-auto  flex flex-col items-start justify-center min-h-[2.5rem]"},e.label&&A.createElement("span",{className:"block w-full text-xl mb-[6px] text-gray-700 font-medium leading-tight"},e.label),A.createElement(Fn,{pristine:n})))};function Js(e){return oa({tag:"svg",attr:{fill:"currentColor",viewBox:"0 0 16 16"},child:[{tag:"path",attr:{fillRule:"evenodd",d:"M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707zM15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 1 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768L15.828.879a.5.5 0 0 0 0-.707z"}}]})(e)}function Qs(e){return oa({tag:"svg",attr:{fill:"currentColor",viewBox:"0 0 16 16"},child:[{tag:"path",attr:{fillRule:"evenodd",d:"M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707z"}}]})(e)}function ec(e){return oa({tag:"svg",attr:{version:"1.1",viewBox:"0 0 16 16"},child:[{tag:"path",attr:{d:"M14.341 5.579c-0.347-0.473-0.831-1.027-1.362-1.558s-1.085-1.015-1.558-1.362c-0.806-0.591-1.197-0.659-1.421-0.659h-5.75c-0.689 0-1.25 0.561-1.25 1.25v11.5c0 0.689 0.561 1.25 1.25 1.25h9.5c0.689 0 1.25-0.561 1.25-1.25v-7.75c0-0.224-0.068-0.615-0.659-1.421zM12.271 4.729c0.48 0.48 0.856 0.912 1.134 1.271h-2.406v-2.405c0.359 0.278 0.792 0.654 1.271 1.134v0zM14 14.75c0 0.136-0.114 0.25-0.25 0.25h-9.5c-0.136 0-0.25-0.114-0.25-0.25v-11.5c0-0.135 0.114-0.25 0.25-0.25 0 0 5.749-0 5.75 0v3.5c0 0.276 0.224 0.5 0.5 0.5h3.5v7.75z"}},{tag:"path",attr:{d:"M9.421 0.659c-0.806-0.591-1.197-0.659-1.421-0.659h-5.75c-0.689 0-1.25 0.561-1.25 1.25v11.5c0 0.604 0.43 1.109 1 1.225v-12.725c0-0.135 0.115-0.25 0.25-0.25h7.607c-0.151-0.124-0.297-0.238-0.437-0.341z"}}]})(e)}Z.default(Ct)`
  flex: 1.5 0 auto;
  padding: 12px 24px;
`;const tc=()=>{const{resizingSidebar:e,setResizingSidebar:t,fullscreen:n,setSidebarWidth:a,displayState:r}=A.useContext(wc);A.useEffect((()=>{const e=()=>t(!1);return window.addEventListener("mouseup",e),()=>{window.removeEventListener("mouseup",e)}}),[]),A.useEffect((()=>{const t=e=>{a((t=>{const n=t+e.movementX,a=window.innerWidth-8;return n<bc?bc:n>a?a:n}))};return e&&(window.addEventListener("mousemove",t),document.body.classList.add("select-none")),()=>{window.removeEventListener("mousemove",t),document.body.classList.remove("select-none")}}),[e]);const i=()=>t(!0);return n?null:A.createElement("div",{onMouseDown:i,className:`z-100 absolute top-1/2 right-0 w-2 h-32 bg-white rounded-r-md border border-gray-100 shadow-sm hover:shadow-md transition-all duration-150 ease-out transform translate-x-full -translate-y-1/2 group hover:bg-gray-50 ${"closed"!==r?"opacity-100":"opacity-0"} ${e?"scale-110":""}`,style:{cursor:"grab"}},A.createElement("span",{className:"absolute top-1/2 left-1/2 h-4/6 w-px bg-gray-300 transform -translate-y-1/2 -translate-x-1/2 opacity-50 transition-opacity duration-150 ease-out group-hover:opacity-100"}))};function nc(e){return oa({tag:"svg",attr:{viewBox:"0 0 1024 1024"},child:[{tag:"path",attr:{d:"M955.7 856l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416 720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48zM480 416c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v184c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V416zm32 352a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z"}}]})(e)}const ac=()=>A.createElement("a",{className:"flex-grow-0 flex w-full text-xs items-center py-1 px-4 text-yellow-600 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200",href:"https://tina.io/docs/tina-cloud/",target:"_blank"},A.createElement(nc,{className:"w-5 h-auto inline-block mr-1 opacity-70 text-yellow-600"})," ","You are currently in",A.createElement("strong",{className:"ml-1 font-bold text-yellow-700"},"Local Mode"));function rc(e){return oa({tag:"svg",attr:{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},child:[{tag:"circle",attr:{cx:"12",cy:"12",r:"1"}},{tag:"circle",attr:{cx:"12",cy:"5",r:"1"}},{tag:"circle",attr:{cx:"12",cy:"19",r:"1"}}]})(e)}function ic(e){return oa({tag:"svg",attr:{viewBox:"0 0 16 16",fill:"currentColor"},child:[{tag:"path",attr:{fillRule:"evenodd",clipRule:"evenodd",d:"M9.5 1.1l3.4 3.5.1.4v2h-1V6H8V2H3v11h4v1H2.5l-.5-.5v-12l.5-.5h6.7l.3.1zM9 2v3h2.9L9 2zm4 14h-1v-3H9v-1h3V9h1v3h3v1h-3v3z"}}]})(e)}const lc=({sidebar:e})=>{const t=Ht(),[n,a]=A.useState(!1),r=t.plugins.findOrCreateMap("content-creator");return Zt(r),r.all().length?A.createElement(cc,null,e?A.createElement(Nt,{onClick:()=>a(!0),variant:"primary"},A.createElement(ie,{className:"w-5/6 h-auto"})):A.createElement(dc,{onClick:()=>a(!0),open:n},A.createElement(ie,null)," ",A.createElement(pc,null,"New")),A.createElement(mc,{open:n,direction:e?"left":"right"},A.createElement(en,{click:!0,escape:!0,onDismiss:()=>a(!1),disabled:!n},r.all().map((e=>A.createElement(oc,{plugin:e,key:e.name,onClick:()=>{a(!1)}})))))):null},oc=({plugin:e,onClick:t})=>{const[n,a]=A.useState(!1);return A.createElement(A.Fragment,null,A.createElement(uc,{onClick:()=>{a((e=>!e)),t()}},e.name),n&&A.createElement(sc,{plugin:e,close:()=>a(!1)}))},sc=({plugin:e,close:n})=>{const a=Ht(),r=t.useMemo((()=>new Tt({id:"create-form-id",label:"create-form",fields:e.fields,actions:e.actions,buttons:e.buttons,initialValues:e.initialValues||{},reset:e.reset,onChange:e.onChange,onSubmit:async t=>{await e.onSubmit(t,a).then((()=>{n()}))}})),[n,a,e]);return A.createElement(ne,{id:"content-creator-modal",onClick:e=>e.stopPropagation()},A.createElement(ot,null,A.createElement(et,{close:n},e.name),A.createElement(re,null,A.createElement(Tn,{form:r}))))},cc=Z.default.div`
  pointer-events: auto;
  position: relative;
`,dc=Z.default(Ct)`
  display: flex;
  align-items: center;
  transition: all 150ms ease-out;
  padding: 0 10px;
  @media (min-width: 1030px) {
    padding: 0 20px;
  }
  &:focus {
    outline: none !important;
  }
  svg {
    fill: currentColor;
    opacity: 0.7;
    width: 2em;
    height: 2em;
    margin-right: 4px;
    transform-origin: 50% 50%;
    transition: all 150ms ease-out;
  }
  ${e=>e.open&&r.css`
      background-color: transparent;
      svg {
        transform: rotate(45deg);
      }
    `};
`,mc=Z.default.div`
  min-width: 192px;
  border-radius: var(--tina-radius-big);
  border: 1px solid var(--tina-color-grey-2);
  display: block;
  position: absolute;
  top: 0;
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 0 0;
  box-shadow: var(--tina-shadow-big);
  background-color: white;
  overflow: hidden;
  z-index: var(--tina-z-index-1);

  ${e=>"left"===e.direction&&r.css`
      right: 0;
      transform-origin: 100% 0;
    `}

  ${e=>"right"===e.direction&&r.css`
      left: 0;
      transform-origin: 0 0;
    `}
    
  ${e=>e.open&&r.css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 44px, 0) scale3d(1, 1, 1);
    `};
`,uc=e=>{var t=e,{children:n}=t,a=u(t,["children"]);return A.createElement("button",d({className:"relative text-center text-sm p-2 w-full border-b border-gray-50 outline-none transition-all ease-out duration-150 hover:text-blue-500 hover:bg-gray-50"},a),n)},pc=Z.default.span`
  display: none;
  @media (min-width: 1030px) {
    display: inline;
  }
`,gc=e=>{var t=e,{className:n="",children:a,showCollections:r,collectionsInfo:i,screens:l,contentCreators:o,sidebarWidth:s,RenderNavSite:c,RenderNavCollection:m}=t,p=u(t,["className","children","showCollections","collectionsInfo","screens","contentCreators","sidebarWidth","RenderNavSite","RenderNavCollection"]);const{setEdit:g}=R.useEditState();return A.createElement("div",d({className:`relative z-30 flex flex-col bg-white border-r border-gray-200 w-96 h-full ${n}`,style:{maxWidth:s+"px"}},p),A.createElement("div",{className:"border-b border-gray-200"},A.createElement(w.Menu,{as:"div",className:"relative block"},(({open:e})=>A.createElement("div",null,A.createElement(w.Menu.Button,{className:"group w-full px-6 py-3 flex justify-between items-center transition-colors duration-150 ease-out "+(e?"bg-gray-50":"bg-transparent")},A.createElement("span",{className:"text-left inline-flex items-center text-xl tracking-wide text-gray-800 flex-1 gap-1 opacity-80 group-hover:opacity-100 transition-opacity duration-150 ease-out"},A.createElement("svg",{viewBox:"0 0 32 32",fill:"#EC4815",xmlns:"http://www.w3.org/2000/svg",className:"w-10 h-auto -ml-1"},A.createElement("path",{d:"M18.6466 14.5553C19.9018 13.5141 20.458 7.36086 21.0014 5.14903C21.5447 2.9372 23.7919 3.04938 23.7919 3.04938C23.7919 3.04938 23.2085 4.06764 23.4464 4.82751C23.6844 5.58738 25.3145 6.26662 25.3145 6.26662L24.9629 7.19622C24.9629 7.19622 24.2288 7.10204 23.7919 7.9785C23.355 8.85496 24.3392 17.4442 24.3392 17.4442C24.3392 17.4442 21.4469 22.7275 21.4469 24.9206C21.4469 27.1136 22.4819 28.9515 22.4819 28.9515H21.0296C21.0296 28.9515 18.899 26.4086 18.462 25.1378C18.0251 23.8669 18.1998 22.596 18.1998 22.596C18.1998 22.596 15.8839 22.4646 13.8303 22.596C11.7767 22.7275 10.4072 24.498 10.16 25.4884C9.91287 26.4787 9.81048 28.9515 9.81048 28.9515H8.66211C7.96315 26.7882 7.40803 26.0129 7.70918 24.9206C8.54334 21.8949 8.37949 20.1788 8.18635 19.4145C7.99321 18.6501 6.68552 17.983 6.68552 17.983C7.32609 16.6741 7.97996 16.0452 10.7926 15.9796C13.6052 15.914 17.3915 15.5965 18.6466 14.5553Z"}),A.createElement("path",{d:"M11.1268 24.7939C11.1268 24.7939 11.4236 27.5481 13.0001 28.9516H14.3511C13.0001 27.4166 12.8527 23.4155 12.8527 23.4155C12.1656 23.6399 11.3045 24.3846 11.1268 24.7939Z"})),A.createElement("span",null,"Tina")),A.createElement(rc,{className:"flex-0 w-6 h-full inline-block text-gray-500  group-hover:opacity-80 transition-all duration-300 ease-in-out transform "+(e?"opacity-100":"opacity-30 hover:opacity-50")})),A.createElement("div",{className:"transform translate-y-full absolute bottom-3 right-5 z-50"},A.createElement(w.Transition,{enter:"transition duration-150 ease-out",enterFrom:"transform opacity-0 -translate-y-2",enterTo:"transform opacity-100 translate-y-0",leave:"transition duration-75 ease-in",leaveFrom:"transform opacity-100 translate-y-0",leaveTo:"transform opacity-0 -translate-y-2"},A.createElement(w.Menu.Items,{className:"bg-white border border-gray-150 rounded-lg shadow-lg"},A.createElement(w.Menu.Item,null,(({active:e})=>A.createElement("button",{className:`text-lg px-4 py-2 first:pt-3 last:pb-3 tracking-wide whitespace-nowrap flex items-center opacity-80 text-gray-600 ${e&&"text-blue-400 bg-gray-50 opacity-100"}`,onClick:()=>{Lc({displayState:"closed",sidebarWidth:null,resizingSidebar:!1}),g(!1)}},A.createElement(Za,{className:"w-6 h-auto mr-2 text-blue-400"})," ","Log Out")))))))))),a,A.createElement("div",{className:"px-6 flex-1"},r&&A.createElement(A.Fragment,null,A.createElement("h4",{className:"uppercase font-bold text-sm mb-3 mt-8 text-gray-700"},"Collections"),A.createElement(fc,d({RenderNavCollection:m},i))),(l.length>0||o.length)>0&&A.createElement(A.Fragment,null,A.createElement("h4",{className:"uppercase font-bold text-sm mb-3 mt-8 text-gray-700"},"Site"),A.createElement("ul",{className:"flex flex-col gap-4"},l.map((e=>A.createElement("li",{key:`nav-site-${e.name}`},A.createElement(c,{view:e})))),o.map(((e,t)=>A.createElement(hc,{key:`plugin-${t}`,plugin:e})))))))},fc=({collections:e,loading:t,RenderNavCollection:n})=>!0===t?A.createElement(wn,{color:"var(--tina-color-primary)"}):0===e.length?A.createElement("div",null,"No collections found"):A.createElement("ul",{className:"flex flex-col gap-4"},e.map((e=>A.createElement("li",{key:`nav-collection-${e.name}`},A.createElement(n,{collection:e}))))),hc=({plugin:e})=>{const[t,n]=A.useState(!1);return A.createElement("li",{key:e.name},A.createElement("button",{className:"text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100",onClick:()=>{n(!0)}},A.createElement(ic,{className:"mr-3 h-6 opacity-80 w-auto"})," ",e.name),t&&A.createElement(sc,{plugin:e,close:()=>n(!1)}))},wc=A.createContext(null),vc=440,bc=360,xc=1e3,yc=440,Ec="displace";function kc({position:e=Ec,defaultWidth:t=yc,sidebar:n}){var a;Zt(n);const r=Ht();return r.enabled?A.createElement(Nc,{position:(null==(a=null==r?void 0:r.sidebar)?void 0:a.position)||e,defaultWidth:t,sidebar:n}):null}const Cc=e=>{const[n,a]=t.useState([]),[r,i]=t.useState(!0);return t.useEffect((()=>{const t=async()=>{if(await e.api.admin.isAuthenticated()){try{const t=await e.api.admin.fetchCollections();a(t.getCollections)}catch(t){e.alerts.error(`[ERROR] GetCollections failed: ${t.message}`,3e4),a([])}i(!1)}};e.api.admin&&(i(!0),t())}),[e.api.admin]),{collections:n,loading:r}},Nc=({sidebar:e,defaultWidth:n,position:a})=>{var r,i;const l=Ht(),o=Cc(l),s=l.plugins.getType("screen");Zt(e),Zt(s);const c=s.all(),[d,m]=t.useState(!1),[u,p]=t.useState(null),[g,f]=A.useState("open"),[h,v]=A.useState(n),[b,x]=A.useState(!1),[y,E]=A.useState(!0),k=!1!==l.flags.get("tina-admin"),C=k?[]:l.plugins.getType("content-creator").all(),N=()=>{f("fullscreen"===g?"open":"fullscreen")},L=()=>{f("closed"===g?"open":"closed")},M=()=>{m((e=>!e))};return A.useEffect((()=>{const e=()=>{"fullscreen"!==g&&"displace"===a&&Lc({displayState:g,sidebarWidth:h,resizingSidebar:b})};return e(),window.addEventListener("resize",e),()=>{window.removeEventListener("resize",e)}}),[g,a,h,b]),A.createElement(wc.Provider,{value:{sidebarWidth:h,setSidebarWidth:v,displayState:g,setDisplayState:f,position:a,toggleFullscreen:N,toggleSidebarOpen:L,resizingSidebar:b,setResizingSidebar:x,menuIsOpen:d,setMenuIsOpen:m,toggleMenu:M,setActiveView:p,formIsPristine:y,setFormIsPristine:E}},A.createElement(A.Fragment,null,A.createElement(Sc,null,A.createElement(Tc,null),(h>xc||"fullscreen"===g)&&A.createElement(gc,{showCollections:k,collectionsInfo:o,screens:c,contentCreators:C,sidebarWidth:h,RenderNavSite:({view:e})=>A.createElement(zc,{view:e,onClick:()=>{p(e),m(!1)}}),RenderNavCollection:({collection:e})=>A.createElement(Hc,{collection:e})}),A.createElement(Fc,null,A.createElement(Mc,{isLocalMode:null==(i=null==(r=l.api)?void 0:r.tina)?void 0:i.isLocalMode}),A.createElement(Gs,null,A.createElement(e.placeholder,null)),u&&A.createElement(Wt,{screen:u,close:()=>p(null)})),A.createElement(tc,null)),h<xc+1&&A.createElement(w.Transition,{show:d},A.createElement(w.Transition.Child,{as:A.Fragment,enter:"transform transition-all ease-out duration-300",enterFrom:"opacity-0 -translate-x-full",enterTo:"opacity-100 translate-x-0",leave:"transform transition-all ease-in duration-200",leaveFrom:"opacity-100 translate-x-0",leaveTo:"opacity-0 -translate-x-full"},A.createElement("div",{className:"fixed left-0 top-0 z-overlay h-full transform"},A.createElement(gc,{className:"rounded-r-md",showCollections:k,collectionsInfo:o,screens:c,contentCreators:C,sidebarWidth:h,RenderNavSite:({view:e})=>A.createElement(zc,{view:e,onClick:()=>{p(e),m(!1)}}),RenderNavCollection:({collection:e})=>A.createElement(Hc,{collection:e})},A.createElement("div",{className:"absolute top-8 right-0 transform translate-x-full overflow-hidden"},A.createElement(Ct,{rounded:"right",variant:"secondary",onClick:()=>{m(!1)},className:"transition-opacity duration-150 ease-out"},A.createElement(ar,{className:"h-6 w-auto"})))))),A.createElement(w.Transition.Child,{as:A.Fragment,enter:"ease-out duration-300",enterFrom:"opacity-0",enterTo:"opacity-80",entered:"opacity-80",leave:"ease-in duration-200",leaveFrom:"opacity-80",leaveTo:"opacity-0"},A.createElement("div",{onClick:()=>{m(!1)},className:"fixed z-menu inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"})))))},Lc=({displayState:e,sidebarWidth:t,resizingSidebar:n})=>{const a=document.getElementsByTagName("body")[0],r=window.innerWidth;if(a.style.transition=n?"":"all 200ms ease-out","open"===e){const e=Math.min(t,r-vc);a.style.paddingLeft=e-6+"px"}else a.style.paddingLeft="0"},Mc=({isLocalMode:e})=>{const{toggleFullscreen:t,displayState:n,setMenuIsOpen:a,toggleSidebarOpen:r,sidebarWidth:i}=A.useContext(wc);return A.createElement("div",{className:"flex-grow-0 w-full overflow-visible z-20"},e&&A.createElement(ac,null),A.createElement("div",{className:"mt-4 -mb-14 w-full flex items-center justify-between pointer-events-none"},i<xc+1&&"fullscreen"!==n&&A.createElement(Ct,{rounded:"right",variant:"secondary",onClick:()=>{a(!0)},className:"pointer-events-auto -ml-px"},A.createElement(Ua,{className:"h-7 w-auto"})),A.createElement("div",{className:"flex-1"}),A.createElement("div",{className:"flex items-center gap-2 pointer-events-auto transition-opacity duration-150 ease-in-out -mr-px"},A.createElement(Ct,{rounded:"full",variant:"ghost",onClick:t,className:"pointer-events-auto opacity-50 hover:opacity-100 focus:opacity-80"},"fullscreen"===n?A.createElement(Js,{className:"h-5 w-auto -mx-1"}):A.createElement(Qs,{className:"h-5 w-auto -mx-1"})),A.createElement(Ct,{rounded:"left",variant:"secondary",onClick:r,"aria-label":"closes cms sidebar",className:""},A.createElement(pa,{className:"h-6 w-auto"})))))},zc=({view:e,onClick:t})=>A.createElement("button",{className:"text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100",value:e.name,onClick:t},A.createElement(e.Icon,{className:"mr-2 h-6 opacity-80 w-auto"})," ",e.name),Hc=({collection:e})=>A.createElement("a",{href:`/admin#/collections/${e.name}`,className:"text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100"},A.createElement(ec,{className:"mr-2 h-6 opacity-80 w-auto"})," ",e.label?e.label:e.name),Tc=({})=>{const{displayState:e,toggleSidebarOpen:t}=A.useContext(wc);return A.createElement(Ct,{rounded:"right",variant:"primary",onClick:t,className:" absolute top-8 right-0 transition-all duration-150 ease-out "+("closed"!==e?"opacity-0":"translate-x-full pointer-events-auto"),"aria-label":"opens cms sidebar"},A.createElement(Ya,{className:"h-6 w-auto"}))},Sc=({children:e})=>{const{displayState:t,sidebarWidth:n,resizingSidebar:a}=A.useContext(wc);return A.createElement("div",{className:"fixed top-0 left-0 h-screen z-base "+("closed"===t?"pointer-events-none":"")},A.createElement("div",{className:`relative h-screen transform flex ${"closed"!==t?"":"-translate-x-full"} ${a?"transition-none":"fullscreen"===t?"transition-all duration-150 ease-out":"transition-all duration-300 ease-out"}`,style:{width:"fullscreen"===t?"100vw":n+"px",maxWidth:"100vw",minWidth:"360px"}},e))},Fc=({children:e})=>{const{displayState:t}=A.useContext(wc);return A.createElement("div",{className:`relative left-0 w-full h-full flex flex-col items-stretch bg-white shadow-2xl overflow-hidden transition-opacity duration-300 ease-out ${"closed"!==t?"opacity-100":"opacity-0"} ${"fullscreen"===t?"":"rounded-r-md"}`},e)};class Pc{constructor(e,t,n){this.form=e,this.__type="screen",this.name=e.label,this.Icon=t||da,this.layout=n||"popup",this.Component=()=>A.createElement(Tn,{form:e})}}function Bc(e,n={}){const[a,r]=Ot(e,n);return Bt(t.useMemo((()=>{if(r)return new Pc(r)}),[r])),[a,r]}function _c(e,n,a){Bt(t.useMemo((()=>{if(e)return new Pc(e,n,a)}),[e,n,a]))}class Vc{constructor(e={}){var t,n;this.buttons={save:"Save",reset:"Reset"},(null==(t=e.buttons)?void 0:t.save)&&(this.buttons.save=e.buttons.save),(null==(n=e.buttons)?void 0:n.reset)&&(this.buttons.reset=e.buttons.reset)}}const Ic=Z.default(Ct)`
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding: 0 10px;

  &:focus {
    outline: none;
  }

  svg {
    fill: currentColor;
    opacity: 0.7;
    width: 2.5em;
    height: 2.5em;
  }

  &:disabled {
    opacity: 0.6;
    filter: grayscale(25%);
  }

  @media (min-width: 1030px) {
    padding: 0 20px;

    svg {
      margin-right: 4px;
    }
  }
`,Rc=Z.default.span`
  all: unset;
  display: none;
  @media (min-width: 1030px) {
    display: inline;
  }
`,Oc=({form:e})=>{const[n,a]=t.useState(!1);return A.createElement(A.Fragment,null,A.createElement($c,{open:n,onClick:()=>a((e=>!e))}),A.createElement(Dc,{open:n},A.createElement(en,{click:!0,escape:!0,disabled:!n,allowClickPropagation:!0,onDismiss:()=>{a((e=>!e))}},(null==e?void 0:e.actions)&&e.actions.map(((t,n)=>A.createElement(t,{form:e,key:n}))),A.createElement(jc,null))))},$c=Z.default((e=>A.createElement("button",d({},e),A.createElement(de,null))))`
  height: var(--tina-toolbar-height);
  width: 36px;
  align-self: stretch;
  background-color: white;
  background-position: center;
  background-size: auto 18px;
  background-repeat: no-repeat;
  border: 0;
  margin: 0 -12px 0 12px;
  outline: none;
  cursor: pointer;
  transition: all 150ms ease-out;
  display: flex;
  justify-content: center;
  align-items: center;
  border-left: 1px solid var(--tina-color-grey-2);
  &:hover {
    background-color: var(--tina-color-grey-1);
    svg {
      fill: var(--tina-color-primary);
    }
  }
  svg {
    transition: all 150ms ease-out;
  }

  ${e=>e.open&&r.css`
      background-color: var(--tina-color-grey-1);
      box-shadow: inset 0px 2px 3px rgba(0, 0, 0, 0.06);
      svg {
        fill: var(--tina-color-primary);
      }
      &:hover {
        svg {
          fill: var(--tina-color-primary);
        }
      }
    `};
`,Dc=Z.default.div`
  min-width: 192px;
  border-radius: var(--tina-radius-big);
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  top: 0;
  right: 14px;
  transform: translate3d(0, 23px, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 100% 0%;
  box-shadow: var(--tina-shadow-big);
  background-color: white;
  overflow: hidden;
  z-index: var(--tina-z-index-1);
  ${e=>e.open&&r.css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 55px, 0) scale3d(1, 1, 1);
    `};
`,Ac=Z.default(zn)`
  height: 32px;
  background-color: var(--tina-color-grey-1);
  display: flex;
  align-items: center;
  justify-content: center;

  &:not(:first-child) {
    border-top: 2px solid var(--tina-color-grey-2);
  }

  svg {
    fill: currentColor;
    width: 24px;
    margin-right: 2px;
  }
`,jc=()=>{const e=Ht();return A.createElement(Ac,{onClick:()=>{e.disable()}},A.createElement(ke,null)," Exit Tina")},Zc=(e,t)=>{const[n,a]=A.useState();return A.useEffect((()=>{if(e)return e.subscribe(a,t)}),[e]),n},Kc=()=>{var e;const t=Ht(),n=t.plugins.getType("toolbar:widget"),a=t.plugins.getType("form"),r=a.all().length?a.all()[0]:null,i=null==r?void 0:r.finalForm.getState(),l=Zc(r,{pristine:!0,submitting:!0,invalid:!0}),[,o]=A.useState(0),s=t.plugins.getType("screen");Zt(s);const c=s.all(),m=c.length>0,[u,p]=A.useState(null),[g,f]=A.useState(!1);Zt(a),Zt(n);const h=()=>{r&&(r.reset(),o((e=>e++)))},w=(null==(e=t.toolbar)?void 0:e.buttons)||(null==r?void 0:r.buttons)||{save:"Save",reset:"Reset",invalid:!0},v=r&&r.submit,b=!r,x=!!b||l&&(null==i?void 0:i.pristine),y=!b&&!(!l||!(null==i?void 0:i.submitting)),E=l&&(null==i?void 0:i.invalid);return A.createElement(A.Fragment,null,A.createElement(ed,null),A.createElement(Uc,{menuIsOpen:g},A.createElement(qc,null,m&&A.createElement(ad,{onClick:()=>f(!g),open:g},A.createElement(me,null)),A.createElement(lc,{sidebar:!1})),A.createElement(Xc,null,n.all().length>=1&&A.createElement(Wc,null,n.all().sort(((e,t)=>e.weight-t.weight)).map((e=>A.createElement(e.component,d({key:e.name},e.props))))),A.createElement(Jc,null,A.createElement(Gc,{dirty:!x})),A.createElement(Qc,null,A.createElement(Ic,{disabled:b||x,onClick:h},A.createElement(Re,null),A.createElement(Rc,null,w.reset)),A.createElement(Yc,{variant:"primary",onClick:v,busy:y,disabled:b||x||E},y&&A.createElement(wn,null),!y&&A.createElement(A.Fragment,null,A.createElement(Rc,null,w.save))),A.createElement(Oc,{form:r})))),m&&A.createElement(od,{visible:g},A.createElement(ld,null,A.createElement(rd,null,c.map((e=>{const t=e.Icon;return A.createElement(id,{key:e.name,value:e.name,onClick:()=>{p(e),f(!1)}},A.createElement(t,null)," ",e.name)})))),A.createElement(sd,null)),u&&A.createElement(Wt,{screen:u,close:()=>p(null)}))},Gc=({dirty:e})=>A.createElement(ir,{name:"Form Status",margin:!1},e?A.createElement(nd,null,A.createElement(td,{warning:!0})," ",A.createElement(Rc,null,"Unsaved changes")):A.createElement(nd,null,A.createElement(td,null)," ",A.createElement(Rc,null,"No changes"))),Uc=Z.default.div`
  font-family: 'Inter', sans-serif;
  position: fixed;
  top: 0;
  left: ${e=>e.menuIsOpen?"var(--tina-sidebar-width)":"0"};
  right: 0;
  padding: 0 12px;
  height: 62px;
  z-index: var(--tina-z-index-4);
  box-sizing: border-box;
  display: grid;
  grid-template-areas: 'left right';
  grid-template-columns: auto 1fr;
  align-items: stretch;
  background-color: var(--tina-color-grey-1);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid var(--tina-color-grey-2);
  transition: left var(--tina-timing-long) ease-out;

  @media (max-width: 1029px) {
    label {
      display: none;
    }
  }
`,Yc=Z.default(Ic)`
  padding: 0 32px;
`,Wc=Z.default.div`
  grid-area: widgets;
  display: flex;
  align-self: stretch;
  align-items: center;
  justify-self: end;
  padding-right: 12px;
  border-right: 1px solid white;
  box-shadow: inset -1px 0 0 #e1ddec;
  background-image: linear-gradient(
    to left,
    rgba(0, 0, 0, 0.01),
    transparent 48px
  );

  > * {
    margin-bottom: 0;
    margin-left: 16px;
  }

  label {
    margin-bottom: 0;
    white-space: nowrap;
  }

  @media (min-width: 1030px) {
    > div {
      display: block;
    }
  }
`,qc=Z.default.div`
  grid-area: left;
  justify-self: start;
  display: flex;
  align-items: center;
`,Xc=Z.default.div`
  grid-area: right;
  justify-self: end;
  display: flex;
  align-items: center;
`,Jc=Z.default.div`
  display: flex;
  align-items: center;

  > * {
    margin-bottom: 0;
    margin-left: 16px;
  }

  label {
    margin-bottom: 0;
  }
`,Qc=Z.default.div`
  display: flex;
  align-items: center;

  button {
    margin-left: 12px;
  }
`,ed=Z.default.div`
  position: relative;
  opacity: 0;
  display: block;
  width: 100%;
  height: var(--tina-toolbar-height);
`,td=Z.default.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 8px;
  margin-top: -1px;
  background-color: #3cad3a;
  border: 1px solid #249a21;
  margin-right: 5px;
  opacity: 0.5;

  ${e=>e.warning&&r.css`
      background-color: #e9d050;
      border: 1px solid #d3ba38;
      opacity: 1;
    `};
`,nd=Z.default.p`
  font-size: var(--tina-font-size-3);
  display: flex;
  align-items: center;
  color: var(--tina-color-grey-6);
  padding-right: 4px;
  line-height: 1.35;
  margin: 0;
`,ad=Z.default(Ct)`
  position: relative;
  margin-left: -12px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-right: 8px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  outline: none;

  svg {
    position: relative;
    transition: fill 85ms ease-out;
    fill: var(--tina-color-grey-6);
    margin-left: -4px;
    width: 28px;
    height: auto;
    path {
      position: relative;
      transition: transform var(--tina-timing-long) ease-out,
        opacity var(--tina-timing-long) ease-out,
        fill var(--tina-timing-short) ease-out;
      transform-origin: 50% 50%;
    }
  }
  &:hover {
    svg {
      fill: var(--tina-color-grey-7);
    }
  }
  ${e=>e.open&&r.css`
      svg {
        path:first-child {
          /* Top bar */
          transform: rotate(45deg) translate3d(0, 0.45rem, 0);
        }
        path:nth-child(2) {
          /* Middle bar */
          transform: translate3d(-100%, 0, 0);
          opacity: 0;
        }
        path:last-child {
          /* Bottom Bar */
          transform: rotate(-45deg) translate3d(0, -0.45rem, 0);
        }
      }
    `};
`,rd=Z.default.div`
  margin: 0 calc(var(--tina-padding-big) * -1) 32px
    calc(var(--tina-padding-big) * -1);
  display: block;
`,id=Z.default.div`
  color: var(--tina-color-grey-1);
  font-size: var(--tina-font-size-4);
  font-weight: var(--tina-font-weight-regular);
  padding: var(--tina-padding-big) var(--tina-padding-big)
    var(--tina-padding-big) 64px;
  position: relative;
  cursor: pointer;
  transition: all var(--tina-timing-short) ease-out;
  overflow: hidden;
  &:after {
    content: '';
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: 8px;
    right: 8px;
    border-radius: var(--tina-radius-big);
    background-color: var(--tina-color-grey-9);
    z-index: -1;
    transition: all 150ms ease;
    transform: translate3d(0, 100%, 0);
    opacity: 0;
  }
  &:hover {
    color: var(--tina-color-primary-light);
    &:after {
      transform: translate3d(0, 0, 0);
      transition: transform var(--tina-timing-short) ease-out, opacity 0ms;
      opacity: 1;
    }
    svg {
      fill: var(--tina-color-primary);
    }
    & ~ * {
      &:after {
        transform: translate3d(0, -100%, 0);
      }
    }
  }
  svg {
    position: absolute;
    left: var(--tina-padding-big);
    top: 50%;
    transform: translate3d(0, -50%, 0);
    width: 36px;
    height: auto;
    fill: var(--tina-color-grey-4);
    transition: all var(--tina-timing-short) ease-out;
  }
`,ld=Z.default.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding: var(--tina-padding-big);
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`,od=Z.default.div`
  all: unset;
  box-sizing: border-box;
  background: var(--tina-color-grey-8);
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--tina-sidebar-width);
  transform: translate3d(${e=>e.visible?"0":"-100%"}, 0, 0);
  overflow: hidden;
  padding: var(--tina-padding-big);
  transition: all var(--tina-timing-long) ease-out;
  z-index: var(--tina-z-index-2);

  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`,sd=Z.default((e=>{var t=u(e,[]);return A.createElement("div",d({},t),A.createElement(Te,null))}))`
  position: absolute;
  z-index: -1;
  bottom: var(--tina-padding-big);
  left: var(--tina-padding-big);
  svg {
    width: 128px;
    height: 128px;
    margin: -4px -20px;
    fill: var(--tina-color-grey-9);
  }
`,cd={__type:"field",name:"markdown",Component:ud("Markdown")},dd={__type:"field",name:"html",Component:ud("HTML")},md=Z.default.p`
  white-space: normal;
  font-size: var(--tina-font-size-2);
  margin: 8px 0 0 0;

  a {
    color: var(--tina-color-primary);
  }
`;function ud(e,t){return t=>j.default.createElement(ir,{name:t.input.name,label:`${e} Field not Registered`},j.default.createElement(md,null,"The ",e," field is not registered. Some built-in field types are not bundled by default in an effort to control bundle size. Consult the Tina docs to learn how to use this field type."),j.default.createElement(md,null,j.default.createElement("a",{style:{textDecoration:"underline"},href:"https://tina.io/docs/editing/markdown/#registering-the-field-plugins",target:"_blank",rel:"noreferrer noopener"},"Tina Docs: Registering Field Plugins")))}function pd({navigateNext:e,navigatePrev:t,hasNext:n,hasPrev:a}){return j.default.createElement("div",{className:"w-full flex flex-shrink-0 justify-end gap-2 items-center bg-white border-t border-gray-100 py-3 px-5 shadow-sm z-10"},j.default.createElement(Ct,{variant:"secondary",disabled:!a,onClick:t},j.default.createElement(Ga,{className:"w-6 h-full mr-2 opacity-70"})," Previous"),j.default.createElement(Ct,{variant:"secondary",disabled:!n,onClick:e},"Next ",j.default.createElement(qa,{className:"w-6 h-full ml-2 opacity-70"})))}function gd({item:e,onClick:t,onSelect:n,onDelete:a}){return j.default.createElement(hd,{onClick:()=>t(e),type:e.type},j.default.createElement(wd,null,e.previewSrc?j.default.createElement("img",{src:e.previewSrc,alt:e.filename}):j.default.createElement(fd,{type:e.type})),j.default.createElement(vd,null,e.filename),j.default.createElement("div",{className:"flex justify-end gap-2 items-center ml-2"},n&&"file"===e.type&&j.default.createElement(Ct,{size:"medium",onClick:()=>n(e)},"Insert"),a&&"file"===e.type&&j.default.createElement(Nt,{size:"medium",onClick:()=>a(e)},j.default.createElement(Se,{className:"w-5/6 h-auto"}))))}function fd({type:e}){return"dir"===e?j.default.createElement(qe,null):j.default.createElement(Xe,null)}const hd=Z.default.li`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: white;
  filter: drop-shadow(0 0 0 transparent);
  transition: filter 300ms ease;
  border-radius: var(--tina-radius-small);

  > :first-child {
    margin-right: var(--tina-padding-small);
  }

  &:hover {
    filter: drop-shadow(var(--tina-shadow-small));
    ${e=>"dir"===e.type&&r.css`
        cursor: pointer;
      `}
  }
`,wd=Z.default.div`
  width: 56px;
  height: 56px;
  border-radius: var(--tina-radius-small);
  overflow: hidden;
  display: flex;
  justify-content: center;
  flex-shrink: 0;

  > img {
    object-fit: cover;
    width: 100%;
    min-height: 100%;
    object-position: center;
  }

  > svg {
    width: 47%;
    height: 100%;
    fill: var(--tina-color-grey-4);
  }
`,vd=Z.default.span`
  flex-grow: 1;
  font-size: var(--tina-font-size-2);
  overflow: hidden;
  width: 100%;
  overflow-wrap: break-word;
  white-space: nowrap;
  text-overflow: ellipsis;
`;function bd({directory:e="",setDirectory:t}){e=e.replace(/^\/|\/$/g,"");let n=X.default.dirname(e);return"."===n&&(n=""),j.default.createElement(xd,{showArrow:""!==e},j.default.createElement("span",{onClick:()=>t(n)},j.default.createElement(be,{className:"w-8 h-auto"})),j.default.createElement("button",{onClick:()=>t("")},"Media"),e&&e.split("/").map(((e,n,a)=>{const r=a.slice(0,n+1).join("/");return j.default.createElement("button",{key:r,onClick:()=>{t(r)}},e)})))}const xd=Z.default.div`
  width: 100%;
  display: flex;
  align-items: center;
  color: var(--tina-color-grey-4);
  font-size: var(--tina-font-size-3);

  button {
    text-transform: capitalize;
    transition: color 180ms ease;
    border: 0;
    background-color: transparent;
    font-size: inherit;
  }

  > span {
    display: flex;
  }

  svg {
    width: 20px;
    height: 20px;
    fill: var(--tina-color-grey-4);
    transform: translateX(6px);
    opacity: 0;
    transition: opacity 200ms ease, transform 300ms ease-out;
    align-self: center;
  }

  ${e=>e.showArrow&&r.css`
      svg {
        opacity: 1;
        transform: translateX(0px);
        transition: opacity 180ms ease, transform 300ms ease-in;
      }
    `}

  svg:hover {
    cursor: pointer;
    fill: var(--tina-color-grey-9);
  }

  button:hover {
    color: var(--tina-color-grey-9);
  }

  > :not(:last-child) {
    display: none;
  }

  > :first-child {
    display: inline;
  }

  *:not(span)::after {
    content: '/';
    padding-left: 8px;
  }

  > *:not(:first-of-type) {
    padding-left: 8px;
  }

  @media (min-width: 720px) {
    font-size: var(--tina-font-size-2);

    svg {
      margin-left: -8px;
    }

    ${e=>e.showArrow&&r.css`
        svg {
          transform: translateX(-4px);
        }
      `}

    > :not(:last-child) {
      display: flex;
    }

    > *:not(:first-of-type) {
      padding-left: 8px;
    }
  }
`;function yd(){const e=Sa(),[n,a]=t.useState();if(t.useEffect((()=>e.events.subscribe("media:open",(e=>{var t=e,{type:n}=t,r=u(t,["type"]);a(r)}))),[]),!n)return null;const r=()=>a(void 0);return j.default.createElement(ne,null,j.default.createElement(rt,null,j.default.createElement(et,{close:r},"Media Manager"),j.default.createElement(re,null,j.default.createElement(kd,m(d({},n),{close:r})))))}const Ed=new ft({title:"Error fetching media",message:"Something went wrong while requesting the resource.",docsLink:"https://tina.io/docs/media/#media-store"});function kd(e){var n=e,{allowDelete:a,onSelect:r,close:i}=n,l=u(n,["allowDelete","onSelect","close"]);const o=Sa(),[s,c]=t.useState((()=>o.media.isConfigured?"loading":"not-configured")),[p,g]=t.useState(Ed),[f,w]=t.useState(l.directory),[v,b]=t.useState({items:[],nextOffset:void 0}),[x,y]=t.useState([]),E=x[x.length-1],k=()=>y([]),C=()=>{v.nextOffset&&y([...x,v.nextOffset])},N=()=>{const e=x.slice(0,x.length-1);y(e)},L=x.length>0,M=!!v.nextOffset;t.useEffect((()=>{if(o.media.isConfigured)return e(),o.events.subscribe(["media:upload:success","media:delete:success","media:pageSize"],e);function e(){c("loading"),o.media.list({offset:E,limit:o.media.pageSize,directory:f}).then((e=>{b(e),c("loaded")})).catch((e=>{console.error(e),"MediaListError"===e.ERR_TYPE?g(e):g(Ed),c("error")}))}}),[E,f,o.media.isConfigured]);const z=e=>{"dir"===e.type&&(w(X.default.join(e.directory,e.filename)),k())};let H,T;a&&(H=e=>{confirm("Are you sure you want to delete this file?")&&o.media.delete(e)}),r&&(T=e=>{r(e),i&&i()});const[S,F]=t.useState(!1),{getRootProps:P,getInputProps:B,isDragActive:_}=h.useDropzone({accept:o.media.accept||"image/*",multiple:!0,onDrop:async e=>{try{F(!0),await o.media.persist(e.map((e=>({directory:f||"/",file:e}))))}catch{}F(!1)}}),V=P(),{onClick:I}=V,R=u(V,["onClick"]);function O(){const e=null==document?void 0:document.body;return e.style.overflow="hidden",()=>{e.style.overflow="auto"}}if(t.useEffect(O,[]),"loading"===s||S)return j.default.createElement(Nd,null);if("not-configured"===s)return j.default.createElement(zd,{title:"No Media Store Configured",message:"To use the media manager, you need to configure a Media Store.",docsLink:"https://tina.io/docs/media-cloudinary/"});if("error"===s){const{title:e,message:t,docsLink:n}=p;return j.default.createElement(zd,{title:e,message:t,docsLink:n})}return j.default.createElement(Ld,null,j.default.createElement("div",{className:"flex items-center bg-white border-b border-gray-100 py-3 px-5 shadow-sm flex-shrink-0"},j.default.createElement(bd,{directory:f,setDirectory:w}),j.default.createElement(Cd,{onClick:I,uploading:S})),j.default.createElement("ul",m(d({},R),{className:"flex flex-1 flex-col gap-4 p-5 m-0 h-full overflow-y-auto "+(_?"border-2 border-blue-500 rounded-lg":"")}),j.default.createElement("input",d({},B())),"loaded"===s&&0===v.items.length&&j.default.createElement(Md,null),v.items.map((e=>j.default.createElement(gd,{key:e.id,item:e,onClick:z,onSelect:T,onDelete:H})))),j.default.createElement(pd,{currentOffset:E,hasNext:M,navigateNext:C,hasPrev:L,navigatePrev:N}))}const Cd=({onClick:e,uploading:t})=>j.default.createElement(Ct,{variant:"primary",size:"custom",className:"text-sm h-10 px-6",busy:t,onClick:e},t?j.default.createElement(wn,null):j.default.createElement(j.default.Fragment,null,"Upload ",j.default.createElement(Aa,{className:"w-6 h-full ml-2 opacity-70"}))),Nd=e=>j.default.createElement("div",d({className:"w-full h-full flex flex-col items-center justify-center"},e),j.default.createElement(wn,{color:"var(--tina-color-primary)"})),Ld=({children:e})=>j.default.createElement("div",{className:"h-full flex-1 text-gray-700 flex flex-col relative bg-gray-50 outline-none active:outline-none focus:outline-none"},e),Md=e=>j.default.createElement("div",d({className:"text-2xl opacity-50 p-12 text-center"},e),"Drag and Drop assets here"),zd=e=>{var t=e,{title:n,message:a,docsLink:r}=t,i=u(t,["title","message","docsLink"]);return j.default.createElement("div",d({className:"h-3/4 text-center flex flex-col justify-center"},i),j.default.createElement("h2",{className:"mb-3 text-xl text-gray-600"},n),j.default.createElement("div",{className:"mb-3 text-base text-gray-700"},a),j.default.createElement("a",{href:r,target:"_blank",rel:"noreferrer noopener",className:"font-bold text-blue-500 hover:text-blue-600 hover:underline transition-all ease-out duration-150"},"Learn More"))},Hd=Lt({name:"Media Manager",Component:kd,Icon:ua,layout:"fullscreen",props:{allowDelete:!0}}),Td=[vs,hs,vi,Qr,ds,xs,us,os,gs,vr,Br,fi,qr,Cs,Ps,cd,dd,_s,Is];class Sd extends vt{constructor(e={}){var t=e,{sidebar:n,toolbar:a,alerts:r={}}=t;if(super(u(t,["sidebar","toolbar","alerts"])),this.alerts.setMap(d({"media:upload:failure":()=>({level:"error",message:"Failed to upload file."}),"media:delete:failure":()=>({level:"error",message:"Failed to delete file."})},r)),n){const e="object"===typeof n?n:void 0;this.sidebar=new js(this.events,e)}if(a){const e="object"===typeof a?a:void 0;this.toolbar=new Vc(e)}Td.forEach((e=>{this.fields.find(e.name)||this.fields.add(e)})),this.plugins.add(Hd)}get alerts(){return this._alerts||(this._alerts=new bt(this.events)),this._alerts}registerApi(e,t){t.alerts&&this.alerts.setMap(t.alerts),super.registerApi(e,t)}get forms(){return this.plugins.findOrCreateMap("form")}get fields(){return this.plugins.findOrCreateMap("field")}get screens(){return this.plugins.findOrCreateMap("screen")}}const Fd="The `cms` prop must be an instance of `TinaCMS`.",Pd=({cms:e,children:t})=>{if(!(e instanceof Sd))throw new Error(Fd);return A.createElement(zt.Provider,{value:e},t)};function Bd({alerts:e}){return Zt(e),e.all.length?j.default.createElement(_d,null,e.all.map(((t,n)=>j.default.createElement(Id,{key:t.id,index:n,level:t.level,onClick:()=>{e.dismiss(t)}},"info"===t.level&&j.default.createElement(Ge,null),"success"===t.level&&j.default.createElement(Ke,null),"warn"===t.level&&j.default.createElement(Ue,null),"error"===t.level&&j.default.createElement(Ye,null),j.default.createElement("p",null,t.message),j.default.createElement(Rd,null))))):null}const _d=Z.default.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 999999;
  pointer-events: none;
`,Vd=r.keyframes`
  0% {
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`,Id=Z.default.div`
  text-align: center;
  border: 0;
  border-radius: var(--tina-radius-small);
  box-shadow: var(--tina-shadow-small);
  background-color: var(--tina-color-grey-1);
  border: 1px solid var(--tina-color-grey-2);
  color: var(--tina-color-grey-9);
  fill: var(--tina-color-primary);
  font-weight: var(--tina-font-weight-regular);
  pointer-events: all;
  cursor: pointer;
  font-size: var(--tina-font-size-2);
  padding: 8px 4px 8px 12px;
  transition: all var(--tina-timing-short) ease-out;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  min-width: 350px;
  max-width: 100%;

  animation-name: ${Vd};
  animation-timing-function: ease-out;
  animation-iteration-count: 1;
  animation-fill-mode: both;
  animation-duration: 150ms;

  p {
    margin: 0;
    flex: 1 0 auto;
    text-align: left;
  }

  svg {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    flex: 0 0 auto;
  }

  ${e=>"info"===e.level&&r.css`
      fill: var(--tina-color-primary);
      border-left: 6px solid var(--tina-color-primary);
    `};

  ${e=>"success"===e.level&&r.css`
      fill: var(--tina-color-success);
      border-left: 6px solid var(--tina-color-success);
    `};

  ${e=>"warn"===e.level&&r.css`
      fill: var(--tina-color-warning-dark);
      border-left: 6px solid var(--tina-color-warning);
    `};

  ${e=>"error"===e.level&&r.css`
      fill: var(--tina-color-error);
      border-left: 6px solid var(--tina-color-error);
    `};
`,Rd=Z.default((e=>{var t=u(e,[]);return j.default.createElement("button",d({},t),j.default.createElement(ce,null))}))`
  border: none;
  background: transparent;
  padding: 0;
  margin-left: 14px;
  outline: none;
  fill: var(--tina-color-grey-5);
  display: flex;
  align-items: center;

  svg {
    width: 20px;
    height: 20px;
    flex: 0 0 auto;
  }
`,Od=A.createContext(-1),$d=({children:e})=>{const t=A.useRef(null),[n,a]=A.useState(0);return A.useEffect((()=>{if(!t)return;const e=new MutationObserver((()=>a((e=>e+1))));return e.observe(t.current,{childList:!0,subtree:!0,characterData:!0}),()=>e.disconnect()}),[]),A.createElement(Od.Provider,{value:n},A.createElement("div",{ref:t},e))},Dd=e=>{const t=A.useContext(Od),[n,a]=A.useState(null);return A.useEffect((()=>{const t=document.querySelector(`[data-tinafield="${e}"]`);a(t)}),[t,e]),n},Ad=Z.default.div`
  position: fixed;
  z-index: var(--tina-z-index-3);
  left: 0;
  padding: 8px 0;
  margin-left: var(--tina-sidebar-width);
  width: calc(100% - var(--tina-sidebar-width));
  text-align: center;
  top: ${e=>"top"===e.position?0:"auto"};
  bottom: ${e=>"top"===e.position?"auto":0};
`,jd=Z.default.div`
  display: inline-block;
  fill: white;
  background-color: var(--tina-color-primary);
  border-radius: 50%;
  box-shadow: 0 0 10px -5px;
`,Zd=()=>A.createElement(Ad,{position:"top"},A.createElement(jd,null,A.createElement(ge,{className:"w-8 h-auto"}))),Kd=()=>A.createElement(Ad,{position:"bottom"},A.createElement(jd,null,A.createElement(pe,{className:"w-8 h-auto"}))),Gd=()=>{const{subscribe:e}=It("field:focus");A.useEffect((()=>e((({fieldName:e})=>{const t=document.querySelector(`[data-tinafield="${e}"]`);if(!t)return;const{top:n,height:a}=t.getBoundingClientRect(),r=n+window.scrollY,i=n+a+window.scrollY,l=window.scrollY,o=window.innerHeight+window.scrollY;a<window.innerHeight?i>o?window.scrollTo({top:i-window.innerHeight,behavior:"smooth"}):r<l&&window.scrollTo({top:r,behavior:"smooth"}):i<o?window.scrollTo({top:i-window.innerHeight,behavior:"smooth"}):r>l&&window.scrollTo({top:r,behavior:"smooth"})}))))},Ud=()=>{const[e,t]=A.useState(null),[n,a]=A.useState(!1),[r,i]=A.useState(!1),l=Dd(e);A.useEffect((()=>{let e;return l?(a(!0),i(l.getBoundingClientRect())):e=setTimeout((()=>{a(!1)}),150),()=>{clearTimeout(e)}}),[l]);const[,o]=A.useState(0),s=()=>o((e=>e+1));A.useEffect((()=>(window.addEventListener("scroll",s),()=>{window.removeEventListener("scroll",s)})),[]);const{subscribe:c}=It("field:hover");if(A.useEffect((()=>c((({fieldName:e})=>{t(e)})))),Gd(),!n)return null;const d=r.top+window.scrollY,m=r.top+r.height+window.scrollY,u=window.scrollY;return d>window.innerHeight+window.scrollY?A.createElement(Kd,null):m<u?A.createElement(Zd,null):A.createElement("div",{style:{position:"absolute",zIndex:"var(--tina-z-index-3)",top:r.top+window.scrollY,left:r.left+window.scrollX,width:r.width,height:r.height,outline:"2px dashed var(--tina-color-indicator)",borderRadius:"var(--tina-radius-small)",transition:n?l?"opacity 300ms ease-out":"opacity 150ms ease-in":"none",opacity:l&&n?.8:0}})};var Yd='.tina-tailwind {\n  line-height: 1.5;\n  -webkit-text-size-adjust: 100%;\n  -moz-tab-size: 4;\n  tab-size: 4;\n}\n\n  .tina-tailwind *,\n  .tina-tailwind ::before,\n  .tina-tailwind ::after {\n    box-sizing: border-box;\n    border-width: 0;\n    border-style: solid;\n    border-color: transparent;\n  }\n\n  .tina-tailwind ::before,\n  .tina-tailwind ::after {\n    --tw-content: \'\';\n  }\n\n  .tina-tailwind hr {\n    height: 0; /* 1 */\n    color: inherit; /* 2 */\n    border-top-width: 1px; /* 3 */\n  }\n\n  .tina-tailwind abbr:where([title]) {\n    text-decoration: underline dotted;\n  }\n\n  .tina-tailwind h1,\n  .tina-tailwind h2,\n  .tina-tailwind h3,\n  .tina-tailwind h4,\n  .tina-tailwind h5,\n  .tina-tailwind h6 {\n    font-size: inherit;\n    font-weight: inherit;\n  }\n\n  .tina-tailwind a {\n    color: inherit;\n    text-decoration: inherit;\n  }\n\n  .tina-tailwind b,\n  .tina-tailwind strong {\n    font-weight: bolder;\n  }\n\n  .tina-tailwind code,\n  .tina-tailwind kbd,\n  .tina-tailwind samp,\n  .tina-tailwind pre {\n    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; /* 1 */\n    font-size: 1em; /* 2 */\n  }\n\n  .tina-tailwind small {\n    font-size: 80%;\n  }\n\n  .tina-tailwind sub,\n  .tina-tailwind sup {\n    font-size: 75%;\n    line-height: 0;\n    position: relative;\n    vertical-align: baseline;\n  }\n\n  .tina-tailwind sub {\n    bottom: -0.25em;\n  }\n\n  .tina-tailwind sup {\n    top: -0.5em;\n  }\n\n  .tina-tailwind table {\n    text-indent: 0; /* 1 */\n    border-color: inherit; /* 2 */\n    border-collapse: collapse; /* 3 */\n  }\n\n  .tina-tailwind button,\n  .tina-tailwind input,\n  .tina-tailwind optgroup,\n  .tina-tailwind select,\n  .tina-tailwind textarea {\n    font-family: inherit; /* 1 */\n    font-size: 100%; /* 1 */\n    line-height: inherit; /* 1 */\n    color: inherit; /* 1 */\n    margin: 0; /* 2 */\n    padding: 0; /* 3 */\n  }\n\n  .tina-tailwind button,\n  .tina-tailwind select {\n    text-transform: none;\n  }\n\n  .tina-tailwind button,\n  .tina-tailwind [type=\'button\'],\n  .tina-tailwind [type=\'reset\'],\n  .tina-tailwind [type=\'submit\'] {\n    -webkit-appearance: button; /* 1 */\n    background-color: transparent; /* 2 */\n    background-image: none; /* 2 */\n  }\n\n  .tina-tailwind :-moz-focusring {\n    outline: auto;\n  }\n\n  .tina-tailwind :-moz-ui-invalid {\n    box-shadow: none;\n  }\n\n  .tina-tailwind progress {\n    vertical-align: baseline;\n  }\n\n  .tina-tailwind ::-webkit-inner-spin-button,\n  .tina-tailwind ::-webkit-outer-spin-button {\n    height: auto;\n  }\n\n  .tina-tailwind [type=\'search\'] {\n    -webkit-appearance: textfield; /* 1 */\n    outline-offset: -2px; /* 2 */\n  }\n\n  .tina-tailwind ::-webkit-search-decoration {\n    -webkit-appearance: none;\n  }\n\n  .tina-tailwind ::-webkit-file-upload-button {\n    -webkit-appearance: button; /* 1 */\n    font: inherit; /* 2 */\n  }\n\n  .tina-tailwind summary {\n    display: list-item;\n  }\n\n  .tina-tailwind blockquote,\n  .tina-tailwind dl,\n  .tina-tailwind dd,\n  .tina-tailwind h1,\n  .tina-tailwind h2,\n  .tina-tailwind h3,\n  .tina-tailwind h4,\n  .tina-tailwind h5,\n  .tina-tailwind h6,\n  .tina-tailwind hr,\n  .tina-tailwind figure,\n  .tina-tailwind p,\n  .tina-tailwind pre {\n    margin: 0;\n  }\n\n  .tina-tailwind fieldset {\n    margin: 0;\n    padding: 0;\n  }\n\n  .tina-tailwind legend {\n    padding: 0;\n  }\n\n  .tina-tailwind ol,\n  .tina-tailwind ul,\n  .tina-tailwind menu {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n  }\n\n  .tina-tailwind textarea {\n    resize: vertical;\n  }\n\n  .tina-tailwind input::placeholder,\n  .tina-tailwind textarea::placeholder {\n    opacity: 1; /* 1 */\n    color: #918c9e; /* 2 */\n  }\n\n  .tina-tailwind button,\n  .tina-tailwind [role=\'button\'] {\n    cursor: pointer;\n  }\n\n  .tina-tailwind :disabled {\n    cursor: default;\n  }\n\n  .tina-tailwind img,\n  .tina-tailwind svg,\n  .tina-tailwind video,\n  .tina-tailwind canvas,\n  .tina-tailwind audio,\n  .tina-tailwind iframe,\n  .tina-tailwind embed,\n  .tina-tailwind object {\n    display: block; /* 1 */\n    vertical-align: middle; /* 2 */\n  }\n\n  .tina-tailwind img,\n  .tina-tailwind video {\n    max-width: 100%;\n    height: auto;\n  }\n\n  .tina-tailwind [hidden] {\n    display: none;\n  }\n*, ::before, ::after {\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(0 132 255 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n}\n.container {\n  width: 100%;\n}\n@media (min-width: 640px) {\n\n  .container {\n    max-width: 640px;\n  }\n}\n@media (min-width: 768px) {\n\n  .container {\n    max-width: 768px;\n  }\n}\n@media (min-width: 1024px) {\n\n  .container {\n    max-width: 1024px;\n  }\n}\n@media (min-width: 1280px) {\n\n  .container {\n    max-width: 1280px;\n  }\n}\n@media (min-width: 1536px) {\n\n  .container {\n    max-width: 1536px;\n  }\n}\n.prose {\n  color: var(--tw-prose-body);\n  max-width: 65ch;\n}\n.prose :where([class~="lead"]):not(:where([class~="not-prose"] *)) {\n  color: var(--tw-prose-lead);\n  font-size: 1.25em;\n  line-height: 1.6;\n  margin-top: 1.2em;\n  margin-bottom: 1.2em;\n}\n.prose :where(a):not(:where([class~="not-prose"] *)) {\n  color: var(--tw-prose-links);\n  text-decoration: underline;\n  font-weight: 500;\n}\n.prose :where(strong):not(:where([class~="not-prose"] *)) {\n  color: var(--tw-prose-bold);\n  font-weight: 600;\n}\n.prose :where(ol):not(:where([class~="not-prose"] *)) {\n  list-style-type: decimal;\n  padding-left: 1.625em;\n}\n.prose :where(ol[type="A"]):not(:where([class~="not-prose"] *)) {\n  list-style-type: upper-alpha;\n}\n.prose :where(ol[type="a"]):not(:where([class~="not-prose"] *)) {\n  list-style-type: lower-alpha;\n}\n.prose :where(ol[type="A" s]):not(:where([class~="not-prose"] *)) {\n  list-style-type: upper-alpha;\n}\n.prose :where(ol[type="a" s]):not(:where([class~="not-prose"] *)) {\n  list-style-type: lower-alpha;\n}\n.prose :where(ol[type="I"]):not(:where([class~="not-prose"] *)) {\n  list-style-type: upper-roman;\n}\n.prose :where(ol[type="i"]):not(:where([class~="not-prose"] *)) {\n  list-style-type: lower-roman;\n}\n.prose :where(ol[type="I" s]):not(:where([class~="not-prose"] *)) {\n  list-style-type: upper-roman;\n}\n.prose :where(ol[type="i" s]):not(:where([class~="not-prose"] *)) {\n  list-style-type: lower-roman;\n}\n.prose :where(ol[type="1"]):not(:where([class~="not-prose"] *)) {\n  list-style-type: decimal;\n}\n.prose :where(ul):not(:where([class~="not-prose"] *)) {\n  list-style-type: disc;\n  padding-left: 1.625em;\n}\n.prose :where(ol > li):not(:where([class~="not-prose"] *))::marker {\n  font-weight: 400;\n  color: var(--tw-prose-counters);\n}\n.prose :where(ul > li):not(:where([class~="not-prose"] *))::marker {\n  color: var(--tw-prose-bullets);\n}\n.prose :where(hr):not(:where([class~="not-prose"] *)) {\n  border-color: var(--tw-prose-hr);\n  border-top-width: 1px;\n  margin-top: 3em;\n  margin-bottom: 3em;\n}\n.prose :where(blockquote):not(:where([class~="not-prose"] *)) {\n  font-weight: 500;\n  font-style: italic;\n  color: var(--tw-prose-quotes);\n  border-left-width: 0.25rem;\n  border-left-color: var(--tw-prose-quote-borders);\n  quotes: "\\201C""\\201D""\\2018""\\2019";\n  margin-top: 1.6em;\n  margin-bottom: 1.6em;\n  padding-left: 1em;\n}\n.prose :where(blockquote p:first-of-type):not(:where([class~="not-prose"] *))::before {\n  content: open-quote;\n}\n.prose :where(blockquote p:last-of-type):not(:where([class~="not-prose"] *))::after {\n  content: close-quote;\n}\n.prose :where(h1):not(:where([class~="not-prose"] *)) {\n  color: var(--tw-prose-headings);\n  font-weight: 800;\n  font-size: 2.25em;\n  margin-top: 0;\n  margin-bottom: 0.8888889em;\n  line-height: 1.1111111;\n}\n.prose :where(h1 strong):not(:where([class~="not-prose"] *)) {\n  font-weight: 900;\n}\n.prose :where(h2):not(:where([class~="not-prose"] *)) {\n  color: var(--tw-prose-headings);\n  font-weight: 700;\n  font-size: 1.5em;\n  margin-top: 2em;\n  margin-bottom: 1em;\n  line-height: 1.3333333;\n}\n.prose :where(h2 strong):not(:where([class~="not-prose"] *)) {\n  font-weight: 800;\n}\n.prose :where(h3):not(:where([class~="not-prose"] *)) {\n  color: var(--tw-prose-headings);\n  font-weight: 600;\n  font-size: 1.25em;\n  margin-top: 1.6em;\n  margin-bottom: 0.6em;\n  line-height: 1.6;\n}\n.prose :where(h3 strong):not(:where([class~="not-prose"] *)) {\n  font-weight: 700;\n}\n.prose :where(h4):not(:where([class~="not-prose"] *)) {\n  color: var(--tw-prose-headings);\n  font-weight: 600;\n  margin-top: 1.5em;\n  margin-bottom: 0.5em;\n  line-height: 1.5;\n}\n.prose :where(h4 strong):not(:where([class~="not-prose"] *)) {\n  font-weight: 700;\n}\n.prose :where(figure > *):not(:where([class~="not-prose"] *)) {\n  margin-top: 0;\n  margin-bottom: 0;\n}\n.prose :where(figcaption):not(:where([class~="not-prose"] *)) {\n  color: var(--tw-prose-captions);\n  font-size: 0.875em;\n  line-height: 1.4285714;\n  margin-top: 0.8571429em;\n}\n.prose :where(code):not(:where([class~="not-prose"] *)) {\n  color: var(--tw-prose-code);\n  font-weight: 600;\n  font-size: 0.875em;\n}\n.prose :where(code):not(:where([class~="not-prose"] *))::before {\n  content: "`";\n}\n.prose :where(code):not(:where([class~="not-prose"] *))::after {\n  content: "`";\n}\n.prose :where(a code):not(:where([class~="not-prose"] *)) {\n  color: var(--tw-prose-links);\n}\n.prose :where(pre):not(:where([class~="not-prose"] *)) {\n  color: var(--tw-prose-pre-code);\n  background-color: var(--tw-prose-pre-bg);\n  overflow-x: auto;\n  font-weight: 400;\n  font-size: 0.875em;\n  line-height: 1.7142857;\n  margin-top: 1.7142857em;\n  margin-bottom: 1.7142857em;\n  border-radius: 0.375rem;\n  padding-top: 0.8571429em;\n  padding-right: 1.1428571em;\n  padding-bottom: 0.8571429em;\n  padding-left: 1.1428571em;\n}\n.prose :where(pre code):not(:where([class~="not-prose"] *)) {\n  background-color: transparent;\n  border-width: 0;\n  border-radius: 0;\n  padding: 0;\n  font-weight: inherit;\n  color: inherit;\n  font-size: inherit;\n  font-family: inherit;\n  line-height: inherit;\n}\n.prose :where(pre code):not(:where([class~="not-prose"] *))::before {\n  content: none;\n}\n.prose :where(pre code):not(:where([class~="not-prose"] *))::after {\n  content: none;\n}\n.prose :where(table):not(:where([class~="not-prose"] *)) {\n  width: 100%;\n  table-layout: auto;\n  text-align: left;\n  margin-top: 2em;\n  margin-bottom: 2em;\n  font-size: 0.875em;\n  line-height: 1.7142857;\n}\n.prose :where(thead):not(:where([class~="not-prose"] *)) {\n  border-bottom-width: 1px;\n  border-bottom-color: var(--tw-prose-th-borders);\n}\n.prose :where(thead th):not(:where([class~="not-prose"] *)) {\n  color: var(--tw-prose-headings);\n  font-weight: 600;\n  vertical-align: bottom;\n  padding-right: 0.5714286em;\n  padding-bottom: 0.5714286em;\n  padding-left: 0.5714286em;\n}\n.prose :where(tbody tr):not(:where([class~="not-prose"] *)) {\n  border-bottom-width: 1px;\n  border-bottom-color: var(--tw-prose-td-borders);\n}\n.prose :where(tbody tr:last-child):not(:where([class~="not-prose"] *)) {\n  border-bottom-width: 0;\n}\n.prose :where(tbody td):not(:where([class~="not-prose"] *)) {\n  vertical-align: baseline;\n  padding-top: 0.5714286em;\n  padding-right: 0.5714286em;\n  padding-bottom: 0.5714286em;\n  padding-left: 0.5714286em;\n}\n.prose {\n  --tw-prose-body: #374151;\n  --tw-prose-headings: #111827;\n  --tw-prose-lead: #4b5563;\n  --tw-prose-links: #111827;\n  --tw-prose-bold: #111827;\n  --tw-prose-counters: #6b7280;\n  --tw-prose-bullets: #d1d5db;\n  --tw-prose-hr: #e5e7eb;\n  --tw-prose-quotes: #111827;\n  --tw-prose-quote-borders: #e5e7eb;\n  --tw-prose-captions: #6b7280;\n  --tw-prose-code: #111827;\n  --tw-prose-pre-code: #e5e7eb;\n  --tw-prose-pre-bg: #1f2937;\n  --tw-prose-th-borders: #d1d5db;\n  --tw-prose-td-borders: #e5e7eb;\n  --tw-prose-invert-body: #d1d5db;\n  --tw-prose-invert-headings: #fff;\n  --tw-prose-invert-lead: #9ca3af;\n  --tw-prose-invert-links: #fff;\n  --tw-prose-invert-bold: #fff;\n  --tw-prose-invert-counters: #9ca3af;\n  --tw-prose-invert-bullets: #4b5563;\n  --tw-prose-invert-hr: #374151;\n  --tw-prose-invert-quotes: #f3f4f6;\n  --tw-prose-invert-quote-borders: #374151;\n  --tw-prose-invert-captions: #9ca3af;\n  --tw-prose-invert-code: #fff;\n  --tw-prose-invert-pre-code: #d1d5db;\n  --tw-prose-invert-pre-bg: rgb(0 0 0 / 50%);\n  --tw-prose-invert-th-borders: #4b5563;\n  --tw-prose-invert-td-borders: #374151;\n  font-size: 1rem;\n  line-height: 1.75;\n}\n.prose :where(p):not(:where([class~="not-prose"] *)) {\n  margin-top: 1.25em;\n  margin-bottom: 1.25em;\n}\n.prose :where(img):not(:where([class~="not-prose"] *)) {\n  margin-top: 2em;\n  margin-bottom: 2em;\n}\n.prose :where(video):not(:where([class~="not-prose"] *)) {\n  margin-top: 2em;\n  margin-bottom: 2em;\n}\n.prose :where(figure):not(:where([class~="not-prose"] *)) {\n  margin-top: 2em;\n  margin-bottom: 2em;\n}\n.prose :where(h2 code):not(:where([class~="not-prose"] *)) {\n  font-size: 0.875em;\n}\n.prose :where(h3 code):not(:where([class~="not-prose"] *)) {\n  font-size: 0.9em;\n}\n.prose :where(li):not(:where([class~="not-prose"] *)) {\n  margin-top: 0.5em;\n  margin-bottom: 0.5em;\n}\n.prose :where(ol > li):not(:where([class~="not-prose"] *)) {\n  padding-left: 0.375em;\n}\n.prose :where(ul > li):not(:where([class~="not-prose"] *)) {\n  padding-left: 0.375em;\n}\n.prose > :where(ul > li p):not(:where([class~="not-prose"] *)) {\n  margin-top: 0.75em;\n  margin-bottom: 0.75em;\n}\n.prose > :where(ul > li > *:first-child):not(:where([class~="not-prose"] *)) {\n  margin-top: 1.25em;\n}\n.prose > :where(ul > li > *:last-child):not(:where([class~="not-prose"] *)) {\n  margin-bottom: 1.25em;\n}\n.prose > :where(ol > li > *:first-child):not(:where([class~="not-prose"] *)) {\n  margin-top: 1.25em;\n}\n.prose > :where(ol > li > *:last-child):not(:where([class~="not-prose"] *)) {\n  margin-bottom: 1.25em;\n}\n.prose :where(ul ul, ul ol, ol ul, ol ol):not(:where([class~="not-prose"] *)) {\n  margin-top: 0.75em;\n  margin-bottom: 0.75em;\n}\n.prose :where(hr + *):not(:where([class~="not-prose"] *)) {\n  margin-top: 0;\n}\n.prose :where(h2 + *):not(:where([class~="not-prose"] *)) {\n  margin-top: 0;\n}\n.prose :where(h3 + *):not(:where([class~="not-prose"] *)) {\n  margin-top: 0;\n}\n.prose :where(h4 + *):not(:where([class~="not-prose"] *)) {\n  margin-top: 0;\n}\n.prose :where(thead th:first-child):not(:where([class~="not-prose"] *)) {\n  padding-left: 0;\n}\n.prose :where(thead th:last-child):not(:where([class~="not-prose"] *)) {\n  padding-right: 0;\n}\n.prose :where(tbody td:first-child):not(:where([class~="not-prose"] *)) {\n  padding-left: 0;\n}\n.prose :where(tbody td:last-child):not(:where([class~="not-prose"] *)) {\n  padding-right: 0;\n}\n.prose > :where(:first-child):not(:where([class~="not-prose"] *)) {\n  margin-top: 0;\n}\n.prose > :where(:last-child):not(:where([class~="not-prose"] *)) {\n  margin-bottom: 0;\n}\n.tina-tailwind .sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n.tina-tailwind .pointer-events-none {\n  pointer-events: none;\n}\n.tina-tailwind .pointer-events-auto {\n  pointer-events: auto;\n}\n.tina-tailwind .visible {\n  visibility: visible;\n}\n.tina-tailwind .\\!visible {\n  visibility: visible !important;\n}\n.tina-tailwind .static {\n  position: static;\n}\n.tina-tailwind .fixed {\n  position: fixed;\n}\n.tina-tailwind .absolute {\n  position: absolute;\n}\n.tina-tailwind .relative {\n  position: relative;\n}\n.tina-tailwind .sticky {\n  position: sticky;\n}\n.tina-tailwind .inset-0 {\n  top: 0px;\n  right: 0px;\n  bottom: 0px;\n  left: 0px;\n}\n.tina-tailwind .top-1\\/2 {\n  top: 50%;\n}\n.tina-tailwind .right-3 {\n  right: 12px;\n}\n.tina-tailwind .left-0 {\n  left: 0px;\n}\n.tina-tailwind .top-0 {\n  top: 0px;\n}\n.tina-tailwind .bottom-0 {\n  bottom: 0px;\n}\n.tina-tailwind .bottom-3 {\n  bottom: 12px;\n}\n.tina-tailwind .right-5 {\n  right: 20px;\n}\n.tina-tailwind .right-0 {\n  right: 0px;\n}\n.tina-tailwind .left-1\\/2 {\n  left: 50%;\n}\n.tina-tailwind .top-8 {\n  top: 32px;\n}\n.tina-tailwind .-bottom-1 {\n  bottom: -4px;\n}\n.tina-tailwind .right-2\\.5 {\n  right: 10px;\n}\n.tina-tailwind .right-2 {\n  right: 8px;\n}\n.tina-tailwind .top-1 {\n  top: 4px;\n}\n.tina-tailwind .right-1 {\n  right: 4px;\n}\n.tina-tailwind .-top-2 {\n  top: -8px;\n}\n.tina-tailwind .-top-4 {\n  top: -16px;\n}\n.tina-tailwind .z-10 {\n  z-index: 10;\n}\n.tina-tailwind .z-20 {\n  z-index: 20;\n}\n.tina-tailwind .z-40 {\n  z-index: 40;\n}\n.tina-tailwind .z-modal {\n  z-index: 10800;\n}\n.tina-tailwind .-z-1 {\n  z-index: -1;\n}\n.tina-tailwind .z-30 {\n  z-index: 30;\n}\n.tina-tailwind .z-50 {\n  z-index: 50;\n}\n.tina-tailwind .z-100 {\n  z-index: 100;\n}\n.tina-tailwind .z-overlay {\n  z-index: 10600;\n}\n.tina-tailwind .z-menu {\n  z-index: 9800;\n}\n.tina-tailwind .z-base {\n  z-index: 9000;\n}\n.tina-tailwind .z-panel {\n  z-index: 9400;\n}\n.tina-tailwind .m-0 {\n  margin: 0px;\n}\n.tina-tailwind .mx-auto {\n  margin-left: auto;\n  margin-right: auto;\n}\n.tina-tailwind .-mx-0\\.5 {\n  margin-left: -2px;\n  margin-right: -2px;\n}\n.tina-tailwind .-mx-0 {\n  margin-left: -0px;\n  margin-right: -0px;\n}\n.tina-tailwind .-mx-1 {\n  margin-left: -4px;\n  margin-right: -4px;\n}\n.tina-tailwind .mx-0\\.5 {\n  margin-left: 2px;\n  margin-right: 2px;\n}\n.tina-tailwind .mx-0 {\n  margin-left: 0px;\n  margin-right: 0px;\n}\n.tina-tailwind .my-0 {\n  margin-top: 0px;\n  margin-bottom: 0px;\n}\n.tina-tailwind .my-2 {\n  margin-top: 8px;\n  margin-bottom: 8px;\n}\n.tina-tailwind .my-4 {\n  margin-top: 16px;\n  margin-bottom: 16px;\n}\n.tina-tailwind .ml-2 {\n  margin-left: 8px;\n}\n.tina-tailwind .mb-3 {\n  margin-bottom: 12px;\n}\n.tina-tailwind .mr-2 {\n  margin-right: 8px;\n}\n.tina-tailwind .mb-4 {\n  margin-bottom: 16px;\n}\n.tina-tailwind .ml-1 {\n  margin-left: 4px;\n}\n.tina-tailwind .mt-2 {\n  margin-top: 8px;\n}\n.tina-tailwind .mb-2 {\n  margin-bottom: 8px;\n}\n.tina-tailwind .mb-5 {\n  margin-bottom: 20px;\n}\n.tina-tailwind .-mt-px {\n  margin-top: -1px;\n}\n.tina-tailwind .-mt-0\\.5 {\n  margin-top: -2px;\n}\n.tina-tailwind .-mt-0 {\n  margin-top: -0px;\n}\n.tina-tailwind .mb-6 {\n  margin-bottom: 24px;\n}\n.tina-tailwind .mr-1 {\n  margin-right: 4px;\n}\n.tina-tailwind .-ml-1 {\n  margin-left: -4px;\n}\n.tina-tailwind .mt-8 {\n  margin-top: 32px;\n}\n.tina-tailwind .mr-3 {\n  margin-right: 12px;\n}\n.tina-tailwind .mt-4 {\n  margin-top: 16px;\n}\n.tina-tailwind .-mb-14 {\n  margin-bottom: -56px;\n}\n.tina-tailwind .-ml-px {\n  margin-left: -1px;\n}\n.tina-tailwind .-mr-px {\n  margin-right: -1px;\n}\n.tina-tailwind .mb-1 {\n  margin-bottom: 4px;\n}\n.tina-tailwind .mb-\\[6px\\] {\n  margin-bottom: 6px;\n}\n.tina-tailwind .-mt-2 {\n  margin-top: -8px;\n}\n.tina-tailwind .-mr-1 {\n  margin-right: -4px;\n}\n.tina-tailwind .mt-0\\.5 {\n  margin-top: 2px;\n}\n.tina-tailwind .mt-0 {\n  margin-top: 0px;\n}\n.tina-tailwind .block {\n  display: block;\n}\n.tina-tailwind .inline-block {\n  display: inline-block;\n}\n.tina-tailwind .inline {\n  display: inline;\n}\n.tina-tailwind .flex {\n  display: flex;\n}\n.tina-tailwind .inline-flex {\n  display: inline-flex;\n}\n.tina-tailwind .table {\n  display: table;\n}\n.tina-tailwind .grid {\n  display: grid;\n}\n.tina-tailwind .contents {\n  display: contents;\n}\n.tina-tailwind .hidden {\n  display: none;\n}\n.tina-tailwind .\\!hidden {\n  display: none !important;\n}\n.tina-tailwind .h-auto {\n  height: auto;\n}\n.tina-tailwind .h-full {\n  height: 100%;\n}\n.tina-tailwind .h-10 {\n  height: 40px;\n}\n.tina-tailwind .h-3\\/4 {\n  height: 75%;\n}\n.tina-tailwind .h-16 {\n  height: 64px;\n}\n.tina-tailwind .h-screen {\n  height: 100vh;\n}\n.tina-tailwind .h-3 {\n  height: 12px;\n}\n.tina-tailwind .h-8 {\n  height: 32px;\n}\n.tina-tailwind .h-7 {\n  height: 28px;\n}\n.tina-tailwind .h-9 {\n  height: 36px;\n}\n.tina-tailwind .h-5 {\n  height: 20px;\n}\n.tina-tailwind .h-6 {\n  height: 24px;\n}\n.tina-tailwind .h-14 {\n  height: 56px;\n}\n.tina-tailwind .h-32 {\n  height: 128px;\n}\n.tina-tailwind .h-4\\/6 {\n  height: 66.666667%;\n}\n.tina-tailwind .h-4 {\n  height: 16px;\n}\n.tina-tailwind .h-64 {\n  height: 256px;\n}\n.tina-tailwind .max-h-full {\n  max-height: 100%;\n}\n.tina-tailwind .max-h-\\[24rem\\] {\n  max-height: 24rem;\n}\n.tina-tailwind .max-h-\\[10rem\\] {\n  max-height: 10rem;\n}\n.tina-tailwind .min-h-\\[2\\.5rem\\] {\n  min-height: 2.5rem;\n}\n.tina-tailwind .min-h-\\[100px\\] {\n  min-height: 100px;\n}\n.tina-tailwind .w-8 {\n  width: 32px;\n}\n.tina-tailwind .w-5\\/6 {\n  width: 83.333333%;\n}\n.tina-tailwind .w-6 {\n  width: 24px;\n}\n.tina-tailwind .w-full {\n  width: 100%;\n}\n.tina-tailwind .w-3 {\n  width: 12px;\n}\n.tina-tailwind .w-7 {\n  width: 28px;\n}\n.tina-tailwind .w-9 {\n  width: 36px;\n}\n.tina-tailwind .w-5 {\n  width: 20px;\n}\n.tina-tailwind .w-auto {\n  width: auto;\n}\n.tina-tailwind .w-12 {\n  width: 48px;\n}\n.tina-tailwind .w-4 {\n  width: 16px;\n}\n.tina-tailwind .w-screen {\n  width: 100vw;\n}\n.tina-tailwind .w-96 {\n  width: 384px;\n}\n.tina-tailwind .w-10 {\n  width: 40px;\n}\n.tina-tailwind .w-2 {\n  width: 8px;\n}\n.tina-tailwind .w-px {\n  width: 1px;\n}\n.tina-tailwind .w-48 {\n  width: 192px;\n}\n.tina-tailwind .w-32 {\n  width: 128px;\n}\n.tina-tailwind .w-56 {\n  width: 224px;\n}\n.tina-tailwind .min-w-\\[192px\\] {\n  min-width: 192px;\n}\n.tina-tailwind .max-w-form {\n  max-width: 900px;\n}\n.tina-tailwind .max-w-prose {\n  max-width: 65ch;\n}\n.tina-tailwind .max-w-screen-xl {\n  max-width: 1280px;\n}\n.tina-tailwind .max-w-full {\n  max-width: 100%;\n}\n.tina-tailwind .flex-1 {\n  flex: 1 1 0%;\n}\n.tina-tailwind .flex-none {\n  flex: none;\n}\n.tina-tailwind .flex-shrink {\n  flex-shrink: 1;\n}\n.tina-tailwind .flex-shrink-0 {\n  flex-shrink: 0;\n}\n.tina-tailwind .flex-grow {\n  flex-grow: 1;\n}\n.tina-tailwind .flex-grow-0 {\n  flex-grow: 0;\n}\n.tina-tailwind .origin-center {\n  transform-origin: center;\n}\n.tina-tailwind .origin-top-right {\n  transform-origin: top right;\n}\n.tina-tailwind .origin-top-left {\n  transform-origin: top left;\n}\n.tina-tailwind .-translate-y-1\\/2 {\n  --tw-translate-y: -50%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .-translate-x-1\\/2 {\n  --tw-translate-x: -50%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .translate-y-full {\n  --tw-translate-y: 100%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .-translate-y-2 {\n  --tw-translate-y: -8px;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .translate-y-0 {\n  --tw-translate-y: 0px;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .translate-x-full {\n  --tw-translate-x: 100%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .-translate-x-full {\n  --tw-translate-x: -100%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .translate-x-0 {\n  --tw-translate-x: 0px;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .rotate-45 {\n  --tw-rotate: 45deg;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .-rotate-90 {\n  --tw-rotate: -90deg;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .scale-110 {\n  --tw-scale-x: 1.1;\n  --tw-scale-y: 1.1;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .scale-95 {\n  --tw-scale-x: .95;\n  --tw-scale-y: .95;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .scale-100 {\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .transform {\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .cursor-not-allowed {\n  cursor: not-allowed;\n}\n.tina-tailwind .cursor-wait {\n  cursor: wait;\n}\n.tina-tailwind .cursor-pointer {\n  cursor: pointer;\n}\n.tina-tailwind .select-none {\n  user-select: none;\n}\n.tina-tailwind .resize-y {\n  resize: vertical;\n}\n.tina-tailwind .resize {\n  resize: both;\n}\n.tina-tailwind .appearance-none {\n  appearance: none;\n}\n.tina-tailwind .flex-col {\n  flex-direction: column;\n}\n.tina-tailwind .flex-wrap {\n  flex-wrap: wrap;\n}\n.tina-tailwind .items-start {\n  align-items: flex-start;\n}\n.tina-tailwind .items-center {\n  align-items: center;\n}\n.tina-tailwind .items-stretch {\n  align-items: stretch;\n}\n.tina-tailwind .justify-start {\n  justify-content: flex-start;\n}\n.tina-tailwind .justify-end {\n  justify-content: flex-end;\n}\n.tina-tailwind .justify-center {\n  justify-content: center;\n}\n.tina-tailwind .justify-between {\n  justify-content: space-between;\n}\n.tina-tailwind .gap-2 {\n  gap: 8px;\n}\n.tina-tailwind .gap-4 {\n  gap: 16px;\n}\n.tina-tailwind .gap-3 {\n  gap: 12px;\n}\n.tina-tailwind .gap-1 {\n  gap: 4px;\n}\n.tina-tailwind .gap-0\\.5 {\n  gap: 2px;\n}\n.tina-tailwind .gap-0 {\n  gap: 0px;\n}\n.tina-tailwind .gap-x-6 {\n  column-gap: 24px;\n}\n.tina-tailwind .gap-y-3 {\n  row-gap: 12px;\n}\n.tina-tailwind .overflow-hidden {\n  overflow: hidden;\n}\n.tina-tailwind .overflow-visible {\n  overflow: visible;\n}\n.tina-tailwind .overflow-scroll {\n  overflow: scroll;\n}\n.tina-tailwind .overflow-y-auto {\n  overflow-y: auto;\n}\n.tina-tailwind .truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.tina-tailwind .text-ellipsis {\n  text-overflow: ellipsis;\n}\n.tina-tailwind .whitespace-nowrap {\n  white-space: nowrap;\n}\n.tina-tailwind .rounded-lg {\n  border-radius: 8px;\n}\n.tina-tailwind .rounded-full {\n  border-radius: 9999px;\n}\n.tina-tailwind .rounded {\n  border-radius: 4px;\n}\n.tina-tailwind .rounded-md {\n  border-radius: 6px;\n}\n.tina-tailwind .rounded-sm {\n  border-radius: 2px;\n}\n.tina-tailwind .rounded-none {\n  border-radius: 0px;\n}\n.tina-tailwind .rounded-l-full {\n  border-top-left-radius: 9999px;\n  border-bottom-left-radius: 9999px;\n}\n.tina-tailwind .rounded-r-full {\n  border-top-right-radius: 9999px;\n  border-bottom-right-radius: 9999px;\n}\n.tina-tailwind .rounded-b-md {\n  border-bottom-right-radius: 6px;\n  border-bottom-left-radius: 6px;\n}\n.tina-tailwind .rounded-r-md {\n  border-top-right-radius: 6px;\n  border-bottom-right-radius: 6px;\n}\n.tina-tailwind .rounded-l-md {\n  border-top-left-radius: 6px;\n  border-bottom-left-radius: 6px;\n}\n.tina-tailwind .border {\n  border-width: 1px;\n}\n.tina-tailwind .border-2 {\n  border-width: 2px;\n}\n.tina-tailwind .border-0 {\n  border-width: 0;\n}\n.tina-tailwind .border-b {\n  border-bottom-width: 1px;\n}\n.tina-tailwind .border-t {\n  border-top-width: 1px;\n}\n.tina-tailwind .border-r {\n  border-right-width: 1px;\n}\n.tina-tailwind .border-l-0 {\n  border-left-width: 0;\n}\n.tina-tailwind .border-t-0 {\n  border-top-width: 0;\n}\n.tina-tailwind .border-r-0 {\n  border-right-width: 0;\n}\n.tina-tailwind .border-b-0 {\n  border-bottom-width: 0;\n}\n.tina-tailwind .border-l {\n  border-left-width: 1px;\n}\n.tina-tailwind .border-none {\n  border-style: none;\n}\n.tina-tailwind .border-gray-100 {\n  --tw-border-opacity: 1;\n  border-color: rgb(237 236 243 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-blue-500 {\n  --tw-border-opacity: 1;\n  border-color: rgb(0 132 255 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-gray-150 {\n  --tw-border-opacity: 1;\n  border-color: rgb(230 227 239 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-yellow-500 {\n  --tw-border-opacity: 1;\n  border-color: rgb(234 179 8 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-green-400 {\n  --tw-border-opacity: 1;\n  border-color: rgb(74 222 128 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-gray-50 {\n  --tw-border-opacity: 1;\n  border-color: rgb(246 246 249 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-gray-200 {\n  --tw-border-opacity: 1;\n  border-color: rgb(225 221 236 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-transparent {\n  border-color: transparent;\n}\n.tina-tailwind .border-yellow-200 {\n  --tw-border-opacity: 1;\n  border-color: rgb(254 240 138 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-gray-300 {\n  --tw-border-opacity: 1;\n  border-color: rgb(178 173 190 / var(--tw-border-opacity));\n}\n.tina-tailwind .bg-white {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-gray-50 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(246 246 249 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-yellow-400 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(250 204 21 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-green-300 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(134 239 172 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-blue-500 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(0 132 255 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-transparent {\n  background-color: transparent;\n}\n.tina-tailwind .bg-gray-100 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(237 236 243 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-gray-300 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(178 173 190 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-gray-200 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(225 221 236 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-gradient-to-br {\n  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));\n}\n.tina-tailwind .bg-gradient-to-r {\n  background-image: linear-gradient(to right, var(--tw-gradient-stops));\n}\n.tina-tailwind .from-gray-800 {\n  --tw-gradient-from: #363145;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(54 49 69 / 0));\n}\n.tina-tailwind .from-yellow-50 {\n  --tw-gradient-from: #fefce8;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(254 252 232 / 0));\n}\n.tina-tailwind .via-gray-900 {\n  --tw-gradient-stops: var(--tw-gradient-from), #252336, var(--tw-gradient-to, rgb(37 35 54 / 0));\n}\n.tina-tailwind .to-black {\n  --tw-gradient-to: #000;\n}\n.tina-tailwind .to-yellow-100 {\n  --tw-gradient-to: #fef9c3;\n}\n.tina-tailwind .fill-current {\n  fill: currentColor;\n}\n.tina-tailwind .p-5 {\n  padding: 20px;\n}\n.tina-tailwind .p-12 {\n  padding: 48px;\n}\n.tina-tailwind .p-2 {\n  padding: 8px;\n}\n.tina-tailwind .p-1 {\n  padding: 4px;\n}\n.tina-tailwind .p-0 {\n  padding: 0px;\n}\n.tina-tailwind .py-3 {\n  padding-top: 12px;\n  padding-bottom: 12px;\n}\n.tina-tailwind .px-5 {\n  padding-left: 20px;\n  padding-right: 20px;\n}\n.tina-tailwind .px-6 {\n  padding-left: 24px;\n  padding-right: 24px;\n}\n.tina-tailwind .py-4 {\n  padding-top: 16px;\n  padding-bottom: 16px;\n}\n.tina-tailwind .px-3 {\n  padding-left: 12px;\n  padding-right: 12px;\n}\n.tina-tailwind .px-4 {\n  padding-left: 16px;\n  padding-right: 16px;\n}\n.tina-tailwind .py-8 {\n  padding-top: 32px;\n  padding-bottom: 32px;\n}\n.tina-tailwind .py-2 {\n  padding-top: 8px;\n  padding-bottom: 8px;\n}\n.tina-tailwind .py-1 {\n  padding-top: 4px;\n  padding-bottom: 4px;\n}\n.tina-tailwind .px-20 {\n  padding-left: 80px;\n  padding-right: 80px;\n}\n.tina-tailwind .px-2 {\n  padding-left: 8px;\n  padding-right: 8px;\n}\n.tina-tailwind .py-1\\.5 {\n  padding-top: 6px;\n  padding-bottom: 6px;\n}\n.tina-tailwind .py-0\\.5 {\n  padding-top: 2px;\n  padding-bottom: 2px;\n}\n.tina-tailwind .py-0 {\n  padding-top: 0px;\n  padding-bottom: 0px;\n}\n.tina-tailwind .px-1 {\n  padding-left: 4px;\n  padding-right: 4px;\n}\n.tina-tailwind .pt-6 {\n  padding-top: 24px;\n}\n.tina-tailwind .pb-2 {\n  padding-bottom: 8px;\n}\n.tina-tailwind .pl-3 {\n  padding-left: 12px;\n}\n.tina-tailwind .pr-7 {\n  padding-right: 28px;\n}\n.tina-tailwind .pt-1 {\n  padding-top: 4px;\n}\n.tina-tailwind .pb-5 {\n  padding-bottom: 20px;\n}\n.tina-tailwind .pt-16 {\n  padding-top: 64px;\n}\n.tina-tailwind .pt-4 {\n  padding-top: 16px;\n}\n.tina-tailwind .pb-12 {\n  padding-bottom: 48px;\n}\n.tina-tailwind .pl-2\\.5 {\n  padding-left: 10px;\n}\n.tina-tailwind .pr-8 {\n  padding-right: 32px;\n}\n.tina-tailwind .pl-2 {\n  padding-left: 8px;\n}\n.tina-tailwind .pt-3 {\n  padding-top: 12px;\n}\n.tina-tailwind .pt-10 {\n  padding-top: 40px;\n}\n.tina-tailwind .text-left {\n  text-align: left;\n}\n.tina-tailwind .text-center {\n  text-align: center;\n}\n.tina-tailwind .text-right {\n  text-align: right;\n}\n.tina-tailwind .align-baseline {\n  vertical-align: baseline;\n}\n.tina-tailwind .text-sm {\n  font-size: 14px;\n  line-height: 1.43;\n}\n.tina-tailwind .text-2xl {\n  font-size: 24px;\n  line-height: 1.33;\n}\n.tina-tailwind .text-xl {\n  font-size: 20px;\n  line-height: 1.4;\n}\n.tina-tailwind .text-base {\n  font-size: 16px;\n  line-height: 1.5;\n}\n.tina-tailwind .text-lg {\n  font-size: 18px;\n  line-height: 1.55;\n}\n.tina-tailwind .text-xs {\n  font-size: 13px;\n  line-height: 1.33;\n}\n.tina-tailwind .text-4xl {\n  font-size: 36px;\n  line-height: 1.1;\n}\n.tina-tailwind .text-3xl {\n  font-size: 30px;\n  line-height: 1.2;\n}\n.tina-tailwind .font-bold {\n  font-weight: 700;\n}\n.tina-tailwind .font-medium {\n  font-weight: 500;\n}\n.tina-tailwind .font-normal {\n  font-weight: 400;\n}\n.tina-tailwind .font-semibold {\n  font-weight: 600;\n}\n.tina-tailwind .uppercase {\n  text-transform: uppercase;\n}\n.tina-tailwind .italic {\n  font-style: italic;\n}\n.tina-tailwind .not-italic {\n  font-style: normal;\n}\n.tina-tailwind .leading-tight {\n  line-height: 1.25;\n}\n.tina-tailwind .leading-none {\n  line-height: 1;\n}\n.tina-tailwind .tracking-wide {\n  letter-spacing: 0.025em;\n}\n.tina-tailwind .text-gray-700 {\n  --tw-text-opacity: 1;\n  color: rgb(67 62 82 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-gray-600 {\n  --tw-text-opacity: 1;\n  color: rgb(86 81 101 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-blue-500 {\n  --tw-text-opacity: 1;\n  color: rgb(0 132 255 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-gray-500 {\n  --tw-text-opacity: 1;\n  color: rgb(113 108 127 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-white {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-black {\n  --tw-text-opacity: 1;\n  color: rgb(0 0 0 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-gray-300 {\n  --tw-text-opacity: 1;\n  color: rgb(178 173 190 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-yellow-600 {\n  --tw-text-opacity: 1;\n  color: rgb(202 138 4 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-yellow-700 {\n  --tw-text-opacity: 1;\n  color: rgb(161 98 7 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-gray-800 {\n  --tw-text-opacity: 1;\n  color: rgb(54 49 69 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-blue-400 {\n  --tw-text-opacity: 1;\n  color: rgb(34 150 254 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-gray-400 {\n  --tw-text-opacity: 1;\n  color: rgb(145 140 158 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-gray-900 {\n  --tw-text-opacity: 1;\n  color: rgb(37 35 54 / var(--tw-text-opacity));\n}\n.tina-tailwind .underline {\n  text-decoration-line: underline;\n}\n.tina-tailwind .placeholder-gray-200::placeholder {\n  --tw-placeholder-opacity: 1;\n  color: rgb(225 221 236 / var(--tw-placeholder-opacity));\n}\n.tina-tailwind .placeholder-gray-400::placeholder {\n  --tw-placeholder-opacity: 1;\n  color: rgb(145 140 158 / var(--tw-placeholder-opacity));\n}\n.tina-tailwind .opacity-70 {\n  opacity: .7;\n}\n.tina-tailwind .opacity-50 {\n  opacity: .5;\n}\n.tina-tailwind .opacity-80 {\n  opacity: .8;\n}\n.tina-tailwind .opacity-30 {\n  opacity: .3;\n}\n.tina-tailwind .opacity-0 {\n  opacity: 0;\n}\n.tina-tailwind .opacity-100 {\n  opacity: 1;\n}\n.tina-tailwind .opacity-90 {\n  opacity: .9;\n}\n.tina-tailwind .shadow-sm {\n  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .shadow {\n  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .shadow-inner {\n  --tw-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);\n  --tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .shadow-lg {\n  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .shadow-2xl {\n  --tw-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);\n  --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .outline-none {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}\n.tina-tailwind .outline {\n  outline-style: solid;\n}\n.tina-tailwind .ring-2 {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n.tina-tailwind .ring-1 {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n.tina-tailwind .ring-inset {\n  --tw-ring-inset: inset;\n}\n.tina-tailwind .ring-blue-100 {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(180 219 255 / var(--tw-ring-opacity));\n}\n.tina-tailwind .ring-black {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(0 0 0 / var(--tw-ring-opacity));\n}\n.tina-tailwind .ring-opacity-5 {\n  --tw-ring-opacity: .05;\n}\n.tina-tailwind .drop-shadow {\n  --tw-drop-shadow: drop-shadow(0 1px 2px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06));\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.tina-tailwind .grayscale {\n  --tw-grayscale: grayscale(100%);\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.tina-tailwind .filter {\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.tina-tailwind .transition {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.tina-tailwind .transition-all {\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.tina-tailwind .transition-opacity {\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.tina-tailwind .transition-colors {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.tina-tailwind .transition-none {\n  transition-property: none;\n}\n.tina-tailwind .duration-150 {\n  transition-duration: 150ms;\n}\n.tina-tailwind .duration-300 {\n  transition-duration: 300ms;\n}\n.tina-tailwind .duration-75 {\n  transition-duration: 75ms;\n}\n.tina-tailwind .duration-200 {\n  transition-duration: 200ms;\n}\n.tina-tailwind .duration-100 {\n  transition-duration: 100ms;\n}\n.tina-tailwind .ease-out {\n  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);\n}\n.tina-tailwind .ease-in {\n  transition-timing-function: cubic-bezier(0.4, 0, 1, 1);\n}\n.tina-tailwind .ease-in-out {\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}\n.tina-tailwind .icon-parent svg {\n      fill: currentColor;\n    }\n.tina-tailwind {\n  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";\n  font-size: 16px;\n  line-height: 1.5;\n  --tw-text-opacity: 1;\n  color: rgb(86 81 101 / var(--tw-text-opacity));\n}\n/* if the last block has margin-bottom it makes the text box larger but some of it isn\'t clickable */\n.prose [data-slate-editor=\'true\'] {\n  padding-bottom: 1em;\n}\n/* prose adds backticks, which look like they should be editable */\n.prose [data-slate-editor=\'true\'] .slate-code::before {\n  content: \'\';\n}\n.prose [data-slate-editor=\'true\'] .slate-code::after {\n  content: \'\';\n}\n.prose [data-slate-editor=\'true\'] .slate-code_block {\n  margin: 0;\n}\n/* code lines as part of a block don\'t need the same background formatting */\n.prose [data-slate-editor=\'true\'] .slate-code_block .slate-code {\n  background: none;\n}\n/* prose makes the first p in a block slightly larger */\n.prose [data-slate-editor=\'true\'] p:first-of-type {\n  font-size: 1em;\n}\n/* experimental floating toolbar doesn\'t need a large text area */\n.with-toolbar [data-slate-editor=\'true\'] {\n  min-height: 100px;\n}\n.tina-tailwind .first\\:pt-3:first-child {\n  padding-top: 12px;\n}\n.tina-tailwind .last\\:pb-3:last-child {\n  padding-bottom: 12px;\n}\n.tina-tailwind .hover\\:border-gray-200:hover {\n  --tw-border-opacity: 1;\n  border-color: rgb(225 221 236 / var(--tw-border-opacity));\n}\n.tina-tailwind .hover\\:bg-gray-50:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(246 246 249 / var(--tw-bg-opacity));\n}\n.tina-tailwind .hover\\:bg-blue-600:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(5 116 228 / var(--tw-bg-opacity));\n}\n.tina-tailwind .hover\\:bg-white:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity));\n}\n.tina-tailwind .hover\\:bg-gray-100:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(237 236 243 / var(--tw-bg-opacity));\n}\n.tina-tailwind .hover\\:bg-blue-500:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(0 132 255 / var(--tw-bg-opacity));\n}\n.tina-tailwind .hover\\:text-blue-600:hover {\n  --tw-text-opacity: 1;\n  color: rgb(5 116 228 / var(--tw-text-opacity));\n}\n.tina-tailwind .hover\\:text-blue-500:hover {\n  --tw-text-opacity: 1;\n  color: rgb(0 132 255 / var(--tw-text-opacity));\n}\n.tina-tailwind .hover\\:text-blue-400:hover {\n  --tw-text-opacity: 1;\n  color: rgb(34 150 254 / var(--tw-text-opacity));\n}\n.tina-tailwind .hover\\:text-red-500:hover {\n  --tw-text-opacity: 1;\n  color: rgb(239 68 68 / var(--tw-text-opacity));\n}\n.tina-tailwind .hover\\:text-gray-900:hover {\n  --tw-text-opacity: 1;\n  color: rgb(37 35 54 / var(--tw-text-opacity));\n}\n.tina-tailwind .hover\\:underline:hover {\n  text-decoration-line: underline;\n}\n.tina-tailwind .hover\\:placeholder-gray-600:hover::placeholder {\n  --tw-placeholder-opacity: 1;\n  color: rgb(86 81 101 / var(--tw-placeholder-opacity));\n}\n.tina-tailwind .hover\\:opacity-50:hover {\n  opacity: .5;\n}\n.tina-tailwind .hover\\:opacity-100:hover {\n  opacity: 1;\n}\n.tina-tailwind .hover\\:shadow:hover {\n  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .hover\\:shadow-md:hover {\n  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .focus\\:z-10:focus {\n  z-index: 10;\n}\n.tina-tailwind .focus\\:border-blue-500:focus {\n  --tw-border-opacity: 1;\n  border-color: rgb(0 132 255 / var(--tw-border-opacity));\n}\n.tina-tailwind .focus\\:border-blue-400:focus {\n  --tw-border-opacity: 1;\n  border-color: rgb(34 150 254 / var(--tw-border-opacity));\n}\n.tina-tailwind .focus\\:bg-gray-50:focus {\n  --tw-bg-opacity: 1;\n  background-color: rgb(246 246 249 / var(--tw-bg-opacity));\n}\n.tina-tailwind .focus\\:text-gray-900:focus {\n  --tw-text-opacity: 1;\n  color: rgb(37 35 54 / var(--tw-text-opacity));\n}\n.tina-tailwind .focus\\:text-blue-500:focus {\n  --tw-text-opacity: 1;\n  color: rgb(0 132 255 / var(--tw-text-opacity));\n}\n.tina-tailwind .focus\\:opacity-80:focus {\n  opacity: .8;\n}\n.tina-tailwind .focus\\:shadow-outline:focus {\n  --tw-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);\n  --tw-shadow-colored: 0 0 0 3px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .focus\\:outline-none:focus {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}\n.tina-tailwind .focus\\:ring-2:focus {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n.tina-tailwind .focus\\:ring-1:focus {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n.tina-tailwind .focus\\:ring-blue-500:focus {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(0 132 255 / var(--tw-ring-opacity));\n}\n.tina-tailwind .focus\\:ring-offset-2:focus {\n  --tw-ring-offset-width: 2px;\n}\n.tina-tailwind .focus\\:ring-offset-gray-100:focus {\n  --tw-ring-offset-color: #EDECF3;\n}\n.tina-tailwind .active\\:outline-none:active {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}\n.tina-tailwind .group:hover .group-hover\\:text-blue-500 {\n  --tw-text-opacity: 1;\n  color: rgb(0 132 255 / var(--tw-text-opacity));\n}\n.tina-tailwind .group:hover .group-hover\\:text-blue-400 {\n  --tw-text-opacity: 1;\n  color: rgb(34 150 254 / var(--tw-text-opacity));\n}\n.tina-tailwind .group:hover .group-hover\\:text-gray-800 {\n  --tw-text-opacity: 1;\n  color: rgb(54 49 69 / var(--tw-text-opacity));\n}\n.tina-tailwind .group:hover .group-hover\\:opacity-90 {\n  opacity: .9;\n}\n.tina-tailwind .group:hover .group-hover\\:opacity-100 {\n  opacity: 1;\n}\n.tina-tailwind .group:hover .group-hover\\:opacity-80 {\n  opacity: .8;\n}\n.tina-tailwind .group:hover .group-hover\\:opacity-50 {\n  opacity: .5;\n}\n@media (min-width: 640px) {\n\n  .tina-tailwind .sm\\:text-sm {\n    font-size: 14px;\n    line-height: 1.43;\n  }\n}\n';const Wd=({children:e,position:t,styled:n=!0})=>{const a=Sa();return A.createElement($d,null,A.createElement("style",null,Yd),A.createElement(J,null,A.createElement("div",{className:"tina-tailwind"},A.createElement(Bd,{alerts:a.alerts}),a.enabled&&n&&A.createElement(yt,null),a.enabled&&a.toolbar&&A.createElement(Kc,null),A.createElement(yd,null),a.sidebar&&A.createElement(kc,{position:t,sidebar:a.sidebar}),A.createElement(Ud,null)),e))},qd=({cms:e,children:t,position:n,styled:a=!0})=>A.createElement(Pd,{cms:e},A.createElement(Wd,{position:n,styled:a},t)),Xd=qd;function Jd(e,t){return n=>{const a=A.useMemo((()=>new Sd(t)),[t]);return A.createElement(qd,{cms:a},A.createElement(e,d({},n)))}}class Qd{constructor(e){this.__type="form:meta",this.name=e.name,this.Component=e.Component}}const em=A.createContext({currentBranch:null,setCurrentBranch:e=>{console.warn("BranchContext not initialized")}}),tm=({currentBranch:e,setCurrentBranch:t,children:n})=>A.createElement(em.Provider,{value:{currentBranch:e,setCurrentBranch:t}},n),nm=()=>{const e=A.useContext(em),{dispatch:t}=It("branch:change");return A.useEffect((()=>{t({branchName:e.currentBranch})}),[e.currentBranch]),e},am=({listBranches:e,createBranch:t})=>{const[n,a]=A.useState("loading"),[r,i]=A.useState([]),{currentBranch:l,setCurrentBranch:o}=nm(),s=A.useCallback((e=>{a("loading"),t({branchName:e,baseBranch:l}).then((async e=>{o(e),await c()}))}),[]),c=A.useCallback((async()=>{a("loading"),await e().then((e=>{i(e),a("ready")})).catch((()=>a("error")))}),[]);return A.useEffect((()=>{c()}),[]),A.createElement(A.Fragment,null,"loading"===n?A.createElement("div",{style:{margin:"32px auto",textAlign:"center"}},A.createElement(wn,{color:"var(--tina-color-primary)"})):A.createElement(A.Fragment,null,"ready"===n?A.createElement(im,null,A.createElement(rm,{currentBranch:l,branchList:r,onCreateBranch:e=>{s(e)},onChange:e=>{o(e)}})):A.createElement("div",{className:"px-6 py-8 w-full h-full flex flex-col items-center justify-center"},A.createElement("p",{className:"text-base mb-4 text-center"},"An error occurred while retrieving the branch list."),A.createElement(Ct,{className:"mb-4",onClick:c},"Try again ",A.createElement(Wa,{className:"w-6 h-full ml-1 opacity-70"})))))},rm=({branchList:e,currentBranch:t,onCreateBranch:n,onChange:a})=>{const[r,i]=A.useState(""),l=e.find((e=>e.name===r)),o=e.filter((e=>!r||e.name.includes(r)));return A.createElement(lm,null,A.createElement("input",{placeholder:"Type the name of a branch to filter or create",value:r,style:{padding:"0.5rem"},onChange:e=>i(e.target.value)}),!l&&r?A.createElement(A.Fragment,null,A.createElement(cm,null),A.createElement(Ct,{size:"small",variant:"primary",onClick:()=>n(r)},"Create New Branch `",r,"`...")):"",o.length>0&&A.createElement(A.Fragment,null,A.createElement(cm,null),A.createElement(sm,null,o.map((e=>{const n=e.name===t;return A.createElement(om,{key:e,onClick:()=>a(e.name),style:n?{opacity:.6,pointerEvents:"none",fontStyle:"italic"}:{}},e.name,n&&"(current)")})))))},im=Z.default.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
`,lm=Z.default.div`
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
`,om=Z.default.div`
  cursor: pointer;
  &:hover {
    background-color: aquamarine;
  }
`,sm=Z.default.div`
  max-height: 70vh;
  overflow: auto;
  white-space: nowrap;
  background-color: #fff;
  padding: 0.5rem;
  box-shadow: inset 0px 0px 5px 0px rgb(0 0 0 / 20%);
`,cm=Z.default.div`
  height: 0;
  width: 100%;
  margin: 0.5rem 0;
`;class dm{constructor(e){this.__type="screen",this.Icon=Ka,this.name="Select Branch",this.layout="popup",this.Component=()=>A.createElement(am,{listBranches:this.listBranches,createBranch:this.createBranch}),this.listBranches=e.listBranches,this.createBranch=e.createBranch}}function mm(e,t){const[n,a]=A.useState(t);return A.useEffect((()=>{const t=window.localStorage&&window.localStorage.getItem(e);null!=t&&void 0!=t&&a(JSON.parse(t))}),[e]),[n,t=>{try{const r=t instanceof Function?t(n):t;a(r),localStorage.setItem(e,JSON.stringify(r))}catch(r){console.log(r)}}]}e.ActionButton=zn,e.AddIcon=ie,e.AlertIcon=Ke,e.Alerts=bt,e.AlignCenter=le,e.AlignLeft=oe,e.AlignRight=se,e.BaseTextField=Jt,e.BlocksField=Wr,e.BlocksFieldPlugin=qr,e.BoldIcon=ye,e.BranchDataProvider=tm,e.BranchSwitcher=am,e.BranchSwitcherPlugin=dm,e.Button=Ct,e.CMSContext=zt,e.CheckboxGroup=Ca,e.CheckboxGroupField=Bs,e.CheckboxGroupFieldPlugin=_s,e.ChevronDownIcon=pe,e.ChevronLeftIcon=fe,e.ChevronRightIcon=he,e.ChevronUpIcon=ge,e.Circle=Je,e.CircleCheck=Qe,e.CloseIcon=ce,e.CodeIcon=Ee,e.ColorField=Jr,e.ColorFieldPlugin=Qr,e.ColorPicker=Wn,e.Cover=Zn,e.DateField=Ss,e.DateFieldPlugin=Ps,e.DeleteImageButton=Ra,e.Dismissible=en,e.DragIcon=ve,e.DuplicateIcon=we,e.ERROR_MISSING_CMS=Mt,e.EditIcon=ue,e.EllipsisVerticalIcon=de,e.ErrorIcon=Ye,e.EventBus=mt,e.ExitIcon=ke,e.FieldDescription=sr,e.FieldLabel=or,e.FieldMeta=ir,e.FieldWrapper=lr,e.FieldsBuilder=sn,e.FieldsGroup=dn,e.File=Xe,e.Folder=qe,e.FontLoader=xt,e.Form=Tt,e.FormActionMenu=Nn,e.FormBuilder=Tn,e.FormLegacy=pn,e.FormMetaPlugin=Qd,e.FormPortalProvider=En,e.FormStatus=Fn,e.FormWrapper=Pn,e.FullscreenFormBuilder=Sn,e.FullscreenModal=rt,e.GlobalFormPlugin=Pc,e.GlobalStyles=kt,e.Group=dr,e.GroupField=wr,e.GroupFieldPlugin=vr,e.GroupLabel=Cr,e.GroupListField=Pr,e.GroupListFieldPlugin=Br,e.GroupListHeader=Nr,e.GroupListMeta=Lr,e.GroupPanel=hr,e.HamburgerIcon=me,e.HeadingIcon=Ce,e.IconButton=Nt,e.ImageField=wi,e.ImageFieldPlugin=vi,e.ImageUpload=Ia,e.InfoIcon=Ge,e.Input=Ha,e.ItalicIcon=Ne,e.ItemDeleteButton=kr,e.ItemHeader=Tr,e.LeftArrowIcon=be,e.LinkIcon=Oe,e.ListField=gi,e.ListFieldPlugin=fi,e.ListPanel=Mr,e.LoadingDots=wn,e.LocalWarning=ac,e.LockIcon=$e,e.MarkdownIcon=Ze,e.MdxFieldPlugin=os,e.MediaIcon=Le,e.MediaListError=ft,e.MediaManager=gt,e.Modal=ne,e.ModalActions=ae,e.ModalBody=re,e.ModalFullscreen=it,e.ModalHeader=et,e.ModalOverlay=te,e.ModalPopup=st,e.ModalProvider=J,e.Nav=gc,e.NumberField=cs,e.NumberFieldPlugin=ds,e.NumberInput=Ta,e.OrderedListIcon=Me,e.PanelBody=gr,e.PanelHeader=pr,e.Popover=jn,e.PopupModal=ot,e.PullRequestIcon=We,e.QuoteIcon=De,e.RadioGroup=va,e.RadioGroupField=ps,e.RadioGroupFieldPlugin=gs,e.RedoIcon=Be,e.Reference=er,e.ReferenceField=Vs,e.ReferenceFieldPlugin=Is,e.ReorderIcon=_e,e.ReorderRowIcon=Ve,e.ResetForm=kn,e.ResetIcon=Re,e.RightArrowIcon=xe,e.Select=fa,e.SelectField=ms,e.SelectFieldPlugin=us,e.SettingsIcon=ze,e.StrikethroughIcon=je,e.Swatch=$n,e.TableIcon=He,e.TagsField=ys,e.TagsFieldPlugin=Cs,e.TextArea=Qt,e.TextField=ws,e.TextFieldPlugin=vs,e.TextareaField=fs,e.TextareaFieldPlugin=hs,e.Theme=yt,e.Tina=Xd,e.TinaCMS=Sd,e.TinaCMSProvider=Pd,e.TinaField=hn,e.TinaForm=fn,e.TinaIcon=Te,e.TinaProvider=qd,e.TinaUI=Wd,e.Toggle=qn,e.ToggleField=bs,e.ToggleFieldPlugin=xs,e.TrashIcon=Se,e.UnderlineIcon=Ae,e.UndoIcon=Pe,e.UnorderedListIcon=Fe,e.UploadIcon=Ie,e.WarningIcon=Ue,e.selectFieldClasses=ga,e.textFieldClasses=Xt,e.useBranchData=nm,e.useCMS=Sa,e.useCMSEvent=_t,e.useDismissible=tn,e.useForm=Ot,e.useFormPortal=yn,e.useFormScreenPlugin=_c,e.useGlobalForm=Bc,e.useLocalForm=Rt,e.useLocalStorage=mm,e.useModalContainer=ee,e.usePlugin=Pt,e.usePlugins=Bt,e.usePreviewSrc=hi,e.useScreenPlugin=Yt,e.useSubscribable=Zt,e.useWatchFormValues=Kt,e.withPlugin=Ut,e.withPlugins=Gt,e.withTina=Jd,e.wrapFieldsWithMeta=rr,Object.defineProperty(e,"__esModule",{value:!0}),e[Symbol.toStringTag]="Module"}(t,n(67294),n(73935),n(8797),n(73342),n(37303),n(95142),n(713),n(19818),n(66688),n(98366),n(15948),n(32512),n(35594),n(1379),n(60406),n(92764),n(96646),n(88206),n(70193),n(4757),n(69222),n(16166),n(15896),n(10508),n(71269),n(23994),n(26897),n(45984),n(73160),n(52943),n(40081),n(27046),n(30381),n(74071),n(62520))}}]);