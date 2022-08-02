"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[150],{14980:function(e,t,n){n.d(t,{Tof:function(){return Wl},Acx:function(){return Xl},zxk:function(){return We},r9b:function(){return sl},V92:function(){return Pe},Ndp:function(){return Le},l09:function(){return Qe},quP:function(){return Pt},PXv:function(){return Bt},PHR:function(){return $o},xgg:function(){return bt},DrE:function(){return eo},u_l:function(){return q},nK9:function(){return X},fef:function(){return G},xBx:function(){return ve},ah7:function(){return ze},JL8:function(){return po},PQB:function(){return Xe},pdg:function(){return Ne},GRk:function(){return Ml},$z_:function(){return Be},H1r:function(){return Al},kNL:function(){return Sn},_aR:function(){return Gl}});var a=n(67294),r=n(73935),i=n(8797),o=n(80983),l=n(82727),s=n(8390),c=n(6512),d=n(68171),m=n(73342),p=n(37303),u=n(3902),g=n(713),h=n(19818),w=n(26729),f=n(21359),v=n.n(f),b=n(15948),x=n(32512),y=n(99747),E=n(88206),k=n(40566),C=n(85520),N=n(24421),z=n(63143),S=n(22774),M=n(39012),L=n(71269),F=n(91243),$=n(60406),P=n(35426),B=n(26897),H=n(45984),T=n(73160),D=n(60910),Z=n(5005),V=n(28894),I=n(27046),j=n.n(I),_=n(30381),R=n.n(_),O=n(61715),A=n(33680);const Y=({children:e})=>{const[t,n]=(0,a.useState)(null),r=(0,a.useCallback)((e=>{null!==e&&n(e)}),[]);return a.createElement(a.Fragment,null,a.createElement("div",{id:"modal-root",className:"tina-tailwind",ref:r}),a.createElement(W.Provider,{value:{portalNode:t}},e))},W=a.createContext(null);const J=({children:e})=>a.createElement("div",{className:"fixed inset-0 z-modal w-screen h-screen overflow-y-auto"},e,a.createElement("div",{className:"fixed -z-1 inset-0 opacity-80 bg-gradient-to-br from-gray-800 via-gray-900 to-black"})),q=e=>{const{portalNode:t}=function(){const e=a.useContext(W);if(!e)throw new Error("No Modal Container context provided");return e}();return t?(0,r.createPortal)(a.createElement(J,null,a.createElement("div",{...e})),t):null},X=({children:e})=>a.createElement("div",{className:"w-full flex justify-between gap-4 items-center px-5 pb-5 rounded-b-md"},e),G=i.ZP.div`
  padding: ${e=>e.padded?"var(--tina-padding-big)":"0"};
  margin: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 160px;

  &:last-child {
    border-radius: 0 0 5px 5px;
  }
`,U=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M14.9524 4.89689L14.9524 26.8016H16.7461L16.7461 4.89689H14.9524Z"}),a.createElement("path",{d:"M4.8969 16.7461H26.8016L26.8016 14.9523H4.89689L4.8969 16.7461Z"})),K=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M5 6.2684L24.7316 26L26 24.7316L6.2684 5L5 6.2684Z"}),a.createElement("path",{d:"M6.2684 26L26 6.2684L24.7316 5L5 24.7316L6.2684 26Z"})),Q=({...e})=>a.createElement("svg",{viewBox:"0 0 4 14",fill:"#828282",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M2 5.5C1.5625 5.5 1.21875 5.65625 0.9375 5.9375C0.625 6.25 0.5 6.59375 0.5 7C0.5 7.4375 0.625 7.78125 0.9375 8.0625C1.21875 8.375 1.5625 8.5 2 8.5C2.40625 8.5 2.75 8.375 3.0625 8.0625C3.34375 7.78125 3.5 7.4375 3.5 7C3.5 6.59375 3.34375 6.25 3.0625 5.9375C2.75 5.65625 2.40625 5.5 2 5.5ZM0.5 2.25C0.5 1.84375 0.625 1.5 0.9375 1.1875C1.21875 0.90625 1.5625 0.75 2 0.75C2.40625 0.75 2.75 0.90625 3.0625 1.1875C3.34375 1.5 3.5 1.84375 3.5 2.25C3.5 2.6875 3.34375 3.03125 3.0625 3.3125C2.75 3.625 2.40625 3.75 2 3.75C1.5625 3.75 1.21875 3.625 0.9375 3.3125C0.625 3.03125 0.5 2.6875 0.5 2.25ZM0.5 11.75C0.5 11.3438 0.625 11 0.9375 10.6875C1.21875 10.4062 1.5625 10.25 2 10.25C2.40625 10.25 2.75 10.4062 3.0625 10.6875C3.34375 11 3.5 11.3438 3.5 11.75C3.5 12.1875 3.34375 12.5312 3.0625 12.8125C2.75 13.125 2.40625 13.25 2 13.25C1.5625 13.25 1.21875 13.125 0.9375 12.8125C0.625 12.5312 0.5 12.1875 0.5 11.75Z"})),ee=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M4 10H28V8H4V10Z"}),a.createElement("path",{d:"M4 17H28V15H4V17Z"}),a.createElement("path",{d:"M4 24H28V22H4V24Z"})),te=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M6.708 10.5L5.5 11.7654L14.2939 20.9773C14.9597 21.6747 16.0412 21.6737 16.7061 20.9773L25.5 11.7654L24.292 10.5L15.5 19.7098L6.708 10.5Z"})),ne=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M25.292 21.5L26.5 20.2346L17.7061 11.0227C17.0403 10.3253 15.9588 10.3263 15.2939 11.0227L6.5 20.2346L7.708 21.5L16.5 12.2901L25.292 21.5Z"})),ae=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M15 22C15 23.1 14.1 24 13 24C11.9 24 11 23.1 11 22C11 20.9 11.9 20 13 20C14.1 20 15 20.9 15 22ZM13 14C11.9 14 11 14.9 11 16C11 17.1 11.9 18 13 18C14.1 18 15 17.1 15 16C15 14.9 14.1 14 13 14ZM13 8C11.9 8 11 8.9 11 10C11 11.1 11.9 12 13 12C14.1 12 15 11.1 15 10C15 8.9 14.1 8 13 8ZM19 12C20.1 12 21 11.1 21 10C21 8.9 20.1 8 19 8C17.9 8 17 8.9 17 10C17 11.1 17.9 12 19 12ZM19 14C17.9 14 17 14.9 17 16C17 17.1 17.9 18 19 18C20.1 18 21 17.1 21 16C21 14.9 20.1 14 19 14ZM19 20C17.9 20 17 20.9 17 22C17 23.1 17.9 24 19 24C20.1 24 21 23.1 21 22C21 20.9 20.1 20 19 20Z"})),re=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M21 7.208L19.7346 6L10.5227 14.7939C9.82527 15.4597 9.82626 16.5412 10.5227 17.2061L19.7346 26L21 24.792L11.7901 16L21 7.208Z"})),ie=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M15.5 23.0129L8.88889 23.0129L8.88889 9.10324L15.5 9.10324L15.5 7.11615L8.88889 7.11615C7.85 7.11615 7 8.01034 7 9.10324L7 23.0129C7 24.1058 7.85 25 8.88889 25L15.5 25L15.5 23.0129Z"}),a.createElement("path",{d:"M18.6961 12.4912L21.1328 15.0645L12 15.0645L12 17.0516L21.1328 17.0516L18.6961 19.6249L20.0278 21.0258L24.75 16.0581L20.0278 11.0903L18.6961 12.4912Z"})),oe=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"currentColor",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M18.6466 14.5553C19.9018 13.5141 20.458 7.36086 21.0014 5.14903C21.5447 2.9372 23.7919 3.04938 23.7919 3.04938C23.7919 3.04938 23.2085 4.06764 23.4464 4.82751C23.6844 5.58738 25.3145 6.26662 25.3145 6.26662L24.9629 7.19622C24.9629 7.19622 24.2288 7.10204 23.7919 7.9785C23.355 8.85496 24.3392 17.4442 24.3392 17.4442C24.3392 17.4442 21.4469 22.7275 21.4469 24.9206C21.4469 27.1136 22.4819 28.9515 22.4819 28.9515H21.0296C21.0296 28.9515 18.899 26.4086 18.462 25.1378C18.0251 23.8669 18.1998 22.596 18.1998 22.596C18.1998 22.596 15.8839 22.4646 13.8303 22.596C11.7767 22.7275 10.4072 24.498 10.16 25.4884C9.91287 26.4787 9.81048 28.9515 9.81048 28.9515H8.66211C7.96315 26.7882 7.40803 26.0129 7.70918 24.9206C8.54334 21.8949 8.37949 20.1788 8.18635 19.4145C7.99321 18.6501 6.68552 17.983 6.68552 17.983C7.32609 16.6741 7.97996 16.0452 10.7926 15.9796C13.6052 15.914 17.3915 15.5965 18.6466 14.5553Z"}),a.createElement("path",{d:"M11.1268 24.7939C11.1268 24.7939 11.4236 27.5481 13.0001 28.9516H14.3511C13.0001 27.4166 12.8527 23.4155 12.8527 23.4155C12.1656 23.6399 11.3045 24.3846 11.1268 24.7939Z"})),le=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M16.9 4.2V6.9H25V8.7H7V6.9H15.1V4.2H16.9ZM7.77201 10.5H24.2279L22.4102 24.1332C22.2853 25.0698 21.4406 25.8 20.4977 25.8H11.5022C10.5561 25.8 9.71404 25.0653 9.58977 24.1332L7.77201 10.5ZM22.172 12.3H9.82791L11.3739 23.8953C11.3788 23.9318 11.4569 24 11.5022 24H20.4977C20.5432 24 20.6209 23.9328 20.6259 23.8953L22.172 12.3Z"})),se=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M15.3012 6.23952L11.0607 10.4801L10 9.41943L14.2406 5.17886C14.9213 4.49816 16.0233 4.48258 16.7196 5.17886L20.9602 9.41943L19.8995 10.4801L15.6589 6.23952C15.5561 6.13671 15.4039 6.13689 15.3012 6.23952Z"}),a.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M15.6988 25.8732L19.9393 21.6326L21 22.6933L16.7594 26.9339C16.0787 27.6146 14.9767 27.6301 14.2804 26.9339L10.0398 22.6933L11.1005 21.6326L15.3411 25.8732C15.4439 25.976 15.5961 25.9758 15.6988 25.8732Z"}),a.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M14.6569 27.1127V17.799L16.1569 17.799V27.1127L14.6569 27.1127Z"}),a.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M14.6569 14.3137V5L16.1569 5V14.3137L14.6569 14.3137Z"})),ce=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M12.625 13.3846H19.375C21.2358 13.3846 22.75 14.8342 22.75 16.6154C22.75 18.3966 21.2358 19.8462 19.375 19.8462H16V22H19.375C22.4766 22 25 19.5845 25 16.6154C25 13.6463 22.4766 11.2308 19.375 11.2308H12.625V8L7 12.3077L12.625 16.6154V13.3846Z",fill:"inherit"})),de=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M16 29.3333C17.4666 29.3333 18.6666 28.1333 18.6666 26.6666H13.3333C13.3333 27.3739 13.6143 28.0522 14.1144 28.5523C14.6145 29.0524 15.2927 29.3333 16 29.3333ZM24 21.3333V14.6666C24 10.5733 21.8133 7.14665 18 6.23998V5.33331C18 4.22665 17.1066 3.33331 16 3.33331C14.8933 3.33331 14 4.22665 14 5.33331V6.23998C10.1733 7.14665 7.99998 10.56 7.99998 14.6666V21.3333L5.33331 24V25.3333H26.6666V24L24 21.3333Z",fill:"inherit"})),me=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M16 2.66669C8.64802 2.66669 2.66669 8.64802 2.66669 16C2.66669 23.352 8.64802 29.3334 16 29.3334C23.352 29.3334 29.3334 23.352 29.3334 16C29.3334 8.64802 23.352 2.66669 16 2.66669ZM17.3334 22.6667H14.6667V14.6667H17.3334V22.6667ZM17.3334 12H14.6667V9.33335H17.3334V12Z",fill:"inherit"})),pe=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M31.2176 28.768L16.9664 2.1568C16.8686 1.98698 16.7278 1.84593 16.5581 1.74786C16.3884 1.64978 16.1959 1.59814 16 1.59814C15.804 1.59814 15.6115 1.64978 15.4419 1.74786C15.2722 1.84593 15.1314 1.98698 15.0336 2.1568L0.783977 28.768C0.688907 28.9338 0.639554 29.1219 0.640959 29.3131C0.642365 29.5042 0.694478 29.6916 0.791977 29.856C0.991977 30.1936 1.35518 30.4 1.74878 30.4H30.2512C30.4442 30.4003 30.6339 30.3503 30.8017 30.2549C30.9695 30.1595 31.1095 30.022 31.208 29.856C31.3054 29.6916 31.3576 29.5044 31.3593 29.3133C31.361 29.1222 31.3121 28.9341 31.2176 28.768V28.768ZM17.6 27.2H14.4V24H17.6V27.2ZM17.6 21.6H14.4V11.2H17.6V21.6Z",fill:"inherit"})),ue=({...e})=>a.createElement("svg",{viewBox:"0 0 32 32",fill:"inherit",xmlns:"http://www.w3.org/2000/svg",...e},a.createElement("path",{d:"M22.276 3.05736C22.1524 2.9333 22.0055 2.83491 21.8437 2.76787C21.6819 2.70082 21.5085 2.66643 21.3334 2.66669H10.6667C10.4916 2.66643 10.3181 2.70082 10.1563 2.76787C9.99455 2.83491 9.84763 2.9333 9.72402 3.05736L3.05736 9.72402C2.9333 9.84763 2.83491 9.99455 2.76787 10.1563C2.70082 10.3181 2.66643 10.4916 2.66669 10.6667V21.3334C2.66669 21.688 2.80669 22.0267 3.05736 22.276L9.72402 28.9427C9.84763 29.0667 9.99455 29.1651 10.1563 29.2322C10.3181 29.2992 10.4916 29.3336 10.6667 29.3334H21.3334C21.688 29.3334 22.0267 29.1934 22.276 28.9427L28.9427 22.276C29.0667 22.1524 29.1651 22.0055 29.2322 21.8437C29.2992 21.6819 29.3336 21.5085 29.3334 21.3334V10.6667C29.3336 10.4916 29.2992 10.3181 29.2322 10.1563C29.1651 9.99455 29.0667 9.84763 28.9427 9.72402L22.276 3.05736ZM17.3334 22.6667H14.6667V20H17.3334V22.6667ZM17.3334 17.3334H14.6667V9.33336H17.3334V17.3334Z",fill:"inherit"})),ge=({...e})=>a.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"2 2 20 20",...e},a.createElement("path",{d:"M20,5h-8.586L9.707,3.293C9.52,3.105,9.265,3,9,3H4C2.897,3,2,3.897,2,5v14c0,1.103,0.897,2,2,2h16c1.103,0,2-0.897,2-2V7 C22,5.897,21.103,5,20,5z M4,19V7h7h1h8l0.002,12H4z"})),he=({...e})=>a.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"2 2 20 20",...e},a.createElement("path",{d:"M19.903,8.586c-0.049-0.106-0.11-0.207-0.196-0.293l-6-6c-0.086-0.086-0.187-0.147-0.293-0.196 c-0.03-0.014-0.062-0.022-0.094-0.033c-0.084-0.028-0.17-0.046-0.259-0.051C13.04,2.011,13.021,2,13,2H6C4.897,2,4,2.897,4,4v16 c0,1.103,0.897,2,2,2h12c1.103,0,2-0.897,2-2V9c0-0.021-0.011-0.04-0.013-0.062c-0.005-0.089-0.022-0.175-0.051-0.259 C19.926,8.647,19.917,8.616,19.903,8.586z M16.586,8H14V5.414L16.586,8z M6,20V4h6v5c0,0.553,0.447,1,1,1h5l0.002,10H6z"}),a.createElement("path",{d:"M8 12H16V14H8zM8 16H16V18H8zM8 8H10V10H8z"})),we=({...e})=>a.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"currentColor",className:"bi bi-circle",viewBox:"0 0 16 16",...e},a.createElement("path",{d:"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"})),fe=({...e})=>a.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"currentColor",className:"bi bi-check-circle-fill",viewBox:"0 0 16 16",...e},a.createElement("path",{d:"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"})),ve=({children:e,close:t})=>a.createElement("div",{className:"h-14 flex items-center justify-between px-5 border-b border-gray-200 m-0"},a.createElement(be,null,e),t&&a.createElement(xe,{onClick:t},a.createElement(K,null))),be=({children:e})=>a.createElement("h2",{className:"text-gray-600 font-sans font-medium text-base leading-none m-0"},e),xe=i.ZP.div`
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
`,ye=i.F4`
  0% {
    transform: translate3d( -2rem, 0, 0 );
    opacity: 0;
  }

  100% {
    transform: translate3d( 0, 0, 0 );
    opacity: 1;
  }
`,Ee=i.ZP.div`
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
  animation: ${ye} 150ms ease-out 1;

  ${G} {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 721px) {
    width: calc(100% - 170px);
  }
`,ke=Ee,Ce=i.F4`
  0% {
    transform: translate3d( 0, -2rem, 0 );
    opacity: 0;
  }

  100% {
    transform: translate3d( 0, 0, 0 );
    opacity: 1;
  }
`,Ne=i.ZP.div`
  display: block;
  z-index: var(--tina-z-index-0);
  overflow: visible; /* Keep this as "visible", select component needs to overflow */
  background-color: var(--tina-color-grey-1);
  border-radius: var(--tina-radius-small);
  margin: 40px auto;
  width: 460px;
  max-width: 90%;
  animation: ${Ce} 150ms ease-out 1;
`,ze=Ne;class Se{constructor(e){this.events=e,this.plugins={}}getType(e){return this.plugins[e]=this.plugins[e]||new Me(e,this.events)}findOrCreateMap(e){return this.getType(e)}add(e){this.findOrCreateMap(e.__type).add(e)}remove(e){this.findOrCreateMap(e.__type).remove(e)}all(e){return this.findOrCreateMap(e).all()}}class Me{constructor(e,t){this.__type=e,this.events=t,this.__plugins={}}add(e){const t=e;t.__type||(t.__type=this.__type),this.__plugins[t.name]=t,this.events.dispatch({type:`plugin:add:${this.__type}`})}all(){return Object.keys(this.__plugins).map((e=>this.__plugins[e]))}find(e){return this.__plugins[e]}remove(e){const t="string"===typeof e?e:e.name,n=this.__plugins[t];return delete this.__plugins[t],this.events.dispatch({type:`plugin:remove:${this.__type}`}),n}subscribe(e){return this.events.subscribe(`plugin:*:${this.__type}`,e)}}class Le{constructor(){this.listeners=new Set}subscribe(e,t){let n;n="string"===typeof e?[e]:e;const a=n.map((e=>new Fe(e,t)));return a.forEach((e=>this.listeners.add(e))),()=>{a.forEach((e=>this.listeners.delete(e)))}}dispatch(e){if(!this.listeners)return;Array.from(this.listeners.values()).forEach((t=>t.handleEvent(e)))}}class Fe{constructor(e,t){this.eventPattern=e,this.callback=t}handleEvent(e){return!!this.watchesEvent(e)&&(this.callback(e),!0)}watchesEvent(e){if("*"===this.eventPattern)return!0;const t=e.type.split(":"),n=this.eventPattern.split(":");let a=0,r=!1;for(;!r&&a<n.length;){const e="*"===n[a],i=n[a]===t[a];r=!(e||i),a++}return!r}}const $e=/<Error>.*<Code>(.+)<\/Code>.*<Message>(.+)<\/Message>.*/;class Pe{constructor(){this.accept="*"}async persist(e){return e.map((({directory:e,file:t})=>({id:t.name,type:"file",directory:e,filename:t.name})))}async previewSrc(e){return e}async list(){return{items:[],nextOffset:0}}async delete(){}}class Be{constructor(e){this.fetchFunction=(e,t)=>fetch(e,t),this.accept="image/*",this.parse=e=>e.src,this.cms=e}setup(){var e,t,n,a;if(!this.api){this.api=null==(t=null==(e=this.cms)?void 0:e.api)?void 0:t.tina,this.isLocal=!!this.api.isLocalMode;const r=new URL(this.api.contentApiUrl);if(this.url=`${r.origin}/media`,!this.isLocal)if(null==(a=null==(n=this.api.options)?void 0:n.tinaioConfig)?void 0:a.assetsApiUrlOverride){const e=new URL(this.api.assetsApiUrl);this.url=`${e.origin}/v1/${this.api.clientId}`}else this.url=`${r.origin.replace("content","assets")}/v1/${this.api.clientId}`}}async isAuthenticated(){return this.setup(),await this.api.isAuthenticated()}async persist_cloud(e){if(await this.isAuthenticated())for(const t of e){const e=`${t.directory&&"/"!==t.directory?`${t.directory}/${t.file.name}`:t.file.name}`,n=await this.api.fetchWithToken(`${this.url}/upload_url/${e}`,{method:"GET"}),{signedUrl:a}=await n.json();if(!a)throw new Error("Unexpected error generating upload url");const r=await this.fetchFunction(a,{method:"PUT",body:t.file,headers:{"Content-Type":o.contentType(t.file.name)||"application/octet-stream","Content-Length":String(t.file.size)}});if(!r.ok){const e=await r.text(),t=$e.exec(e);throw console.error(e),t?new Error(`Upload error: '${t[2]}'`):new Error("Unexpected error uploading media asset")}}return[]}async persist_local(e){const t=[];for(const n of e){const{file:e,directory:a}=n,r=new FormData;r.append("file",e),r.append("directory",a),r.append("filename",e.name);const i=`${a?`${a}/${e.name}`:e.name}`,o=await this.fetchFunction(`${this.url}/upload/${i}`,{method:"POST",body:r});if(200!=o.status){const e=await o.json();throw new Error(e.message)}const l=await o.json();if(!(null==l?void 0:l.success))throw new Error("Unexpected error uploading media");{const n={type:"file",id:e.name,filename:e.name,directory:a,previewSrc:i};t.push(n)}}return t}async persist(e){return this.setup(),this.isLocal?this.persist_local(e):this.persist_cloud(e)}async previewSrc(e){return e}async list(e){let t;if(this.setup(),this.isLocal){if(t=await this.fetchFunction(`${this.url}/list/${e.directory||""}?limit=${20|e.limit}${e.offset?`&cursor=${e.offset}`:""}`),404==t.status)throw Ze;if(t.status>=500){const{e:e}=await t.json(),n=new Error("Unexpected error");throw console.error(e),n}}else{if(!(await this.isAuthenticated()))throw new Error("Not authenticated");if(t=await this.api.fetchWithToken(`${this.url}/list/${e.directory||""}?limit=${20|e.limit}${e.offset?`&cursor=${e.offset}`:""}`),401==t.status)throw De;if(404==t.status)throw Ze}const{cursor:n,files:a,directories:r}=await t.json(),i=[];for(const o of a)i.push({directory:e.directory||"",type:"file",id:o.filename,filename:o.filename,src:o.src,previewSrc:this.isLocal?o.src:`${o.src}?fit=crop&max-w=56&max-h=56`});for(const o of r)i.push({type:"dir",id:o,directory:e.directory||"",filename:o});return{items:i,nextOffset:n||0}}async delete(e){const t=`${e.directory?`${e.directory}/${e.filename}`:e.filename}`;if(this.isLocal)await this.fetchFunction(`${this.url}/${t}`,{method:"DELETE"});else{if(!(await this.isAuthenticated()))throw De;await this.api.fetchWithToken(`${this.url}/${t}`,{method:"DELETE"})}}}class He{constructor(e,t){this.store=e,this.events=t,this._pageSize=20,this.previewSrc=async(e,t="",n={})=>{try{this.events.dispatch({type:"media:preview:start",src:e,fieldName:t,formValues:n});const a=await this.store.previewSrc(e,t,n);return this.events.dispatch({type:"media:preview:success",src:e,url:a,fieldName:t,formValues:n}),a}catch(a){throw this.events.dispatch({type:"media:preview:failure",src:e,error:a,fieldName:t,formValues:n}),a}}}get isConfigured(){return!(this.store instanceof Pe)}get pageSize(){return this._pageSize}set pageSize(e){this._pageSize=e,this.events.dispatch({type:"media:pageSize",pageSize:e})}open(e={}){this.events.dispatch({type:"media:open",...e})}get accept(){return this.store.accept}async persist(e){try{this.events.dispatch({type:"media:upload:start",uploaded:e});const t=await this.store.persist(e);return this.events.dispatch({type:"media:upload:success",uploaded:e,media:t}),t}catch(t){throw this.events.dispatch({type:"media:upload:failure",uploaded:e,error:t}),t}}async delete(e){try{this.events.dispatch({type:"media:delete:start",media:e}),await this.store.delete(e),this.events.dispatch({type:"media:delete:success",media:e})}catch(t){throw this.events.dispatch({type:"media:delete:failure",media:e,error:t}),t}}async list(e){try{this.events.dispatch({type:"media:list:start",...e});const t=await this.store.list(e);return this.events.dispatch({type:"media:list:success",...e,media:t}),t}catch(t){throw this.events.dispatch({type:"media:list:failure",...e,error:t}),t}}}class Te extends Error{constructor(e){super(e.message),this.ERR_TYPE="MediaListError",this.title=e.title,this.docsLink=e.docsLink}}const De=new Te({title:"Unauthorized",message:"You don't have access to this resource.",docsLink:"https://tina.io/packages/next-tinacms-cloudinary"}),Ze=new Te({title:"Bad Route",message:"The Cloudinary API route is missing or misconfigured.",docsLink:"https://tina.io/packages/next-tinacms-cloudinary/#set-up-api-routes"});new Te({title:"An Error Occurred",message:"Something went wrong accessing your media from Tina Cloud.",docsLink:""});class Ve{constructor(e){this.events=e,this._flags=new Map}get(e){return this._flags.get(e)}set(e,t){this._flags.set(e,t),this.events.dispatch({type:"flag:set",key:e,value:t})}}const Ie=class{constructor(e={}){this._enabled=!1,this.api={},this.unsubscribeHooks={},this.events=new Le,this.media=new He(new Pe,this.events),this.enable=()=>{this._enabled=!0,this.events.dispatch(Ie.ENABLED)},this.disable=()=>{this._enabled=!1,this.events.dispatch(Ie.DISABLED)},this.toggle=()=>{this.enabled?this.disable():this.enable()},this.plugins=new Se(this.events),this.flags=new Ve(this.events),e.media?this.media.store=e.media:this.media.store=new Pe,e.mediaOptions&&e.mediaOptions.pageSize&&(this.media.pageSize=e.mediaOptions.pageSize),e.plugins&&e.plugins.forEach((e=>this.plugins.add(e))),e.apis&&Object.entries(e.apis).forEach((([e,t])=>this.registerApi(e,t))),e.enabled&&this.enable()}registerApi(e,t){if(this.unsubscribeHooks[e]&&this.unsubscribeHooks[e](),t.events instanceof Le){const n=t.events.subscribe("*",this.events.dispatch),a=this.events.subscribe("*",(e=>t.events.dispatch(e)));this.unsubscribeHooks[e]=()=>{n(),a()}}this.api[e]=t}get enabled(){return this._enabled}get disabled(){return!this._enabled}};let je=Ie;je.ENABLED={type:"cms:enable"},je.DISABLED={type:"cms:disable"};class _e{constructor(e,t={}){this.events=e,this.map=t,this.alerts=new Map,this.mapEventToAlert=e=>{const t=this.map[e.type];if(t){let n;n="function"===typeof t?t:()=>t;const{level:a,message:r,timeout:i}=n(e);this.add(a,r,i)}},this.events.subscribe("*",this.mapEventToAlert)}setMap(e){this.map={...this.map,...e}}add(e,t,n=3e3){const a={level:e,message:t,timeout:n,id:`${t}|${Date.now()}`};this.alerts.set(a.id,a),this.events.dispatch({type:"alerts:add",alert:a});let r=null;const i=()=>{clearTimeout(r),this.dismiss(a)};return r=setTimeout(i,a.timeout),i}dismiss(e){this.alerts.delete(e.id),this.events.dispatch({type:"alerts:remove",alert:e})}subscribe(e){const t=this.events.subscribe("alerts",e);return()=>t()}get all(){return Array.from(this.alerts.values())}info(e,t){return this.add("info",e,t)}success(e,t){return this.add("success",e,t)}warn(e,t){return this.add("warn",e,t)}error(e,t){return this.add("error",e,t)}}function Re(){const[e,t]=a.useState(!1),r={google:{families:["Inter:400,600"]},loading:()=>{t(!0)}};return a.useEffect((()=>{e||n.e(933).then(n.t.bind(n,75933,23)).then((e=>e.load(r)))}),[]),null}function Oe(){return a.createElement(a.Fragment,null,a.createElement(Re,null),a.createElement(Ye,null))}const Ae=i.iv`
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
`,Ye=i.vJ`
  ${Ae};
