(window.webpackJsonp=window.webpackJsonp||[]).push([[3,15],{70:function(e,t,a){"use strict";a.r(t);var n=a(0),l=a.n(n),c=a(79),r=a(76),i=a(22),o=a(80),s=a(2),u=a(6),m=a(74),b=a(75),d=a(99),f=a(92),p=a(96),v=a(97),h=a(98),k=a(95),E=a(73),O=a(83),j=a(56),g=a.n(j);var _=function e(t,a){return"link"===t.type?Object(d.a)(t.href,a):"category"===t.type&&t.items.some((function(t){return e(t,a)}))};function C(e){var t,a,c,r=e.item,i=e.onItemClick,o=e.collapsible,b=e.activePath,d=Object(u.a)(e,["item","onItemClick","collapsible","activePath"]),f=r.items,p=r.label,v=_(r,b),h=(a=v,c=Object(n.useRef)(a),Object(n.useEffect)((function(){c.current=a}),[a]),c.current),k=Object(n.useState)((function(){return!!o&&(!v&&r.collapsed)})),E=k[0],O=k[1];Object(n.useEffect)((function(){v&&!h&&E&&O(!1)}),[v,h,E]);var j=Object(n.useCallback)((function(e){e.preventDefault(),O((function(e){return!e}))}),[O]);return 0===f.length?null:l.a.createElement("li",{className:Object(m.a)("menu__list-item",{"menu__list-item--collapsed":E}),key:p},l.a.createElement("a",Object(s.a)({className:Object(m.a)("menu__link",(t={"menu__link--sublist":o,"menu__link--active":o&&v},t[g.a.menuLinkText]=!o,t)),onClick:o?j:void 0,href:o?"#!":void 0},d),p),l.a.createElement("ul",{className:"menu__list"},f.map((function(e){return l.a.createElement(w,{tabIndex:E?"-1":"0",key:e.label,item:e,onItemClick:i,collapsible:o,activePath:b})}))))}function N(e){var t=e.item,a=e.onItemClick,n=e.activePath,c=(e.collapsible,Object(u.a)(e,["item","onItemClick","activePath","collapsible"])),r=t.href,i=t.label,o=_(t,n);return l.a.createElement("li",{className:"menu__list-item",key:i},l.a.createElement(E.a,Object(s.a)({className:Object(m.a)("menu__link",{"menu__link--active":o}),to:r},Object(O.a)(r)?{isNavLink:!0,exact:!0,onClick:a}:{target:"_blank",rel:"noreferrer noopener"},c),i))}function w(e){switch(e.item.type){case"category":return l.a.createElement(C,e);case"link":default:return l.a.createElement(N,e)}}var y=function(e){var t,a,c=e.path,i=e.sidebar,o=e.sidebarCollapsible,u=void 0===o||o,d=Object(n.useState)(!1),O=d[0],j=d[1],_=Object(b.a)().navbar,C=_.title,N=_.hideOnScroll,y=Object(r.a)().isClient,M=Object(h.a)(),I=M.logoLink,P=M.logoLinkProps,x=M.logoImageUrl,L=M.logoAlt,S=Object(f.a)().isAnnouncementBarClosed,R=Object(k.a)().scrollY;Object(p.a)(O);var W=Object(v.a)();return Object(n.useEffect)((function(){W===v.b.desktop&&j(!1)}),[W]),l.a.createElement("div",{className:Object(m.a)(g.a.sidebar,(t={},t[g.a.sidebarWithHideableNavbar]=N,t))},N&&l.a.createElement(E.a,Object(s.a)({tabIndex:-1,className:g.a.sidebarLogo,to:I},P),null!=x&&l.a.createElement("img",{key:y,src:x,alt:L}),null!=C&&l.a.createElement("strong",null,C)),l.a.createElement("div",{className:Object(m.a)("menu","menu--responsive",g.a.menu,(a={"menu--show":O},a[g.a.menuWithAnnouncementBar]=!S&&0===R,a))},l.a.createElement("button",{"aria-label":O?"Close Menu":"Open Menu","aria-haspopup":"true",className:"button button--secondary button--sm menu__button",type:"button",onClick:function(){j(!O)}},O?l.a.createElement("span",{className:Object(m.a)(g.a.sidebarMenuIcon,g.a.sidebarMenuCloseIcon)},"\xd7"):l.a.createElement("svg",{"aria-label":"Menu",className:g.a.sidebarMenuIcon,xmlns:"http://www.w3.org/2000/svg",height:24,width:24,viewBox:"0 0 32 32",role:"img",focusable:"false"},l.a.createElement("title",null,"Menu"),l.a.createElement("path",{stroke:"currentColor",strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"2",d:"M4 7h22M4 15h22M4 23h22"}))),l.a.createElement("ul",{className:"menu__list"},i.map((function(e){return l.a.createElement(w,{key:e.label,item:e,onItemClick:function(e){e.target.blur(),j(!1)},collapsible:u,activePath:c})})))))},M=a(89),I=a(91),P=a(81),x=a(61),L=a.n(x),S=a(100);function R(e){var t,a,n=e.currentDocRoute,i=e.versionMetadata,s=e.children,u=Object(r.a)(),m=u.siteConfig,b=u.isClient,d=i.pluginId,f=i.permalinkToSidebar,p=i.docsSidebars,v=i.version,h=f[n.path],k=p[h];return l.a.createElement(o.a,{key:b,searchMetadatas:{version:v,tag:Object(S.b)(d,v)}},l.a.createElement("div",{className:L.a.docPage},k&&l.a.createElement("div",{className:L.a.docSidebarContainer,role:"complementary"},l.a.createElement(y,{key:h,sidebar:k,path:n.path,sidebarCollapsible:null===(t=null===(a=m.themeConfig)||void 0===a?void 0:a.sidebarCollapsible)||void 0===t||t})),l.a.createElement("main",{className:L.a.docMainContainer},l.a.createElement(c.a,{components:M.a},s))))}t.default=function(e){var t=e.route.routes,a=e.versionMetadata,n=e.location,c=t.find((function(e){return Object(P.matchPath)(n.pathname,e)}));return c?l.a.createElement(R,{currentDocRoute:c,versionMetadata:a},Object(i.a)(t)):l.a.createElement(I.default,e)}},91:function(e,t,a){"use strict";a.r(t);var n=a(0),l=a.n(n),c=a(80);t.default=function(){return l.a.createElement(c.a,{title:"Page Not Found"},l.a.createElement("div",{className:"container margin-vert--xl"},l.a.createElement("div",{className:"row"},l.a.createElement("div",{className:"col col--6 col--offset-3"},l.a.createElement("h1",{className:"hero__title"},"Page Not Found"),l.a.createElement("p",null,"We could not find what you were looking for."),l.a.createElement("p",null,"Please contact the owner of the site that linked you to the original URL and let them know their link is broken.")))))}}}]);