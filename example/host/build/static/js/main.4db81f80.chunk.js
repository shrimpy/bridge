(this.webpackJsonphost=this.webpackJsonphost||[]).push([[0],{13:function(e,t,n){},16:function(e,t,n){},19:function(e,t,n){"use strict";n.r(t);var o=n(2),r=n.n(o),c=n(5),s=n.n(c),i=(n(13),n(6)),a=n(7),l=n(1),u=n.n(l),d=n(3),p=n(8),h=(n(16),n(0)),f="http://localhost:3001",m={width:"800px",height:"300px",marginBottom:"10px",border:"1px solid lightgrey",display:"inline-block"};var g=function(){return Object(o.useEffect)((function(){!function(){var e=document.createElement("iframe");e.src=f,e.width="100%",e.height="100%",e.onload=function(){var t=Object(d.a)(u.a.mark((function t(n){return u.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,x("IFRAME",e.contentWindow,f);case 2:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}(),document.getElementById("place-holder-for-iframe").appendChild(e)}(),function(){b.apply(this,arguments)}()}),[]),Object(h.jsxs)("div",{className:"App",children:[Object(h.jsxs)("header",{className:"App-header",children:[Object(h.jsx)("h1",{className:"App-title",children:"Welcome to Bridge demo"}),Object(h.jsxs)("p",{children:["Host Origin: ",window.location.origin]})]}),Object(h.jsx)("br",{}),Object(h.jsx)("div",{id:"place-holder-for-iframe",style:m}),Object(h.jsx)("br",{}),Object(h.jsx)("div",{id:"place-holder-for-div",style:m})]})};function b(){return(b=Object(d.a)(u.a.mark((function e(){var t,n,o,r,c,s,i,a;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch(f);case 2:return t=e.sent,e.next=5,t.text();case 5:for(n=e.sent,o=document.createRange().createContextualFragment(n),r=o.querySelectorAll("script"),c=[],s=0;s<r.length;s++)i=r[s],c.push(v(i.src.replace("http://localhost:3000",f))),i.parentNode.removeChild(i);return document.getElementById("place-holder-for-div").appendChild(o),e.next=14,Promise.all(c);case 14:return a={postMessage:function(){window.postMessage.apply(window,arguments)}},e.next=17,x("DIV",a,window.location.origin);case 17:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function v(e){return new Promise((function(t){document.body.querySelectorAll('script[src="'.concat(e,'"]')).length>0&&t();var n=document.createElement("script");n.src=e,n.async=!1,n.onload=function(e){t()},document.body.appendChild(n)}))}var j=function(){function e(){Object(i.a)(this,e),this.name="HostSampleResolver"}return Object(a.a)(e,[{key:"echo",value:function(e,t){return new Promise((function(t){setTimeout((function(){t({data:"echo from host: ".concat(e.message)})}),500)}))}}]),e}();function x(e,t,n){return w.apply(this,arguments)}function w(){return(w=Object(d.a)(u.a.mark((function e(t,n,o){var r,c;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return(r=new p.Host(window,n,o)).registerResolver(new j),e.next=4,r.setup();case 4:return console.log("Host ===> ".concat(t,": channel opened.")),e.next=7,r.invokeResolver("ClientSampleResolver","echo",{message:"message from host"});case 7:c=e.sent,console.log("Host ===> RESPONSE from client > ".concat(JSON.stringify(c))),r.subscribe("client-event",(function(e){console.log("Host - sub ===>",e)})),setTimeout((function(){r.broadcastEvent("host-event","YOLO")}),1e3);case 11:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var O=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,20)).then((function(t){var n=t.getCLS,o=t.getFID,r=t.getFCP,c=t.getLCP,s=t.getTTFB;n(e),o(e),r(e),c(e),s(e)}))};s.a.render(Object(h.jsx)(r.a.StrictMode,{children:Object(h.jsx)(g,{})}),document.getElementById("root")),O()}},[[19,1,2]]]);
//# sourceMappingURL=main.4db81f80.chunk.js.map