`,We=({variant:e="secondary",as:t="button",size:n="medium",busy:r,disabled:i,rounded:o="full",children:l,className:s,...c})=>{const d={primary:"shadow text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500",secondary:"shadow text-gray-500 hover:text-blue-500 bg-gray-50 hover:bg-white border border-gray-200",white:"shadow text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-200",ghost:"text-gray-500 hover:text-blue-500 hover:shadow border border-transparent hover:border-gray-200 bg-transparent",danger:"shadow text-white bg-red-500 hover:bg-red-600 focus:ring-red-500"},m=r?"busy":i?"disabled":"default",p={disabled:"pointer-events-none\topacity-30 cursor-not-allowed",busy:"pointer-events-none opacity-70 cursor-wait",default:""},u={full:"rounded-full",left:"rounded-l-full",right:"rounded-r-full"},g={small:"text-xs h-8 px-3",medium:"text-sm h-10 px-4",custom:""};return a.createElement(t,{className:`icon-parent border-0 inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center inline-flex justify-center transition-all duration-150 ease-out  ${d[e]} ${g[n]} ${p[m]} ${u[o]} ${s}`,...c},l)},Je=({variant:e="secondary",size:t="medium",busy:n,disabled:r,children:i,className:o,...l})=>{const s={primary:"shadow text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500",secondary:"shadow text-gray-500 hover:text-blue-500 bg-gray-50 hover:bg-white border border-gray-200",white:"shadow text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-200",ghost:"text-gray-500 hover:text-blue-500 hover:shadow border border-transparent hover:border-gray-200 bg-transparent"},c=n?"busy":r?"disabled":"default",d={disabled:"pointer-events-none\topacity-30 cursor-not-allowed",busy:"pointer-events-none opacity-70 cursor-wait",default:""},m={small:"h-7 w-7",medium:"h-9 w-9",custom:""};return a.createElement("button",{className:`icon-parent inline-flex items-center border border-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center inline-flex justify-center transition-all duration-150 ease-out rounded-full  ${s[e]} ${m[t]} ${d[c]} ${o}`,...l},i)};function qe(...e){return e.filter(Boolean).join(" ")}const Xe=({toolbarItems:e})=>a.createElement(l.J,{as:"div",className:"relative block w-full"},(({open:t})=>a.createElement(a.Fragment,null,a.createElement(l.J.Button,{"data-test":"popoverRichTextButton",className:"cursor-pointer relative w-full justify-center inline-flex border items-center p-3 text-sm font-medium focus:outline-none pointer-events-auto "+(t?"text-blue-400":"text-gray-300 hover:text-blue-500"),onMouseDown:e=>{e.preventDefault()}},a.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"}))),a.createElement(s.u,{as:a.Fragment,enter:"transition ease-out duration-100",enterFrom:"transform opacity-0 scale-95",enterTo:"transform opacity-100 scale-100",leave:"transition ease-in duration-75",leaveFrom:"transform opacity-100 scale-100",leaveTo:"transform opacity-0 scale-95"},a.createElement(l.J.Panel,null,(({close:t})=>a.createElement("div",{className:"z-20 origin-top-right absolute right-0 mt-0 -mr-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1"},e.map((e=>a.createElement("span",{"data-test":`${e.name}OverflowButton`,key:e.name,onMouseDown:n=>{n.preventDefault(),t(),e.onMouseDown(n)},className:qe(e.active?"bg-gray-50 text-blue-500":"bg-white text-gray-600","hover:bg-gray-50 hover:text-blue-500 cursor-pointer pointer-events-auto px-4 py-2 text-sm w-full flex items-center whitespace-nowrap")},a.createElement("div",{className:"mr-2 opacity-80"},e.Icon)," ",e.label))))))))));function Ge({Component:e,props:t,...n}){return{__type:"screen",layout:"popup",...n,Component:n=>a.createElement(e,{...n,...t})}}const Ue=a.createContext(null);function Ke(){const e=a.useContext(Ue);if(!e)throw new Error("useCMS could not find an instance of CMS");const[,t]=a.useState(e.enabled);return a.useEffect((()=>e.events.subscribe("cms",(()=>{t(e.enabled)}))),[e]),e}class Qe{constructor({id:e,label:t,fields:n,actions:a,buttons:r,reset:i,loadInitialValues:o,onChange:l,...s}){this.loading=!1,this.subscribe=(e,t)=>this.finalForm.subscribe(e,t),this.handleSubmit=async(e,t,n)=>{try{const a=await this.onSubmit(e,t,n);return t.initialize(e),a}catch(a){return{[u.Ck]:a}}},this.submit=()=>this.finalForm.submit();const c=s.initialValues||{};if(this.__type=s.__type||"form",this.id=e,this.label=t,this.fields=n||[],this.onSubmit=s.onSubmit,this.finalForm=(0,u.Np)({...s,initialValues:c,onSubmit:this.handleSubmit,mutators:{...m.Z,setFieldData:p.Z,...s.mutators}}),this._reset=i,this.actions=a||[],this.buttons=r||{save:"Save",reset:"Reset"},this.updateFields(this.fields),o&&(this.loading=!0,o().then((e=>{this.updateInitialValues(e)})).finally((()=>{this.loading=!1}))),l){let e=!0;this.subscribe((t=>{e?e=!1:l(t)}),{values:!0})}}get name(){return this.id}get values(){if(!this.loading)return this.finalForm.getState().values||this.initialValues}get initialValues(){return this.finalForm.getState().initialValues}get pristine(){return this.finalForm.getState().pristine}get dirty(){return this.finalForm.getState().dirty}get submitting(){return this.finalForm.getState().submitting}get valid(){return this.finalForm.getState().valid}async reset(){this._reset&&await this._reset(),this.finalForm.reset()}updateFields(e){this.fields=e}change(e,t){return this.finalForm.change(e,t)}get mutators(){return this.finalForm.mutators}updateValues(e){this.finalForm.batch((()=>{this.finalForm.getState().active?tt(this.finalForm,e):et(this.finalForm,e)}))}updateInitialValues(e){this.finalForm.batch((()=>{const t=this.values||{};this.finalForm.initialize(e);this.finalForm.getState().active?tt(this.finalForm,t):et(this.finalForm,t)}))}}function et(e,t){Object.entries(t).forEach((([t,n])=>{e.change(t,n)}))}function tt(e,t,n){const a=e.getState().active;Object.entries(t).forEach((([t,r])=>{const i=n?`${n}.${t}`:t;"object"===typeof r?"string"===typeof a&&a.startsWith(i)?tt(e,r,i):e.change(i,r):i!==a&&e.change(i,r)}))}function nt(e,t,n){const r=Ke();a.useEffect((function(){return r.events.subscribe(e,t)}),n)}const at=nt;function rt(e){const t=Ke();return{dispatch:n=>t.events.dispatch({...n,type:e}),subscribe:n=>t.events.subscribe(e,n)}}function it(e,t){const[,n]=a.useState(0);a.useEffect((()=>e.subscribe((()=>{n((e=>e+1)),t&&t()}))))}const ot=({screen:e,close:t})=>a.createElement(lt,{name:e.name,close:t,layout:e.layout},a.createElement(e.Component,{close:t})),lt=({children:e,name:t,close:n,layout:r})=>{let i;switch(r){case"popup":default:i=ze;break;case"fullscreen":i=ke}return a.createElement(q,null,a.createElement(i,null,a.createElement(ve,{close:n},t),a.createElement(G,null,e)))},st="shadow-inner focus:shadow-outline focus:border-blue-500 focus:outline-none block text-base px-3 py-2 text-gray-600 w-full bg-white border border-gray-200 transition-all ease-out duration-150 focus:text-gray-900 rounded-md",ct=({...e})=>a.createElement("input",{type:"text",className:st,...e}),dt=({...e})=>a.createElement("textarea",{className:"shadow-inner text-base px-3 py-2 text-gray-600 resize-y focus:shadow-outline focus:border-blue-500 block w-full border-gray-200 focus:text-gray-900 rounded-md",...e,style:{minHeight:"160px"}}),mt=({onDismiss:e,escape:t,click:n,disabled:r,allowClickPropagation:i,document:o,...l})=>{const s=function({onDismiss:e,escape:t=!1,click:n=!1,disabled:r=!1,allowClickPropagation:i=!1,document:o}){const l=(0,a.useRef)();return(0,a.useEffect)((()=>{const a=o?[document,o]:[document],s=e=>{e.stopPropagation(),e.stopImmediatePropagation(),e.preventDefault()},c=t=>{r||l.current.contains(t.target)||(console.log("did not click main content",t.target,l.current),i||s(t),e(t))},d=t=>{r||27===t.keyCode&&(t.stopPropagation(),e(t))};return n&&a.forEach((e=>e.body.addEventListener("click",c))),t&&a.forEach((e=>e.addEventListener("keydown",d))),()=>{a.forEach((e=>{e.body.removeEventListener("click",c),e.removeEventListener("keydown",d)}))}}),[n,o,t,r,e]),l}({onDismiss:e,escape:t,click:n,disabled:r,allowClickPropagation:i,document:o});return a.createElement("div",{ref:s,...l})};var pt=(e=>(e.Hex="hex",e.RGB="rgb",e))(pt||{});function ut(e){if(!e)return null;const t=(0,h.get)(e);if(!t)return null;const n=t.value;return{r:n[0],g:n[1],b:n[2],a:n[3]}}const gt={rgb:{getLabel:e=>`R${e.r} G${e.g} B${e.b}`,getValue(e){const t=[e.r,e.g,e.b,e.a];return h.to.rgb(t)},parse:ut},hex:{getLabel:e=>function(e){return"#"+((1<<24)+(e.r<<16)+(e.g<<8)+e.b).toString(16).slice(1)}(e),getValue(e){const t=[e.r,e.g,e.b,e.a];return h.to.hex(t)},parse:ut}};function ht({form:e,fields:t,padding:n=!1}){const r=Ke(),[i,o]=a.useState([]),l=a.useCallback((()=>{const e=r.plugins.getType("field").all();o(e)}),[o]);return a.useEffect((()=>l()),[]),at("plugin:add:field",(()=>l()),[]),a.createElement(ft,{padding:n},t.map((t=>a.createElement(wt,{key:t.name,field:t,form:e,fieldPlugins:i}))))}const wt=({field:e,form:t,fieldPlugins:n})=>{if(a.useEffect((()=>{t.mutators.setFieldData(e.name,{tinaField:e})}),[t,e]),null===e.component)return null;const r=n.find((t=>t.name===e.component));let i;r&&r.type&&(i=r.type);const o=vt("parse",e,r),l=vt("validate",e,r);let s=e.format;!s&&r&&r.format&&(s=r.format);let c=e.defaultValue;return!o&&r&&r.defaultValue&&(c=r.defaultValue),a.createElement(w.gN,{name:e.name,key:e.name,type:i,parse:o?(t,n)=>o(t,n,e):void 0,format:s?(t,n)=>s(t,n,e):void 0,defaultValue:c,validate:(t,n,a)=>{if(l)return l(t,n,a,e)}},(n=>"string"!==typeof e.component&&null!==e.component?a.createElement(e.component,{...n,form:t.finalForm,tinaForm:t,field:e}):r?a.createElement(r.Component,{...n,form:t.finalForm,tinaForm:t,field:e}):a.createElement("p",null,"Unrecognized field type")))},ft=({padding:e,children:t})=>a.createElement("div",{className:"relative block w-full h-full whitespace-nowrap overflow-x-visible "+(e?"pb-5":"")},t);function vt(e,t,n){let a=t[e];return!a&&n&&n[e]&&(a=n[e]),a}a.createContext(!1);v().string,v().string,v().any.isRequired,v().any;const bt=({dotSize:e=8,color:t="white"})=>a.createElement("div",null,a.createElement(yt,{dotSize:e,color:t}),a.createElement(yt,{dotSize:e,color:t}),a.createElement(yt,{dotSize:e,color:t})),xt=i.F4`
  0% { transform: scale(0.1); }
  50% { transform: scale(1); }
  90% { transform: scale(0.1); }
  100% { transform: scale(0.1); }
`,yt=i.ZP.span`
  animation: ${xt} 2s linear infinite;
  display: inline-block;
  margin-right: 4px;
  :nth-child(2) {
    animation-delay: 0.3s;
  }
  :nth-child(3) {
    animation-delay: 0.5s;
  }
  ${({color:e,dotSize:t})=>i.iv`
      background: ${e};
      width: ${t}px;
      height: ${t}px;
      border-radius: ${t}px;
    `}
`,Et=a.createContext((()=>null));function kt(){return(0,a.useContext)(Et)}const Ct=({children:e})=>{const t=a.useRef(null),n=a.useRef(0),i=a.useCallback((e=>t.current?(0,r.createPortal)(e.children({zIndexShift:n.current+=1}),t.current):null),[t,n]);return a.createElement(Et.Provider,{value:i},a.createElement("div",{ref:t,style:{position:"relative",width:"100%",flex:"1 1 0%",overflow:"hidden"}},e))},Nt=({pristine:e,reset:t,children:n,...r})=>{const[i,o]=a.useState(!1);return a.createElement(a.Fragment,null,a.createElement(We,{onClick:()=>{o((e=>!e))},disabled:e,...r},n),i&&a.createElement(zt,{reset:t,close:()=>o(!1)}))},zt=({close:e,reset:t})=>a.createElement(q,null,a.createElement(ze,null,a.createElement(ve,{close:e},"Reset"),a.createElement(G,{padded:!0},a.createElement("p",null,"Are you sure you want to reset all changes?")),a.createElement(X,null,a.createElement(We,{style:{flexGrow:2},onClick:e},"Cancel"),a.createElement(We,{style:{flexGrow:3},variant:"primary",onClick:async()=>{await t(),e()}},"Reset")))),St=({actions:e,form:t})=>{const[n,r]=(0,a.useState)(!1);return a.createElement(a.Fragment,null,a.createElement(Mt,{onClick:()=>r((e=>!e))}),a.createElement(Lt,{open:n},a.createElement(mt,{click:!0,escape:!0,disabled:!n,onDismiss:()=>{r((e=>!e))}},e.map(((e,n)=>a.createElement(e,{form:t,key:n}))))))},Mt=(0,i.ZP)((e=>a.createElement("button",{...e},a.createElement(Q,null))))`
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
`,Lt=i.ZP.div`
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
  ${e=>e.open&&i.iv`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, -28px, 0) scale3d(1, 1, 1);
    `};
`,Ft=i.ZP.button`
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
`,$t=()=>a.createElement(Vt,null,a.createElement(Dt,null,"\ud83e\udd14"),a.createElement("h3",{className:"font-sans font-normal text-lg"},"Hey, you don't have any fields added to this form."),a.createElement("p",null,a.createElement(It,{href:"https://tinacms.org/docs/fields",target:"_blank"},a.createElement(Dt,null,"\ud83d\udcd6")," Field Setup Guide"))),Pt=({form:e,onPristineChange:t,...n})=>{const r=!!n.hideFooter,[i,o]=a.useState(0);a.useEffect((()=>{o((e=>e+1))}),[e]);const l=e.finalForm,s=a.useCallback((e=>{if(!e.destination||!l)return;const t=e.type;l.mutators.move(t,e.source.index,e.destination.index)}),[e]);return a.useEffect((()=>{const e=e=>{e.preventDefault(),e.returnValue=""},n=l.subscribe((({pristine:n})=>{t&&t(n),n?window.removeEventListener("beforeunload",e):window.addEventListener("beforeunload",e)}),{pristine:!0});return()=>{window.removeEventListener("beforeunload",e),n()}}),[l]),Tt({finalForm:l,tinaForm:e}),a.createElement(w.l0,{form:l,key:`${i}: ${e.id}`,onSubmit:e.onSubmit},(({handleSubmit:t,pristine:n,invalid:i,submitting:o})=>a.createElement(a.Fragment,null,a.createElement(b.Z5,{onDragEnd:s},a.createElement(Ct,null,a.createElement(Ht,{id:e.id},e&&e.fields.length?a.createElement(ht,{form:e,fields:e.fields}):a.createElement($t,null))),!r&&a.createElement("div",{className:"relative flex-none w-full h-16 px-6 bg-white border-t border-gray-100\tflex items-center justify-center"},a.createElement("div",{className:"flex-1 w-full flex justify-between gap-4 items-center max-w-form"},e.reset&&a.createElement(Nt,{pristine:n,reset:async()=>{l.reset(),await e.reset()},style:{flexGrow:1}},e.buttons.reset),a.createElement(We,{onClick:()=>t(),disabled:n||o||i,busy:o,variant:"primary",style:{flexGrow:3}},o&&a.createElement(bt,null),!o&&e.buttons.save),e.actions.length>0&&a.createElement(St,{form:e,actions:e.actions})))))))},Bt=({pristine:e})=>a.createElement("div",{className:"flex flex-0 items-center"},!e&&a.createElement(a.Fragment,null,a.createElement("span",{className:"w-3 h-3 flex-0 rounded-full bg-yellow-400 border border-yellow-500 mr-2"})," ",a.createElement("p",{className:"text-gray-700 text-sm leading-tight whitespace-nowrap"},"Unsaved Changes")),e&&a.createElement(a.Fragment,null,a.createElement("span",{className:"w-3 h-3 flex-0 rounded-full bg-green-300 border border-green-400 mr-2"})," ",a.createElement("p",{className:"text-gray-500 text-sm leading-tight whitespace-nowrap"},"No Changes"))),Ht=({children:e,id:t})=>a.createElement("div",{"data-test":`form:${t}`,className:"h-full overflow-y-auto max-h-full bg-gray-50 pt-6 px-6 pb-2"},a.createElement("div",{className:"w-full flex justify-center"},a.createElement("div",{className:"w-full max-w-form"},e))),Tt=({finalForm:e,tinaForm:t})=>{const[n,r]=a.useState({}),[i,o]=a.useState(null),{subscribe:l}=e;a.useEffect((()=>{l((({values:e})=>{r(e)}),{values:!0})}),[l,r]);const s=Ke();a.useEffect((()=>{if("reset"===(null==i?void 0:i.name))s.events.dispatch({type:"forms:reset",value:null,mutationType:i.mutationType,formId:t.id}),o(null);else if(null==i?void 0:i.name){const e=i.field.value,a=(0,u.u9)(n,null==i?void 0:i.name);s.events.dispatch({type:"forms:fields:onChange",value:a,previousValue:e,mutationType:i.mutationType,formId:t.id,field:i.field}),o(null)}}),[JSON.stringify(n),s]);const{change:c,reset:d}=e,{insert:m,move:p,remove:g,...h}=e.mutators,w=(t,n)=>{o({name:t,field:e.getFieldState(t),mutationType:n})};a.useMemo((()=>{e.reset=e=>(w("reset",{type:"reset"}),d(e)),e.change=(e,t)=>(w(e.toString(),{type:"change"}),c(e,t)),e.mutators={insert:(...e)=>{w(e[0],{type:"insert",at:e[1]}),m(...e)},move:(...e)=>{w(e[0],{type:"move",from:e[1],to:e[2]}),p(...e)},remove:(...e)=>{w(e[0],{type:"remove",at:e[1]}),g(...e)},...h}}),[JSON.stringify(n)])},Dt=i.ZP.span`
  font-size: 40px;
  line-height: 1;
  display: inline-block;
`,Zt=i.F4`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`,Vt=i.ZP.div`
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
  animation-name: ${Zt};
  animation-delay: 300ms;
  animation-timing-function: ease-out;
  animation-iteration-count: 1;
  animation-fill-mode: both;
  animation-duration: 150ms;
  > *:first-child {
    margin: 0 0 var(--tina-padding-big) 0;
  }
  > ${Dt} {
    display: block;
  }
  h3 {
    font-size: var(--tina-font-size-5);
    font-weight: normal;
    display: block;
    margin: 0 0 var(--tina-padding-big) 0;
    ${Dt} {
      font-size: 1em;
    }
  }
  p {
    display: block;
    margin: 0 0 var(--tina-padding-big) 0;
  }
`,It=i.ZP.a`
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
  ${Dt} {
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
    ${Dt} {
      transform: translate3d(0, -50%, 0);
    }
  }
`,jt=(0,i.ZP)((({colorRGBA:e,colorFormat:t,unselectable:n,...r})=>a.createElement("div",{...r},a.createElement("div",{className:"swatch-inner"},e?gt[t].getLabel(e):"Click to add color"))))`
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
    color: ${e=>{return!(t=e.colorRGBA)||.299*t.r+.587*t.g+.114*t.b>186?"#000000":"#ffffff";var t}};
    transition: all var(--tina-timing-short) ease-out;
  }

  &:hover {
    > div {
      opacity: 0.6;
    }
  }
`,_t=i.F4`
  0% {
    transform: translate3d(-50%, 0, 0) scale3d(0.5,0.5,1)
  }
  100% {
    transform: translate3d(-50%, 8px, 0) scale3d(1, 1, 1);
  }
`,Rt=i.F4`
  0% {
    transform: translate3d(-50%, -100%, 0) scale3d(0.5,0.5,1)
  }
  100% {
    transform: translate3d(-50%, calc(-100% - 8px), 0) scale3d(1, 1, 1);
  }
`,Ot=i.ZP.div`
  position: fixed;
  top: ${e=>e.triggerBoundingBox?e.triggerBoundingBox.bottom:"0"}px;
  left: ${e=>e.triggerBoundingBox?e.triggerBoundingBox.left+e.triggerBoundingBox.width/2:"0"}px;
  transform: translate3d(-50%, 8px, 0) scale3d(1, 1, 1);
  transform-origin: 50% 0;
  animation: ${_t} 85ms ease-out both 1;
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

  ${e=>e.openTop&&i.iv`
      top: ${e.triggerBoundingBox?e.triggerBoundingBox.top:"0"}px;
      transform: translate3d(-50%, calc(-100% - 8px), 0) scale3d(1, 1, 1);
      animation: ${Rt} 85ms ease-out both 1;
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
`,At=(i.ZP.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: var(--tina-z-index-1);
`,i.ZP.div`
  position: relative;
`),Yt="transparent",Wt=["#D0021B","#F5A623","#F8E71C","#8B572A","#7ED321","#417505","#BD10E0","#9013FE","#4A90E2","#50E3C2","#B8E986","#000000","#4A4A4A","#9B9B9B","#FFFFFF"],Jt={sketch:e=>a.createElement(g.xS,{presetColors:e.presetColors,color:e.color,onChange:e.onChange,disableAlpha:e.disableAlpha,width:e.width}),block:e=>a.createElement(g.if,{colors:e.presetColors,color:e.color,onChange:e.onChange,width:e.width})},qt=({colorFormat:e,userColors:t=Wt,widget:n="sketch",input:r})=>{const i=kt(),o=a.useRef(null),[l,s]=(0,a.useState)(null),[c,d]=(0,a.useState)(!1),m=()=>{o.current&&s(o.current.getBoundingClientRect())};a.useEffect((()=>{if(l){const e=l.top+l.height/2,t=window.innerHeight;d(e>t/2)}}),[l]),a.useEffect((()=>{let e=!1;setTimeout((()=>{m()}),100);const t=()=>{clearTimeout(e),e=setTimeout(m,100)};return window.addEventListener("resize",t),()=>{window.removeEventListener("resize",t)}}),[o.current]);const p=Jt[n];if(!p)throw new Error("You must specify a widget type.");const[u,g]=(0,a.useState)(!1),h=(e||pt.Hex).toLowerCase(),w=r.value?gt[h].parse(r.value):null,f=e=>{const t=e.hex===Yt?null:{...e.rgb,a:1};r.onChange(t?gt[h].getValue(t):null)},v=e=>{e.stopPropagation();const t=!u;g(t),t&&m()};return a.createElement(At,{ref:o},a.createElement(jt,{onClick:v,colorRGBA:w,colorFormat:h}),u&&a.createElement(i,null,(({zIndexShift:e})=>a.createElement(Ot,{openTop:c,triggerBoundingBox:l,style:{zIndex:5e3+e}},a.createElement(mt,{click:!0,escape:!0,disabled:!u,onDismiss:v},a.createElement(p,{presetColors:[...t,Yt],color:w||{r:0,g:0,b:0,a:0},onChange:f,disableAlpha:!0,width:"240px"}))))))},Xt=i.ZP.div`
  display: flex;
  align-items: center;

  > span {
    color: var(--tina-color-grey-8);
  }
`,Gt=i.ZP.div`
  position: relative;
  width: 48px;
  height: 28px;
  margin: ${e=>e.hasToggleLabels?"0 10px":"0"};
`,Ut=i.ZP.label`
  background: none;
  padding: 0;
  opacity: ${e=>e.disabled?"0.4":"1"};
  outline: none;
  width: 48px;
  height: 28px;
  pointer-events: ${e=>e.disabled?"none":"inherit"};
`,Kt=i.ZP.div`
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
`,Qt=({disabled:e,...t})=>a.createElement("input",{className:"absolute left-0 top-0 w-12 h-8 opacity-0 m-0 "+(e?"cursor-not-allowed pointer-events-none":"cursor-pointer z-20"),...t});var en={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},tn=a.createContext&&a.createContext(en),nn=globalThis&&globalThis.__assign||function(){return nn=Object.assign||function(e){for(var t,n=1,a=arguments.length;n<a;n++)for(var r in t=arguments[n])Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e},nn.apply(this,arguments)},an=globalThis&&globalThis.__rest||function(e,t){var n={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var r=0;for(a=Object.getOwnPropertySymbols(e);r<a.length;r++)t.indexOf(a[r])<0&&Object.prototype.propertyIsEnumerable.call(e,a[r])&&(n[a[r]]=e[a[r]])}return n};function rn(e){return e&&e.map((function(e,t){return a.createElement(e.tag,nn({key:t},e.attr),rn(e.child))}))}function on(e){return function(t){return a.createElement(ln,nn({attr:nn({},e.attr)},t),rn(e.child))}}function ln(e){var t=function(t){var n,r=e.attr,i=e.size,o=e.title,l=an(e,["attr","size","title"]),s=i||t.size||"1em";return t.className&&(n=t.className),e.className&&(n=(n?n+" ":"")+e.className),a.createElement("svg",nn({stroke:"currentColor",fill:"currentColor",strokeWidth:"0"},t.attr,r,l,{className:n,style:nn(nn({color:e.color||t.color},t.style),e.style),height:s,width:s,xmlns:"http://www.w3.org/2000/svg"}),o&&a.createElement("title",null,o),e.children)};return void 0!==tn?a.createElement(tn.Consumer,null,(function(e){return t(e)})):t(en)}function sn(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",d:"M0 0h24v24H0V0z"}},{tag:"path",attr:{d:"M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"}}]})(e)}function cn(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",d:"M0 0h24v24H0z"}},{tag:"path",attr:{d:"M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"}}]})(e)}function dn(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",d:"M0 0h24v24H0V0z"}},{tag:"path",attr:{d:"M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46a.5.5 0 00-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.488.488 0 0014 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1a.566.566 0 00-.18-.03c-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46a.5.5 0 00.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"}}]})(e)}function mn(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",d:"M0 0h24v24H0V0z"}},{tag:"path",attr:{d:"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"}}]})(e)}function pn(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",d:"M0 0h24v24H0V0z",opacity:".87"}},{tag:"path",attr:{d:"M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z"}}]})(e)}const un="shadow appearance-none bg-white text-gray-600 block pl-3 pr-7 py-2 truncate w-full text-base cursor-pointer border-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md";function gn(e){return"object"===typeof e?e:{value:e,label:e}}function hn(e){return a.createElement("option",{key:e.value,value:e.value},e.label)}const wn=i.ZP.span`
  ${e=>"button"===e.variant?"position: relative;":""}
`,fn=i.ZP.div`
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
`,vn=i.ZP.div`
  display: flex;
  padding-top: 4px;
  ${e=>"button"===e.variant?"\n    min-height: calc(40px + 2px);\n    background-color: var(--tina-color-grey-0);\n    border-radius: var(--tina-radius-big);\n    box-shadow: var(--tina-shadow-small);\n    background-color: var(--tina-color-grey-0);\n    border: 1px solid var(--tina-color-grey-2);\n    color: var(--tina-color-primary);\n    padding: 3px;\n    box-shadow: 0 0 0 0 var(--tina-color-grey-3);\n    transition: all 85ms ease-out;\n    gap: 3px;\n    &:hover {\n      box-shadow: 0 0 0 2px var(--tina-color-grey-3);\n    }\n    &:focus-within, &:active {\n      box-shadow: 0 0 0 2px var(--tina-color-primary);\n    }\n  ":"\n    gap: 12px;\n    flex-wrap: wrap;\n  "}
  ${e=>"vertical"===e.direction?"flex-direction: column;":""}
`,bn=i.ZP.div`
  ${e=>"button"===e.variant?"\n      \n    flex: 1;\n    ":""}
  & > input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
`,xn=i.ZP.label`
  display: flex;
  align-items: center;
  font-size: var(--tina-font-size-1);
  ${e=>"button"===e.variant?"\n    flex: 1;\n    text-align: center;\n    border-radius: var(--tina-radius-big);\n    border: 1px solid var(--tina-color-grey-2);\n    color: var(--tina-color-primary);\n    font-weight: var(--tina-font-weight-regular);\n    cursor: pointer;\n    font-size: var(--tina-font-size-1);\n    height: calc(40px - 6px);\n    padding: 0 var(--tina-padding-small);\n    transition: all 85ms ease-out;\n    margin: 0;\n    border: none;\n    text-align: center;\n    justify-content: center;\n    input:checked + & {\n      color: var(--tina-color-grey-0);\n    }\n    &:hover {\n      background-color: var(--tina-color-grey-1);\n    }\n    &:active {\n      background-color: var(--tina-color-grey-2);\n    }\n  ":`\n  &:before {\n    content: '';\n    display: block;\n    width: 16px;\n    height: 16px;\n    margin-right: 4px;\n    border-radius: var(--tina-radius-big);\n    background-color: var(--tina-color-primary);\n    border: 1px solid var(${e=>e.checked?"--tina-color-primary":"--tina-color-grey-2"});\n    box-shadow: 0 0 0 0 var(--tina-color-grey-3), inset 0 0 0 8px white;\n    transition: all 85ms ease-out;\n  }\n  &:hover:before {\n    box-shadow: 0 0 0 2px var(--tina-color-grey-3), inset 0 0 0 8px white;\n  }\n  input:focus + &:before {\n    border: 1px solid var(--tina-color-grey-2);\n    box-shadow: 0 0 0 2px var(--tina-color-primary), inset 0 0 0 8px white;\n  }\n  input:checked + &:before {\n    border: 1px solid var(--tina-color-primary);\n    box-shadow: 0 0 0 0 var(--tina-color-primary), inset 0 0 0 4px white;\n  }\n  input:checked:focus + &:before {\n    border: 1px solid var(--tina-color-grey-2);\n    box-shadow: 0 0 0 2px var(--tina-color-primary), inset 0 0 0 4px white;\n  }\n  `}
`,yn=i.ZP.div`
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
`,En=i.ZP.div`
  flex: 1;

  & > input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
}
`,kn=i.ZP.label`
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
`,Cn=i.ZP.span`
  position: relative;
`,Nn=({...e})=>a.createElement("input",{className:st,...e}),zn=({onChange:e,value:t,step:n})=>a.createElement(Nn,{type:"number",step:n,value:t,onChange:e});function Sn(){return Ke()}const Mn=i.ZP.div`
  border-radius: var(--tina-radius-small);
  flex: 1;
  display: flex;
  flex-direction: column;
  outline: none;
  cursor: pointer;
`,Ln=i.ZP.div`
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
`,Fn=i.ZP.img`
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
  ${e=>{var t,n;return(null==e?void 0:e.src)&&((null==(t=null==e?void 0:e.src)?void 0:t.includes("png"))||(null==(n=null==e?void 0:e.src)?void 0:n.includes("svg")))?i.iv`
          background-image: none;
        `:i.iv`
          background-image: url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='40px' height='50px' viewBox='0 0 40 50' style='enable-background:new 0 0 40 50;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Cdefs%3E%3C/defs%3E%3Cpath class='st0' d='M16.09,24.97c-3.31,0.55-6.16-2.09-5.57-5.16c0.34-1.73,1.82-3.14,3.68-3.5c3.39-0.66,6.37,2.11,5.67,5.25 C19.48,23.28,17.96,24.66,16.09,24.97z M1.88,26.75c0-7.69,0-15.38,0-23.07C2,3.64,1.97,3.53,1.99,3.45c0.5-1.7,1.64-2.82,3.48-3.31 C5.57,0.12,5.71,0.14,5.75,0c7.31,0,14.63,0,21.94,0c0.03,0.1,0.12,0.08,0.2,0.1c0.96,0.2,1.77,0.63,2.47,1.28 c2.72,2.52,5.44,5.05,8.16,7.57c0.68,0.63,1.14,1.38,1.37,2.24c0.02,0.08-0.02,0.19,0.11,0.23c0,5.11,0,10.22,0,15.34h-4.76 c0-3.38,0-6.75,0-10.13c0-0.35-0.1-0.43-0.46-0.43c-3.21,0.01-6.42,0.01-9.63,0.01c-1.65,0-2.62-0.9-2.62-2.42 c0-2.94-0.01-5.89,0.01-8.83c0-0.46-0.14-0.54-0.6-0.53c-4.91,0.02-9.83,0.02-14.74,0c-0.44,0-0.57,0.09-0.57,0.52 c0.02,6.21,0.01,12.42,0.01,18.63c0,1.06,0,2.12,0,3.18H1.88z M27.28,11.46c0,0.31,0.14,0.34,0.41,0.34c2.25-0.01,4.5,0,6.75-0.01 c0.09,0,0.2,0.04,0.24,0c-2.46-2.28-4.92-4.56-7.39-6.85C27.29,7.1,27.3,9.28,27.28,11.46z M33.37,29.61c0,5.18-0.01,10.37,0,15.55 c0,0.35-0.1,0.43-0.46,0.43c-9.23-0.01-18.46-0.01-27.69,0c-0.44,0-0.45-0.17-0.45-0.48c0.01-5.17,0-10.33,0-15.5H0 c0,5.6,0,11.19,0,16.79c0.17,0.09,0.15,0.26,0.19,0.4c0.57,1.85,2.39,3.18,4.47,3.19c9.6,0.01,19.2,0.01,28.81,0 c2.08,0,3.89-1.33,4.47-3.19c0.04-0.14,0.02-0.31,0.19-0.4c0-5.6,0-11.19,0-16.79H33.37z M29.75,42.62c0.34,0,0.44-0.06,0.44-0.4 c-0.01-3.68-0.01-4.6-0.01-8.28c0-0.25-0.08-0.43-0.28-0.6c-0.62-0.55-1.22-1.13-1.83-1.69c-0.79-0.73-1.36-0.74-2.15-0.01 c-2.71,2.52-5.43,5.03-8.13,7.55c-0.26,0.25-0.39,0.24-0.65,0c-1.13-1.08-2.28-2.13-3.43-3.19c-0.7-0.65-1.31-0.65-2.01,0 c-1.16,1.07-2.31,2.15-3.48,3.22c-0.2,0.19-0.29,0.37-0.29,0.64c0.01,1.69,0.03,0.61,0,2.3c-0.01,0.41,0.14,0.46,0.53,0.46 c3.52-0.01,7.05-0.01,10.57-0.01C22.6,42.61,26.17,42.61,29.75,42.62z'/%3E%3C/svg%3E");
        `}}
`,$n=(0,i.ZP)(Je)`
  top: 8px;
  right: 8px;
  position: absolute;
  &:not(:hover) {
    fill: var(--tina-color-grey-0);
    background-color: transparent;
    border-color: transparent;
  }
`,Pn=i.ZP.div`
  position: relative;
  overflow: hidden;
  &:hover {
    ${Fn} {
      opacity: 0.6;
    }
  }
`,Bn=({onDrop:e,onClear:t,onClick:n,value:r,previewSrc:i,loading:o})=>{const l=Sn(),{getRootProps:s,getInputProps:c}=(0,x.u)({accept:l.media.accept||"image/*",onDrop:e,noClick:!!n});return a.createElement(Mn,{...s(),onClick:n},a.createElement("input",{...c()}),r?a.createElement(Pn,null,o?a.createElement(Tn,null):a.createElement(a.Fragment,null,a.createElement(Fn,{src:i}),t&&a.createElement(Hn,{onClick:e=>{e.stopPropagation(),t()}}))):a.createElement(Pn,null,o?a.createElement(Tn,null):a.createElement(Ln,null,"Drag 'n' drop a file here,",a.createElement("br",null),"or click to select a file")))},Hn=({onClick:e})=>a.createElement($n,{onClick:e},a.createElement(le,{className:"w-5/6 h-auto"})),Tn=()=>a.createElement(Dn,null,a.createElement(bt,null)),Dn=i.ZP.div`
  padding: 16px;
  width: 100%;
  min-height: 96px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`,Zn=(e,t)=>{const[n,r]=a.useState([]),[i,o]=a.useState(!0);return a.useEffect((()=>{e&&t.length>0?(async()=>{const n=await Promise.all(t.map((async t=>{try{return{collection:t,edges:(await e.api.tina.request("#graphql\n            query ($collection: String!){\n              collection(collection: $collection) {\n                documents {\n                  edges {\n                    node {\n                      ...on Node {\n                        id\n                      }\n                    }\n                  }\n                }\n              }\n            }\n            ",{variables:{collection:t}})).collection.documents.edges}}catch(n){return{collection:t,edges:[]}}})));r(n),o(!1)})():r([])}),[e,t]),{optionSets:n,loading:i}},Vn=({cms:e,input:t,field:n})=>{const{optionSets:r,loading:i}=Zn(e,n.collections);return!0===i?a.createElement(bt,{color:"var(--tina-color-primary)"}):a.createElement(a.Fragment,null,a.createElement("select",{id:t.name,value:t.value,onChange:t.onChange,className:un,...t},a.createElement("option",{value:""},"Choose an option"),r.length>0&&r.map((({collection:e,edges:t})=>a.createElement("optgroup",{key:`${e}-group`,label:e},t.map((({node:{id:e}})=>a.createElement("option",{key:`${e}-option`,value:e},e))))))),a.createElement(sn,{className:"absolute top-1/2 right-3 w-6 h-auto -translate-y-1/2 text-gray-300 group-hover:text-blue-500 transition duration-150 ease-out"}))};function In(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"}}]})(e)}function jn(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M13 19v-4h3l-4-5-4 5h3v4z"}},{tag:"path",attr:{d:"M7 19h2v-2H7c-1.654 0-3-1.346-3-3 0-1.404 1.199-2.756 2.673-3.015l.581-.102.192-.558C8.149 8.274 9.895 7 12 7c2.757 0 5 2.243 5 5v1h1c1.103 0 2 .897 2 2s-.897 2-2 2h-3v2h3c2.206 0 4-1.794 4-4a4.01 4.01 0 0 0-3.056-3.888C18.507 7.67 15.56 5 12 5 9.244 5 6.85 6.611 5.757 9.15 3.609 9.792 2 11.82 2 14c0 2.757 2.243 5 5 5z"}}]})(e)}function _n(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"m7 17.013 4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.583v4.43zM18.045 4.458l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58zM9 13.417l6.03-5.973 1.586 1.586-6.029 5.971L9 15.006v-1.589z"}},{tag:"path",attr:{d:"M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2z"}}]})(e)}function Rn(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M19.002 3h-14c-1.103 0-2 .897-2 2v4h2V5h14v14h-14v-4h-2v4c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.898-2-2-2z"}},{tag:"path",attr:{d:"m11 16 5-4-5-4v3.001H3v2h8z"}}]})(e)}function On(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M5.559 8.855c.166 1.183.789 3.207 3.087 4.079C11 13.829 11 14.534 11 15v.163c-1.44.434-2.5 1.757-2.5 3.337 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-1.58-1.06-2.903-2.5-3.337V15c0-.466 0-1.171 2.354-2.065 2.298-.872 2.921-2.896 3.087-4.079C19.912 8.441 21 7.102 21 5.5 21 3.57 19.43 2 17.5 2S14 3.57 14 5.5c0 1.552 1.022 2.855 2.424 3.313-.146.735-.565 1.791-1.778 2.252-1.192.452-2.053.953-2.646 1.536-.593-.583-1.453-1.084-2.646-1.536-1.213-.461-1.633-1.517-1.778-2.252C8.978 8.355 10 7.052 10 5.5 10 3.57 8.43 2 6.5 2S3 3.57 3 5.5c0 1.602 1.088 2.941 2.559 3.355zM17.5 4c.827 0 1.5.673 1.5 1.5S18.327 7 17.5 7 16 6.327 16 5.5 16.673 4 17.5 4zm-4 14.5c0 .827-.673 1.5-1.5 1.5s-1.5-.673-1.5-1.5.673-1.5 1.5-1.5 1.5.673 1.5 1.5zM6.5 4C7.327 4 8 4.673 8 5.5S7.327 7 6.5 7 5 6.327 5 5.5 5.673 4 6.5 4z"}}]})(e)}function An(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M12.707 17.293 8.414 13H18v-2H8.414l4.293-4.293-1.414-1.414L4.586 12l6.707 6.707z"}}]})(e)}function Yn(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"}}]})(e)}function Wn(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M4 21a1 1 0 0 0 .24 0l4-1a1 1 0 0 0 .47-.26L21 7.41a2 2 0 0 0 0-2.82L19.42 3a2 2 0 0 0-2.83 0L4.3 15.29a1.06 1.06 0 0 0-.27.47l-1 4A1 1 0 0 0 3.76 21 1 1 0 0 0 4 21zM18 4.41 19.59 6 18 7.59 16.42 6zM5.91 16.51 15 7.41 16.59 9l-9.1 9.1-2.11.52z"}}]})(e)}function Jn(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"}}]})(e)}function qn(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M10 11H7.101l.001-.009a4.956 4.956 0 0 1 .752-1.787 5.054 5.054 0 0 1 2.2-1.811c.302-.128.617-.226.938-.291a5.078 5.078 0 0 1 2.018 0 4.978 4.978 0 0 1 2.525 1.361l1.416-1.412a7.036 7.036 0 0 0-2.224-1.501 6.921 6.921 0 0 0-1.315-.408 7.079 7.079 0 0 0-2.819 0 6.94 6.94 0 0 0-1.316.409 7.04 7.04 0 0 0-3.08 2.534 6.978 6.978 0 0 0-1.054 2.505c-.028.135-.043.273-.063.41H2l4 4 4-4zm4 2h2.899l-.001.008a4.976 4.976 0 0 1-2.103 3.138 4.943 4.943 0 0 1-1.787.752 5.073 5.073 0 0 1-2.017 0 4.956 4.956 0 0 1-1.787-.752 5.072 5.072 0 0 1-.74-.61L7.05 16.95a7.032 7.032 0 0 0 2.225 1.5c.424.18.867.317 1.315.408a7.07 7.07 0 0 0 2.818 0 7.031 7.031 0 0 0 4.395-2.945 6.974 6.974 0 0 0 1.053-2.503c.027-.135.043-.273.063-.41H22l-4-4-4 4z"}}]})(e)}function Xn(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z"}}]})(e)}function Gn(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"}}]})(e)}const Un=(e,t)=>{const[n,r]=a.useState(void 0);return a.useEffect((()=>{e&&t?(async()=>{const n=await e.api.tina.request("#graphql\n        query($id: String!) {\n          node(id:$id) {\n            ... on Document {\n              _sys {\n                collection {\n                  name\n                }\n                breadcrumbs\n              }\n            }\n          }\n        }",{variables:{id:t}});r(n.node)})():r(void 0)}),[e,t]),n},Kn=({cms:e,id:t,children:n})=>{const r=Un(e,t);return r?a.createElement(a.Fragment,null,n(r)):null},Qn=({cms:e,input:t})=>!1!==e.flags.get("tina-admin")?a.createElement(Kn,{cms:e,id:t.value},(e=>a.createElement("a",{href:`/admin#/collections/${e._sys.collection.name}/${e._sys.breadcrumbs.join("/")}`,className:"text-gray-700 hover:text-blue-500 flex items-center uppercase text-sm mt-2 mb-2 leading-none"},a.createElement(_n,{className:"h-5 w-auto opacity-80 mr-2"}),"Edit in CMS"))):null;function ea(e){return on({tag:"svg",attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z"}}]})(e)}function ta(e){return on({tag:"svg",attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M256 93.09V32l-80 81.454 80 81.456v-61.093c65.996 0 120 54.982 120 122.183 0 20.363-5 39.714-14.004 57.016L391 342.547c15.996-25.457 25-54.988 25-86.547 0-89.599-72.002-162.91-160-162.91zm0 285.094c-66.001 0-120-54.988-120-122.184 0-20.363 5-39.709 13.999-57.02L121 169.454C104.999 193.89 96 224.436 96 256c0 89.599 72.002 162.91 160 162.91V480l80-81.453-80-81.457v61.094z"}}]})(e)}function na(e){return t=>a.createElement(aa,{name:t.input.name,label:t.field.label,description:t.field.description,error:t.meta.error},a.createElement(e,{...t}))}const aa=({name:e,label:t,description:n,error:r,margin:i=!0,children:o,...l})=>{const{dispatch:s}=rt("field:hover"),{dispatch:c}=rt("field:focus");return a.createElement(ra,{margin:i,onMouseOver:()=>s({fieldName:e}),onMouseOut:()=>s({fieldName:null}),onClick:()=>c({fieldName:e}),...l},a.createElement(ia,{name:e},t||e,n&&a.createElement(oa,null,n)),o,r&&"string"===typeof r&&a.createElement(la,null,r))},ra=({margin:e,children:t,...n})=>a.createElement("div",{className:"relative "+(e?"mb-5 last:mb-0":""),...n},t),ia=({children:e,className:t,name:n,...r})=>a.createElement("label",{htmlFor:n,className:`block font-sans text-xs font-semibold text-gray-700 whitespace-normal mb-2 ${t}`,...r},e),oa=({children:e,className:t,...n})=>a.createElement("span",{className:`block font-sans text-xs italic font-light text-gray-400 pt-0.5 whitespace-normal m-0 ${t}`,...n},e),la=({children:e,className:t,...n})=>a.createElement("span",{className:`block font-sans text-xs font-normal text-red-500 pt-2 whitespace-normal m-0 ${t}`,...n},e),sa=na((({tinaForm:e,field:t})=>{const n=Ke(),[r,i]=a.useState(!1);return a.createElement(a.Fragment,null,a.createElement(da,{onClick:()=>{!0!==e.finalForm.getState().invalid?i((e=>!e)):n.alerts.error("Cannot navigate away from an invalid form.")}},t.label||t.name),a.createElement(ca,{isExpanded:r,setExpanded:i,field:t,tinaForm:e}))})),ca=function({setExpanded:e,isExpanded:t,tinaForm:n,field:r}){const i=Ke(),o=kt(),l=a.useMemo((()=>r.fields.map((e=>({...e,name:`${r.name}.${e.name}`})))),[r.fields,r.name]);return a.createElement(o,null,(({zIndexShift:o})=>a.createElement(ga,{isExpanded:t,style:{zIndex:o+1e3}},a.createElement(ma,{onClick:()=>{!0!==n.finalForm.getState().invalid?e(!1):i.alerts.error("Cannot navigate away from an invalid form.")}},r.label||r.name),a.createElement(pa,{id:n.id},t?a.createElement(ht,{form:n,fields:l}):null))))},da=({onClick:e,children:t})=>a.createElement("div",{className:"pt-1 mb-5"},a.createElement("button",{onClick:e,className:"group px-4 py-3 bg-white hover:bg-gray-50 shadow focus:shadow-outline focus:border-blue-500 w-full border border-gray-100 hover:border-gray-200 text-gray-500 hover:text-blue-400 focus:text-blue-500 rounded-md flex justify-between items-center gap-2"},a.createElement("span",{className:"text-left text-base font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1"},t)," ",a.createElement(Wn,{className:"h-6 w-auto transition-opacity duration-150 ease-out opacity-80 group-hover:opacity-90"}))),ma=({onClick:e,children:t})=>a.createElement("button",{className:"relative z-40 group text-left w-full bg-white hover:bg-gray-50 py-2 border-t border-b shadow-sm\n       border-gray-100 px-6 -mt-px",onClick:e},a.createElement("div",{className:"flex items-center justify-between gap-3 text-xs tracking-wide font-medium text-gray-700 group-hover:text-blue-400 uppercase max-w-form mx-auto"},t,a.createElement(ea,{className:"h-auto w-5 inline-block opacity-70 -mt-0.5 -mx-0.5"}))),pa=({id:e,children:t})=>a.createElement("div",{style:{flex:"1 1 0%",width:"100%",overflowY:"auto",background:"var(--tina-color-grey-1)"}},a.createElement(Ht,{id:e},t)),ua=i.F4`
  0% {
    transform: translate3d( 100%, 0, 0 );
  }
  100% {
    transform: translate3d( 0, 0, 0 );
  }
`,ga=i.ZP.div`
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
    ${e=>e.isExpanded&&i.iv`
        animation-name: ${ua};
        animation-duration: 150ms;
        animation-delay: 0;
        animation-iteration-count: 1;
        animation-timing-function: ease-out;
        animation-fill-mode: backwards;
      `};

    ${e=>!e.isExpanded&&i.iv`
        transition: transform 150ms ease-out;
        transform: translate3d(100%, 0, 0);
      `};
  }
`;const ha={name:"group",Component:sa},wa=()=>a.createElement(ka,null,"There are no items"),fa=({tinaForm:e,field:t,index:n,item:r,label:i,...o})=>{const l=Ke(),s=kt(),[c,d]=a.useState(!1),m=a.useCallback((()=>{e.mutators.remove(t.name,n)}),[e,t,n]),p=i||(t.label||t.name)+" Item",{dispatch:u}=rt("field:hover"),{dispatch:g}=rt("field:focus");return a.createElement(b._l,{type:t.name,draggableId:`${t.name}.${n}`,index:n},((r,i)=>a.createElement(a.Fragment,null,a.createElement(Ca,{provider:r,isDragging:i.isDragging,...o},a.createElement(za,{isDragging:i.isDragging}),a.createElement(va,{onMouseOver:()=>u({fieldName:`${t.name}.${n}`}),onMouseOut:()=>u({fieldName:null}),onClick:()=>{!0!==e.finalForm.getState().invalid?(d(!0),g({fieldName:`${t.name}.${n}`})):l.alerts.error("Cannot navigate away from an invalid form.")}},a.createElement(ba,null,p),a.createElement(Wn,{className:"h-5 w-auto fill-current text-gray-200 group-hover:text-inherit transition-colors duration-150 ease-out"})),a.createElement(Na,{onClick:m})),a.createElement(s,null,(({zIndexShift:r})=>a.createElement(Sa,{isExpanded:c,setExpanded:d,field:t,index:n,tinaForm:e,itemTitle:p,zIndexShift:r}))))))},va=({children:e,...t})=>a.createElement("div",{className:"group text-gray-400 hover:text-blue-600 flex-1 min-w-0 relative flex justify-between items-center p-2",...t},e),ba=({error:e,children:t})=>a.createElement("span",{className:"m-0 text-xs font-semibold flex-1 text-ellipsis overflow-hidden transition-all ease-out duration-100 text-left "+(e?"text-red-500":"text-gray-600 group-hover:text-inherit")},t),xa=({children:e})=>a.createElement("span",{className:"relative flex w-full justify-between items-center mb-2"},e),ya=({children:e})=>a.createElement("div",{className:"leading-none w-full flex-1 flex justify-between items-center gap-2"},e),Ea=({children:e})=>a.createElement("div",{className:"relative mb-6 rounded-md bg-gray-100 shadow"},e),ka=({children:e})=>a.createElement("div",{className:"text-center rounded bg-gray-100 text-gray-400 p-3 text-sm italic font-regular"},e),Ca=({isDragging:e,children:t,provider:n,...r})=>a.createElement("div",{className:"relative group cursor-pointer flex justify-between items-stretch bg-white border border-gray-100 -mb-px overflow-visible p-0 text-sm font-normal "+(e?"rounded shadow text-blue-600":"text-gray-600 first:rounded-t last:rounded-b"),ref:n.innerRef,...n.draggableProps,...n.dragHandleProps,...r},t),Na=({onClick:e})=>a.createElement("button",{className:"w-8 px-1 py-2.5 flex items-center justify-center hover:bg-gray-50 text-gray-200 hover:text-red-500",onClick:e},a.createElement(le,{className:"fill-current transition-colors ease-out duration-100"})),za=({isDragging:e})=>a.createElement("div",{className:"relative w-8 px-1 py-2.5 flex items-center justify-center hover:bg-gray-50 group cursor-[grab] "+(e?"text-blue-500":"text-gray-200 hover:text-gray-600")},e?a.createElement(se,{className:"fill-current w-7 h-auto"}):a.createElement(a.Fragment,null,a.createElement(ae,{className:"fill-current w-7 h-auto group-hover:opacity-0 transition-opacity duration-150 ease-out"}),a.createElement(se,{className:"fill-current w-7 h-auto absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out"}))),Sa=function({setExpanded:e,isExpanded:t,tinaForm:n,field:r,index:i,itemTitle:o,zIndexShift:l}){const s=Ke(),c=a.useMemo((()=>r.fields.map((e=>({...e,name:`${r.name}.${i}.${e.name}`})))),[r.fields,r.name,i]);return a.createElement(ga,{isExpanded:t,style:{zIndex:l+1e3}},a.createElement(ma,{onClick:()=>{!0!==n.finalForm.getState().invalid?e(!1):s.alerts.error("Cannot navigate away from an invalid form.")}},o),a.createElement(pa,{id:n.id},t?a.createElement(ht,{form:n,fields:c}):null))},Ma={name:"group-list",Component:({tinaForm:e,form:t,field:n,input:r})=>{const i=a.useCallback((()=>{let e={};e="function"===typeof n.defaultItem?n.defaultItem():n.defaultItem||{},t.mutators.insert(n.name,0,e)}),[t,n]),o=r.value||[],l=a.useCallback((e=>n.itemProps?n.itemProps(e):{}),[n.itemProps]);return a.createElement(a.Fragment,null,a.createElement(xa,null,a.createElement(ya,null,a.createElement(ba,null,n.label||n.name),n.description&&a.createElement(oa,{className:"whitespace-nowrap text-ellipsis overflow-hidden"},n.description)),a.createElement(Je,{onClick:i,variant:"primary",size:"small"},a.createElement(U,{className:"w-5/6 h-auto"}))),a.createElement(Ea,null,a.createElement("div",null,a.createElement(b.bK,{droppableId:n.name,type:n.name},(t=>a.createElement("div",{ref:t.innerRef},0===o.length&&a.createElement(wa,null),o.map(((t,r)=>a.createElement(fa,{key:r,tinaForm:e,field:n,item:t,index:r,...l(t)}))),t.placeholder))))))}},La=({templates:e,addItem:t})=>{const n=a.useMemo((()=>Object.entries(e).length>6),[e]),[r,i]=a.useState(""),o=a.useMemo((()=>Object.entries(e).filter((([e,t])=>t.label&&t.label.toLowerCase().includes(r.toLowerCase())||e.toLowerCase().includes(r.toLowerCase())))),[r]);return a.createElement(l.J,null,(({open:e})=>a.createElement(a.Fragment,null,a.createElement(l.J.Button,{as:"span"},a.createElement(Je,{variant:e?"secondary":"primary",size:"small",className:""+(e?"rotate-45 pointer-events-none":"")},a.createElement(U,{className:"w-5/6 h-auto"}))),a.createElement("div",{className:"transform translate-y-full absolute -bottom-1 right-0 z-50"},a.createElement(s.u,{enter:"transition duration-150 ease-out",enterFrom:"transform opacity-0 -translate-y-2",enterTo:"transform opacity-100 translate-y-0",leave:"transition duration-75 ease-in",leaveFrom:"transform opacity-100 translate-y-0",leaveTo:"transform opacity-0 -translate-y-2"},a.createElement(l.J.Panel,{className:"relative overflow-hidden rounded-lg shadow-lg bg-white border border-gray-100"},(({close:e})=>a.createElement("div",{className:"min-w-[192px] max-h-[24rem] overflow-y-auto flex flex-col w-full h-full"},n&&a.createElement("div",{className:"sticky top-0 bg-gray-50 p-2 border-b border-gray-100 z-10"},a.createElement("input",{type:"text",className:"bg-white text-xs rounded-sm border border-gray-100 shadow-inner py-1 px-2 w-full block placeholder-gray-200",onClick:e=>{e.stopPropagation(),e.preventDefault()},value:r,onChange:e=>{i(e.target.value)},placeholder:"Filter..."})),0===o.length&&a.createElement("span",{className:"relative text-center text-xs px-2 py-3 text-gray-300 bg-gray-50 italic"},"No matches found"),o.length>0&&o.map((([n,r])=>a.createElement("button",{className:"relative text-center text-xs py-2 px-4 border-l-0 border-t-0 border-r-0 border-b border-gray-50 w-full outline-none transition-all ease-out duration-150 hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50",key:n,onClick:()=>{t(n,r),i(""),e()}},r.label?r.label:n)))))))))))},Fa=({templates:e,addItem:t,label:n})=>{const r=kt(),[i,o]=a.useState(!1),l=a.useMemo((()=>Object.entries(e).length>6),[e]),[c,d]=a.useState(""),m=a.useMemo((()=>Object.entries(e).filter((([e,t])=>t.label&&t.label.toLowerCase().includes(c.toLowerCase())||e.toLowerCase().includes(c.toLowerCase())))),[c]),p=a.useMemo((()=>[...new Set(Object.entries(e).filter((([e,t])=>!!t.category&&t.category)).map((([e,t])=>t.category)))]),[e]),u=a.useMemo((()=>Object.entries(e).filter((([e,t])=>!t.category)).length>0),[e]),g=a.useMemo((()=>m.filter((([e,t])=>!t.category))),[m]),h=(e,n)=>{e&&n&&t(e,n),d(""),o(!1)};return a.createElement(a.Fragment,null,a.createElement(Je,{variant:i?"secondary":"primary",size:"small",className:""+(i?"rotate-45 pointer-events-none":""),onClick:()=>o(!i)},a.createElement(U,{className:"w-5/6 h-auto"})),a.createElement(r,null,(({zIndexShift:e})=>a.createElement(s.u,{show:i},a.createElement(s.u.Child,{as:a.Fragment,enter:"transform transition-all ease-out duration-200",enterFrom:"opacity-0 -translate-x-1/2",enterTo:"opacity-100 translate-x-0",leave:"transform transition-all ease-in duration-150",leaveFrom:"opacity-100 translate-x-0",leaveTo:"opacity-0 -translate-x-1/2"},a.createElement("div",{className:"absolute left-0 top-0 z-panel h-full w-full transform bg-gray-50",style:{zIndex:e+1e3}},a.createElement(ma,{onClick:()=>{o(!1)}},n," \u2060\u2013 Add New"),a.createElement("div",{className:"h-full overflow-y-auto max-h-full bg-gray-50 pt-4 px-6 pb-12"},a.createElement("div",{className:"w-full flex justify-center"},a.createElement("div",{className:"w-full max-w-form"},l&&a.createElement("div",{className:"block relative group mb-1"},a.createElement("input",{type:"text",className:"shadow-inner focus:shadow-outline focus:border-blue-400 focus:outline-none block text-sm pl-2.5 pr-8 py-1.5 text-gray-600 w-full bg-white border border-gray-200 focus:text-gray-900 rounded-md placeholder-gray-400 hover:placeholder-gray-600 transition-all ease-out duration-150",onClick:e=>{e.stopPropagation(),e.preventDefault()},value:c,onChange:e=>{d(e.target.value)},placeholder:"Search"}),""===c?a.createElement(Gn,{className:"absolute right-3 top-1/2 -translate-y-1/2 w-5 h-auto text-blue-500 opacity-70 group-hover:opacity-100 transition-all ease-out duration-150"}):a.createElement("button",{onClick:()=>{d("")},className:"outline-none focus:outline-none bg-transparent border-0 p-0 m-0 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-all ease-out duration-150"},a.createElement(mn,{className:"w-5 h-auto text-gray-600"}))),0===g.length&&0===p.length&&a.createElement(Ha,null,"No blocks to display."),g.length>0&&0===p.length&&a.createElement(Pa,{className:"pt-3"},g.map((([e,t])=>a.createElement(Ba,{key:`${t}-${e}`,close:h,name:e,template:t})))),p.map(((e,t)=>a.createElement($a,{key:t,templates:m.filter((([t,n])=>!(!n.category||n.category!==e))),category:e,isLast:t===p.length-1&&!u,close:h}))),u&&0===g.length&&a.createElement("div",{className:"relative text-gray-500 block text-left w-full text-base font-bold tracking-wide py-2 truncate pointer-events-none opacity-50"},"Uncategorized"),g.length>0&&p.length>0&&a.createElement($a,{templates:g,category:"Uncategorized",close:h,isLast:!0}))))))))))},$a=({category:e,templates:t,close:n,isLast:r=!1})=>a.createElement(c.p,{defaultOpen:!0,as:"div",className:"left-0 right-0 relative"},(({open:i})=>a.createElement(a.Fragment,null,a.createElement(c.p.Button,{className:`relative block group text-left w-full text-base font-bold tracking-wide py-2 truncate ${0===t.length?"pointer-events-none":""} ${!r&&(!i||0===t.length)&&"border-b border-gray-100"}`},a.createElement("span",{className:"text-gray-500 group-hover:text-gray-800 transition-all ease-out duration-150 "+(0===t.length?"opacity-50":"")},e),t.length>0&&a.createElement(sn,{className:"absolute top-1/2 right-0 w-6 h-auto -translate-y-1/2 text-gray-300 origin-center group-hover:text-blue-500 transition-all duration-150 ease-out "+(i?"":"-rotate-90 opacity-70 group-hover:opacity-100")})),a.createElement(s.u,{enter:"transition duration-100 ease-out",enterFrom:"transform scale-95 opacity-0",enterTo:"transform scale-100 opacity-100",leave:"transition duration-75 ease-out",leaveFrom:"transform scale-100 opacity-100",leaveTo:"transform scale-95 opacity-0"},a.createElement(c.p.Panel,null,t.length>0&&a.createElement(Pa,null,t.map((([e,t])=>a.createElement(Ba,{close:n,name:e,template:t}))))))))),Pa=({children:e,className:t=""})=>a.createElement("div",{className:`w-full mb-1 -mt-2 ${t}`,style:{columns:"320px",columnGap:"16px"}},e),Ba=({close:e,name:t,template:n})=>a.createElement("button",{className:"mb-2 mt-2 group relative text-xs font-bold border border-gray-100 w-full outline-none transition-all ease-out duration-150 hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50 rounded-md bg-white shadow overflow-hidden",style:{breakInside:"avoid",transform:"translateZ(0)"},key:t,onClick:()=>{e(t,n)}},n.previewSrc&&a.createElement("img",{src:n.previewSrc,className:"w-full h-auto transition-all ease-out duration-150 group-hover:opacity-50"}),a.createElement("span",{className:"relative flex justify-between items-center gap-4 w-full px-4 text-left "+(n.previewSrc?"py-2 border-t border-gray-100 ":"py-3")},n.label?n.label:t,a.createElement(U,{className:"w-5 h-auto group-hover:text-blue-500 opacity-30 transition-all ease-out duration-150 group-hover:opacity-80"}))),Ha=({children:e})=>a.createElement("div",{className:"block relative text-gray-300 italic py-1"},e),Ta=({label:e,tinaForm:t,field:n,index:r,template:i,block:o})=>{const l=Ke(),s=kt(),[c,d]=a.useState(!1),m=a.useCallback((()=>{t.mutators.remove(n.name,r)}),[t,n,r]),{dispatch:p}=rt("field:hover"),{dispatch:u}=rt("field:focus");return a.createElement(b._l,{key:r,type:n.name,draggableId:`${n.name}.${r}`,index:r},((g,h)=>a.createElement(a.Fragment,null,a.createElement(Ca,{provider:g,isDragging:h.isDragging},a.createElement(za,{isDragging:h.isDragging}),a.createElement(va,{onClick:()=>{!0!==t.finalForm.getState().invalid?(d(!0),u({fieldName:`${n.name}.${r}`})):l.alerts.error("Cannot navigate away from an invalid form.")},onMouseOver:()=>p({fieldName:`${n.name}.${r}`}),onMouseOut:()=>p({fieldName:null})},a.createElement(ba,null,e||i.label),a.createElement(Wn,{className:"h-5 w-auto fill-current text-gray-200 group-hover:text-inherit transition-colors duration-150 ease-out"})),a.createElement(Na,{onClick:m})),a.createElement(s,null,(({zIndexShift:l})=>a.createElement(Za,{zIndexShift:l,isExpanded:c,setExpanded:d,field:n,item:o,index:r,tinaForm:t,label:e||i.label,template:i}))))))},Da=({tinaForm:e,field:t,index:n})=>{const r=a.useCallback((()=>{e.mutators.remove(t.name,n)}),[e,t,n]);return a.createElement(b._l,{key:n,type:t.name,draggableId:`${t.name}.${n}`,index:n},((e,t)=>a.createElement(Ca,{provider:e,isDragging:t.isDragging},a.createElement(za,{isDragging:t.isDragging}),a.createElement(va,null,a.createElement(ba,{error:!0},"Invalid Block")),a.createElement(Na,{onClick:r}))))},Za=function({setExpanded:e,isExpanded:t,tinaForm:n,field:r,index:i,label:o,template:l,zIndexShift:s}){const c=Ke(),d=a.useMemo((()=>l.fields?l.fields.map((e=>({...e,name:`${r.name}.${i}.${e.name}`}))):[]),[r.name,i,l.fields]);return a.createElement(ga,{isExpanded:t,style:{zIndex:s+1e3}},a.createElement(ma,{onClick:()=>{!0!==n.finalForm.getState().invalid?e(!1):c.alerts.error("Cannot navigate away from an invalid form.")}},o),a.createElement(pa,{id:n.id},t?a.createElement(ht,{form:n,fields:d}):null))},Va={name:"blocks",Component:({tinaForm:e,form:t,field:n,input:r})=>{const i=a.useCallback(((e,a)=>{let r={};r="function"===typeof a.defaultItem?a.defaultItem():a.defaultItem||{},r._template=e,t.mutators.insert(n.name,0,r)}),[n.name,t.mutators]),o=r.value||[];return a.createElement(a.Fragment,null,a.createElement(xa,null,a.createElement(ya,null,a.createElement(ba,null,n.label||n.name),n.description&&a.createElement(oa,null,n.description)),!n.visualSelector&&a.createElement(La,{templates:n.templates,addItem:i}),n.visualSelector&&a.createElement(Fa,{label:n.label||n.name,templates:n.templates,addItem:i})),a.createElement(Ea,null,a.createElement(b.bK,{droppableId:n.name,type:n.name},(t=>a.createElement("div",{ref:t.innerRef,className:"edit-page--list-parent"},0===o.length&&a.createElement(wa,null),o.map(((t,r)=>{const i=n.templates[t._template];if(!i)return a.createElement(Da,{key:r,index:r,field:n,tinaForm:e});return a.createElement(Ta,{key:r,block:t,template:i,index:r,field:n,tinaForm:e,...(o=t,i.itemProps?i.itemProps(o):{})});var o})),t.placeholder)))))}},Ia=e=>e||"",ja={name:"color",Component:na((({input:e,field:t})=>a.createElement(qt,{colorFormat:t.colorFormat,userColors:t.colors,widget:t.widget,input:e}))),parse:Ia},_a=()=>a.createElement(Ja,null,"There are no items"),Ra=({tinaForm:e,field:t,index:n,item:r,label:i,...o})=>{const l=a.useCallback((()=>{e.mutators.remove(t.name,n)}),[e,t,n]),s=[{type:t.type,list:t.list,parentTypename:t.parentTypename,...t.field,label:"Value",name:t.name+"."+n}];return a.createElement(b._l,{type:t.name,draggableId:`${t.name}.${n}`,index:n},((t,n)=>a.createElement(Ca,{provider:t,isDragging:n.isDragging,...o},a.createElement(za,{isDragging:n.isDragging}),a.createElement(va,null,a.createElement(ht,{padding:!1,form:e,fields:s})),a.createElement(Na,{onClick:l}))))},Oa=i.ZP.span`
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

  ${e=>e.error&&i.iv`
      color: var(--tina-color-error) !important;
    `};
`,Aa=i.ZP.div`
  position: relative;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`,Ya=i.ZP.div`
  line-height: 1;
`,Wa=i.ZP.div`
  max-height: initial;
  position: relative;
  height: auto;
  margin-bottom: 24px;
  border-radius: var(--tina-radius-small);
  background-color: var(--tina-color-grey-2);
`,Ja=i.ZP.div`
  text-align: center;
  border-radius: var(--tina-radius-small);
  background-color: var(--tina-color-grey-2);
  color: var(--tina-color-grey-4);
  line-height: 1.35;
  padding: 12px 0;
  font-size: var(--tina-font-size-2);
  font-weight: var(--tina-font-weight-regular);
`,qa=i.ZP.div``,Xa={name:"list",Component:({tinaForm:e,form:t,field:n,input:r})=>{const i=a.useCallback((()=>{let e="";"function"===typeof n.defaultItem?e=n.defaultItem():"undefined"!==typeof n.defaultItem&&(e=n.defaultItem),t.mutators.insert(n.name,0,e)}),[t,n]),o=r.value||[],l=a.useCallback((e=>n.itemProps?n.itemProps(e):{}),[n.itemProps]);return a.createElement(a.Fragment,null,a.createElement(Aa,null,a.createElement(Ya,null,a.createElement(Oa,null,n.label||n.name),n.description&&a.createElement(oa,{className:"whitespace-nowrap text-ellipsis overflow-hidden"},n.description)),a.createElement(Je,{onClick:i,variant:"primary",size:"small"},a.createElement(U,{className:"w-5/6 h-auto"}))),a.createElement(Wa,null,a.createElement(qa,null,a.createElement(b.bK,{droppableId:n.name,type:n.name},(t=>a.createElement("div",{ref:t.innerRef},0===o.length&&a.createElement(_a,null),o.map(((t,r)=>a.createElement(Ra,{key:r,tinaForm:e,field:n,item:t,index:r,...l(t)}))),t.placeholder))))))}};const Ga={name:"image",Component:na((e=>{const t=Ke(),{form:n,field:r}=e,{name:i,value:o}=e.input,[l,s]=function(e,t,n,r){const i=Ke(),o=r||i.media.previewSrc,[{src:l,loading:s},c]=(0,a.useState)({src:"",loading:!0});return(0,a.useEffect)((()=>{let a=!1,r="";return(async()=>{try{r=await o(e,t,n)}catch{}a||c({src:r,loading:!1})})(),()=>{a=!0}}),[e]),[l,s]}(o,i,n.getState().values,r.previewSrc),[c,d]=(0,a.useState)(!1);let m;async function p(n){var a,r;if(n){const i="function"===typeof(null==(r=null==(a=null==t?void 0:t.media)?void 0:a.store)?void 0:r.parse)?t.media.store.parse(n):n;e.input.onChange(i)}}e.field.clearable&&(m=()=>e.input.onChange(""));const u=e.field.uploadDir||(()=>"");return a.createElement(Bn,{value:o,previewSrc:l,loading:c||s,onClick:()=>{const n=u(e.form.getState().values);t.media.open({allowDelete:!0,directory:n,onSelect:p})},onDrop:async([n])=>{d(!0);const a=u(e.form.getState().values),[r]=await t.media.persist([{directory:a,file:n}]);if(r)try{await p(r)}catch(i){console.error("Error uploading media asset: ",i)}finally{d(!1)}},onClear:m})})),parse:Ia};var Ua=a.forwardRef((function(e,t){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor","aria-hidden":"true",ref:t},e),a.createElement("path",{fillRule:"evenodd",d:"M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z",clipRule:"evenodd"}))}));function Ka(...e){return e.filter(Boolean).join(" ")}const Qa=()=>([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,(e=>(e^crypto.getRandomValues(new Uint8Array(1))[0]&15>>e/4).toString(16)));function er({label:e,items:t}){return a.createElement(d.v,{as:"div",className:"relative inline-block text-left z-20"},a.createElement("div",null,a.createElement(d.v.Button,{className:"inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"},e,a.createElement(Ua,{className:"-mr-1 ml-2 h-4 w-4","aria-hidden":"true"}))),a.createElement(s.u,{as:a.Fragment,enter:"transition ease-out duration-100",enterFrom:"transform opacity-0 scale-95",enterTo:"transform opacity-100 scale-100",leave:"transition ease-in duration-75",leaveFrom:"transform opacity-100 scale-100",leaveTo:"transform opacity-0 scale-95"},a.createElement(d.v.Items,{className:"origin-top-right absolute right-0 mt-2 w-32 h-64 overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"},a.createElement("div",{className:"py-1"},t.map((e=>a.createElement(d.v.Item,{key:e.key},(({active:t})=>a.createElement("button",{onClick:e.onClick,className:Ka(t?"bg-gray-100 text-gray-900":"text-gray-700","block px-4 py-2 text-xs w-full text-right")},e.render)))))))))}const tr=({attributes:e,editor:t,element:n,...r})=>{const i=Object.entries(N.ky).map((([e,a])=>({key:e,onClick:()=>(e=>{const a=F.F3.findPath(t,n);(0,y.fLV)(t,{lang:e},{at:a})})(e),render:a})));return a.createElement("div",{className:"relative mb-2 mt-0.5"},a.createElement("div",{style:{userSelect:"none"},contentEditable:!1,className:"absolute top-1 right-1"},a.createElement("div",{className:"flex w-full"},a.createElement("div",null),a.createElement(er,{label:N.ky[n.lang]||"Language",items:i}))),a.createElement("pre",{...e,className:"pt-10 m-0"},a.createElement("code",{...r})))},nr="mt-0.5",ar="font-normal",rr={heading:a.createElement(sr,null),link:a.createElement(mr,null),quote:a.createElement(dr,null),image:a.createElement(gr,null),ul:a.createElement(lr,null),ol:a.createElement(cr,null),code:a.createElement(pr,null),codeBlock:a.createElement(ur,null),bold:a.createElement(hr,null),italic:a.createElement(wr,null)},ir=({name:e})=>rr[e],or=({title:e})=>a.createElement(a.Fragment,null,e&&a.createElement("span",{className:"sr-only"},e),a.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"})));function lr(e){const t=e.title||"format list bulleted";return a.createElement("svg",{className:"h-5 w-5",height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},a.createElement("title",null,t),a.createElement("g",{fill:"none"},a.createElement("path",{d:"M7 5h14v2H7V5z",fill:"currentColor"}),a.createElement("path",{d:"M4 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",fill:"currentColor"}),a.createElement("path",{d:"M7 11h14v2H7v-2zm0 6h14v2H7v-2zm-3 2.5c.82 0 1.5-.68 1.5-1.5s-.67-1.5-1.5-1.5-1.5.68-1.5 1.5.68 1.5 1.5 1.5z",fill:"currentColor"}),a.createElement("path",{d:"M4 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",fill:"currentColor"})))}function sr(e){const t=e.title||"format size";return a.createElement("svg",{height:"24",width:"24",className:"h-5 w-5",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},a.createElement("title",null,t),a.createElement("g",{fill:"none"},a.createElement("path",{d:"M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z",fill:"currentColor"})))}function cr(e){const t=e.title||"format list numbered";return a.createElement("svg",{className:"h-5 w-5",height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},a.createElement("title",null,t),a.createElement("g",{fill:"none"},a.createElement("path",{d:"M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z",fill:"currentColor"})))}function dr(e){const t=e.title||"format quote";return a.createElement("svg",{height:"24",className:"h-5 w-5",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},a.createElement("title",null,t),a.createElement("g",{fill:"none"},a.createElement("path",{d:"M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z",fill:"currentColor"})))}function mr(e){const t=e.title||"insert link";return a.createElement("svg",{height:"24",className:"h-5 w-5",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},a.createElement("title",null,t),a.createElement("g",{fill:"none"},a.createElement("path",{d:"M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",fill:"currentColor"})))}function pr(e){const t=e.title||"code";return a.createElement("svg",{className:"h-5 w-5",height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},a.createElement("title",null,t),a.createElement("g",{fill:"none"},a.createElement("path",{d:"M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",fill:"currentColor"})))}function ur(e){return e.title,a.createElement("svg",{className:"h-5 w-5",stroke:"currentColor",fill:"currentColor",strokeWidth:0,viewBox:"0 0 16 16",height:"1em",width:"1em",xmlns:"http://www.w3.org/2000/svg"},a.createElement("path",{d:"M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"}),a.createElement("path",{d:"M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z"}))}function gr(e){const t=e.title||"image";return a.createElement("svg",{className:"h-5 w-5",height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},a.createElement("title",null,t),a.createElement("g",{fill:"none"},a.createElement("path",{d:"M19 5v14H5V5h14zm0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z",fill:"currentColor"})))}function hr(e){const t=e.title||"format bold";return a.createElement("svg",{className:"h-5 w-5",height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},a.createElement("title",null,t),a.createElement("g",{fill:"none"},a.createElement("path",{d:"M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z",fill:"currentColor"})))}function wr(e){const t=e.title||"format italic";return a.createElement("svg",{className:"h-5 w-5",height:"24",width:"24",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},a.createElement("title",null,t),a.createElement("g",{fill:"none"},a.createElement("path",{d:"M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z",fill:"currentColor"})))}function fr({className:e=""}){return a.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",className:`h-4 w-4 ${e}`,viewBox:"0 0 20 20",fill:"currentColor"},a.createElement("path",{fillRule:"evenodd",d:"M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z",clipRule:"evenodd"}))}const vr=e=>{const t=kt(),n=a.useMemo((()=>Qa()),[e.id]),r=a.useMemo((()=>new Qe({...e,id:n,onChange:({values:t})=>{e.onChange(t)},onSubmit:()=>{}})),[n]);return a.createElement(t,null,(({zIndexShift:t})=>a.createElement(ga,{isExpanded:!0,style:{zIndex:t+1e3}},a.createElement(ma,{onClick:e.onClose},e.label),a.createElement(Pt,{form:r,hideFooter:!0}))))},br=(e,t)=>{const n=(0,F.vt)();a.useEffect((()=>{const a=a=>{n&&(0,P.ZP)(e,a)&&(a.preventDefault(),t())};return document.addEventListener("keydown",a),()=>document.removeEventListener("keydown",a)}),[n])},xr=(e,t)=>{const[n,r]=a.useState(!1);return{isExpanded:n,handleClose:()=>{r(!1),((e,t)=>{const n=F.F3.findPath(e,t),a=F.F3.toDOMNode(e,e);a&&(a.focus(),setTimeout((()=>{$.YR.select(e,n)}),1))})(e,t)},handleRemove:()=>{((e,t)=>{const n=F.F3.findPath(e,t);$.YR.removeNodes(e,{at:n})})(e,t)},handleSelect:e=>{e.preventDefault(),r(!0)}}},yr=a.createContext({templates:[]}),Er=()=>{const{templates:e}=a.useContext(yr);return e},kr=({inline:e,children:t})=>{const n=e?"span":"div";return a.createElement(n,{contentEditable:!1,style:{userSelect:"none"},className:"relative"},t)},Cr=({attributes:e,children:t,element:n,onChange:r,editor:i})=>{const o=(0,F.vt)(),{handleClose:l,handleRemove:s,handleSelect:c,isExpanded:d}=xr(i,n);br("enter",(()=>{(0,y.s2K)(i,[{type:C.J,children:[{text:""}]}])})),br("space",(()=>{(0,y.s2K)(i,[{text:" "}],{match:e=>{if($.W_.isElement(e)&&e.type===qr)return!0},select:!0})}));const m=Er().find((e=>e.name===n.name)),p={activeTemplate:m,element:n,editor:i,onChange:r,onClose:l};return m?a.createElement("span",{...e},t,a.createElement(kr,{inline:!0},a.createElement("span",{style:{margin:"0 0.5px"},className:"relative inline-flex shadow-sm rounded-md leading-none"},o&&a.createElement("span",{className:"absolute inset-0 ring-2 ring-blue-100 ring-inset rounded-md z-10 pointer-events-none"}),a.createElement("span",{style:{fontWeight:"inherit"},className:"cursor-pointer relative inline-flex items-center justify-start px-2 py-0.5 rounded-l-md border border-gray-200 bg-white  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",onMouseDown:c},m.label||m.name),a.createElement(Sr,{onOpen:c,onRemove:s})),d&&a.createElement(zr,{...p}))):null},Nr=({attributes:e,children:t,element:n,editor:r,onChange:i})=>{const o=(0,F.vt)(),{handleClose:l,handleRemove:s,handleSelect:c,isExpanded:d}=xr(r,n);br("enter",(()=>{(0,y.s2K)(r,[{type:C.J,children:[{text:""}]}])}));const m=Er().find((e=>e.name===n.name)),p={activeTemplate:m,element:n,editor:r,onChange:i,onClose:l};return m?a.createElement("div",{...e,className:"w-full my-2"},t,a.createElement(kr,{inline:!1},a.createElement("span",{className:"relative w-full inline-flex shadow-sm rounded-md"},o&&a.createElement("span",{className:"absolute inset-0 ring-2 ring-blue-100 ring-inset rounded-md z-10 pointer-events-none"}),a.createElement("span",{onMouseDown:c,className:"cursor-pointer w-full relative inline-flex items-center justify-start px-4 py-2 rounded-l-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"},m.label||m.name),a.createElement(Sr,{onOpen:c,onRemove:s})),d&&a.createElement(zr,{...p}))):null},zr=({editor:e,element:t,activeTemplate:n,onClose:r,onChange:i})=>{const o=[...F.F3.findPath(e,t),n.name].join(".");return a.createElement(vr,{id:o,label:n.label,fields:n.fields,initialValues:t.props,onChange:i,onClose:r})},Sr=({onOpen:e,onRemove:t})=>a.createElement(l.J,{as:"span",className:"-ml-px relative block"},a.createElement(l.J.Button,{as:"span",className:"cursor-pointer h-full relative inline-flex items-center px-1 py-0.5 rounded-r-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"},a.createElement(or,{title:"Open options"})),a.createElement(s.u,{as:a.Fragment,enter:"transition ease-out duration-100",enterFrom:"transform opacity-0 scale-95",enterTo:"transform opacity-100 scale-100",leave:"transition ease-in duration-75",leaveFrom:"transform opacity-100 scale-100",leaveTo:"transform opacity-0 scale-95"},a.createElement(l.J.Panel,null,a.createElement("div",{className:"z-30 origin-top-right absolute right-0 mt-2 -mr-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"},a.createElement("div",{className:"py-1"},a.createElement("span",{onClick:e,className:Ka("cursor-pointer text-left w-full block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900")},"Edit"),a.createElement("button",{onMouseDown:e=>{e.preventDefault(),t()},className:Ka("cursor-pointer text-left w-full block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900")},"Remove")))))),Mr=({inline:e,children:t})=>{const n=e?"span":"div";return a.createElement(n,{contentEditable:!1,style:{userSelect:"none"},className:"relative"},t)},Lr=({attributes:e,children:t,element:n,editor:r,onChange:i})=>{const o=(0,F.vt)(),{handleClose:l,handleRemove:s,handleSelect:c,isExpanded:d}=xr(r,n);return br("enter",(()=>{(0,y.s2K)(r,[{type:C.J,children:[{text:""}]}])})),a.createElement("div",{...e,className:"w-full mb-2"},t,a.createElement(Mr,{inline:!1},a.createElement("span",{className:"relative w-full inline-flex shadow-sm rounded-md"},o&&a.createElement("span",{className:"z-10 absolute inset-0 ring-2 ring-blue-100 ring-inset rounded-md pointer-events-none"}),a.createElement("div",{className:"z-10"},a.createElement(Hn,{onClick:e=>{e.stopPropagation(),s()}})),a.createElement("span",{onMouseDown:c,style:{minHeight:"50px"},className:"cursor-pointer flex items-center justify-center rounded-md w-full relative bg-gray-100 overflow-hidden"},n.url?a.createElement("img",{className:"my-0",src:n.url,title:n.caption,alt:n.alt}):a.createElement("span",{className:"absolute inset-0 flex items-center justify-center text-gray-300"},a.createElement("span",null,"Click to add an image")))),d&&a.createElement(Fr,{onChange:i,initialValues:n,onClose:l,element:n})))},Fr=e=>a.createElement(vr,{id:"image-form",label:"Image",fields:[{label:"URL",name:"url",component:"image",clearable:!0},{label:"Caption",name:"caption",component:"text"},{label:"Alt",name:"alt",component:"text"}],initialValues:e.initialValues,onChange:e.onChange,onClose:e.onClose}),$r="img",Pr=(0,y.xje)({key:$r,isVoid:!0,isInline:!1,isElement:!0,component:e=>a.createElement(Lr,{...e,onChange:t=>{const n=F.F3.findPath(e.editor,e.element);(0,y.fLV)(e.editor,t,{at:n})}})}),Br=e=>(0,S.Se)(e),Hr=(e,t)=>{((e,t)=>{if(e.selection){const n=(0,y.G_R)(e,e.selection);if(!n)return;const[a]=n;!(0,y.kKo)(a)||(0,y.P99)(e,a,N.sT)||(0,y.P99)(e,a,N.Zv)||t()}})(e,(()=>(0,S.kQ)(e,{type:t})))},Tr=[...[{mode:"block",type:M.GD,match:"# ",preFormat:Br},{mode:"block",type:M.oG,match:"## ",preFormat:Br},{mode:"block",type:M.o3,match:"### ",preFormat:Br},{mode:"block",type:M.jB,match:"#### ",preFormat:Br},{mode:"block",type:M.$H,match:"##### ",preFormat:Br},{mode:"block",type:M.KW,match:"###### ",preFormat:Br},{mode:"block",type:z.a,match:"> ",preFormat:Br,format:e=>{(0,y.s2K)(e,{type:z.a,children:[{type:C.J,children:[{text:""}]}]})}},{mode:"block",type:N.sT,match:"```",triggerAtBlockStart:!1,preFormat:Br,format:e=>{(0,N.WP)(e,{defaultType:(0,y.bbC)(e,y.mnA),insertNodesOptions:{select:!0}})}},{mode:"block",type:E.c,match:["---","\u2014-","___ "],format:e=>{(0,y.fLV)(e,{type:E.c}),(0,y.s2K)(e,{type:y.mnA,children:[{text:""}]})}}],...[{mode:"block",type:S.f8,match:["* ","- "],preFormat:Br,format:e=>Hr(e,S.Ht)},{mode:"block",type:S.f8,match:["1. ","1) "],preFormat:Br,format:e=>Hr(e,S.kN)},{mode:"block",type:S.oG,match:"[] "},{mode:"block",type:S.oG,match:"[x] ",format:e=>(0,y.fLV)(e,{type:S.oG,checked:!0},{match:t=>$.ML.isBlock(e,t)})}],...[{mode:"mark",type:[L.Qp,L.mZ],match:"***"},{mode:"mark",type:L.Qp,match:"**"},{mode:"mark",type:L.mZ,match:"*"},{mode:"mark",type:L.mZ,match:"_"},{mode:"mark",type:L.QM,match:"`"}]],Dr="break",Zr=(0,y.xje)({key:Dr,isElement:!0,isInline:!0,isVoid:!0,component:e=>a.createElement(a.Fragment,null,a.createElement("br",{className:e.className,...e.attributes}),e.children),handlers:{onKeyDown:(e,{options:{rules:t=[]}})=>n=>{const a=(0,y.xmC)(e);a&&t.forEach((({hotkey:t,query:r})=>{(0,P.ZP)(t,n)&&(0,y.VqB)(a,r)&&(n.preventDefault(),(0,y.s2K)(e,{type:Dr,children:[{text:""}]}))}))}},options:{rules:[{hotkey:"shift+enter"}]}}),Vr=(0,y.xje)({key:"trailingBlock",withOverrides:(e,{options:{level:t,...n}})=>{const{normalizeNode:a}=e;return e.normalizeNode=([r,i])=>{const o=(0,y.DXT)(e,t),l=null==o?void 0:o[0];if(!(!l||[Xr,qr,$r].includes(l.type)&&(0,y.VqB)(o,n)))return a([r,i]);{const t=o?$.y$.next(o[1]):[0];(0,y.s2K)(e,{type:C.J,children:[{text:""}]},{at:t})}},e},options:{level:0},then:e=>({type:(0,y.bbC)(e,y.mnA)})}),Ir=[M.GD,M.oG,M.o3,M.o3,M.jB,M.$H,M.KW,C.J],jr={types:[z.a,M.GD,M.oG,M.o3,M.o3,M.jB,M.$H,M.KW],defaultType:C.J},_r=(0,y.xje)({key:"WITH_CORRECT_NODE_BEHAVIOR",withOverrides:e=>{const{deleteBackward:t,insertBreak:n}=e;return e.insertBreak=()=>{if(!e.selection||!$.e6.isCollapsed(e.selection))return n();const t=$.y$.parent(e.selection.anchor.path),a=$.NB.get(e,t);$.ML.isVoid(e,a)?$.ML.insertNode(e,{type:"p",children:[{text:""}]}):n()},e.deleteBackward=n=>{if(!e.selection||!$.e6.isCollapsed(e.selection)||0!==e.selection.anchor.offset)return t(n);const a=$.y$.parent(e.selection.anchor.path),r=$.NB.get(e,a);if(0===$.NB.string(r).length&&$.y$.hasPrevious(a)){const t=$.y$.previous(a),n=$.NB.get(e,t);if($.ML.isVoid(e,n))return $.YR.removeNodes(e),void $.ML.normalize(e,{force:!0})}t(n)},e}}),Rr=[Vr(),_r(),(0,H.wQ)({options:{rules:Tr}}),(0,T.z$)({options:{rules:[{hotkey:"mod+enter"},{hotkey:"mod+shift+enter",before:!0},{hotkey:"enter",query:{start:!0,end:!0,allow:M.Nl}}]}}),(0,D.gH)({options:{rules:[{...jr,hotkey:"Enter",predicate:y.ptC}]}}),Zr({options:{rules:[{hotkey:"shift+enter"},{hotkey:"enter",query:{allow:[N.sT,z.a]}}]}})],Or=[(0,M.DR)(),(0,C.Z)(),(0,N._8)(),(0,z.D)(),(0,L.pJ)(),(0,L.Td)(),(0,L.wF)(),(0,L.sW)(),(0,S.V8)(),(0,E.x)(),(0,B.kd)()],Ar=e=>[Xr,qr,$r].includes(e.type)?{...e,children:[{type:"text",text:""}]}:e.children?e.children.length?{...e,children:e.children.map(Ar)}:{...e,children:[{text:""}]}:e,Yr=(e,t)=>{const n=F.F3.toDOMNode(e,e);n&&(n.focus(),setTimeout((()=>{Wr(e)?(0,y.fLV)(e,t):(0,y.s2K)(e,[t])}),1))},Wr=e=>{var t;if(!e.selection)return!1;const[n]=$.ML.node(e,e.selection),a=e.selection.focus,r=(0,y.xmC)(e);return!$.NB.string(n)&&!(null==(t=n.children)?void 0:t.some((t=>$.ML.isInline(e,t))))&&$.ML.isStart(e,a,r[1])},Jr={isNodeActive:(e,t)=>{const n=(0,y.bbC)(e,t);return!!(null==e?void 0:e.selection)&&(0,y.zwG)(e,{match:{type:n}})},isMarkActive:(e,t)=>!!(null==e?void 0:e.selection)&&(0,y.yw6)(e,t),isListActive:(e,t)=>{const n=!!(null==e?void 0:e.selection)&&(0,S.j8)(e);return!!n&&n.list[0].type===t},currentNodeSupportsMDX:e=>(0,y.DYv)(e,{match:{type:Ir}}),normalize:Ar},qr="mdxJsxTextElement",Xr="mdxJsxFlowElement",Gr=e=>{const t=t=>{const n=F.F3.findPath(e.editor,e.element);(0,y.fLV)(e.editor,{props:t},{at:n})};return e.inline?a.createElement(Cr,{...e,onChange:t}):a.createElement(Nr,{...e,onChange:t})},Ur=(0,y.xje)({key:qr,isInline:!0,isVoid:!0,isElement:!0,component:e=>a.createElement(Gr,{...e,inline:!0})}),Kr=(0,y.xje)({key:Xr,isVoid:!0,isElement:!0,component:e=>a.createElement(Gr,{...e,inline:!1})}),Qr=(e,t)=>{const n=!t.inline;Jr.currentNodeSupportsMDX(e)&&(n?(Yr(e,{type:Xr,name:t.name,children:[{text:""}],props:t.defaultItem?t.defaultItem:{}}),$.ML.normalize(e,{force:!0})):((e,t)=>{(0,y.s2K)(e,[t]),setTimeout((()=>{$.YR.move(e)}),1)})(e,{type:qr,name:t.name,children:[{text:""}],props:t.defaultItem?t.defaultItem:{}}))},ei=e=>{const t=(0,y.sZ5)(),n=a.useMemo((()=>t.selection),[]),[r]=ai(t);return a.createElement(vr,{id:"link-form",label:"Link",fields:[{label:"URL",name:"url",component:"text"},{label:"Title",name:"title",component:"text"}],initialValues:{url:r?r[0].url:"",title:r?r[0].title:""},onChange:e=>{const a=(0,y.v$F)(t,{match:e=>!$.ML.isEditor(e)&&$.W_.isElement(e)&&e.type===k.uJ,at:n});if(a)for(const[,n]of a)(0,y.fLV)(t,e,{match:e=>!$.ML.isEditor(e)&&$.W_.isElement(e)&&e.type===k.uJ,at:n})},onClose:e.onClose})},ti=e=>{const[t]=ai(e);return!!t},ni=(e,t)=>{(0,y.LKm)(e,{match:e=>!$.ML.isEditor(e)&&$.W_.isElement(e)&&e.type===k.uJ,at:t||void 0})},ai=e=>(0,y.v$F)(e,{match:e=>!$.ML.isEditor(e)&&$.W_.isElement(e)&&e.type===k.uJ}),ri=({hidden:e,label:t,active:n,onMouseDown:r,icon:i,options:o,name:c,isLastItem:d=!1})=>{const m=(0,y.sZ5)(),[p,u]=a.useState(null);a.useEffect((()=>{m.selection&&u(m.selection)}),[JSON.stringify(m.selection)]);const[g,h]=a.useState(!1);if(o)return a.createElement(l.J,{as:"div",className:"relative z-10 w-full"},a.createElement(l.J.Button,{as:"span",className:"cursor-pointer w-full inline-flex justify-center items-center px-2 py-2 rounded-l-md border-l border-b border-t border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 "+(d?"border-r rounded-r-md":"border-r-0"),onMouseDown:e=>{e.preventDefault()}},a.createElement("span",{className:"sr-only"},"Open options"),a.createElement(sr,null)),a.createElement(s.u,{as:a.Fragment,enter:"transition ease-out duration-100",enterFrom:"transform opacity-0 scale-95",enterTo:"transform opacity-100 scale-100",leave:"transition ease-in duration-75",leaveFrom:"transform opacity-100 scale-100",leaveTo:"transform opacity-0 scale-95"},a.createElement(l.J.Panel,null,(({close:e})=>a.createElement("div",{className:"origin-top-left absolute left-0 mt-2 -mr-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"},a.createElement("div",{className:"py-2 tina-prose"},a.createElement("span",{onMouseDown:()=>e()},o)))))));if("image"===i)return a.createElement("span",{className:"relative"},a.createElement("span",{"data-test":`${c}Button`,className:`cursor-pointer w-full inline-flex relative justify-center items-center px-2 py-2 border-l border-b border-t border-r-0 border-gray-200 text-sm font-medium  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${n?"bg-gray-50 text-blue-500":"bg-white text-gray-600"} ${d?"border-r rounded-r-md":"border-r-0"}`,style:{visibility:e?"hidden":"visible",pointerEvents:e?"none":"auto"},onMouseDown:e=>{e.preventDefault(),(e=>{Yr(e,{type:$r,children:[{text:""}],url:"",caption:"",alt:""}),$.ML.normalize(e,{force:!0})})(m)}},a.createElement("span",{className:"sr-only"},t),a.createElement(ir,{name:i})));if("link"===i){const r=!m.selection||(0,y.zbr)(m.selection)&&!ti(m);return a.createElement("span",{className:"relative"},a.createElement("span",{"data-test":`${c}Button`,className:`cursor-pointer w-full inline-flex relative justify-center items-center px-2 py-2 border-l border-b border-t border-r-0 border-gray-200 text-sm font-medium  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${n?"bg-gray-50 text-blue-500":r?"bg-gray-50 text-gray-300":"bg-white text-gray-600"} ${d?"border-r rounded-r-md":"border-r-0"}`,style:{visibility:e?"hidden":"visible",pointerEvents:e?"none":"auto"},onMouseDown:e=>{e.preventDefault(),r||((e=>{const t={type:"a",url:"",title:"",children:[{text:""}]};if((0,y.zbr)(e.selection)){const[,t]=(0,y.joq)(e,{match:t=>!$.ML.isEditor(t)&&$.W_.isElement(t)&&(0,y.bbC)(e,k.uJ)});$.YR.select(e,t)}if(ti(e)){const[n]=ai(e);t.url=n[0].url,t.title=n[0].title,ni(e)}(0,y.qEX)(e,t,{split:!0})})(m),h((e=>!e)))}},a.createElement("span",{className:"sr-only"},t),a.createElement(ir,{name:i})),g&&a.createElement(ei,{selection:p,onClose:e=>{h(!1)},onChange:e=>console.log(e)}))}return a.createElement("span",{"data-test":`${c}Button`,className:`cursor-pointer w-full inline-flex relative justify-center items-center px-2 py-2 border-l border-b border-t border-r-0 border-gray-200 text-sm font-medium  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${n?"bg-gray-50 text-blue-500":"bg-white text-gray-600"} ${d?"border-r rounded-r-md":"border-r-0"}`,style:{visibility:e?"hidden":"visible",pointerEvents:e?"none":"auto"},onMouseDown:r},a.createElement("span",{className:"sr-only"},t),a.createElement(ir,{name:i}))},ii=({editor:e,templates:t})=>a.createElement(l.J,{as:"span",className:"relative z-10 block",style:{width:"85px"}},(({open:n})=>a.createElement(a.Fragment,null,a.createElement(l.J.Button,{as:"span",onMouseDown:e=>{e.preventDefault()},className:"cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md border  text-sm font-medium transition-all ease-out duration-150 hover:bg-blue-500 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 "+(n?"bg-gray-50 border-gray-200 text-blue-500":"text-white border-blue-500 bg-blue-500")},a.createElement("span",{className:"text-sm font-semibold tracking-wide align-baseline mr-1"},"Embed"),a.createElement(fr,{className:"origin-center transition-all ease-out duration-150 "+(n?"rotate-45":"")})),a.createElement(s.u,{as:a.Fragment,enter:"transition ease-out duration-100",enterFrom:"transform opacity-0 scale-95",enterTo:"transform opacity-100 scale-100",leave:"transition ease-in duration-75",leaveFrom:"transform opacity-100 scale-100",leaveTo:"transform opacity-0 scale-95"},a.createElement(l.J.Panel,null,(({close:n})=>a.createElement("div",{className:"origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1 max-h-[10rem] overflow-y-auto"},t.map((t=>a.createElement("span",{key:t.name,onMouseDown:a=>{a.preventDefault(),n(),Qr(e,t)},className:"hover:bg-gray-50 hover:text-blue-500 cursor-pointer pointer-events-auto px-4 py-2 text-sm w-full flex items-center"},t.label||t.name)))))))))),oi=({toolbarItems:e,itemsShown:t,showEmbed:n})=>a.createElement(l.J,{as:"span",className:"relative z-10 block w-full"},a.createElement(l.J.Button,{"data-test":"popoverRichTextButton",as:"span",className:"cursor-pointer relative w-full justify-center inline-flex border border-gray-200 focus:border-blue-500 items-center px-2 py-2 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 pointer-events-auto "+(n?"rounded-none":"rounded-r-md"),onMouseDown:e=>{e.preventDefault()}},a.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"}))),a.createElement(s.u,{as:a.Fragment,enter:"transition ease-out duration-100",enterFrom:"transform opacity-0 scale-95",enterTo:"transform opacity-100 scale-100",leave:"transition ease-in duration-75",leaveFrom:"transform opacity-100 scale-100",leaveTo:"transform opacity-0 scale-95"},a.createElement(l.J.Panel,null,(({close:n})=>a.createElement("div",{className:"origin-top-right absolute right-0 mt-2 -mr-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1"},e.map(((e,r)=>r<t-1?null:a.createElement("span",{"data-test":`${e.name}OverflowButton`,key:e.name,onMouseDown:t=>{t.preventDefault(),n(),e.onMouseDown(t)},className:Ka(e.active?"bg-gray-50 text-blue-500":"bg-white text-gray-600","hover:bg-gray-50 hover:text-blue-500 cursor-pointer pointer-events-auto px-4 py-2 text-sm w-full flex items-center")},a.createElement("div",{className:"mr-2 opacity-80"},a.createElement(ir,{name:e.name}))," ",e.label)))))))),li=({children:e,position:t})=>{const n=a.useRef(),r=(0,y.sZ5)(),{selection:i}=r;return a.useEffect((()=>{const e=n.current;if(!e)return;if(!i||!F.F3.isFocused(r)||$.e6.isCollapsed(i)||""===$.ML.string(r,i))return e.classList.add("hidden"),void e.classList.remove("block");e.classList.add("block"),e.classList.remove("hidden");(async()=>{if(n.current){const e=window.getSelection().getRangeAt(0),{x:a,y:r}=await(0,Z.oo)(e,n.current,{placement:t||"top",middleware:[(0,V.RR)(),(0,V.uY)()]});Object.assign(n.current.style,{left:`${a}px`,top:`${r}px`})}})()}),[JSON.stringify(i),n.current]),a.createElement("div",{ref:n,className:"absolute z-10"},e)},si=[{name:M.GD,render:a.createElement("h1",{className:"my-0 text-4xl font-medium"},"Heading 1")},{name:M.oG,render:a.createElement("h2",{className:"my-0 text-3xl font-medium"},"Heading 2")},{name:M.o3,render:a.createElement("h3",{className:"my-0 text-2xl font-semibold"},"Heading 3")},{name:M.jB,render:a.createElement("h4",{className:"my-0 text-xl font-bold"},"Heading 4")},{name:M.$H,render:a.createElement("h5",{className:"my-0 text-lg font-bold"},"Heading 5")},{name:M.KW,render:a.createElement("h6",{className:"my-0 text-base font-bold"},"Heading 6")},{name:C.J,render:a.createElement("p",{className:"my-0"},"Paragraph")}];function ci({templates:e}){const t=e.length>0,n=a.useRef(null),r=(0,y.sZ5)(),i=Jr.isMarkActive(r,L.Qp),o=Jr.isMarkActive(r,L.QM),l=Jr.isMarkActive(r,L.mZ),s=Jr.isNodeActive(r,k.uJ),c=Jr.isListActive(r,S.Ht),d=Jr.isListActive(r,S.kN),m=Jr.isNodeActive(r,N.sT),p=Jr.isNodeActive(r,z.a),u=Jr.isNodeActive(r,$r),g=[{name:"heading",label:"Heading",active:!1,options:si.map((e=>a.createElement("span",{key:e.name,onMouseDown:(0,y.lBo)(y.uPr,r,{activeType:e.name}),className:Ka("hover:bg-gray-100 hover:text-gray-900 cursor-pointer block px-4 py-2 text-sm w-full text-left")},e.render)))},{name:"link",label:"Link",active:s},{name:"image",label:"Image",active:u},{name:"quote",label:"Quote",active:p,onMouseDown:(0,y.lBo)(y.uPr,r,{activeType:z.a})},{name:"ul",label:"Bullet List",active:c,onMouseDown:(0,y.lBo)(S.kQ,r,{type:S.Ht})},{name:"ol",label:"List",active:d,onMouseDown:(0,y.lBo)(S.kQ,r,{type:S.kN})},{name:"code",label:"Code",active:o,onMouseDown:(0,y.lBo)(y.w9d,r,{key:L.QM})},{name:"codeBlock",label:"Code Block",active:m,onMouseDown:(0,y.lBo)(N.WP,r,{insertNodesOptions:{select:!0}})},{name:"bold",label:"Bold",active:i,onMouseDown:(0,y.lBo)(y.w9d,r,{key:L.Qp})},{name:"italic",label:"Italic",active:l,onMouseDown:(0,y.lBo)(y.w9d,r,{key:L.mZ})}],[h,w]=a.useState(g.length);var f,v;return f=n,v=e=>{const n=(e.target.getBoundingClientRect().width-(t?85:0))/40;w(Math.floor(n))},a.useEffect((()=>{const e=new ResizeObserver((e=>{for(const t of e)v(t)}));return f.current&&e.observe(f.current),()=>e.disconnect()}),[f.current]),a.createElement("div",{className:"sticky -top-4 inline-flex shadow rounded-md mb-2 z-50 max-w-full",style:{width:40*g.length+(t?85:0)+"px"}},a.createElement("div",{ref:n,className:"grid w-full",style:{gridTemplateColumns:t?"1fr 85px":"1fr"}},a.createElement("div",{className:"grid",style:{gridTemplateColumns:"repeat(auto-fit, minmax(40px, 1fr))",gridTemplateRows:"auto",gridAutoRows:0}},g.map(((e,n)=>{const r=n+1===h,i=n+1>h;return h<g.length&&r?a.createElement(oi,{key:e.name,itemsShown:h,toolbarItems:g,showEmbed:t}):a.createElement(ri,{key:e.name,name:e.name,hidden:i,active:e.active,onMouseDown:e.onMouseDown,label:e.label,options:e.options,icon:e.name,isLastItem:r&&!t})}))),t&&a.createElement(ii,{templates:e,editor:r})))}const di=()=>{const e=(0,y.sZ5)(),t=Jr.isNodeActive(e,k.uJ);return a.createElement(li,{position:"bottom"},t&&a.createElement("button",{onMouseDown:t=>{t.preventDefault(),ni(e)},className:"mt-2 cursor-pointer hover:bg-gray-100 border border-gray-200 rounded-md bg-gray-100 text-gray-600 py-1 px-2"},"Clear"))};function mi(e,t){switch(t.type){case"selectItem":return{...e,activeIndex:t.value,status:"selected"};case"updateValue":const n=t.value.toLocaleLowerCase(),a=""===n?e.initialTemplates:e.activeTemplates.filter((e=>e.name.toLocaleLowerCase().startsWith(n)||e.label.toLocaleLowerCase().startsWith(n)));return 0===a.length?{...e,activeTemplates:a,activeIndex:0,value:t.value,status:"cancelled"}:{...e,activeTemplates:a,activeIndex:0,value:t.value};case"selectCurrentItem":return{...e,status:"selected"};case"move":if("down"===t.value)return e.activeIndex===e.activeTemplates.length-1?{...e,activeIndex:0}:{...e,activeIndex:e.activeIndex+1};if("up"===t.value)return 0===e.activeIndex?{...e,activeIndex:e.activeTemplates.length-1}:{...e,activeIndex:e.activeIndex-1};throw new Error(`Unexpected value for move action ${t.value}`);default:return{...e}}}function pi(e){const t=Er(),[n,r]=a.useReducer(mi,{activeIndex:0,status:"pending",value:e.value,initialTemplates:t,activeTemplates:t});a.useEffect((()=>{"selected"===n.status&&e.onValue(n.activeTemplates[n.activeIndex]),"cancelled"===n.status&&e.onCancel()}),[n.status]),a.useEffect((()=>{r({type:"updateValue",value:e.value})}),[e.value]),br("escape",(()=>{e.onCancel()})),br("enter",(()=>{r({type:"selectCurrentItem"})})),br("ArrowDown",(()=>{r({type:"move",value:"down"})})),br("ArrowUp",(()=>{r({type:"move",value:"up"})}));const i=a.useRef();return function(e,t){a.useEffect((()=>{const n=n=>{e.current&&!e.current.contains(n.target)&&t(n)};return document.addEventListener("mousedown",n),document.addEventListener("touchstart",n),()=>{document.removeEventListener("mousedown",n),document.removeEventListener("touchstart",n)}}),[e,t])}(i,(()=>e.onCancel())),a.createElement("span",{ref:i,className:"block w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none max-h-[10rem] overflow-y-auto"},a.createElement("span",{className:"block py-1"},0===n.activeTemplates.length&&a.createElement("span",{className:"block px-4 py-2 text-sm text-left w-full text-gray-500"},"No matches found"),n.activeTemplates.map(((e,t)=>a.createElement("span",{key:e.key,className:"block"},a.createElement("span",{onMouseDown:e=>{e.preventDefault(),r({type:"selectItem",value:t})},className:Ka(t===n.activeIndex?"bg-gray-50 text-gray-900":"text-gray-700","cursor-pointer truncate block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 hover:text-gray-900")},e.label||e.name))))))}const ui="maybe_mdx",gi=e=>(0,y.DYv)(e,{match:{type:(0,y.bbC)(e,ui)}}),hi=(0,y.xje)({key:ui,isElement:!0,isInline:!0,withOverrides:e=>{const{type:t}=(0,y.s3t)(e,ui),{insertText:n}=e;return e.insertText=a=>(e=>void 0!==gi(e))(e)?$.YR.insertText(e,a):e.selection&&"/"===a&&Jr.currentNodeSupportsMDX(e)?void(0,y.s2K)(e,{type:t,children:[{type:"text",text:"/"}]}):n(a),e},component:e=>a.createElement(wi,{...e})}),wi=e=>{var t;const n=a.useRef(),r=a.useRef(),i=(0,F.UE)(),o=(0,F.vt)(),l=null==(t=e.element.children[0])?void 0:t.text,s=l.slice(1),{selection:c}=e.editor;return a.useEffect((()=>{o&&i||(0,y.LKm)(e.editor,{at:c,match:e=>$.W_.isElement(e)&&e.type===ui})}),[i,o,JSON.stringify(c)]),a.useEffect((()=>{l.startsWith("/")||(0,y.LKm)(e.editor,{match:e=>$.W_.isElement(e)&&e.type===ui})}),[l]),a.useEffect((()=>{if(!r.current)return;(async()=>{if(r.current){const{x:e,y:t}=await(0,Z.oo)(n.current,r.current,{placement:"bottom-start",middleware:[(0,V.RR)(),(0,V.uY)()]});r.current&&Object.assign(r.current.style,{left:`${e}px`,top:`${t}px`})}})()}),[JSON.stringify(c),r.current,n.current]),a.createElement("span",{...e.attributes,ref:n,className:`${e.className}`},e.children,o&&a.createElement("span",{ref:r,className:"block absolute z-50",contentEditable:!1,style:{userSelect:"none"}},a.createElement(pi,{value:s,onValue:t=>{$.YR.removeNodes(e.editor,{match:e=>{if($.W_.isElement(e)&&e.type===ui)return!0}}),Qr(e.editor,t)},onCancel:()=>{(0,y.LKm)(e.editor,{match:e=>$.W_.isElement(e)&&e.type===ui})}})))},fi=na((e=>{const t=a.useMemo((()=>{var t,n;return(null==(n=null==(t=e.input.value)?void 0:t.children)?void 0:n.length)?e.input.value.children.map(Jr.normalize):[{type:"p",children:[{type:"text",text:""}]}]}),[]),n=a.useMemo((()=>(0,y.ZUk)([...Rr,...Or,Kr(),Ur(),Pr(),(0,k.Tv)(),hi()],{components:{[M.GD]:({attributes:e,editor:t,element:n,className:r,...i})=>a.createElement("h1",{className:Ka(ar,nr,r,"text-4xl font-medium mb-4 last:mb-0 mt-6 first:mt-0"),...e,...i}),[M.oG]:({attributes:e,editor:t,element:n,className:r,...i})=>a.createElement("h2",{className:Ka(ar,nr,r,"text-3xl font-medium mb-4 last:mb-0 mt-6 first:mt-0"),...e,...i}),[M.o3]:({attributes:e,editor:t,element:n,className:r,...i})=>a.createElement("h3",{className:Ka(ar,nr,r,"text-2xl font-semibold mb-4 last:mb-0 mt-6 first:mt-0"),...e,...i}),[M.jB]:({attributes:e,editor:t,element:n,className:r,...i})=>a.createElement("h4",{className:Ka(ar,nr,r,"text-xl font-bold mb-4 last:mb-0 mt-6 first:mt-0"),...e,...i}),[M.$H]:({attributes:e,editor:t,element:n,className:r,...i})=>a.createElement("h5",{className:Ka(ar,nr,r,"text-lg font-bold mb-4 last:mb-0 mt-6 first:mt-0"),...e,...i}),[M.KW]:({attributes:e,editor:t,element:n,className:r,...i})=>a.createElement("h6",{className:Ka(ar,nr,r,"text-base font-bold mb-4 last:mb-0 mt-6 first:mt-0"),...e,...i}),[C.J]:({attributes:e,className:t,editor:n,element:r,...i})=>a.createElement("p",{className:Ka(nr,t,"text-base font-normal mb-4 last:mb-0"),...e,...i}),[z.a]:({className:e,attributes:t,editor:n,element:r,...i})=>a.createElement("blockquote",{className:Ka("not-italic mb-4 last:mb-0",nr,e),...t,...i}),[N.sT]:e=>a.createElement(tr,{...e}),[S.Ht]:({attributes:e,editor:t,className:n,element:r,...i})=>a.createElement("ul",{className:Ka(nr,n,"mb-4 pl-2 list-disc list-inside last:mb-0"),...e,...i}),[S.f8]:({attributes:e,editor:t,className:n,element:r,...i})=>a.createElement("li",{className:Ka("p-0 mt-0 mb-2 last:mb-0",n),...e,...i}),[S.kN]:({attributes:e,editor:t,className:n,element:r,...i})=>a.createElement("ol",{className:Ka(nr,n,"mb-4 pl-2 list-decimal list-inside last:mb-0"),...e,...i}),[S.f8]:({attributes:e,className:t,editor:n,element:r,...i})=>a.createElement("li",{className:Ka("p-0 mt-0 mb-2 last:mb-0",t),...e,...i}),[S.wl]:({attributes:e,editor:t,element:n,className:r,...i})=>a.createElement("span",{className:Ka(r),...e,...i}),[k.uJ]:({attributes:e,editor:t,element:n,nodeProps:r,className:i,...o})=>a.createElement("a",{className:Ka(i,"text-blue-500 hover:text-blue-600 transition-color ease-out duration-150 underline"),...e,...o}),[L.QM]:({editor:e,leaf:t,text:n,attributes:r,className:i,...o})=>a.createElement("code",{className:Ka("bg-gray-100 p-1 rounded-sm",i),...r,...o}),[L.mZ]:({editor:e,leaf:t,text:n,...r})=>a.createElement("em",{...r.attributes,...r}),[L.Qp]:({editor:e,leaf:t,text:n,...r})=>a.createElement("strong",{...r.attributes,...r}),[E.c]:({attributes:e,className:t,editor:n,element:r,children:i,...o})=>{const l=(0,F.vt)();return a.createElement("div",{className:Ka(t,"cursor-pointer relative border bg-gray-200 my-4 first:mt-0 last:mb-0"),...e,...o},i,l&&a.createElement("span",{className:"absolute h-4 -top-2 inset-0 ring-2 ring-blue-100 ring-inset rounded-md z-10 pointer-events-none"}))}}})),[]),r=[e.tinaForm.id,e.input.name].join("."),i=a.useMemo((()=>Qa()),[r]);return a.createElement(yr.Provider,{value:{templates:e.field.templates}},a.createElement("div",{className:"with-toolbar"},a.createElement("div",{className:Ka("min-h-[100px]","max-w-full tina-prose relative shadow-inner focus-within:shadow-outline focus-within:border-blue-500 block w-full bg-white border border-gray-200 text-gray-600 focus-within:text-gray-900 rounded-md px-3 py-2 mb-5")},a.createElement(y.hv7,{id:i,initialValue:t,plugins:n,onChange:t=>{e.input.onChange({type:"root",children:t})}},a.createElement(ci,{templates:e.field.templates,inlineOnly:!1}),a.createElement(vi,{id:i,form:e.form,initialValue:t}),a.createElement(di,null)))))})),vi=({id:e,form:t,initialValue:n})=>{const r=(0,y.U7P)(e);return a.useMemo((()=>{const{reset:e}=t;t.reset=t=>(r.children=n,r.onChange(),e(t))}),[]),null},bi={name:"rich-text",Component:e=>a.createElement(fi,{...e})},xi={name:"number",Component:na((({input:e,field:t})=>a.createElement(zn,{...e,step:t.step}))),parse:e=>e&&+e},yi={name:"select",type:"select",Component:na((({input:e,field:t,options:n})=>{const r=n||t.options;return a.createElement("div",{className:"relative group"},a.createElement("select",{id:e.name,value:e.value,onChange:e.onChange,className:un,...e},r?r.map(gn).map(hn):a.createElement("option",null,e.value)),a.createElement(sn,{className:"absolute top-1/2 right-3 w-6 h-auto -translate-y-1/2 text-gray-300 group-hover:text-blue-500 transition duration-150 ease-out pointer-events-none"}))})),parse:Ia,validate(e,t,n,a){if(a.required&&!e)return"Required"}},Ei={name:"radio-group",Component:na((({input:e,field:t,options:n})=>{const[r,i]=a.useState(null),o=n||t.options,l={};a.useEffect((()=>{i(l[`radio_${e.value}`])}),[e.value]);return a.createElement(vn,{id:e.name,direction:t.direction,variant:t.variant},"button"===t.variant&&a.createElement(fn,{width:null==r?void 0:r.offsetWidth,height:null==r?void 0:r.offsetHeight,left:null==r?void 0:r.offsetLeft,top:null==r?void 0:r.offsetTop,hasValue:!!e.value}),o?o.map((e=>"object"===typeof e?e:{value:e,label:e})).map((n=>{const r=`field-${t.name}-option-${n.value}`,i=n.value===e.value;return a.createElement(bn,{key:n.value,variant:t.variant,ref:e=>{l[`radio_${n.value}`]=e}},a.createElement("input",{type:"radio",id:r,name:e.name,value:n.value,onChange:t=>e.onChange(t.target.value),checked:i}),a.createElement(xn,{htmlFor:r,checked:i,variant:t.variant},a.createElement(wn,{variant:t.variant},n.label)))})):e.value)}))},ki={name:"textarea",Component:na((({input:e})=>a.createElement(dt,{...e}))),parse:Ia},Ci={name:"text",Component:na((({input:e,field:t})=>a.createElement(ct,{...e,placeholder:t.placeholder}))),validate(e,t,n,a){if(a.required&&!e)return"Required"},parse:Ia},Ni={name:"toggle",type:"checkbox",Component:na((({input:e,field:t,name:n,disabled:r=!1})=>{const i=!(!e.value&&!e.checked);let o=null;if(t.toggleLabels){const e="object"===typeof t.toggleLabels&&"true"in t.toggleLabels&&"false"in t.toggleLabels&&t.toggleLabels;o={true:e?e.true:"Yes",false:e?e.false:"No"}}return a.createElement(Xt,null,o&&a.createElement("span",null,o.false),a.createElement(Gt,{hasToggleLabels:null!==o},a.createElement(Qt,{id:n,type:"checkbox",...e}),a.createElement(Ut,{htmlFor:n,role:"switch",disabled:r},a.createElement(Kt,{checked:i},a.createElement("span",null)))),o&&a.createElement("span",null,o.true))}))},zi=na((({input:e,field:t,form:n,tinaForm:r})=>{const[i,o]=a.useState(""),l=a.useCallback((e=>{var a,r;(null==(r=null==(a=n.getFieldState(t.name))?void 0:a.value)?void 0:r.includes(e))||e.length&&(n.mutators.insert(t.name,0,e),o(""))}),[n,t.name]),s=e.value||[];return a.createElement(a.Fragment,null,a.createElement(ct,{value:i,onChange:e=>o(e.target.value),placeholder:t.placeholder,onKeyPress:e=>{","!==e.key&&"Enter"!==e.key||(e.preventDefault(),l(i))}}),a.createElement(Si,null,s.map(((e,n)=>a.createElement(Mi,{key:e,tinaForm:r,field:t,index:n},e)))))})),Si=i.ZP.span`
  display: flex;
  flex-wrap: wrap;
  margin: 4px -4px 0 -4px;
`,Mi=(0,i.ZP)((({tinaForm:e,field:t,index:n,children:r,...i})=>{const o=a.useCallback((()=>{e.mutators.remove(t.name,n)}),[e,t,n]);return a.createElement("span",{...i},a.createElement("span",null,r),a.createElement("button",{className:"text-center flex-shrink-0 border-0 bg-transparent p-2 flex items-center justify-center cursor-pointer",onClick:o},a.createElement(K,{className:"w-4 h-auto"})))}))`
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
`,Li={name:"tags",Component:zi,parse:Ia},Fi="MMM DD, YYYY",$i="h:mm A";const Pi=na((({input:e,field:{dateFormat:t,timeFormat:n,...r}})=>{const[i,o]=(0,a.useState)(!1),l=(0,a.useRef)(null);return(0,a.useEffect)((()=>{const e=e=>{l.current&&e.target&&(l.current.contains(e.target)?o(!0):o(!1))};return document.addEventListener("mouseup",e,!1),()=>{document.removeEventListener("mouseup",e,!1)}}),[document]),a.createElement(Bi,{ref:l},a.createElement(j(),{value:e.value,onFocus:e.onFocus,onChange:e.onChange,open:i,dateFormat:t||Fi,timeFormat:n||!1,inputProps:{className:st},...r}))})),Bi=i.ZP.div`
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
`,Hi={__type:"field",name:"date",Component:Pi,format:(e,t,n)=>{const a=function(e){if("string"===typeof e)return e;return Fi}(n.dateFormat),r=function(e){if("string"===typeof e)return e;if(e)return $i}(n.timeFormat),i="string"===typeof r?`${a} ${r}`:a;if("string"===typeof e){const t=R()(e);return t.isValid()?t.format(i):e}return R()(e).format(i)},parse:e=>{const t=new Date(e);return isNaN(t.getTime())?e:new Date(e).toISOString()}},Ti={name:"checkbox-group",Component:na((({input:e,field:t,options:n,disabled:r=!1})=>{const i=n||t.options;return a.createElement(yn,{id:e.name},null==i?void 0:i.map((e=>"object"===typeof e?e:{value:e,label:e})).map((n=>{const i=`field-${t.name}-option-${n.value}`,o=!!e.value&&e.value.includes(n.value);return a.createElement(En,{key:n.value},a.createElement("input",{type:"checkbox",name:e.name,id:i,value:n.value,checked:o,disabled:r,onChange:t=>{!0===t.target.checked?e.onChange([...e.value,t.target.value]):e.onChange([...e.value.filter((e=>e!==t.target.value))])}}),a.createElement(kn,{htmlFor:i,checked:o},!0===o?a.createElement(fe,{className:"w-5 h-auto text-black"}):a.createElement(we,{className:"w-5 h-auto text-black"}),a.createElement(Cn,null,n.label)))})))}))},Di={name:"reference",type:"reference",Component:na((({input:e,field:t})=>{const n=Sn();return a.createElement("div",null,a.createElement("div",{className:"relative group"},a.createElement(Vn,{cms:n,input:e,field:t})),a.createElement(Qn,{cms:n,input:e}))})),parse:Ia},Zi=()=>a.createElement(ji,null,a.createElement(Vi,null,"\ud83d\udd0e"),a.createElement("p",{className:"mb-4"},"Tina didn't find ",a.createElement("br",null),"any queries to ",a.createElement("br",null),"generate forms for."),a.createElement("p",null,a.createElement(We,{href:"https://tina.io/docs/tinacms-context/",target:"_blank",as:"a"},a.createElement(Vi,null,"\ud83d\udcd6")," Contextual Editing"))),Vi=i.ZP.span`
  font-size: 40px;
  line-height: 1;
  display: inline-block;
`,Ii=i.F4`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`,ji=i.ZP.div`
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
  animation-name: ${Ii};
  animation-delay: 300ms;
  animation-timing-function: ease-out;
  animation-iteration-count: 1;
  animation-fill-mode: both;
  animation-duration: 150ms;
  > *:first-child {
    margin: 0 0 var(--tina-padding-big) 0;
  }
  ${Vi} {
    display: block;
    font-size: 24px;
  }
  a {
    ${Vi} {
      margin-right: 0.25em;
    }
  }
  h3 {
    font-size: var(--tina-font-size-5);
    font-weight: normal;
    display: block;
    margin: 0 0 var(--tina-padding-big) 0;
    ${Vi} {
      font-size: 1em;
    }
  }
  p {
    display: block;
    margin: 0 0 var(--tina-padding-big) 0;
  }
`;class _i{constructor(e,t={}){var n,a;this.events=e,this._isOpen=!1,this.position="displace",this.renderNav=!0,this.buttons={save:"Save",reset:"Reset"},this.position=t.position||"displace",this.renderNav=t.renderNav||!0,this.placeholder=t.placeholder||Zi,(null==(n=t.buttons)?void 0:n.save)&&(this.buttons.save=t.buttons.save),(null==(a=t.buttons)?void 0:a.reset)&&(this.buttons.reset=t.buttons.reset)}get isOpen(){return this._isOpen}set isOpen(e){this._isOpen!==e&&(this._isOpen=e,e?this.events.dispatch({type:"sidebar:opened"}):this.events.dispatch({type:"sidebar:closed"}))}subscribe(e){const t=this.events.subscribe("sidebar",e);return()=>t()}}function Ri(e){return on({tag:"svg",attr:{fill:"currentColor",viewBox:"0 0 16 16"},child:[{tag:"path",attr:{fillRule:"evenodd",d:"M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707zM15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 1 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768L15.828.879a.5.5 0 0 0 0-.707z"}}]})(e)}function Oi(e){return on({tag:"svg",attr:{fill:"currentColor",viewBox:"0 0 16 16"},child:[{tag:"path",attr:{fillRule:"evenodd",d:"M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707z"}}]})(e)}const Ai=({hidden:e=!1,forms:t,setActiveFormId:n})=>a.createElement(s.u,{appear:!0,show:!e,enter:"transition-all ease-out duration-150",enterFrom:"opacity-0 -translate-x-1/2",enterTo:"opacity-100",leave:"transition-all ease-out duration-150",leaveFrom:"opacity-100",leaveTo:"opacity-0 -translate-x-1/2"},a.createElement("ul",{className:"pt-16"},t.sort(Yi).map(((e,r)=>a.createElement("li",{key:e.id,className:"relative px-6 py-2"},a.createElement("button",{onClick:()=>n(e.id),className:"w-full h-full bg-transparent border-none text-lg text-gray-700 hover:text-blue-500 transition-all ease-out duration-150 flex items-center gap-2 p-1 m-0"},a.createElement(Wn,{className:"opacity-70 w-5 h-auto fill-current"}),e.label),r!==t.length-1&&a.createElement("hr",{className:"absolute bottom-0 left-0 border-t border-gray-100 w-full"})))))),Yi=(e,t)=>t.id<e.id?-1:t.id>e.id?1:0,Wi=({children:e})=>{var t;const[n,r]=(0,a.useState)(""),i=Ke(),o="undefined"===typeof(null==(t=null==i?void 0:i.sidebar)?void 0:t.renderNav)||i.sidebar.renderNav,l=i.plugins.getType("form"),{setFormIsPristine:s}=a.useContext(wo);function c(){1===l.all().length&&r(l.all()[0].id)}it(l,(()=>{c()})),a.useEffect((()=>{c()}),[]);const d=l.all(),m=d.length>1,p=l.find(n),u=!!p;if(!d.length)return a.createElement(a.Fragment,null," ",e," ");if(m&&!p)return a.createElement(Ai,{isEditing:u,forms:d,setActiveFormId:r});const g=i.plugins.all("form:meta");return a.createElement(a.Fragment,null,p&&a.createElement(Xi,{isEditing:u,isMultiform:m},m&&a.createElement(Gi,{renderNav:o,activeForm:p,setActiveFormId:r}),!m&&a.createElement(Ui,{renderNav:o,activeForm:p}),g&&g.map((e=>a.createElement(a.Fragment,{key:e.name},a.createElement(e.Component,null)))),a.createElement(Pt,{form:p,onPristineChange:s})))},Ji=i.ZP.div`
  display: block;
  margin: 0 auto;
  width: 100%;
`;i.ZP.div`
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;
  border-top: 1px solid var(--tina-color-grey-2);
  background-color: var(--tina-color-grey-1);

  ${Ji} {
    height: 100%;
  }
`;const qi=i.F4`
  0% {
    transform: translate3d( 100%, 0, 0 );
  }
  100% {
    transform: translate3d( 0, 0, 0 );
  }
`,Xi=i.ZP.div`
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

  ${e=>e.isEditing&&i.iv`
      > * {
        transform: none;
        animation-name: ${qi};
        animation-duration: 150ms;
        animation-delay: 0;
        animation-iteration-count: 1;
        animation-timing-function: ease-out;
      }
    `};
`,Gi=({activeForm:e,setActiveFormId:t,renderNav:n})=>{const r=Ke(),{sidebarWidth:i,formIsPristine:o}=a.useContext(wo);return a.createElement("div",{className:"py-4 border-b border-gray-200 bg-white "+(i>vo&&n?"px-6":n?"pl-20 pr-28":"pl-6 pr-28")},a.createElement("div",{className:"max-w-form mx-auto flex flex-col items-start justify-center min-h-[2.5rem]"},a.createElement("button",{className:"pointer-events-auto text-xs mb-1 text-gray-400 hover:text-blue-500 hover:underline transition-all ease-out duration-150 font-medium flex items-center justify-start gap-0.5",onClick:()=>{!0===e.finalForm.getState().invalid?r.alerts.error("Cannot navigate away from an invalid form."):t("")}},a.createElement(In,{className:"h-auto w-5 inline-block opacity-70 -mt-0.5 -mx-0.5"}),"Return to Form List"),a.createElement("span",{className:"block w-full text-xl mb-[6px] text-gray-700 font-medium leading-tight"},e.label||e.name),a.createElement(Bt,{pristine:o})))},Ui=({renderNav:e,activeForm:t})=>{const{sidebarWidth:n,formIsPristine:r,displayState:i}=a.useContext(wo),o=(0,O.Lm)(),l=e?n>vo&&o>vo||"fullscreen"===i&&o>vo?"navOpen":"navClosed":"noNav",s=!!t.label&&t.label.replace(/^.*[\\\/]/,"");return a.createElement("div",{className:`py-4 border-b border-gray-200 bg-white ${{navOpen:"px-6",navClosed:"pl-20 pr-28",noNav:"pl-6 pr-28"}[l]}`},a.createElement("div",{className:"max-w-form mx-auto  flex flex-col items-start justify-center min-h-[2.5rem]"},s&&a.createElement("span",{className:"block w-full text-lg mb-[6px] text-gray-700 font-medium leading-tight text-ellipsis overflow-hidden whitespace-nowrap"},s),a.createElement(Bt,{pristine:r})))};function Ki(e){return on({tag:"svg",attr:{version:"1.1",viewBox:"0 0 16 16"},child:[{tag:"path",attr:{d:"M14.341 5.579c-0.347-0.473-0.831-1.027-1.362-1.558s-1.085-1.015-1.558-1.362c-0.806-0.591-1.197-0.659-1.421-0.659h-5.75c-0.689 0-1.25 0.561-1.25 1.25v11.5c0 0.689 0.561 1.25 1.25 1.25h9.5c0.689 0 1.25-0.561 1.25-1.25v-7.75c0-0.224-0.068-0.615-0.659-1.421zM12.271 4.729c0.48 0.48 0.856 0.912 1.134 1.271h-2.406v-2.405c0.359 0.278 0.792 0.654 1.271 1.134v0zM14 14.75c0 0.136-0.114 0.25-0.25 0.25h-9.5c-0.136 0-0.25-0.114-0.25-0.25v-11.5c0-0.135 0.114-0.25 0.25-0.25 0 0 5.749-0 5.75 0v3.5c0 0.276 0.224 0.5 0.5 0.5h3.5v7.75z"}},{tag:"path",attr:{d:"M9.421 0.659c-0.806-0.591-1.197-0.659-1.421-0.659h-5.75c-0.689 0-1.25 0.561-1.25 1.25v11.5c0 0.604 0.43 1.109 1 1.225v-12.725c0-0.135 0.115-0.25 0.25-0.25h7.607c-0.151-0.124-0.297-0.238-0.437-0.341z"}}]})(e)}function Qi(e){return on({tag:"svg",attr:{viewBox:"0 0 1024 1024"},child:[{tag:"path",attr:{d:"M955.7 856l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416 720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48zM480 416c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v184c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V416zm32 352a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z"}}]})(e)}(0,i.ZP)(We)`
  flex: 1.5 0 auto;
  padding: 12px 24px;
`;const eo=()=>a.createElement("a",{className:"flex-grow-0 flex w-full text-xs items-center py-1 px-4 text-yellow-600 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200",href:"https://tina.io/docs/tina-cloud/",target:"_blank"},a.createElement(Qi,{className:"w-5 h-auto inline-block mr-1 opacity-70 text-yellow-600"})," ","You are currently in",a.createElement("strong",{className:"ml-1 font-bold text-yellow-700"},"Local Mode"));function to(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},child:[{tag:"circle",attr:{cx:"12",cy:"12",r:"1"}},{tag:"circle",attr:{cx:"12",cy:"5",r:"1"}},{tag:"circle",attr:{cx:"12",cy:"19",r:"1"}}]})(e)}function no(e){return on({tag:"svg",attr:{viewBox:"0 0 16 16",fill:"currentColor"},child:[{tag:"path",attr:{fillRule:"evenodd",clipRule:"evenodd",d:"M9.5 1.1l3.4 3.5.1.4v2h-1V6H8V2H3v11h4v1H2.5l-.5-.5v-12l.5-.5h6.7l.3.1zM9 2v3h2.9L9 2zm4 14h-1v-3H9v-1h3V9h1v3h3v1h-3v3z"}}]})(e)}const ao=({sidebar:e})=>{const t=Ke(),[n,r]=a.useState(!1),i=t.plugins.findOrCreateMap("content-creator");return it(i),i.all().length?a.createElement(oo,null,e?a.createElement(Je,{onClick:()=>r(!0),variant:"primary"},a.createElement(U,{className:"w-5/6 h-auto"})):a.createElement(lo,{onClick:()=>r(!0),open:n},a.createElement(U,null)," ",a.createElement(mo,null,"New")),a.createElement(so,{open:n,direction:e?"left":"right"},a.createElement(mt,{click:!0,escape:!0,onDismiss:()=>r(!1),disabled:!n},i.all().map((e=>a.createElement(ro,{plugin:e,key:e.name,onClick:()=>{r(!1)}})))))):null},ro=({plugin:e,onClick:t})=>{const[n,r]=a.useState(!1);return a.createElement(a.Fragment,null,a.createElement(co,{onClick:()=>{r((e=>!e)),t()}},e.name),n&&a.createElement(io,{plugin:e,close:()=>r(!1)}))},io=({plugin:e,close:t})=>{const n=Ke(),r=(0,a.useMemo)((()=>new Qe({id:"create-form-id",label:"create-form",fields:e.fields,actions:e.actions,buttons:e.buttons,initialValues:e.initialValues||{},reset:e.reset,onChange:e.onChange,onSubmit:async a=>{await e.onSubmit(a,n).then((()=>{t()}))}})),[t,n,e]);return a.createElement(q,{id:"content-creator-modal",onClick:e=>e.stopPropagation()},a.createElement(Ne,null,a.createElement(ve,{close:t},e.name),a.createElement(G,null,a.createElement(Pt,{form:r}))))},oo=i.ZP.div`
  pointer-events: auto;
  position: relative;
`,lo=(0,i.ZP)(We)`
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
  ${e=>e.open&&i.iv`
      background-color: transparent;
      svg {
        transform: rotate(45deg);
      }
    `};
`,so=i.ZP.div`
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

  ${e=>"left"===e.direction&&i.iv`
      right: 0;
      transform-origin: 100% 0;
    `}

  ${e=>"right"===e.direction&&i.iv`
      left: 0;
      transform-origin: 0 0;
    `}
    
  ${e=>e.open&&i.iv`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 44px, 0) scale3d(1, 1, 1);
    `};
`,co=({children:e,...t})=>a.createElement("button",{className:"relative text-center text-sm p-2 w-full border-b border-gray-50 outline-none transition-all ease-out duration-150 hover:text-blue-500 hover:bg-gray-50",...t},e),mo=i.ZP.span`
  display: none;
  @media (min-width: 1030px) {
    display: inline;
  }
`,po=({className:e="",children:t,showCollections:n,collectionsInfo:r,screens:i,contentCreators:o,sidebarWidth:l,RenderNavSite:c,RenderNavCollection:m,...p})=>{const{setEdit:u}=(0,A.i)();return a.createElement("div",{className:`relative z-30 flex flex-col bg-white border-r border-gray-200 w-96 h-full ${e}`,style:{maxWidth:l+"px"},...p},a.createElement("div",{className:"border-b border-gray-200"},a.createElement(d.v,{as:"div",className:"relative block"},(({open:e})=>a.createElement("div",null,a.createElement(d.v.Button,{className:"group w-full px-6 py-3 flex justify-between items-center transition-colors duration-150 ease-out "+(e?"bg-gray-50":"bg-transparent")},a.createElement("span",{className:"text-left inline-flex items-center text-xl tracking-wide text-gray-800 flex-1 gap-1 opacity-80 group-hover:opacity-100 transition-opacity duration-150 ease-out"},a.createElement("svg",{viewBox:"0 0 32 32",fill:"#EC4815",xmlns:"http://www.w3.org/2000/svg",className:"w-10 h-auto -ml-1"},a.createElement("path",{d:"M18.6466 14.5553C19.9018 13.5141 20.458 7.36086 21.0014 5.14903C21.5447 2.9372 23.7919 3.04938 23.7919 3.04938C23.7919 3.04938 23.2085 4.06764 23.4464 4.82751C23.6844 5.58738 25.3145 6.26662 25.3145 6.26662L24.9629 7.19622C24.9629 7.19622 24.2288 7.10204 23.7919 7.9785C23.355 8.85496 24.3392 17.4442 24.3392 17.4442C24.3392 17.4442 21.4469 22.7275 21.4469 24.9206C21.4469 27.1136 22.4819 28.9515 22.4819 28.9515H21.0296C21.0296 28.9515 18.899 26.4086 18.462 25.1378C18.0251 23.8669 18.1998 22.596 18.1998 22.596C18.1998 22.596 15.8839 22.4646 13.8303 22.596C11.7767 22.7275 10.4072 24.498 10.16 25.4884C9.91287 26.4787 9.81048 28.9515 9.81048 28.9515H8.66211C7.96315 26.7882 7.40803 26.0129 7.70918 24.9206C8.54334 21.8949 8.37949 20.1788 8.18635 19.4145C7.99321 18.6501 6.68552 17.983 6.68552 17.983C7.32609 16.6741 7.97996 16.0452 10.7926 15.9796C13.6052 15.914 17.3915 15.5965 18.6466 14.5553Z"}),a.createElement("path",{d:"M11.1268 24.7939C11.1268 24.7939 11.4236 27.5481 13.0001 28.9516H14.3511C13.0001 27.4166 12.8527 23.4155 12.8527 23.4155C12.1656 23.6399 11.3045 24.3846 11.1268 24.7939Z"})),a.createElement("span",null,"Tina")),a.createElement(to,{className:"flex-0 w-6 h-full inline-block text-gray-500  group-hover:opacity-80 transition-all duration-300 ease-in-out transform "+(e?"opacity-100":"opacity-30 hover:opacity-50")})),a.createElement("div",{className:"transform translate-y-full absolute bottom-3 right-5 z-50"},a.createElement(s.u,{enter:"transition duration-150 ease-out",enterFrom:"transform opacity-0 -translate-y-2",enterTo:"transform opacity-100 translate-y-0",leave:"transition duration-75 ease-in",leaveFrom:"transform opacity-100 translate-y-0",leaveTo:"transform opacity-0 -translate-y-2"},a.createElement(d.v.Items,{className:"bg-white border border-gray-150 rounded-lg shadow-lg"},a.createElement(d.v.Item,null,(({active:e})=>a.createElement("button",{className:`text-lg px-4 py-2 first:pt-3 last:pb-3 tracking-wide whitespace-nowrap flex items-center opacity-80 text-gray-600 ${e&&"text-blue-400 bg-gray-50 opacity-100"}`,onClick:()=>{Co({displayState:"closed",sidebarWidth:null,resizingSidebar:!1}),u(!1)}},a.createElement(Rn,{className:"w-6 h-auto mr-2 text-blue-400"})," ","Log Out")))))))))),t,a.createElement("div",{className:"px-6 flex-1 overflow-auto"},n&&a.createElement(a.Fragment,null,a.createElement("h4",{className:"uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700"},"Collections"),a.createElement(uo,{RenderNavCollection:m,...r})),(i.length>0||o.length)>0&&a.createElement(a.Fragment,null,a.createElement("h4",{className:"uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700"},"Site"),a.createElement("ul",{className:"flex flex-col gap-4"},i.map((e=>a.createElement("li",{key:`nav-site-${e.name}`},a.createElement(c,{view:e})))),o.map(((e,t)=>a.createElement(go,{key:`plugin-${t}`,plugin:e})))))))},uo=({collections:e,loading:t,RenderNavCollection:n})=>!0===t?a.createElement(bt,{color:"var(--tina-color-primary)"}):0===e.length?a.createElement("div",null,"No collections found"):a.createElement("ul",{className:"flex flex-col gap-4"},e.map((e=>a.createElement("li",{key:`nav-collection-${e.name}`},a.createElement(n,{collection:e}))))),go=({plugin:e})=>{const[t,n]=a.useState(!1);return a.createElement("li",{key:e.name},a.createElement("button",{className:"text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100",onClick:()=>{n(!0)}},a.createElement(no,{className:"mr-3 h-6 opacity-80 w-auto"})," ",e.name),t&&a.createElement(io,{plugin:e,close:()=>n(!1)}))},ho=()=>{const{resizingSidebar:e,setResizingSidebar:t,fullscreen:n,setSidebarWidth:r,displayState:i}=a.useContext(wo);a.useEffect((()=>{const e=()=>t(!1);return window.addEventListener("mouseup",e),()=>{window.removeEventListener("mouseup",e)}}),[]),a.useEffect((()=>{const t=e=>{r((t=>{const n=t+e.movementX,a=window.innerWidth-8;return n<fo?fo:n>a?a:n}))};return e&&(window.addEventListener("mousemove",t),document.body.classList.add("select-none")),()=>{window.removeEventListener("mousemove",t),document.body.classList.remove("select-none")}}),[e]);return n?null:a.createElement("div",{onMouseDown:()=>t(!0),className:`z-100 absolute top-1/2 right-0 w-2 h-32 bg-white rounded-r-md border border-gray-100 shadow-sm hover:shadow-md transition-all duration-150 ease-out transform translate-x-full -translate-y-1/2 group hover:bg-gray-50 ${"closed"!==i?"opacity-100":"opacity-0"} ${e?"scale-110":""}`,style:{cursor:"grab"}},a.createElement("span",{className:"absolute top-1/2 left-1/2 h-4/6 w-px bg-gray-300 transform -translate-y-1/2 -translate-x-1/2 opacity-50 transition-opacity duration-150 ease-out group-hover:opacity-100"}))},wo=a.createContext(null),fo=360,vo=1e3,bo="tina.sidebarState",xo="tina.sidebarWidth";function yo({position:e="displace",defaultWidth:t=440,defaultState:n="open",sidebar:r}){var i,o,l,s;it(r);const c=Ke();return c.enabled?a.createElement(ko,{position:(null==(i=null==c?void 0:c.sidebar)?void 0:i.position)||e,defaultWidth:(null==(o=null==c?void 0:c.sidebar)?void 0:o.defaultWidth)||t,defaultState:(null==(l=null==c?void 0:c.sidebar)?void 0:l.defaultState)||n,renderNav:"undefined"===typeof(null==(s=null==c?void 0:c.sidebar)?void 0:s.renderNav)||c.sidebar.renderNav,sidebar:r}):null}const Eo=e=>{const[t,n]=(0,a.useState)([]),[r,i]=(0,a.useState)(!0);return(0,a.useEffect)((()=>{e.api.admin&&(i(!0),(async()=>{if(await e.api.admin.isAuthenticated()){try{const t=await e.api.admin.fetchCollections();n(t)}catch(t){throw n([]),new Error(`[${t.name}] GetCollections failed: ${t.message}`)}i(!1)}})())}),[e.api.admin]),{collections:t,loading:r}},ko=({sidebar:e,defaultWidth:t,defaultState:n,position:r,renderNav:i})=>{var o,l;const c=Ke(),d=Eo(c),m=c.plugins.getType("screen");it(e),it(m);const p=m.all(),[u,g]=(0,a.useState)(!1),[h,w]=(0,a.useState)(null),[f,v]=a.useState(n),[b,x]=a.useState(t),[y,E]=a.useState(!1),[k,C]=a.useState(!0);a.useEffect((()=>{if("undefined"!==typeof window){const e=window.localStorage.getItem(bo),t=window.localStorage.getItem(xo);null!==e&&v(JSON.parse(e)),null!==t&&x(JSON.parse(t))}}),[]),a.useEffect((()=>{if("undefined"!==typeof window){null===window.localStorage.getItem(bo)&&v(n)}}),[n]),a.useEffect((()=>{"undefined"!==typeof window&&c.enabled&&window.localStorage.setItem(bo,JSON.stringify(f))}),[f,c]),a.useEffect((()=>{y&&window.localStorage.setItem(xo,JSON.stringify(b))}),[b,y]);const N=!1!==c.flags.get("tina-admin"),z=N?[]:c.plugins.getType("content-creator").all();a.useEffect((()=>{const e=()=>{"fullscreen"!==f&&Co({position:r,displayState:f,sidebarWidth:b,resizingSidebar:y})};return e(),window.addEventListener("resize",e),()=>{window.removeEventListener("resize",e)}}),[f,r,b,y]);const S=(0,O.Lm)(),M=i&&(b>vo&&S>vo||"fullscreen"===f&&S>vo),L=i&&(b<vo+1||S<vo+1);return a.createElement(wo.Provider,{value:{sidebarWidth:b,setSidebarWidth:x,displayState:f,setDisplayState:v,position:r,toggleFullscreen:()=>{v("fullscreen"===f?"open":"fullscreen")},toggleSidebarOpen:()=>{v("closed"===f?"open":"closed")},resizingSidebar:y,setResizingSidebar:E,menuIsOpen:u,setMenuIsOpen:g,toggleMenu:()=>{g((e=>!e))},setActiveView:w,formIsPristine:k,setFormIsPristine:C}},a.createElement(a.Fragment,null,a.createElement(Lo,null,a.createElement(Mo,null),M&&a.createElement(po,{showCollections:N,collectionsInfo:d,screens:p,contentCreators:z,sidebarWidth:b,RenderNavSite:({view:e})=>a.createElement(zo,{view:e,onClick:()=>{w(e),g(!1)}}),RenderNavCollection:({collection:e})=>a.createElement(So,{collection:e})}),a.createElement(Fo,null,a.createElement(No,{displayNav:M,renderNav:i,isLocalMode:null==(l=null==(o=c.api)?void 0:o.tina)?void 0:l.isLocalMode}),a.createElement(Wi,null,a.createElement(e.placeholder,null)),h&&a.createElement(ot,{screen:h,close:()=>w(null)})),a.createElement(ho,null)),L&&a.createElement(s.u,{show:u},a.createElement(s.u.Child,{as:a.Fragment,enter:"transform transition-all ease-out duration-300",enterFrom:"opacity-0 -translate-x-full",enterTo:"opacity-100 translate-x-0",leave:"transform transition-all ease-in duration-200",leaveFrom:"opacity-100 translate-x-0",leaveTo:"opacity-0 -translate-x-full"},a.createElement("div",{className:"fixed left-0 top-0 z-overlay h-full transform"},a.createElement(po,{className:"rounded-r-md",showCollections:N,collectionsInfo:d,screens:p,contentCreators:z,sidebarWidth:b,RenderNavSite:({view:e})=>a.createElement(zo,{view:e,onClick:()=>{w(e),g(!1)}}),RenderNavCollection:({collection:e})=>a.createElement(So,{collection:e})},a.createElement("div",{className:"absolute top-8 right-0 transform translate-x-full overflow-hidden"},a.createElement(We,{rounded:"right",variant:"secondary",onClick:()=>{g(!1)},className:"transition-opacity duration-150 ease-out"},a.createElement(ea,{className:"h-6 w-auto"})))))),a.createElement(s.u.Child,{as:a.Fragment,enter:"ease-out duration-300",enterFrom:"opacity-0",enterTo:"opacity-80",entered:"opacity-80",leave:"ease-in duration-200",leaveFrom:"opacity-80",leaveTo:"opacity-0"},a.createElement("div",{onClick:()=>{g(!1)},className:"fixed z-menu inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"})))))},Co=({position:e="overlay",displayState:t,sidebarWidth:n,resizingSidebar:a})=>{const r=document.getElementsByTagName("body")[0],i=window.innerWidth;if("displace"===e)if(r.style.transition=a?"":"all 200ms ease-out","open"===t){const e=Math.min(n,i-440);r.style.paddingLeft=e-6+"px"}else r.style.paddingLeft="0";else r.style.transition="",r.style.paddingLeft="0"},No=({renderNav:e,displayNav:t,isLocalMode:n})=>{const{toggleFullscreen:r,displayState:i,setMenuIsOpen:o,toggleSidebarOpen:l}=a.useContext(wo),s=e&&!t;return a.createElement("div",{className:"flex-grow-0 w-full overflow-visible z-20"},n&&a.createElement(eo,null),a.createElement("div",{className:"mt-4 -mb-14 w-full flex items-center justify-between pointer-events-none"},s&&a.createElement(We,{rounded:"right",variant:"secondary",onClick:()=>{o(!0)},className:"pointer-events-auto -ml-px"},a.createElement(Yn,{className:"h-7 w-auto"})),a.createElement("div",{className:"flex-1"}),a.createElement("div",{className:"flex items-center gap-2 pointer-events-auto transition-opacity duration-150 ease-in-out -mr-px"},a.createElement(We,{rounded:"full",variant:"ghost",onClick:r,className:"pointer-events-auto opacity-50 hover:opacity-100 focus:opacity-80"},"fullscreen"===i?a.createElement(Ri,{className:"h-5 w-auto -mx-1"}):a.createElement(Oi,{className:"h-5 w-auto -mx-1"})),a.createElement(We,{rounded:"left",variant:"secondary",onClick:l,"aria-label":"closes cms sidebar",className:""},a.createElement(pn,{className:"h-6 w-auto"})))))},zo=({view:e,onClick:t})=>a.createElement("button",{className:"text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100",value:e.name,onClick:t},a.createElement(e.Icon,{className:"mr-2 h-6 opacity-80 w-auto"})," ",e.name),So=({collection:e})=>a.createElement("a",{href:`/admin#/collections/${e.name}`,className:"text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100"},a.createElement(Ki,{className:"mr-2 h-6 opacity-80 w-auto"})," ",e.label?e.label:e.name),Mo=({})=>{const{displayState:e,toggleSidebarOpen:t}=a.useContext(wo);return a.createElement(We,{rounded:"right",variant:"primary",onClick:t,className:" absolute top-8 right-0 transition-all duration-150 ease-out "+("closed"!==e?"opacity-0":"translate-x-full pointer-events-auto"),"aria-label":"opens cms sidebar"},a.createElement(Wn,{className:"h-6 w-auto"}))},Lo=({children:e})=>{const{displayState:t,sidebarWidth:n,resizingSidebar:r}=a.useContext(wo);return a.createElement("div",{className:"fixed top-0 left-0 h-screen z-base "+("closed"===t?"pointer-events-none":"")},a.createElement("div",{className:`relative h-screen transform flex ${"closed"!==t?"":"-translate-x-full"} ${r?"transition-none":"fullscreen"===t?"transition-all duration-150 ease-out":"transition-all duration-300 ease-out"}`,style:{width:"fullscreen"===t?"100vw":n+"px",maxWidth:"fullscreen"===t?"100vw":"calc(100vw - 8px)",minWidth:"360px"}},e))},Fo=({children:e})=>{const{displayState:t}=a.useContext(wo);return a.createElement("div",{className:`relative left-0 w-full h-full flex flex-col items-stretch bg-white shadow-2xl overflow-hidden transition-opacity duration-300 ease-out ${"closed"!==t?"opacity-100":"opacity-0"} ${"fullscreen"===t?"":"rounded-r-md"}`},e)};class $o{constructor(e,t,n){this.form=e,this.__type="screen",this.name=e.label,this.Icon=t||dn,this.layout=n||"popup",this.Component=()=>a.createElement(Pt,{form:e})}}class Po{constructor(e={}){var t,n;this.buttons={save:"Save",reset:"Reset"},(null==(t=e.buttons)?void 0:t.save)&&(this.buttons.save=e.buttons.save),(null==(n=e.buttons)?void 0:n.reset)&&(this.buttons.reset=e.buttons.reset)}}const Bo=(0,i.ZP)(We)`
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
`,Ho=i.ZP.span`
  all: unset;
  display: none;
  @media (min-width: 1030px) {
    display: inline;
  }
`,To=({form:e})=>{const[t,n]=(0,a.useState)(!1);return a.createElement(a.Fragment,null,a.createElement(Do,{open:t,onClick:()=>n((e=>!e))}),a.createElement(Zo,{open:t},a.createElement(mt,{click:!0,escape:!0,disabled:!t,allowClickPropagation:!0,onDismiss:()=>{n((e=>!e))}},(null==e?void 0:e.actions)&&e.actions.map(((t,n)=>a.createElement(t,{form:e,key:n}))),a.createElement(Io,null))))},Do=(0,i.ZP)((e=>a.createElement("button",{...e},a.createElement(Q,null))))`
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

  ${e=>e.open&&i.iv`
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
`,Zo=i.ZP.div`
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
  ${e=>e.open&&i.iv`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 55px, 0) scale3d(1, 1, 1);
    `};
`,Vo=(0,i.ZP)(Ft)`
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
`,Io=()=>{const e=Ke();return a.createElement(Vo,{onClick:()=>{e.disable()}},a.createElement(ie,null)," Exit Tina")},jo=()=>{var e;const t=Ke(),n=t.plugins.getType("toolbar:widget"),r=t.plugins.getType("form"),i=r.all().length?r.all()[0]:null,o=null==i?void 0:i.finalForm.getState(),l=((e,t)=>{const[n,r]=a.useState();return a.useEffect((()=>{if(e)return e.subscribe(r,t)}),[e]),n})(i,{pristine:!0,submitting:!0,invalid:!0}),[,s]=a.useState(0),c=t.plugins.getType("screen");it(c);const d=c.all(),m=d.length>0,[p,u]=a.useState(null),[g,h]=a.useState(!1);it(r),it(n);const w=(null==(e=t.toolbar)?void 0:e.buttons)||(null==i?void 0:i.buttons)||{save:"Save",reset:"Reset",invalid:!0},f=i&&i.submit,v=!i,b=!!v||l&&(null==o?void 0:o.pristine),x=!v&&!(!l||!(null==o?void 0:o.submitting)),y=l&&(null==o?void 0:o.invalid);return a.createElement(a.Fragment,null,a.createElement(Xo,null),a.createElement(Ro,{menuIsOpen:g},a.createElement(Yo,null,m&&a.createElement(Ko,{onClick:()=>h(!g),open:g},a.createElement(ee,null)),a.createElement(ao,{sidebar:!1})),a.createElement(Wo,null,n.all().length>=1&&a.createElement(Ao,null,n.all().sort(((e,t)=>e.weight-t.weight)).map((e=>a.createElement(e.component,{key:e.name,...e.props})))),a.createElement(Jo,null,a.createElement(_o,{dirty:!b})),a.createElement(qo,null,a.createElement(Bo,{disabled:v||b,onClick:()=>{i&&(i.reset(),s((e=>e++)))}},a.createElement(ce,null),a.createElement(Ho,null,w.reset)),a.createElement(Oo,{variant:"primary",onClick:f,busy:x,disabled:v||b||y},x&&a.createElement(bt,null),!x&&a.createElement(a.Fragment,null,a.createElement(Ho,null,w.save))),a.createElement(To,{form:i})))),m&&a.createElement(nl,{visible:g},a.createElement(tl,null,a.createElement(Qo,null,d.map((e=>{const t=e.Icon;return a.createElement(el,{key:e.name,value:e.name,onClick:()=>{u(e),h(!1)}},a.createElement(t,null)," ",e.name)})))),a.createElement(al,null)),p&&a.createElement(ot,{screen:p,close:()=>u(null)}))},_o=({dirty:e})=>a.createElement(aa,{name:"Form Status",margin:!1},e?a.createElement(Uo,null,a.createElement(Go,{warning:!0})," ",a.createElement(Ho,null,"Unsaved changes")):a.createElement(Uo,null,a.createElement(Go,null)," ",a.createElement(Ho,null,"No changes"))),Ro=i.ZP.div`
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
`,Oo=(0,i.ZP)(Bo)`
  padding: 0 32px;
`,Ao=i.ZP.div`
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
`,Yo=i.ZP.div`
  grid-area: left;
  justify-self: start;
  display: flex;
  align-items: center;
`,Wo=i.ZP.div`
  grid-area: right;
  justify-self: end;
  display: flex;
  align-items: center;
`,Jo=i.ZP.div`
  display: flex;
  align-items: center;

  > * {
    margin-bottom: 0;
    margin-left: 16px;
  }

  label {
    margin-bottom: 0;
  }
`,qo=i.ZP.div`
  display: flex;
  align-items: center;

  button {
    margin-left: 12px;
  }
`,Xo=i.ZP.div`
  position: relative;
  opacity: 0;
  display: block;
  width: 100%;
  height: var(--tina-toolbar-height);
`,Go=i.ZP.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 8px;
  margin-top: -1px;
  background-color: #3cad3a;
  border: 1px solid #249a21;
  margin-right: 5px;
  opacity: 0.5;

  ${e=>e.warning&&i.iv`
      background-color: #e9d050;
      border: 1px solid #d3ba38;
      opacity: 1;
    `};
`,Uo=i.ZP.p`
  font-size: var(--tina-font-size-3);
  display: flex;
  align-items: center;
  color: var(--tina-color-grey-6);
  padding-right: 4px;
  line-height: 1.35;
  margin: 0;
`,Ko=(0,i.ZP)(We)`
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
  ${e=>e.open&&i.iv`
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
`,Qo=i.ZP.div`
  margin: 0 calc(var(--tina-padding-big) * -1) 32px
    calc(var(--tina-padding-big) * -1);
  display: block;
`,el=i.ZP.div`
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
`,tl=i.ZP.div`
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
`,nl=i.ZP.div`
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
`,al=(0,i.ZP)((({...e})=>a.createElement("div",{...e},a.createElement(oe,null))))`
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
`,rl={__type:"field",name:"markdown",Component:ll("Markdown")},il={__type:"field",name:"html",Component:ll("HTML")},ol=i.ZP.p`
  white-space: normal;
  font-size: var(--tina-font-size-2);
  margin: 8px 0 0 0;

  a {
    color: var(--tina-color-primary);
  }
`;function ll(e,t){return t=>a.createElement(aa,{name:t.input.name,label:`${e} Field not Registered`},a.createElement(ol,null,"The ",e," field is not registered. Some built-in field types are not bundled by default in an effort to control bundle size. Consult the Tina docs to learn how to use this field type."),a.createElement(ol,null,a.createElement("a",{style:{textDecoration:"underline"},href:"https://tina.io/docs/editing/markdown/#registering-the-field-plugins",target:"_blank",rel:"noreferrer noopener"},"Tina Docs: Registering Field Plugins")))}function sl({navigateNext:e,navigatePrev:t,hasNext:n,hasPrev:r,variant:i="secondary"}){return a.createElement("div",{className:"w-full flex flex-shrink-0 justify-end gap-2 items-center"},a.createElement(We,{variant:i,disabled:!r,onClick:t},a.createElement(An,{className:"w-6 h-full mr-2 opacity-70"})," Previous"),a.createElement(We,{variant:i,disabled:!n,onClick:e},"Next ",a.createElement(Xn,{className:"w-6 h-full ml-2 opacity-70"})))}function cl({item:e,onClick:t,onSelect:n,onDelete:r}){return a.createElement(ml,{onClick:()=>t(e),type:e.type},a.createElement(pl,null,e.previewSrc?a.createElement("img",{src:e.previewSrc,alt:e.filename}):a.createElement(dl,{type:e.type})),a.createElement(ul,null,e.filename),a.createElement("div",{className:"flex justify-end gap-2 items-center ml-2"},n&&"file"===e.type&&a.createElement(We,{size:"medium",onClick:()=>n(e)},"Insert"),r&&"file"===e.type&&a.createElement(Je,{size:"medium",onClick:()=>r(e)},a.createElement(le,{className:"w-5/6 h-auto"}))))}function dl({type:e}){return"dir"===e?a.createElement(ge,null):a.createElement(he,null)}const ml=i.ZP.li`
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
    ${e=>"dir"===e.type&&i.iv`
        cursor: pointer;
      `}
  }
`,pl=i.ZP.div`
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
`,ul=i.ZP.span`
  flex-grow: 1;
  font-size: var(--tina-font-size-2);
  overflow: hidden;
  width: 100%;
  overflow-wrap: break-word;
  white-space: nowrap;
  text-overflow: ellipsis;
`;function gl({directory:e="",setDirectory:t}){e=e.replace(/^\/|\/$/g,"");let n=e.match(/.*\//);return"."===n&&(n=""),a.createElement(hl,{showArrow:""!==e},""!==e&&a.createElement("span",{onClick:()=>t(n)},a.createElement(re,{className:"w-8 h-auto"})),a.createElement("button",{onClick:()=>t("")},"Media"),e&&e.split("/").map(((e,n,r)=>{const i=r.slice(0,n+1).join("/");return a.createElement("button",{key:i,onClick:()=>{t(i)}},e)})))}const hl=i.ZP.div`
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

  ${e=>e.showArrow&&i.iv`
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

    ${e=>e.showArrow&&i.iv`
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
`;const wl=function(...e){const[t,n,a]=[0,e.length-1,"/"],r=new RegExp("^"+a),i=new RegExp(a+"$");return(e=e.map((function(e,a){return a===t&&"file://"===e||(a>t&&(e=e.replace(r,"")),a<n&&(e=e.replace(i,""))),e}))).join(a)};function fl(){const e=Sn(),[t,n]=(0,a.useState)();if((0,a.useEffect)((()=>e.events.subscribe("media:open",(({type:e,...t})=>{n(t)}))),[]),!t)return null;const r=()=>n(void 0);return a.createElement(q,null,a.createElement(Ee,null,a.createElement(ve,{close:r},"Media Manager"),a.createElement(G,null,a.createElement(bl,{...t,close:r}))))}const vl=new Te({title:"Error fetching media",message:"Something went wrong while requesting the resource.",docsLink:"https://tina.io/docs/media/#media-store"});function bl({allowDelete:e,onSelect:t,close:n,...r}){var i,o,l,s,c,d,m,p,u,g,h,w,f;const v=Sn(),[b,y]=(0,a.useState)((()=>v.media.isConfigured?"loading":"not-configured")),[E,k]=(0,a.useState)(vl),[C,N]=(0,a.useState)(r.directory),[z,S]=(0,a.useState)({items:[],nextOffset:void 0}),[M,L]=(0,a.useState)(!1),[F,$]=(0,a.useState)([]),[P,B]=(0,a.useState)(""),H=F[F.length-1],T=F.length>0,D=!!z.nextOffset,Z=v.api.tina.isLocalMode,V=Object.keys((null==(l=null==(o=null==(i=v.api.tina.schema.schema)?void 0:i.config)?void 0:o.media)?void 0:l.tina)||{}).includes("mediaRoot")&&Object.keys((null==(d=null==(c=null==(s=v.api.tina.schema.schema)?void 0:s.config)?void 0:c.media)?void 0:d.tina)||{}).includes("publicFolder"),I=V?wl(null==(u=null==(p=null==(m=v.api.tina.schema.schema)?void 0:m.config)?void 0:p.media)?void 0:u.tina.publicFolder,null==(w=null==(h=null==(g=v.api.tina.schema.schema)?void 0:g.config)?void 0:h.media)?void 0:w.tina.mediaRoot):"",j=null==(f=v.api.tina)?void 0:f.branch;function _(){y("loading"),v.media.list({offset:H,limit:v.media.pageSize,directory:C}).then((e=>{S(e),y("loaded")})).catch((e=>{console.error(e),"MediaListError"===e.ERR_TYPE?k(e):k(vl),y("error")}))}(0,a.useEffect)((()=>{if(v.media.isConfigured)return _(),v.events.subscribe(["media:upload:success","media:delete:success","media:pageSize"],_)}),[H,C,v.media.isConfigured]);const R=e=>{"dir"===e.type&&(N(wl(e.directory,e.filename)),$([]))};let O,A;e&&(O=e=>{confirm("Are you sure you want to delete this file?")&&v.media.delete(e)}),t&&(A=e=>{t(e),n&&n()});const[Y,W]=(0,a.useState)(!1),{getRootProps:J,getInputProps:q,isDragActive:X}=(0,x.u)({accept:v.media.accept||"image/*",multiple:!0,onDrop:async e=>{try{W(!0),await v.media.persist(e.map((e=>({directory:C||"/",file:e}))))}catch{}W(!1)}}),{onClick:G,...U}=J();if((0,a.useEffect)((function(){const e=null==document?void 0:document.body;return e.style.overflow="hidden",()=>{e.style.overflow="auto"}}),[]),"loading"===b||Y)return a.createElement(yl,{extraText:P});if("not-configured"===b)return a.createElement(Cl,{title:"No Media Store Configured",message:"To use the media manager, you need to configure a Media Store.",docsLink:"https://tina.io/docs/reference/media/overview/"});if("error"===b){const{title:e,message:t,docsLink:n}=E;return a.createElement(Cl,{title:e,message:t,docsLink:n})}return a.createElement(a.Fragment,null,a.createElement(El,null,a.createElement("div",{className:"flex items-center bg-white border-b border-gray-100 gap-x-3 py-3 px-5 shadow-sm flex-shrink-0"},a.createElement(gl,{directory:C,setDirectory:N}),!Z&&V&&a.createElement(We,{busy:!1,variant:"white",onClick:()=>{L(!0)}},"Sync ",a.createElement(ta,{className:"w-6 h-full ml-2 opacity-70"})),a.createElement(xl,{onClick:G,uploading:Y})),a.createElement("ul",{...U,className:"flex flex-1 flex-col gap-4 p-5 m-0 h-full overflow-y-auto "+(X?"border-2 border-blue-500 rounded-lg":"")},a.createElement("input",{...q()}),"loaded"===b&&0===z.items.length&&a.createElement(kl,null),z.items.map((e=>a.createElement(cl,{key:e.id,item:e,onClick:R,onSelect:A,onDelete:O})))),a.createElement("div",{className:"bg-white border-t border-gray-100 py-3 px-5 shadow-sm z-10"},a.createElement(sl,{hasNext:D,navigateNext:()=>{z.nextOffset&&$([...F,z.nextOffset])},hasPrev:T,navigatePrev:()=>{const e=F.slice(0,F.length-1);$(e)}}))),M&&a.createElement(Nl,{folder:I,branch:j,syncFunc:async()=>{if(V){const t=await v.api.tina.syncTinaMedia();if(null==t?void 0:t.assetsSyncing)try{y("loading"),await async function(e,t,n){const a=Number(new Date)+(t||2e3);n=n||100;const r=async function(t,i){const o=await e();o.complete?t(o):Number(new Date)<a?setTimeout(r,n,t,i):i(new Error("Time out error"))};return new Promise(r)}((async()=>{var e,n;const a=await v.api.tina.checkSyncStatus({assetsSyncing:t.assetsSyncing}),r=null==(e=Object.values(a.status).filter(Boolean))?void 0:e.length,i=null==(n=Object.keys(a.status))?void 0:n.length;return B(`${r}/${i} Media items loaded`),a}),6e4,3e3),B(""),_()}catch(e){v.alerts.error("Error in syncing media, check console for more details"),console.error("'Error in syncing media, check below for more details"),console.error(e)}else v.alerts.warn("Whoops, Looks media is not set up correctly in Tina Cloud. Check console for more details"),console.warn("Whoops, Looks media is not set up correctly. Check below for more details"),console.warn(t)}},close:()=>{L(!1)}}))}const xl=({onClick:e,uploading:t})=>a.createElement(We,{variant:"primary",size:"custom",className:"text-sm h-10 px-6",busy:t,onClick:e},t?a.createElement(bt,null):a.createElement(a.Fragment,null,"Upload ",a.createElement(jn,{className:"w-6 h-full ml-2 opacity-70"}))),yl=e=>a.createElement("div",{className:"w-full h-full flex flex-col items-center justify-center",...e},e.extraText&&a.createElement("p",null,e.extraText),a.createElement(bt,{color:"var(--tina-color-primary)"})),El=({children:e})=>a.createElement("div",{className:"h-full flex-1 text-gray-700 flex flex-col relative bg-gray-50 outline-none active:outline-none focus:outline-none"},e),kl=e=>a.createElement("div",{className:"text-2xl opacity-50 p-12 text-center",...e},"Drag and Drop assets here"),Cl=({title:e,message:t,docsLink:n,...r})=>a.createElement("div",{className:"h-3/4 text-center flex flex-col justify-center",...r},a.createElement("h2",{className:"mb-3 text-xl text-gray-600"},e),a.createElement("div",{className:"mb-3 text-base text-gray-700"},t),a.createElement("a",{href:n,target:"_blank",rel:"noreferrer noopener",className:"font-bold text-blue-500 hover:text-blue-600 hover:underline transition-all ease-out duration-150"},"Learn More")),Nl=({close:e,syncFunc:t,folder:n,branch:r})=>a.createElement(q,null,a.createElement(Ne,null,a.createElement(ve,{close:e},"Sync Media"),a.createElement(G,{padded:!0},a.createElement("p",null,`This will copy all media from the \`${n}\` folder on branch \`${r}\` in your git repository to Tina Cloud. Are\n            you sure you would like to perform this action?`)),a.createElement(X,null,a.createElement(We,{style:{flexGrow:2},onClick:e},"Cancel"),a.createElement(We,{style:{flexGrow:3},variant:"primary",onClick:async()=>{await t(),e()}},"Sync Media")))),zl=Ge({name:"Media Manager",Component:bl,Icon:function(e){return on({tag:"svg",attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",d:"M0 0h24v24H0V0z"}},{tag:"path",attr:{d:"M20 4v12H8V4h12m0-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 9.67l1.69 2.26 2.48-3.1L19 15H9zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"}}]})(e)},layout:"fullscreen",props:{allowDelete:!0}}),Sl=[Ci,ki,Ga,ja,xi,Ni,yi,bi,Ei,ha,Ma,Xa,Va,Li,Hi,rl,il,Ti,Di];class Ml extends je{constructor({sidebar:e,toolbar:t,alerts:n={},...a}={}){if(super(a),this.alerts.setMap({"media:upload:failure":()=>({level:"error",message:"Failed to upload file."}),"media:delete:failure":()=>({level:"error",message:"Failed to delete file."}),...n}),e){const t="object"===typeof e?e:void 0;this.sidebar=new _i(this.events,t)}if(t){const e="object"===typeof t?t:void 0;this.toolbar=new Po(e)}Sl.forEach((e=>{this.fields.find(e.name)||this.fields.add(e)})),this.plugins.add(zl)}get alerts(){return this._alerts||(this._alerts=new _e(this.events)),this._alerts}registerApi(e,t){t.alerts&&this.alerts.setMap(t.alerts),super.registerApi(e,t)}get forms(){return this.plugins.findOrCreateMap("form")}get fields(){return this.plugins.findOrCreateMap("field")}get screens(){return this.plugins.findOrCreateMap("screen")}}const Ll=({cms:e,children:t})=>{if(!(e instanceof Ml))throw new Error("The `cms` prop must be an instance of `TinaCMS`.");return a.createElement(Ue.Provider,{value:e},t)};function Fl({alerts:e}){return it(e),e.all.length?a.createElement($l,null,e.all.map(((t,n)=>a.createElement(Bl,{key:t.id,index:n,level:t.level,onClick:()=>{e.dismiss(t)}},"info"===t.level&&a.createElement(me,null),"success"===t.level&&a.createElement(de,null),"warn"===t.level&&a.createElement(pe,null),"error"===t.level&&a.createElement(ue,null),a.createElement("p",null,t.message),a.createElement(Hl,null))))):null}const $l=i.ZP.div`
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
`,Pl=i.F4`
  0% {
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`,Bl=i.ZP.div`
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

  animation-name: ${Pl};
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

  ${e=>"info"===e.level&&i.iv`
      fill: var(--tina-color-primary);
      border-left: 6px solid var(--tina-color-primary);
    `};

  ${e=>"success"===e.level&&i.iv`
      fill: var(--tina-color-success);
      border-left: 6px solid var(--tina-color-success);
    `};

  ${e=>"warn"===e.level&&i.iv`
      fill: var(--tina-color-warning-dark);
      border-left: 6px solid var(--tina-color-warning);
    `};

  ${e=>"error"===e.level&&i.iv`
      fill: var(--tina-color-error);
      border-left: 6px solid var(--tina-color-error);
    `};
`,Hl=(0,i.ZP)((({...e})=>a.createElement("button",{...e},a.createElement(K,null))))`
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
`,Tl=a.createContext(-1),Dl=({children:e})=>{const t=a.useRef(null),[n,r]=a.useState(0);return a.useEffect((()=>{if(!t)return;const e=new MutationObserver((()=>r((e=>e+1))));return e.observe(t.current,{childList:!0,subtree:!0,characterData:!0}),()=>e.disconnect()}),[]),a.createElement(Tl.Provider,{value:n},a.createElement("div",{ref:t},e))},Zl=i.ZP.div`
  position: fixed;
  z-index: var(--tina-z-index-3);
  left: 0;
  padding: 8px 0;
  margin-left: var(--tina-sidebar-width);
  width: calc(100% - var(--tina-sidebar-width));
  text-align: center;
  top: ${e=>"top"===e.position?0:"auto"};
  bottom: ${e=>"top"===e.position?"auto":0};
`,Vl=i.ZP.div`
  display: inline-block;
  fill: white;
  background-color: var(--tina-color-primary);
  border-radius: 50%;
  box-shadow: 0 0 10px -5px;
`,Il=()=>a.createElement(Zl,{position:"top"},a.createElement(Vl,null,a.createElement(ne,{className:"w-8 h-auto"}))),jl=()=>a.createElement(Zl,{position:"bottom"},a.createElement(Vl,null,a.createElement(te,{className:"w-8 h-auto"}))),_l=()=>{const[e,t]=a.useState(null),[n,r]=a.useState(!1),[i,o]=a.useState(!1),l=(e=>{const t=a.useContext(Tl),[n,r]=a.useState(null);return a.useEffect((()=>{const t=document.querySelector(`[data-tinafield="${e}"]`);r(t)}),[t,e]),n})(e);a.useEffect((()=>{let e;return l?(r(!0),o(l.getBoundingClientRect())):e=setTimeout((()=>{r(!1)}),150),()=>{clearTimeout(e)}}),[l]);const[,s]=a.useState(0),c=()=>s((e=>e+1));a.useEffect((()=>(window.addEventListener("scroll",c),()=>{window.removeEventListener("scroll",c)})),[]);const{subscribe:d}=rt("field:hover");if(a.useEffect((()=>d((({fieldName:e})=>{t(e)})))),(()=>{const{subscribe:e}=rt("field:focus");a.useEffect((()=>e((({fieldName:e})=>{const t=document.querySelector(`[data-tinafield="${e}"]`);if(!t)return;const{top:n,height:a}=t.getBoundingClientRect(),r=n+window.scrollY,i=n+a+window.scrollY,o=window.scrollY,l=window.innerHeight+window.scrollY;a<window.innerHeight?i>l?window.scrollTo({top:i-window.innerHeight,behavior:"smooth"}):r<o&&window.scrollTo({top:r,behavior:"smooth"}):i<l?window.scrollTo({top:i-window.innerHeight,behavior:"smooth"}):r>o&&window.scrollTo({top:r,behavior:"smooth"})}))))})(),!n)return null;const m=i.top+window.scrollY,p=i.top+i.height+window.scrollY,u=window.scrollY;return m>window.innerHeight+window.scrollY?a.createElement(jl,null):p<u?a.createElement(Il,null):a.createElement("div",{style:{position:"absolute",zIndex:"var(--tina-z-index-3)",top:i.top+window.scrollY,left:i.left+window.scrollX,width:i.width,height:i.height,outline:"2px dashed var(--tina-color-indicator)",borderRadius:"var(--tina-radius-small)",transition:n?l?"opacity 300ms ease-out":"opacity 150ms ease-in":"none",opacity:l&&n?.8:0}})};var Rl=(()=>'.tina-tailwind {\n  line-height: 1.5;\n  -webkit-text-size-adjust: 100%;\n  -moz-tab-size: 4;\n  tab-size: 4;\n}\n\n  .tina-tailwind *,\n  .tina-tailwind ::before,\n  .tina-tailwind ::after {\n    box-sizing: border-box;\n    border-width: 0;\n    border-style: solid;\n    border-color: transparent;\n  }\n\n  .tina-tailwind ::before,\n  .tina-tailwind ::after {\n    --tw-content: \'\';\n  }\n\n  .tina-tailwind hr {\n    height: 0; /* 1 */\n    color: inherit; /* 2 */\n    border-top-width: 1px; /* 3 */\n  }\n\n  .tina-tailwind abbr:where([title]) {\n    text-decoration: underline dotted;\n  }\n\n  .tina-tailwind h1,\n  .tina-tailwind h2,\n  .tina-tailwind h3,\n  .tina-tailwind h4,\n  .tina-tailwind h5,\n  .tina-tailwind h6 {\n    font-size: inherit;\n    font-weight: inherit;\n  }\n\n  .tina-tailwind a {\n    color: inherit;\n    text-decoration: inherit;\n  }\n\n  .tina-tailwind b,\n  .tina-tailwind strong {\n    font-weight: bolder;\n  }\n\n  .tina-tailwind code,\n  .tina-tailwind kbd,\n  .tina-tailwind samp,\n  .tina-tailwind pre {\n    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; /* 1 */\n    font-size: 1em; /* 2 */\n  }\n\n  .tina-tailwind small {\n    font-size: 80%;\n  }\n\n  .tina-tailwind sub,\n  .tina-tailwind sup {\n    font-size: 75%;\n    line-height: 0;\n    position: relative;\n    vertical-align: baseline;\n  }\n\n  .tina-tailwind sub {\n    bottom: -0.25em;\n  }\n\n  .tina-tailwind sup {\n    top: -0.5em;\n  }\n\n  .tina-tailwind table {\n    text-indent: 0; /* 1 */\n    border-color: inherit; /* 2 */\n    border-collapse: collapse; /* 3 */\n  }\n\n  .tina-tailwind button,\n  .tina-tailwind input,\n  .tina-tailwind optgroup,\n  .tina-tailwind select,\n  .tina-tailwind textarea {\n    font-family: inherit; /* 1 */\n    font-size: 100%; /* 1 */\n    line-height: inherit; /* 1 */\n    color: inherit; /* 1 */\n    margin: 0; /* 2 */\n    padding: 0; /* 3 */\n  }\n\n  .tina-tailwind button,\n  .tina-tailwind select {\n    text-transform: none;\n  }\n\n  .tina-tailwind button,\n  .tina-tailwind [type=\'button\'],\n  .tina-tailwind [type=\'reset\'],\n  .tina-tailwind [type=\'submit\'] {\n    -webkit-appearance: button; /* 1 */\n    background-color: transparent; /* 2 */\n    background-image: none; /* 2 */\n  }\n\n  .tina-tailwind :-moz-focusring {\n    outline: auto;\n  }\n\n  .tina-tailwind :-moz-ui-invalid {\n    box-shadow: none;\n  }\n\n  .tina-tailwind progress {\n    vertical-align: baseline;\n  }\n\n  .tina-tailwind ::-webkit-inner-spin-button,\n  .tina-tailwind ::-webkit-outer-spin-button {\n    height: auto;\n  }\n\n  .tina-tailwind [type=\'search\'] {\n    -webkit-appearance: textfield; /* 1 */\n    outline-offset: -2px; /* 2 */\n  }\n\n  .tina-tailwind ::-webkit-search-decoration {\n    -webkit-appearance: none;\n  }\n\n  .tina-tailwind ::-webkit-file-upload-button {\n    -webkit-appearance: button; /* 1 */\n    font: inherit; /* 2 */\n  }\n\n  .tina-tailwind summary {\n    display: list-item;\n  }\n\n  .tina-tailwind blockquote,\n  .tina-tailwind dl,\n  .tina-tailwind dd,\n  .tina-tailwind h1,\n  .tina-tailwind h2,\n  .tina-tailwind h3,\n  .tina-tailwind h4,\n  .tina-tailwind h5,\n  .tina-tailwind h6,\n  .tina-tailwind hr,\n  .tina-tailwind figure,\n  .tina-tailwind p,\n  .tina-tailwind pre {\n    margin: 0;\n  }\n\n  .tina-tailwind fieldset {\n    margin: 0;\n    padding: 0;\n  }\n\n  .tina-tailwind legend {\n    padding: 0;\n  }\n\n  .tina-tailwind ol,\n  .tina-tailwind ul,\n  .tina-tailwind menu {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n  }\n\n  .tina-tailwind li:before {\n    display: none;\n  }\n\n  .tina-tailwind textarea {\n    resize: vertical;\n  }\n\n  .tina-tailwind input::placeholder,\n  .tina-tailwind textarea::placeholder {\n    opacity: 1; /* 1 */\n    color: #918c9e; /* 2 */\n  }\n\n  .tina-tailwind button,\n  .tina-tailwind [role=\'button\'] {\n    cursor: pointer;\n  }\n\n  .tina-tailwind :disabled {\n    cursor: default;\n  }\n\n  .tina-tailwind img,\n  .tina-tailwind svg,\n  .tina-tailwind video,\n  .tina-tailwind canvas,\n  .tina-tailwind audio,\n  .tina-tailwind iframe,\n  .tina-tailwind embed,\n  .tina-tailwind object {\n    display: block; /* 1 */\n    vertical-align: middle; /* 2 */\n  }\n\n  .tina-tailwind img,\n  .tina-tailwind video {\n    max-width: 100%;\n    height: auto;\n  }\n\n  .tina-tailwind [hidden] {\n    display: none;\n  }\n*, ::before, ::after {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(0 132 255 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n}\n::backdrop {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(0 132 255 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n}\n.container {\n  width: 100%;\n}\n@media (min-width: 640px) {\n\n  .container {\n    max-width: 640px;\n  }\n}\n@media (min-width: 768px) {\n\n  .container {\n    max-width: 768px;\n  }\n}\n@media (min-width: 1024px) {\n\n  .container {\n    max-width: 1024px;\n  }\n}\n@media (min-width: 1280px) {\n\n  .container {\n    max-width: 1280px;\n  }\n}\n@media (min-width: 1536px) {\n\n  .container {\n    max-width: 1536px;\n  }\n}\n.tina-prose {\n  color: var(--tw-prose-body);\n  max-width: 65ch;\n}\n.tina-prose :where([class~="lead"]):not(:where([class~="not-tina-prose"] *)) {\n  color: var(--tw-prose-lead);\n  font-size: 1.25em;\n  line-height: 1.6;\n  margin-top: 1.2em;\n  margin-bottom: 1.2em;\n}\n.tina-prose :where(a):not(:where([class~="not-tina-prose"] *)) {\n  color: var(--tw-prose-links);\n  text-decoration: underline;\n  font-weight: 500;\n}\n.tina-prose :where(strong):not(:where([class~="not-tina-prose"] *)) {\n  color: var(--tw-prose-bold);\n  font-weight: 600;\n}\n.tina-prose :where(ol):not(:where([class~="not-tina-prose"] *)) {\n  list-style-type: decimal;\n  padding-left: 1.625em;\n}\n.tina-prose :where(ol[type="A"]):not(:where([class~="not-tina-prose"] *)) {\n  list-style-type: upper-alpha;\n}\n.tina-prose :where(ol[type="a"]):not(:where([class~="not-tina-prose"] *)) {\n  list-style-type: lower-alpha;\n}\n.tina-prose :where(ol[type="A" s]):not(:where([class~="not-tina-prose"] *)) {\n  list-style-type: upper-alpha;\n}\n.tina-prose :where(ol[type="a" s]):not(:where([class~="not-tina-prose"] *)) {\n  list-style-type: lower-alpha;\n}\n.tina-prose :where(ol[type="I"]):not(:where([class~="not-tina-prose"] *)) {\n  list-style-type: upper-roman;\n}\n.tina-prose :where(ol[type="i"]):not(:where([class~="not-tina-prose"] *)) {\n  list-style-type: lower-roman;\n}\n.tina-prose :where(ol[type="I" s]):not(:where([class~="not-tina-prose"] *)) {\n  list-style-type: upper-roman;\n}\n.tina-prose :where(ol[type="i" s]):not(:where([class~="not-tina-prose"] *)) {\n  list-style-type: lower-roman;\n}\n.tina-prose :where(ol[type="1"]):not(:where([class~="not-tina-prose"] *)) {\n  list-style-type: decimal;\n}\n.tina-prose :where(ul):not(:where([class~="not-tina-prose"] *)) {\n  list-style-type: disc;\n  padding-left: 1.625em;\n}\n.tina-prose :where(ol > li):not(:where([class~="not-tina-prose"] *))::marker {\n  font-weight: 400;\n  color: var(--tw-prose-counters);\n}\n.tina-prose :where(ul > li):not(:where([class~="not-tina-prose"] *))::marker {\n  color: var(--tw-prose-bullets);\n}\n.tina-prose :where(hr):not(:where([class~="not-tina-prose"] *)) {\n  border-color: var(--tw-prose-hr);\n  border-top-width: 1px;\n  margin-top: 3em;\n  margin-bottom: 3em;\n}\n.tina-prose :where(blockquote):not(:where([class~="not-tina-prose"] *)) {\n  font-weight: 500;\n  font-style: italic;\n  color: var(--tw-prose-quotes);\n  border-left-width: 0.25rem;\n  border-left-color: var(--tw-prose-quote-borders);\n  quotes: "\\201C""\\201D""\\2018""\\2019";\n  margin-top: 1.6em;\n  margin-bottom: 1.6em;\n  padding-left: 1em;\n}\n.tina-prose :where(blockquote p:first-of-type):not(:where([class~="not-tina-prose"] *))::before {\n  content: open-quote;\n}\n.tina-prose :where(blockquote p:last-of-type):not(:where([class~="not-tina-prose"] *))::after {\n  content: close-quote;\n}\n.tina-prose :where(h1):not(:where([class~="not-tina-prose"] *)) {\n  color: var(--tw-prose-headings);\n  font-weight: 800;\n  font-size: 2.25em;\n  margin-top: 0;\n  margin-bottom: 0.8888889em;\n  line-height: 1.1111111;\n}\n.tina-prose :where(h1 strong):not(:where([class~="not-tina-prose"] *)) {\n  font-weight: 900;\n}\n.tina-prose :where(h2):not(:where([class~="not-tina-prose"] *)) {\n  color: var(--tw-prose-headings);\n  font-weight: 700;\n  font-size: 1.5em;\n  margin-top: 2em;\n  margin-bottom: 1em;\n  line-height: 1.3333333;\n}\n.tina-prose :where(h2 strong):not(:where([class~="not-tina-prose"] *)) {\n  font-weight: 800;\n}\n.tina-prose :where(h3):not(:where([class~="not-tina-prose"] *)) {\n  color: var(--tw-prose-headings);\n  font-weight: 600;\n  font-size: 1.25em;\n  margin-top: 1.6em;\n  margin-bottom: 0.6em;\n  line-height: 1.6;\n}\n.tina-prose :where(h3 strong):not(:where([class~="not-tina-prose"] *)) {\n  font-weight: 700;\n}\n.tina-prose :where(h4):not(:where([class~="not-tina-prose"] *)) {\n  color: var(--tw-prose-headings);\n  font-weight: 600;\n  margin-top: 1.5em;\n  margin-bottom: 0.5em;\n  line-height: 1.5;\n}\n.tina-prose :where(h4 strong):not(:where([class~="not-tina-prose"] *)) {\n  font-weight: 700;\n}\n.tina-prose :where(figure > *):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 0;\n  margin-bottom: 0;\n}\n.tina-prose :where(figcaption):not(:where([class~="not-tina-prose"] *)) {\n  color: var(--tw-prose-captions);\n  font-size: 0.875em;\n  line-height: 1.4285714;\n  margin-top: 0.8571429em;\n}\n.tina-prose :where(code):not(:where([class~="not-tina-prose"] *)) {\n  color: var(--tw-prose-code);\n  font-weight: 600;\n  font-size: 0.875em;\n}\n.tina-prose :where(code):not(:where([class~="not-tina-prose"] *))::before {\n  content: "`";\n}\n.tina-prose :where(code):not(:where([class~="not-tina-prose"] *))::after {\n  content: "`";\n}\n.tina-prose :where(a code):not(:where([class~="not-tina-prose"] *)) {\n  color: var(--tw-prose-links);\n}\n.tina-prose :where(pre):not(:where([class~="not-tina-prose"] *)) {\n  color: var(--tw-prose-pre-code);\n  background-color: var(--tw-prose-pre-bg);\n  overflow-x: auto;\n  font-weight: 400;\n  font-size: 0.875em;\n  line-height: 1.7142857;\n  margin-top: 1.7142857em;\n  margin-bottom: 1.7142857em;\n  border-radius: 0.375rem;\n  padding-top: 0.8571429em;\n  padding-right: 1.1428571em;\n  padding-bottom: 0.8571429em;\n  padding-left: 1.1428571em;\n}\n.tina-prose :where(pre code):not(:where([class~="not-tina-prose"] *)) {\n  background-color: transparent;\n  border-width: 0;\n  border-radius: 0;\n  padding: 0;\n  font-weight: inherit;\n  color: inherit;\n  font-size: inherit;\n  font-family: inherit;\n  line-height: inherit;\n}\n.tina-prose :where(pre code):not(:where([class~="not-tina-prose"] *))::before {\n  content: none;\n}\n.tina-prose :where(pre code):not(:where([class~="not-tina-prose"] *))::after {\n  content: none;\n}\n.tina-prose :where(table):not(:where([class~="not-tina-prose"] *)) {\n  width: 100%;\n  table-layout: auto;\n  text-align: left;\n  margin-top: 2em;\n  margin-bottom: 2em;\n  font-size: 0.875em;\n  line-height: 1.7142857;\n}\n.tina-prose :where(thead):not(:where([class~="not-tina-prose"] *)) {\n  border-bottom-width: 1px;\n  border-bottom-color: var(--tw-prose-th-borders);\n}\n.tina-prose :where(thead th):not(:where([class~="not-tina-prose"] *)) {\n  color: var(--tw-prose-headings);\n  font-weight: 600;\n  vertical-align: bottom;\n  padding-right: 0.5714286em;\n  padding-bottom: 0.5714286em;\n  padding-left: 0.5714286em;\n}\n.tina-prose :where(tbody tr):not(:where([class~="not-tina-prose"] *)) {\n  border-bottom-width: 1px;\n  border-bottom-color: var(--tw-prose-td-borders);\n}\n.tina-prose :where(tbody tr:last-child):not(:where([class~="not-tina-prose"] *)) {\n  border-bottom-width: 0;\n}\n.tina-prose :where(tbody td):not(:where([class~="not-tina-prose"] *)) {\n  vertical-align: baseline;\n  padding-top: 0.5714286em;\n  padding-right: 0.5714286em;\n  padding-bottom: 0.5714286em;\n  padding-left: 0.5714286em;\n}\n.tina-prose {\n  --tw-prose-body: #374151;\n  --tw-prose-headings: #111827;\n  --tw-prose-lead: #4b5563;\n  --tw-prose-links: #111827;\n  --tw-prose-bold: #111827;\n  --tw-prose-counters: #6b7280;\n  --tw-prose-bullets: #d1d5db;\n  --tw-prose-hr: #e5e7eb;\n  --tw-prose-quotes: #111827;\n  --tw-prose-quote-borders: #e5e7eb;\n  --tw-prose-captions: #6b7280;\n  --tw-prose-code: #111827;\n  --tw-prose-pre-code: #e5e7eb;\n  --tw-prose-pre-bg: #1f2937;\n  --tw-prose-th-borders: #d1d5db;\n  --tw-prose-td-borders: #e5e7eb;\n  --tw-prose-invert-body: #d1d5db;\n  --tw-prose-invert-headings: #fff;\n  --tw-prose-invert-lead: #9ca3af;\n  --tw-prose-invert-links: #fff;\n  --tw-prose-invert-bold: #fff;\n  --tw-prose-invert-counters: #9ca3af;\n  --tw-prose-invert-bullets: #4b5563;\n  --tw-prose-invert-hr: #374151;\n  --tw-prose-invert-quotes: #f3f4f6;\n  --tw-prose-invert-quote-borders: #374151;\n  --tw-prose-invert-captions: #9ca3af;\n  --tw-prose-invert-code: #fff;\n  --tw-prose-invert-pre-code: #d1d5db;\n  --tw-prose-invert-pre-bg: rgb(0 0 0 / 50%);\n  --tw-prose-invert-th-borders: #4b5563;\n  --tw-prose-invert-td-borders: #374151;\n  font-size: 1rem;\n  line-height: 1.75;\n}\n.tina-prose :where(p):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 1.25em;\n  margin-bottom: 1.25em;\n}\n.tina-prose :where(img):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 2em;\n  margin-bottom: 2em;\n}\n.tina-prose :where(video):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 2em;\n  margin-bottom: 2em;\n}\n.tina-prose :where(figure):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 2em;\n  margin-bottom: 2em;\n}\n.tina-prose :where(h2 code):not(:where([class~="not-tina-prose"] *)) {\n  font-size: 0.875em;\n}\n.tina-prose :where(h3 code):not(:where([class~="not-tina-prose"] *)) {\n  font-size: 0.9em;\n}\n.tina-prose :where(li):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 0.5em;\n  margin-bottom: 0.5em;\n}\n.tina-prose :where(ol > li):not(:where([class~="not-tina-prose"] *)) {\n  padding-left: 0.375em;\n}\n.tina-prose :where(ul > li):not(:where([class~="not-tina-prose"] *)) {\n  padding-left: 0.375em;\n}\n.tina-prose > :where(ul > li p):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 0.75em;\n  margin-bottom: 0.75em;\n}\n.tina-prose > :where(ul > li > *:first-child):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 1.25em;\n}\n.tina-prose > :where(ul > li > *:last-child):not(:where([class~="not-tina-prose"] *)) {\n  margin-bottom: 1.25em;\n}\n.tina-prose > :where(ol > li > *:first-child):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 1.25em;\n}\n.tina-prose > :where(ol > li > *:last-child):not(:where([class~="not-tina-prose"] *)) {\n  margin-bottom: 1.25em;\n}\n.tina-prose :where(ul ul, ul ol, ol ul, ol ol):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 0.75em;\n  margin-bottom: 0.75em;\n}\n.tina-prose :where(hr + *):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 0;\n}\n.tina-prose :where(h2 + *):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 0;\n}\n.tina-prose :where(h3 + *):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 0;\n}\n.tina-prose :where(h4 + *):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 0;\n}\n.tina-prose :where(thead th:first-child):not(:where([class~="not-tina-prose"] *)) {\n  padding-left: 0;\n}\n.tina-prose :where(thead th:last-child):not(:where([class~="not-tina-prose"] *)) {\n  padding-right: 0;\n}\n.tina-prose :where(tbody td:first-child):not(:where([class~="not-tina-prose"] *)) {\n  padding-left: 0;\n}\n.tina-prose :where(tbody td:last-child):not(:where([class~="not-tina-prose"] *)) {\n  padding-right: 0;\n}\n.tina-prose > :where(:first-child):not(:where([class~="not-tina-prose"] *)) {\n  margin-top: 0;\n}\n.tina-prose > :where(:last-child):not(:where([class~="not-tina-prose"] *)) {\n  margin-bottom: 0;\n}\n.tina-tailwind .sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n.tina-tailwind .pointer-events-none {\n  pointer-events: none;\n}\n.tina-tailwind .pointer-events-auto {\n  pointer-events: auto;\n}\n.tina-tailwind .visible {\n  visibility: visible;\n}\n.tina-tailwind .\\!visible {\n  visibility: visible !important;\n}\n.tina-tailwind .static {\n  position: static;\n}\n.tina-tailwind .fixed {\n  position: fixed;\n}\n.tina-tailwind .absolute {\n  position: absolute;\n}\n.tina-tailwind .relative {\n  position: relative;\n}\n.tina-tailwind .sticky {\n  position: sticky;\n}\n.tina-tailwind .inset-0 {\n  top: 0px;\n  right: 0px;\n  bottom: 0px;\n  left: 0px;\n}\n.tina-tailwind .right-0 {\n  right: 0px;\n}\n.tina-tailwind .right-3 {\n  right: 12px;\n}\n.tina-tailwind .top-1\\/2 {\n  top: 50%;\n}\n.tina-tailwind .right-2\\.5 {\n  right: 10px;\n}\n.tina-tailwind .right-2 {\n  right: 8px;\n}\n.tina-tailwind .left-0 {\n  left: 0px;\n}\n.tina-tailwind .top-0 {\n  top: 0px;\n}\n.tina-tailwind .left-1\\/2 {\n  left: 50%;\n}\n.tina-tailwind .bottom-0 {\n  bottom: 0px;\n}\n.tina-tailwind .bottom-3 {\n  bottom: 12px;\n}\n.tina-tailwind .right-5 {\n  right: 20px;\n}\n.tina-tailwind .top-8 {\n  top: 32px;\n}\n.tina-tailwind .-bottom-1 {\n  bottom: -4px;\n}\n.tina-tailwind .top-1 {\n  top: 4px;\n}\n.tina-tailwind .right-1 {\n  right: 4px;\n}\n.tina-tailwind .-top-2 {\n  top: -8px;\n}\n.tina-tailwind .-top-4 {\n  top: -16px;\n}\n.tina-tailwind .z-10 {\n  z-index: 10;\n}\n.tina-tailwind .z-20 {\n  z-index: 20;\n}\n.tina-tailwind .z-40 {\n  z-index: 40;\n}\n.tina-tailwind .z-modal {\n  z-index: 10800;\n}\n.tina-tailwind .-z-1 {\n  z-index: -1;\n}\n.tina-tailwind .z-30 {\n  z-index: 30;\n}\n.tina-tailwind .z-50 {\n  z-index: 50;\n}\n.tina-tailwind .z-100 {\n  z-index: 100;\n}\n.tina-tailwind .z-overlay {\n  z-index: 10600;\n}\n.tina-tailwind .z-menu {\n  z-index: 9800;\n}\n.tina-tailwind .z-base {\n  z-index: 9000;\n}\n.tina-tailwind .z-panel {\n  z-index: 9400;\n}\n.tina-tailwind .m-0 {\n  margin: 0px;\n}\n.tina-tailwind .mx-auto {\n  margin-left: auto;\n  margin-right: auto;\n}\n.tina-tailwind .-mx-0\\.5 {\n  margin-left: -2px;\n  margin-right: -2px;\n}\n.tina-tailwind .-mx-0 {\n  margin-left: -0px;\n  margin-right: -0px;\n}\n.tina-tailwind .-mx-1 {\n  margin-left: -4px;\n  margin-right: -4px;\n}\n.tina-tailwind .my-0 {\n  margin-top: 0px;\n  margin-bottom: 0px;\n}\n.tina-tailwind .my-2 {\n  margin-top: 8px;\n  margin-bottom: 8px;\n}\n.tina-tailwind .my-4 {\n  margin-top: 16px;\n  margin-bottom: 16px;\n}\n.tina-tailwind .ml-2 {\n  margin-left: 8px;\n}\n.tina-tailwind .mb-3 {\n  margin-bottom: 12px;\n}\n.tina-tailwind .mr-2 {\n  margin-right: 8px;\n}\n.tina-tailwind .mt-0 {\n  margin-top: 0px;\n}\n.tina-tailwind .-mr-1 {\n  margin-right: -4px;\n}\n.tina-tailwind .mb-4 {\n  margin-bottom: 16px;\n}\n.tina-tailwind .mr-0\\.5 {\n  margin-right: 2px;\n}\n.tina-tailwind .mr-0 {\n  margin-right: 0px;\n}\n.tina-tailwind .mb-6 {\n  margin-bottom: 24px;\n}\n.tina-tailwind .ml-1\\.5 {\n  margin-left: 6px;\n}\n.tina-tailwind .ml-1 {\n  margin-left: 4px;\n}\n.tina-tailwind .mb-5 {\n  margin-bottom: 20px;\n}\n.tina-tailwind .-mt-px {\n  margin-top: -1px;\n}\n.tina-tailwind .-mt-0\\.5 {\n  margin-top: -2px;\n}\n.tina-tailwind .-mt-0 {\n  margin-top: -0px;\n}\n.tina-tailwind .mb-2 {\n  margin-bottom: 8px;\n}\n.tina-tailwind .-mb-px {\n  margin-bottom: -1px;\n}\n.tina-tailwind .mr-1 {\n  margin-right: 4px;\n}\n.tina-tailwind .-ml-1 {\n  margin-left: -4px;\n}\n.tina-tailwind .mt-8 {\n  margin-top: 32px;\n}\n.tina-tailwind .mr-3 {\n  margin-right: 12px;\n}\n.tina-tailwind .mt-4 {\n  margin-top: 16px;\n}\n.tina-tailwind .-mb-14 {\n  margin-bottom: -56px;\n}\n.tina-tailwind .-ml-px {\n  margin-left: -1px;\n}\n.tina-tailwind .-mr-px {\n  margin-right: -1px;\n}\n.tina-tailwind .mb-1 {\n  margin-bottom: 4px;\n}\n.tina-tailwind .mb-\\[6px\\] {\n  margin-bottom: 6px;\n}\n.tina-tailwind .mt-2 {\n  margin-top: 8px;\n}\n.tina-tailwind .-mt-2 {\n  margin-top: -8px;\n}\n.tina-tailwind .mt-0\\.5 {\n  margin-top: 2px;\n}\n.tina-tailwind .mt-6 {\n  margin-top: 24px;\n}\n.tina-tailwind .block {\n  display: block;\n}\n.tina-tailwind .inline-block {\n  display: inline-block;\n}\n.tina-tailwind .inline {\n  display: inline;\n}\n.tina-tailwind .flex {\n  display: flex;\n}\n.tina-tailwind .inline-flex {\n  display: inline-flex;\n}\n.tina-tailwind .table {\n  display: table;\n}\n.tina-tailwind .grid {\n  display: grid;\n}\n.tina-tailwind .contents {\n  display: contents;\n}\n.tina-tailwind .hidden {\n  display: none;\n}\n.tina-tailwind .\\!hidden {\n  display: none !important;\n}\n.tina-tailwind .h-auto {\n  height: auto;\n}\n.tina-tailwind .h-full {\n  height: 100%;\n}\n.tina-tailwind .h-10 {\n  height: 40px;\n}\n.tina-tailwind .h-3\\/4 {\n  height: 75%;\n}\n.tina-tailwind .h-16 {\n  height: 64px;\n}\n.tina-tailwind .h-screen {\n  height: 100vh;\n}\n.tina-tailwind .h-3 {\n  height: 12px;\n}\n.tina-tailwind .h-8 {\n  height: 32px;\n}\n.tina-tailwind .h-7 {\n  height: 28px;\n}\n.tina-tailwind .h-9 {\n  height: 36px;\n}\n.tina-tailwind .h-5 {\n  height: 20px;\n}\n.tina-tailwind .h-6 {\n  height: 24px;\n}\n.tina-tailwind .h-14 {\n  height: 56px;\n}\n.tina-tailwind .h-32 {\n  height: 128px;\n}\n.tina-tailwind .h-4\\/6 {\n  height: 66.666667%;\n}\n.tina-tailwind .h-4 {\n  height: 16px;\n}\n.tina-tailwind .h-64 {\n  height: 256px;\n}\n.tina-tailwind .max-h-full {\n  max-height: 100%;\n}\n.tina-tailwind .max-h-\\[24rem\\] {\n  max-height: 24rem;\n}\n.tina-tailwind .max-h-\\[10rem\\] {\n  max-height: 10rem;\n}\n.tina-tailwind .min-h-\\[2\\.5rem\\] {\n  min-height: 2.5rem;\n}\n.tina-tailwind .min-h-\\[100px\\] {\n  min-height: 100px;\n}\n.tina-tailwind .w-8 {\n  width: 32px;\n}\n.tina-tailwind .w-5\\/6 {\n  width: 83.333333%;\n}\n.tina-tailwind .w-6 {\n  width: 24px;\n}\n.tina-tailwind .w-full {\n  width: 100%;\n}\n.tina-tailwind .w-3 {\n  width: 12px;\n}\n.tina-tailwind .w-7 {\n  width: 28px;\n}\n.tina-tailwind .w-9 {\n  width: 36px;\n}\n.tina-tailwind .w-5 {\n  width: 20px;\n}\n.tina-tailwind .w-12 {\n  width: 48px;\n}\n.tina-tailwind .w-auto {\n  width: auto;\n}\n.tina-tailwind .w-4 {\n  width: 16px;\n}\n.tina-tailwind .w-screen {\n  width: 100vw;\n}\n.tina-tailwind .w-96 {\n  width: 384px;\n}\n.tina-tailwind .w-10 {\n  width: 40px;\n}\n.tina-tailwind .w-2 {\n  width: 8px;\n}\n.tina-tailwind .w-px {\n  width: 1px;\n}\n.tina-tailwind .w-48 {\n  width: 192px;\n}\n.tina-tailwind .w-32 {\n  width: 128px;\n}\n.tina-tailwind .w-56 {\n  width: 224px;\n}\n.tina-tailwind .min-w-\\[192px\\] {\n  min-width: 192px;\n}\n.tina-tailwind .min-w-0 {\n  min-width: 0px;\n}\n.tina-tailwind .max-w-form {\n  max-width: 900px;\n}\n.tina-tailwind .max-w-prose {\n  max-width: 65ch;\n}\n.tina-tailwind .max-w-screen-xl {\n  max-width: 1280px;\n}\n.tina-tailwind .max-w-full {\n  max-width: 100%;\n}\n.tina-tailwind .flex-1 {\n  flex: 1 1 0%;\n}\n.tina-tailwind .flex-none {\n  flex: none;\n}\n.tina-tailwind .flex-shrink {\n  flex-shrink: 1;\n}\n.tina-tailwind .flex-shrink-0 {\n  flex-shrink: 0;\n}\n.tina-tailwind .flex-grow {\n  flex-grow: 1;\n}\n.tina-tailwind .flex-grow-0 {\n  flex-grow: 0;\n}\n.tina-tailwind .origin-top-right {\n  transform-origin: top right;\n}\n.tina-tailwind .origin-center {\n  transform-origin: center;\n}\n.tina-tailwind .origin-top-left {\n  transform-origin: top left;\n}\n.tina-tailwind .-translate-y-1\\/2 {\n  --tw-translate-y: -50%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .-translate-x-1\\/2 {\n  --tw-translate-x: -50%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .translate-y-full {\n  --tw-translate-y: 100%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .-translate-y-2 {\n  --tw-translate-y: -8px;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .translate-y-0 {\n  --tw-translate-y: 0px;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .translate-x-full {\n  --tw-translate-x: 100%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .-translate-x-full {\n  --tw-translate-x: -100%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .translate-x-0 {\n  --tw-translate-x: 0px;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .rotate-45 {\n  --tw-rotate: 45deg;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .-rotate-90 {\n  --tw-rotate: -90deg;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .scale-95 {\n  --tw-scale-x: .95;\n  --tw-scale-y: .95;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .scale-100 {\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .scale-110 {\n  --tw-scale-x: 1.1;\n  --tw-scale-y: 1.1;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .transform {\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.tina-tailwind .cursor-not-allowed {\n  cursor: not-allowed;\n}\n.tina-tailwind .cursor-wait {\n  cursor: wait;\n}\n.tina-tailwind .cursor-pointer {\n  cursor: pointer;\n}\n.tina-tailwind .cursor-\\[grab\\] {\n  cursor: grab;\n}\n.tina-tailwind .select-none {\n  user-select: none;\n}\n.tina-tailwind .resize-y {\n  resize: vertical;\n}\n.tina-tailwind .resize {\n  resize: both;\n}\n.tina-tailwind .list-inside {\n  list-style-position: inside;\n}\n.tina-tailwind .list-disc {\n  list-style-type: disc;\n}\n.tina-tailwind .list-decimal {\n  list-style-type: decimal;\n}\n.tina-tailwind .appearance-none {\n  appearance: none;\n}\n.tina-tailwind .flex-col {\n  flex-direction: column;\n}\n.tina-tailwind .flex-wrap {\n  flex-wrap: wrap;\n}\n.tina-tailwind .items-start {\n  align-items: flex-start;\n}\n.tina-tailwind .items-center {\n  align-items: center;\n}\n.tina-tailwind .items-stretch {\n  align-items: stretch;\n}\n.tina-tailwind .justify-start {\n  justify-content: flex-start;\n}\n.tina-tailwind .justify-end {\n  justify-content: flex-end;\n}\n.tina-tailwind .justify-center {\n  justify-content: center;\n}\n.tina-tailwind .justify-between {\n  justify-content: space-between;\n}\n.tina-tailwind .gap-2 {\n  gap: 8px;\n}\n.tina-tailwind .gap-4 {\n  gap: 16px;\n}\n.tina-tailwind .gap-3 {\n  gap: 12px;\n}\n.tina-tailwind .gap-1 {\n  gap: 4px;\n}\n.tina-tailwind .gap-0\\.5 {\n  gap: 2px;\n}\n.tina-tailwind .gap-0 {\n  gap: 0px;\n}\n.tina-tailwind .gap-x-3 {\n  column-gap: 12px;\n}\n.tina-tailwind .gap-x-6 {\n  column-gap: 24px;\n}\n.tina-tailwind .gap-y-3 {\n  row-gap: 12px;\n}\n.tina-tailwind .overflow-auto {\n  overflow: auto;\n}\n.tina-tailwind .overflow-hidden {\n  overflow: hidden;\n}\n.tina-tailwind .overflow-visible {\n  overflow: visible;\n}\n.tina-tailwind .overflow-y-auto {\n  overflow-y: auto;\n}\n.tina-tailwind .overflow-x-visible {\n  overflow-x: visible;\n}\n.tina-tailwind .truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.tina-tailwind .text-ellipsis {\n  text-overflow: ellipsis;\n}\n.tina-tailwind .whitespace-normal {\n  white-space: normal;\n}\n.tina-tailwind .whitespace-nowrap {\n  white-space: nowrap;\n}\n.tina-tailwind .rounded-lg {\n  border-radius: 8px;\n}\n.tina-tailwind .rounded-full {\n  border-radius: 9999px;\n}\n.tina-tailwind .rounded {\n  border-radius: 4px;\n}\n.tina-tailwind .rounded-md {\n  border-radius: 6px;\n}\n.tina-tailwind .rounded-sm {\n  border-radius: 2px;\n}\n.tina-tailwind .rounded-none {\n  border-radius: 0px;\n}\n.tina-tailwind .rounded-l-full {\n  border-top-left-radius: 9999px;\n  border-bottom-left-radius: 9999px;\n}\n.tina-tailwind .rounded-r-full {\n  border-top-right-radius: 9999px;\n  border-bottom-right-radius: 9999px;\n}\n.tina-tailwind .rounded-b-md {\n  border-bottom-right-radius: 6px;\n  border-bottom-left-radius: 6px;\n}\n.tina-tailwind .rounded-r-md {\n  border-top-right-radius: 6px;\n  border-bottom-right-radius: 6px;\n}\n.tina-tailwind .rounded-l-md {\n  border-top-left-radius: 6px;\n  border-bottom-left-radius: 6px;\n}\n.tina-tailwind .border {\n  border-width: 1px;\n}\n.tina-tailwind .border-2 {\n  border-width: 2px;\n}\n.tina-tailwind .border-0 {\n  border-width: 0;\n}\n.tina-tailwind .border-b {\n  border-bottom-width: 1px;\n}\n.tina-tailwind .border-t {\n  border-top-width: 1px;\n}\n.tina-tailwind .border-l-0 {\n  border-left-width: 0;\n}\n.tina-tailwind .border-t-0 {\n  border-top-width: 0;\n}\n.tina-tailwind .border-r-0 {\n  border-right-width: 0;\n}\n.tina-tailwind .border-r {\n  border-right-width: 1px;\n}\n.tina-tailwind .border-l {\n  border-left-width: 1px;\n}\n.tina-tailwind .border-none {\n  border-style: none;\n}\n.tina-tailwind .border-gray-100 {\n  --tw-border-opacity: 1;\n  border-color: rgb(237 236 243 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-blue-500 {\n  --tw-border-opacity: 1;\n  border-color: rgb(0 132 255 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-gray-150 {\n  --tw-border-opacity: 1;\n  border-color: rgb(230 227 239 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-yellow-500 {\n  --tw-border-opacity: 1;\n  border-color: rgb(234 179 8 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-green-400 {\n  --tw-border-opacity: 1;\n  border-color: rgb(74 222 128 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-gray-50 {\n  --tw-border-opacity: 1;\n  border-color: rgb(246 246 249 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-gray-200 {\n  --tw-border-opacity: 1;\n  border-color: rgb(225 221 236 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-transparent {\n  border-color: transparent;\n}\n.tina-tailwind .border-yellow-200 {\n  --tw-border-opacity: 1;\n  border-color: rgb(254 240 138 / var(--tw-border-opacity));\n}\n.tina-tailwind .border-gray-300 {\n  --tw-border-opacity: 1;\n  border-color: rgb(178 173 190 / var(--tw-border-opacity));\n}\n.tina-tailwind .bg-white {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-gray-50 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(246 246 249 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-yellow-400 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(250 204 21 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-green-300 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(134 239 172 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-blue-500 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(0 132 255 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-transparent {\n  background-color: transparent;\n}\n.tina-tailwind .bg-red-500 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(239 68 68 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-blue-50 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(220 238 255 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-gray-100 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(237 236 243 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-gray-300 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(178 173 190 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-gray-200 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(225 221 236 / var(--tw-bg-opacity));\n}\n.tina-tailwind .bg-gradient-to-br {\n  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));\n}\n.tina-tailwind .bg-gradient-to-r {\n  background-image: linear-gradient(to right, var(--tw-gradient-stops));\n}\n.tina-tailwind .from-gray-800 {\n  --tw-gradient-from: #363145;\n  --tw-gradient-to: rgb(54 49 69 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.tina-tailwind .from-yellow-50 {\n  --tw-gradient-from: #fefce8;\n  --tw-gradient-to: rgb(254 252 232 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.tina-tailwind .via-gray-900 {\n  --tw-gradient-to: rgb(37 35 54 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), #252336, var(--tw-gradient-to);\n}\n.tina-tailwind .to-black {\n  --tw-gradient-to: #000;\n}\n.tina-tailwind .to-yellow-100 {\n  --tw-gradient-to: #fef9c3;\n}\n.tina-tailwind .fill-current {\n  fill: currentColor;\n}\n.tina-tailwind .p-5 {\n  padding: 20px;\n}\n.tina-tailwind .p-12 {\n  padding: 48px;\n}\n.tina-tailwind .p-2 {\n  padding: 8px;\n}\n.tina-tailwind .p-3 {\n  padding: 12px;\n}\n.tina-tailwind .p-0 {\n  padding: 0px;\n}\n.tina-tailwind .p-1 {\n  padding: 4px;\n}\n.tina-tailwind .py-3 {\n  padding-top: 12px;\n  padding-bottom: 12px;\n}\n.tina-tailwind .px-5 {\n  padding-left: 20px;\n  padding-right: 20px;\n}\n.tina-tailwind .px-6 {\n  padding-left: 24px;\n  padding-right: 24px;\n}\n.tina-tailwind .py-4 {\n  padding-top: 16px;\n  padding-bottom: 16px;\n}\n.tina-tailwind .px-3 {\n  padding-left: 12px;\n  padding-right: 12px;\n}\n.tina-tailwind .px-4 {\n  padding-left: 16px;\n  padding-right: 16px;\n}\n.tina-tailwind .py-1 {\n  padding-top: 4px;\n  padding-bottom: 4px;\n}\n.tina-tailwind .py-2 {\n  padding-top: 8px;\n  padding-bottom: 8px;\n}\n.tina-tailwind .py-8 {\n  padding-top: 32px;\n  padding-bottom: 32px;\n}\n.tina-tailwind .py-1\\.5 {\n  padding-top: 6px;\n  padding-bottom: 6px;\n}\n.tina-tailwind .px-1 {\n  padding-left: 4px;\n  padding-right: 4px;\n}\n.tina-tailwind .py-2\\.5 {\n  padding-top: 10px;\n  padding-bottom: 10px;\n}\n.tina-tailwind .px-2 {\n  padding-left: 8px;\n  padding-right: 8px;\n}\n.tina-tailwind .py-0\\.5 {\n  padding-top: 2px;\n  padding-bottom: 2px;\n}\n.tina-tailwind .py-0 {\n  padding-top: 0px;\n  padding-bottom: 0px;\n}\n.tina-tailwind .pt-6 {\n  padding-top: 24px;\n}\n.tina-tailwind .pb-2 {\n  padding-bottom: 8px;\n}\n.tina-tailwind .pb-5 {\n  padding-bottom: 20px;\n}\n.tina-tailwind .pl-3 {\n  padding-left: 12px;\n}\n.tina-tailwind .pr-7 {\n  padding-right: 28px;\n}\n.tina-tailwind .pt-1 {\n  padding-top: 4px;\n}\n.tina-tailwind .pt-0\\.5 {\n  padding-top: 2px;\n}\n.tina-tailwind .pt-0 {\n  padding-top: 0px;\n}\n.tina-tailwind .pt-2 {\n  padding-top: 8px;\n}\n.tina-tailwind .pt-16 {\n  padding-top: 64px;\n}\n.tina-tailwind .pl-20 {\n  padding-left: 80px;\n}\n.tina-tailwind .pr-28 {\n  padding-right: 114px;\n}\n.tina-tailwind .pl-6 {\n  padding-left: 24px;\n}\n.tina-tailwind .pt-4 {\n  padding-top: 16px;\n}\n.tina-tailwind .pb-12 {\n  padding-bottom: 48px;\n}\n.tina-tailwind .pl-2\\.5 {\n  padding-left: 10px;\n}\n.tina-tailwind .pr-8 {\n  padding-right: 32px;\n}\n.tina-tailwind .pl-2 {\n  padding-left: 8px;\n}\n.tina-tailwind .pt-3 {\n  padding-top: 12px;\n}\n.tina-tailwind .pt-10 {\n  padding-top: 40px;\n}\n.tina-tailwind .text-left {\n  text-align: left;\n}\n.tina-tailwind .text-center {\n  text-align: center;\n}\n.tina-tailwind .text-right {\n  text-align: right;\n}\n.tina-tailwind .align-baseline {\n  vertical-align: baseline;\n}\n.tina-tailwind .font-sans {\n  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";\n}\n.tina-tailwind .text-sm {\n  font-size: 14px;\n  line-height: 1.43;\n}\n.tina-tailwind .text-2xl {\n  font-size: 24px;\n  line-height: 1.33;\n}\n.tina-tailwind .text-xl {\n  font-size: 20px;\n  line-height: 1.4;\n}\n.tina-tailwind .text-base {\n  font-size: 16px;\n  line-height: 1.5;\n}\n.tina-tailwind .text-lg {\n  font-size: 18px;\n  line-height: 1.55;\n}\n.tina-tailwind .text-xs {\n  font-size: 13px;\n  line-height: 1.33;\n}\n.tina-tailwind .text-4xl {\n  font-size: 36px;\n  line-height: 1.1;\n}\n.tina-tailwind .text-3xl {\n  font-size: 30px;\n  line-height: 1.2;\n}\n.tina-tailwind .font-bold {\n  font-weight: 700;\n}\n.tina-tailwind .font-normal {\n  font-weight: 400;\n}\n.tina-tailwind .font-medium {\n  font-weight: 500;\n}\n.tina-tailwind .font-semibold {\n  font-weight: 600;\n}\n.tina-tailwind .font-light {\n  font-weight: 300;\n}\n.tina-tailwind .uppercase {\n  text-transform: uppercase;\n}\n.tina-tailwind .capitalize {\n  text-transform: capitalize;\n}\n.tina-tailwind .italic {\n  font-style: italic;\n}\n.tina-tailwind .not-italic {\n  font-style: normal;\n}\n.tina-tailwind .leading-tight {\n  line-height: 1.25;\n}\n.tina-tailwind .leading-none {\n  line-height: 1;\n}\n.tina-tailwind .tracking-wide {\n  letter-spacing: 0.025em;\n}\n.tina-tailwind .text-gray-700 {\n  --tw-text-opacity: 1;\n  color: rgb(67 62 82 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-gray-600 {\n  --tw-text-opacity: 1;\n  color: rgb(86 81 101 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-blue-500 {\n  --tw-text-opacity: 1;\n  color: rgb(0 132 255 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-gray-500 {\n  --tw-text-opacity: 1;\n  color: rgb(113 108 127 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-white {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-blue-400 {\n  --tw-text-opacity: 1;\n  color: rgb(34 150 254 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-gray-300 {\n  --tw-text-opacity: 1;\n  color: rgb(178 173 190 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-yellow-600 {\n  --tw-text-opacity: 1;\n  color: rgb(202 138 4 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-blue-600 {\n  --tw-text-opacity: 1;\n  color: rgb(5 116 228 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-blue-800 {\n  --tw-text-opacity: 1;\n  color: rgb(20 70 150 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-black {\n  --tw-text-opacity: 1;\n  color: rgb(0 0 0 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-gray-200 {\n  --tw-text-opacity: 1;\n  color: rgb(225 221 236 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-gray-400 {\n  --tw-text-opacity: 1;\n  color: rgb(145 140 158 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-red-500 {\n  --tw-text-opacity: 1;\n  color: rgb(239 68 68 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-yellow-700 {\n  --tw-text-opacity: 1;\n  color: rgb(161 98 7 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-gray-800 {\n  --tw-text-opacity: 1;\n  color: rgb(54 49 69 / var(--tw-text-opacity));\n}\n.tina-tailwind .text-gray-900 {\n  --tw-text-opacity: 1;\n  color: rgb(37 35 54 / var(--tw-text-opacity));\n}\n.tina-tailwind .underline {\n  text-decoration-line: underline;\n}\n.tina-tailwind .no-underline {\n  text-decoration-line: none;\n}\n.tina-tailwind .placeholder-gray-200::placeholder {\n  --tw-placeholder-opacity: 1;\n  color: rgb(225 221 236 / var(--tw-placeholder-opacity));\n}\n.tina-tailwind .placeholder-gray-400::placeholder {\n  --tw-placeholder-opacity: 1;\n  color: rgb(145 140 158 / var(--tw-placeholder-opacity));\n}\n.tina-tailwind .opacity-70 {\n  opacity: .7;\n}\n.tina-tailwind .opacity-50 {\n  opacity: .5;\n}\n.tina-tailwind .opacity-80 {\n  opacity: .8;\n}\n.tina-tailwind .opacity-30 {\n  opacity: .3;\n}\n.tina-tailwind .opacity-0 {\n  opacity: 0;\n}\n.tina-tailwind .opacity-100 {\n  opacity: 1;\n}\n.tina-tailwind .opacity-90 {\n  opacity: .9;\n}\n.tina-tailwind .shadow-sm {\n  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .shadow {\n  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .shadow-lg {\n  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .shadow-inner {\n  --tw-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);\n  --tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .shadow-2xl {\n  --tw-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);\n  --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .outline-none {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}\n.tina-tailwind .outline {\n  outline-style: solid;\n}\n.tina-tailwind .ring-1 {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n.tina-tailwind .ring-2 {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n.tina-tailwind .ring-inset {\n  --tw-ring-inset: inset;\n}\n.tina-tailwind .ring-black {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(0 0 0 / var(--tw-ring-opacity));\n}\n.tina-tailwind .ring-blue-100 {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(180 219 255 / var(--tw-ring-opacity));\n}\n.tina-tailwind .ring-opacity-5 {\n  --tw-ring-opacity: .05;\n}\n.tina-tailwind .drop-shadow {\n  --tw-drop-shadow: drop-shadow(0 1px 2px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06));\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.tina-tailwind .grayscale {\n  --tw-grayscale: grayscale(100%);\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.tina-tailwind .filter {\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.tina-tailwind .\\!filter {\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow) !important;\n}\n.tina-tailwind .transition {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.tina-tailwind .transition-all {\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.tina-tailwind .transition-opacity {\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.tina-tailwind .transition-colors {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.tina-tailwind .transition-none {\n  transition-property: none;\n}\n.tina-tailwind .duration-150 {\n  transition-duration: 150ms;\n}\n.tina-tailwind .duration-100 {\n  transition-duration: 100ms;\n}\n.tina-tailwind .duration-75 {\n  transition-duration: 75ms;\n}\n.tina-tailwind .duration-300 {\n  transition-duration: 300ms;\n}\n.tina-tailwind .duration-200 {\n  transition-duration: 200ms;\n}\n.tina-tailwind .ease-out {\n  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);\n}\n.tina-tailwind .ease-in {\n  transition-timing-function: cubic-bezier(0.4, 0, 1, 1);\n}\n.tina-tailwind .ease-in-out {\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}\n.tina-tailwind .icon-parent svg {\n      fill: currentColor;\n    }\n.tina-tailwind {\n  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";\n  font-size: 16px;\n  line-height: 1.5;\n  --tw-text-opacity: 1;\n  color: rgb(86 81 101 / var(--tw-text-opacity));\n}\n/* if the last block has margin-bottom it makes the text box larger but some of it isn\'t clickable */\n.tina-prose [data-slate-editor=\'true\'] {\n  padding-bottom: 0.5em;\n}\n/* prose adds backticks, which look like they should be editable */\n.tina-prose [data-slate-editor=\'true\'] .slate-code::before {\n  content: \'\';\n}\n.tina-prose [data-slate-editor=\'true\'] .slate-code::after {\n  content: \'\';\n}\n.tina-prose [data-slate-editor=\'true\'] .slate-code_block {\n  margin: 0;\n}\n/* code lines as part of a block don\'t need the same background formatting */\n.tina-prose [data-slate-editor=\'true\'] .slate-code_block .slate-code {\n  background: none;\n}\n/* prose makes the first p in a block slightly larger */\n.tina-prose [data-slate-editor=\'true\'] p:first-of-type {\n  font-size: 1em;\n}\n/* experimental floating toolbar doesn\'t need a large text area */\n.with-toolbar [data-slate-editor=\'true\'] {\n  min-height: 72px;\n}\n.tina-tailwind .first\\:mt-0:first-child {\n  margin-top: 0px;\n}\n.tina-tailwind .first\\:rounded-t:first-child {\n  border-top-left-radius: 4px;\n  border-top-right-radius: 4px;\n}\n.tina-tailwind .first\\:pt-3:first-child {\n  padding-top: 12px;\n}\n.tina-tailwind .last\\:mb-0:last-child {\n  margin-bottom: 0px;\n}\n.tina-tailwind .last\\:rounded-b:last-child {\n  border-bottom-right-radius: 4px;\n  border-bottom-left-radius: 4px;\n}\n.tina-tailwind .last\\:pb-3:last-child {\n  padding-bottom: 12px;\n}\n.tina-tailwind .focus-within\\:border-blue-500:focus-within {\n  --tw-border-opacity: 1;\n  border-color: rgb(0 132 255 / var(--tw-border-opacity));\n}\n.tina-tailwind .focus-within\\:text-gray-900:focus-within {\n  --tw-text-opacity: 1;\n  color: rgb(37 35 54 / var(--tw-text-opacity));\n}\n.tina-tailwind .focus-within\\:shadow-outline:focus-within {\n  --tw-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);\n  --tw-shadow-colored: 0 0 0 3px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .hover\\:border-gray-200:hover {\n  --tw-border-opacity: 1;\n  border-color: rgb(225 221 236 / var(--tw-border-opacity));\n}\n.tina-tailwind .hover\\:bg-gray-50:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(246 246 249 / var(--tw-bg-opacity));\n}\n.tina-tailwind .hover\\:bg-blue-600:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(5 116 228 / var(--tw-bg-opacity));\n}\n.tina-tailwind .hover\\:bg-white:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity));\n}\n.tina-tailwind .hover\\:bg-red-600:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(220 38 38 / var(--tw-bg-opacity));\n}\n.tina-tailwind .hover\\:bg-gray-100:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(237 236 243 / var(--tw-bg-opacity));\n}\n.tina-tailwind .hover\\:bg-blue-500:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(0 132 255 / var(--tw-bg-opacity));\n}\n.tina-tailwind .hover\\:text-blue-600:hover {\n  --tw-text-opacity: 1;\n  color: rgb(5 116 228 / var(--tw-text-opacity));\n}\n.tina-tailwind .hover\\:text-blue-500:hover {\n  --tw-text-opacity: 1;\n  color: rgb(0 132 255 / var(--tw-text-opacity));\n}\n.tina-tailwind .hover\\:text-blue-400:hover {\n  --tw-text-opacity: 1;\n  color: rgb(34 150 254 / var(--tw-text-opacity));\n}\n.tina-tailwind .hover\\:text-red-500:hover {\n  --tw-text-opacity: 1;\n  color: rgb(239 68 68 / var(--tw-text-opacity));\n}\n.tina-tailwind .hover\\:text-gray-600:hover {\n  --tw-text-opacity: 1;\n  color: rgb(86 81 101 / var(--tw-text-opacity));\n}\n.tina-tailwind .hover\\:text-gray-900:hover {\n  --tw-text-opacity: 1;\n  color: rgb(37 35 54 / var(--tw-text-opacity));\n}\n.tina-tailwind .hover\\:underline:hover {\n  text-decoration-line: underline;\n}\n.tina-tailwind .hover\\:placeholder-gray-600:hover::placeholder {\n  --tw-placeholder-opacity: 1;\n  color: rgb(86 81 101 / var(--tw-placeholder-opacity));\n}\n.tina-tailwind .hover\\:opacity-100:hover {\n  opacity: 1;\n}\n.tina-tailwind .hover\\:opacity-50:hover {\n  opacity: .5;\n}\n.tina-tailwind .hover\\:shadow:hover {\n  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .hover\\:shadow-md:hover {\n  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .focus\\:z-10:focus {\n  z-index: 10;\n}\n.tina-tailwind .focus\\:border-blue-500:focus {\n  --tw-border-opacity: 1;\n  border-color: rgb(0 132 255 / var(--tw-border-opacity));\n}\n.tina-tailwind .focus\\:border-blue-400:focus {\n  --tw-border-opacity: 1;\n  border-color: rgb(34 150 254 / var(--tw-border-opacity));\n}\n.tina-tailwind .focus\\:bg-gray-50:focus {\n  --tw-bg-opacity: 1;\n  background-color: rgb(246 246 249 / var(--tw-bg-opacity));\n}\n.tina-tailwind .focus\\:text-blue-500:focus {\n  --tw-text-opacity: 1;\n  color: rgb(0 132 255 / var(--tw-text-opacity));\n}\n.tina-tailwind .focus\\:text-gray-900:focus {\n  --tw-text-opacity: 1;\n  color: rgb(37 35 54 / var(--tw-text-opacity));\n}\n.tina-tailwind .focus\\:opacity-80:focus {\n  opacity: .8;\n}\n.tina-tailwind .focus\\:shadow-outline:focus {\n  --tw-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);\n  --tw-shadow-colored: 0 0 0 3px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.tina-tailwind .focus\\:outline-none:focus {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}\n.tina-tailwind .focus\\:ring-2:focus {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n.tina-tailwind .focus\\:ring-1:focus {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n.tina-tailwind .focus\\:ring-blue-500:focus {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(0 132 255 / var(--tw-ring-opacity));\n}\n.tina-tailwind .focus\\:ring-red-500:focus {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(239 68 68 / var(--tw-ring-opacity));\n}\n.tina-tailwind .focus\\:ring-offset-2:focus {\n  --tw-ring-offset-width: 2px;\n}\n.tina-tailwind .focus\\:ring-offset-gray-100:focus {\n  --tw-ring-offset-color: #EDECF3;\n}\n.tina-tailwind .active\\:outline-none:active {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}\n.tina-tailwind .group:hover .group-hover\\:text-blue-500 {\n  --tw-text-opacity: 1;\n  color: rgb(0 132 255 / var(--tw-text-opacity));\n}\n.tina-tailwind .group:hover .group-hover\\:text-blue-400 {\n  --tw-text-opacity: 1;\n  color: rgb(34 150 254 / var(--tw-text-opacity));\n}\n.tina-tailwind .group:hover .group-hover\\:text-inherit {\n  color: inherit;\n}\n.tina-tailwind .group:hover .group-hover\\:text-gray-800 {\n  --tw-text-opacity: 1;\n  color: rgb(54 49 69 / var(--tw-text-opacity));\n}\n.tina-tailwind .group:hover .group-hover\\:opacity-100 {\n  opacity: 1;\n}\n.tina-tailwind .group:hover .group-hover\\:opacity-90 {\n  opacity: .9;\n}\n.tina-tailwind .group:hover .group-hover\\:opacity-0 {\n  opacity: 0;\n}\n.tina-tailwind .group:hover .group-hover\\:opacity-80 {\n  opacity: .8;\n}\n.tina-tailwind .group:hover .group-hover\\:opacity-50 {\n  opacity: .5;\n}\n@media (min-width: 640px) {\n\n  .tina-tailwind .sm\\:text-sm {\n    font-size: 14px;\n    line-height: 1.43;\n  }\n}\n')();const Ol=({children:e,position:t,styled:n=!0})=>{const r=Sn();return a.createElement(Dl,null,a.createElement("style",null,Rl),a.createElement(Y,null,a.createElement("div",{className:"tina-tailwind"},a.createElement(Fl,{alerts:r.alerts}),r.enabled&&n&&a.createElement(Oe,null),r.enabled&&r.toolbar&&a.createElement(jo,null),a.createElement(fl,null),r.sidebar&&a.createElement(yo,{position:t,sidebar:r.sidebar}),a.createElement(_l,null)),e))},Al=({cms:e,children:t,position:n,styled:r=!0})=>a.createElement(Ll,{cms:e},a.createElement(Ol,{position:n,styled:r},t));const Yl=a.createContext({currentBranch:null,setCurrentBranch:e=>{console.warn("BranchContext not initialized")}}),Wl=({currentBranch:e,setCurrentBranch:t,children:n})=>a.createElement(Yl.Provider,{value:{currentBranch:e,setCurrentBranch:t}},n),Jl=({listBranches:e,createBranch:t})=>{var n,r;const i=null==(r=null==(n=Ke().api)?void 0:n.tina)?void 0:r.isLocalMode,[o,l]=a.useState("loading"),[s,c]=a.useState([]),{currentBranch:d,setCurrentBranch:m}=(()=>{const e=a.useContext(Yl),{dispatch:t}=rt("branch:change");return a.useEffect((()=>{t({branchName:e.currentBranch})}),[e.currentBranch]),e})(),p=a.useCallback((e=>{l("loading"),t({branchName:e,baseBranch:d}).then((async e=>{m(e),await u()}))}),[]),u=a.useCallback((async()=>{l("loading"),await e().then((e=>{c(e),l("ready")})).catch((()=>l("error")))}),[]);return a.useEffect((()=>{u()}),[]),a.createElement("div",{className:"w-full flex justify-center p-5"},a.createElement("div",{className:"w-full max-w-form"},i?a.createElement("div",{className:"px-6 py-8 w-full h-full flex flex-col items-center justify-center"},a.createElement("p",{className:"text-base mb-4 text-center"},a.createElement(Qi,{className:"w-7 h-auto inline-block mr-0.5 opacity-70 text-yellow-600"})),a.createElement("p",{className:"text-base mb-6 text-center"},"Tina's branch switcher isn't available in local mode."," ",a.createElement("a",{target:"_blank",className:"transition-all duration-150 ease-out text-blue-600 hover:text-blue-400 hover:underline no-underline",href:"https://tina.io/docs/tina-cloud/"},"Learn more about moving to production with Tina Cloud.")),a.createElement("p",null,a.createElement(We,{href:"https://tina.io/docs/tina-cloud/",target:"_blank",as:"a"},"Read Our Docs"," ",a.createElement(cn,{className:"w-5 h-auto ml-1.5 opacity-80"})))):"loading"===o?a.createElement("div",{style:{margin:"32px auto",textAlign:"center"}},a.createElement(bt,{color:"var(--tina-color-primary)"})):a.createElement(a.Fragment,null,"ready"===o?a.createElement(ql,{currentBranch:d,branchList:s,onCreateBranch:e=>{p(e)},onChange:e=>{m(e)}}):a.createElement("div",{className:"px-6 py-8 w-full h-full flex flex-col items-center justify-center"},a.createElement("p",{className:"text-base mb-4 text-center"},"An error occurred while retrieving the branch list."),a.createElement(We,{className:"mb-4",onClick:u},"Try again ",a.createElement(qn,{className:"w-6 h-full ml-1 opacity-70"}))))))},ql=({branchList:e,currentBranch:t,onCreateBranch:n,onChange:r})=>{const[i,o]=a.useState(""),[l,s]=a.useState(""),c=e.filter((e=>!l||e.name.includes(l)));return a.createElement("div",{className:"flex flex-col gap-3"},a.createElement("div",{className:"block relative group"},a.createElement(ct,{placeholder:"Search",value:l,onChange:e=>s(e.target.value)}),""===l?a.createElement(Gn,{className:"absolute right-3 top-1/2 -translate-y-1/2 w-5 h-auto text-blue-500 opacity-70 group-hover:opacity-100 transition-all ease-out duration-150"}):a.createElement("button",{onClick:()=>{s("")},className:"outline-none focus:outline-none bg-transparent border-0 p-0 m-0 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-all ease-out duration-150"},a.createElement(mn,{className:"w-5 h-auto text-gray-600"}))),0===c.length&&a.createElement("div",{className:"block relative text-gray-300 italic py-1"},"No branches to display"),c.length>0&&a.createElement("div",{className:"min-w-[192px] max-h-[24rem] overflow-y-auto flex flex-col w-full h-full rounded-lg shadow-inner bg-white border border-gray-200"},c.map((e=>{const n=e.name===t;return a.createElement("div",{className:"cursor-pointer relative text-base py-1.5 px-3 border-l-0 border-t-0 border-r-0 border-b border-gray-50 w-full outline-none transition-all ease-out duration-150 hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50 "+(n?"bg-blue-50 text-blue-800 pointer-events-none":""),key:e,onClick:()=>r(e.name)},e.name,n&&a.createElement("span",{className:"opacity-70 italic"}," (current)"))}))),a.createElement("div",{className:"flex justify-between items-center w-full gap-3"},a.createElement(ct,{placeholder:"Branch Name",value:i,onChange:e=>o(e.target.value)}),a.createElement(We,{className:"flex-0 flex items-center gap-2 whitespace-nowrap",size:"medium",variant:"primary",onClick:()=>n(i)},a.createElement(Jn,{className:"w-5 h-auto opacity-70"})," Create New")))};class Xl{constructor(e){this.__type="screen",this.Icon=On,this.name="Select Branch",this.layout="popup",this.Component=()=>a.createElement(Jl,{listBranches:this.listBranches,createBranch:this.createBranch}),this.listBranches=e.listBranches,this.createBranch=e.createBranch}}function Gl(e,t){const[n,r]=a.useState(t);a.useEffect((()=>{const t=window.localStorage&&window.localStorage.getItem(e);null!=t&&void 0!=t&&r(JSON.parse(t))}),[e]);return[n,t=>{try{const a=t instanceof Function?t(n):t;r(a),localStorage.setItem(e,JSON.stringify(a))}catch(a){console.log(a)}}]}}}]);