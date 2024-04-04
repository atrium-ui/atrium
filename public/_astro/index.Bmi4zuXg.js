var At=Object.defineProperty,yt=Object.getOwnPropertyDescriptor,ht=(e,t,i,s)=>{for(var r=s>1?void 0:s?yt(t,i):t,n=e.length-1,o;n>=0;n--)(o=e[n])&&(r=(s?o(t,i,r):o(r))||r);return s&&r&&At(t,i,r),r},Et=class{get shadowRoot(){return this.__host.__shadowRoot}constructor(t){this.ariaAtomic="",this.ariaAutoComplete="",this.ariaBraileLabel="",this.ariaBraileRoleDescription="",this.ariaBusy="",this.ariaChecked="",this.ariaColCount="",this.ariaColIndex="",this.ariaColSpan="",this.ariaCurrent="",this.ariaDescription="",this.ariaDisabled="",this.ariaExpanded="",this.ariaHasPopup="",this.ariaHidden="",this.ariaInvalid="",this.ariaKeyShortcuts="",this.ariaLabel="",this.ariaLevel="",this.ariaLive="",this.ariaModal="",this.ariaMultiLine="",this.ariaMultiSelectable="",this.ariaOrientation="",this.ariaPlaceholder="",this.ariaPosInSet="",this.ariaPressed="",this.ariaReadOnly="",this.ariaRequired="",this.ariaRoleDescription="",this.ariaRowCount="",this.ariaRowIndex="",this.ariaRowSpan="",this.ariaSelected="",this.ariaSetSize="",this.ariaSort="",this.ariaValueMax="",this.ariaValueMin="",this.ariaValueNow="",this.ariaValueText="",this.role="",this.form=null,this.labels=[],this.states=new Set,this.validationMessage="",this.validity={},this.willValidate=!0,this.__host=t}checkValidity(){return console.warn("`ElementInternals.checkValidity()` was called on the server.This method always returns true."),!0}reportValidity(){return!0}setFormValue(){}setValidity(){}},J=new WeakMap,S=e=>{let t=J.get(e);return t===void 0&&J.set(e,t=new Map),t},bt=class{constructor(){this.__shadowRootMode=null,this.__shadowRoot=null,this.__internals=null}get attributes(){return Array.from(S(this)).map(([t,i])=>({name:t,value:i}))}get shadowRoot(){return this.__shadowRootMode==="closed"?null:this.__shadowRoot}setAttribute(t,i){S(this).set(t,String(i))}removeAttribute(t){S(this).delete(t)}toggleAttribute(t,i){if(this.hasAttribute(t)){if(i===void 0||!i)return this.removeAttribute(t),!1}else return i===void 0||i?(this.setAttribute(t,""),!0):!1;return!0}hasAttribute(t){return S(this).has(t)}attachShadow(t){const i={host:this};return this.__shadowRootMode=t.mode,t&&t.mode==="open"&&(this.__shadowRoot=i),i}attachInternals(){if(this.__internals!==null)throw new Error("Failed to execute 'attachInternals' on 'HTMLElement': ElementInternals for the specified element was already attached.");const t=new Et(this);return this.__internals=t,t}getAttribute(t){const i=S(this).get(t);return i??null}},St=class extends bt{},Ct=St,wt=class{constructor(){this.__definitions=new Map}define(t,i){var s;if(this.__definitions.has(t))throw new Error(`Failed to execute 'define' on 'CustomElementRegistry': the name "${t}" has already been used with this registry`);this.__definitions.set(t,{ctor:i,observedAttributes:(s=i.observedAttributes)!=null?s:[]})}get(t){const i=this.__definitions.get(t);return i?.ctor}},xt=wt,Pt=new xt,w=globalThis,K=w.ShadowRoot&&(w.ShadyCSS===void 0||w.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,dt=Symbol(),Z=new WeakMap,Rt=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==dt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(K&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=Z.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&Z.set(t,e))}return e}toString(){return this.cssText}},Tt=e=>new Rt(typeof e=="string"?e:e+"",void 0,dt),kt=(e,t)=>{K?e.adoptedStyleSheets=t.map(i=>i instanceof CSSStyleSheet?i:i.styleSheet):t.forEach(i=>{const s=document.createElement("style"),r=w.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=i.cssText,e.appendChild(s)})},G=K||w.CSSStyleSheet===void 0?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let i="";for(const s of t.cssRules)i+=s.cssText;return Tt(i)})(e):e,Q,H,A=globalThis;(Q=A.customElements)!==null&&Q!==void 0||(A.customElements=Pt);var X=A.trustedTypes,Mt=X?X.emptyScript:"",Y=A.reactiveElementPolyfillSupport,D={toAttribute(e,t){switch(t){case Boolean:e=e?Mt:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=e!==null;break;case Number:i=e===null?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch{i=null}}return i}},ct=(e,t)=>t!==e&&(t==t||e==e),N={attribute:!0,type:String,converter:D,reflect:!1,hasChanged:ct},B="finalized",tt,g=class extends((tt=globalThis.HTMLElement)!=null?tt:Ct){constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),((t=this.h)!==null&&t!==void 0?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach((t,i)=>{const s=this._$Ep(i,t);s!==void 0&&(this._$Ev.set(s,i),e.push(s))}),e}static createProperty(e,t=N){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const i=typeof e=="symbol"?Symbol():"__"+e,s=this.getPropertyDescriptor(e,i,t);s!==void 0&&Object.defineProperty(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(s){const r=this[e];this[t]=s,this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||N}static finalize(){if(this.hasOwnProperty(B))return!1;this[B]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),e.h!==void 0&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)t.unshift(G(s))}else e!==void 0&&t.push(G(e));return t}static _$Ep(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(e=this.constructor.h)===null||e===void 0||e.forEach(t=>t(this))}addController(e){var t,i;((t=this._$ES)!==null&&t!==void 0?t:this._$ES=[]).push(e),this.renderRoot!==void 0&&this.isConnected&&((i=e.hostConnected)===null||i===void 0||i.call(e))}removeController(e){var t;(t=this._$ES)===null||t===void 0||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;const t=(e=this.shadowRoot)!==null&&e!==void 0?e:this.attachShadow(this.constructor.shadowRootOptions);return kt(t,this.constructor.elementStyles),t}connectedCallback(){var e;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$ES)===null||e===void 0||e.forEach(t=>{var i;return(i=t.hostConnected)===null||i===void 0?void 0:i.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$ES)===null||e===void 0||e.forEach(t=>{var i;return(i=t.hostDisconnected)===null||i===void 0?void 0:i.call(t)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=N){var s;const r=this.constructor._$Ep(e,i);if(r!==void 0&&i.reflect===!0){const n=(((s=i.converter)===null||s===void 0?void 0:s.toAttribute)!==void 0?i.converter:D).toAttribute(t,i.type);this._$El=e,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$El=null}}_$AK(e,t){var i;const s=this.constructor,r=s._$Ev.get(e);if(r!==void 0&&this._$El!==r){const n=s.getPropertyOptions(r),o=typeof n.converter=="function"?{fromAttribute:n.converter}:((i=n.converter)===null||i===void 0?void 0:i.fromAttribute)!==void 0?n.converter:D;this._$El=r,this[r]=o.fromAttribute(t,n.type),this._$El=null}}requestUpdate(e,t,i){let s=!0;e!==void 0&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||ct)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),i.reflect===!0&&this._$El!==e&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(e,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((s,r)=>this[r]=s),this._$Ei=void 0);let t=!1;const i=this._$AL;try{t=this.shouldUpdate(i),t?(this.willUpdate(i),(e=this._$ES)===null||e===void 0||e.forEach(s=>{var r;return(r=s.hostUpdate)===null||r===void 0?void 0:r.call(s)}),this.update(i)):this._$Ek()}catch(s){throw t=!1,this._$Ek(),s}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;(t=this._$ES)===null||t===void 0||t.forEach(i=>{var s;return(s=i.hostUpdated)===null||s===void 0?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){this._$EC!==void 0&&(this._$EC.forEach((t,i)=>this._$EO(i,this[i],t)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}};g[B]=!0,g.elementProperties=new Map,g.elementStyles=[],g.shadowRootOptions={mode:"open"},Y?.({ReactiveElement:g}),((H=A.reactiveElementVersions)!==null&&H!==void 0?H:A.reactiveElementVersions=[]).push("1.6.3");var U,P=globalThis,y=P.trustedTypes,et=y?y.createPolicy("lit-html",{createHTML:e=>e}):void 0,j="$lit$",_=`lit$${(Math.random()+"").slice(9)}$`,ut="?"+_,Ht=`<${ut}>`,m=P.document===void 0?{createTreeWalker:()=>({})}:document,R=()=>m.createComment(""),T=e=>e===null||typeof e!="object"&&typeof e!="function",vt=Array.isArray,Nt=e=>vt(e)||typeof e?.[Symbol.iterator]=="function",O=`[ 	
\f\r]`,C=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,it=/-->/g,st=/>/g,f=RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),rt=/'/g,nt=/"/g,pt=/^(?:script|style|textarea|title)$/i,Ut=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),Ot=Ut(1),E=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),ot=new WeakMap,$=m.createTreeWalker(m,129,null,!1);function _t(e,t){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return et!==void 0?et.createHTML(t):t}var Lt=(e,t)=>{const i=e.length-1,s=[];let r,n=t===2?"<svg>":"",o=C;for(let a=0;a<i;a++){const l=e[a];let v,c,h=-1,u=0;for(;u<l.length&&(o.lastIndex=u,c=o.exec(l),c!==null);)u=o.lastIndex,o===C?c[1]==="!--"?o=it:c[1]!==void 0?o=st:c[2]!==void 0?(pt.test(c[2])&&(r=RegExp("</"+c[2],"g")),o=f):c[3]!==void 0&&(o=f):o===f?c[0]===">"?(o=r??C,h=-1):c[1]===void 0?h=-2:(h=o.lastIndex-c[2].length,v=c[1],o=c[3]===void 0?f:c[3]==='"'?nt:rt):o===nt||o===rt?o=f:o===it||o===st?o=C:(o=f,r=void 0);const p=o===f&&e[a+1].startsWith("/>")?" ":"";n+=o===C?l+Ht:h>=0?(s.push(v),l.slice(0,h)+j+l.slice(h)+_+p):l+_+(h===-2?(s.push(void 0),a):p)}return[_t(e,n+(e[i]||"<?>")+(t===2?"</svg>":"")),s]},z=class ft{constructor({strings:t,_$litType$:i},s){let r;this.parts=[];let n=0,o=0;const a=t.length-1,l=this.parts,[v,c]=Lt(t,i);if(this.el=ft.createElement(v,s),$.currentNode=this.el.content,i===2){const h=this.el.content,u=h.firstChild;u.remove(),h.append(...u.childNodes)}for(;(r=$.nextNode())!==null&&l.length<a;){if(r.nodeType===1){if(r.hasAttributes()){const h=[];for(const u of r.getAttributeNames())if(u.endsWith(j)||u.startsWith(_)){const p=c[o++];if(h.push(u),p!==void 0){const gt=r.getAttribute(p.toLowerCase()+j).split(_),k=/([.?@])?(.*)/.exec(p);l.push({type:1,index:n,name:k[2],strings:gt,ctor:k[1]==="."?Vt:k[1]==="?"?Bt:k[1]==="@"?jt:M})}else l.push({type:6,index:n})}for(const u of h)r.removeAttribute(u)}if(pt.test(r.tagName)){const h=r.textContent.split(_),u=h.length-1;if(u>0){r.textContent=y?y.emptyScript:"";for(let p=0;p<u;p++)r.append(h[p],R()),$.nextNode(),l.push({type:2,index:++n});r.append(h[u],R())}}}else if(r.nodeType===8)if(r.data===ut)l.push({type:2,index:n});else{let h=-1;for(;(h=r.data.indexOf(_,h+1))!==-1;)l.push({type:7,index:n}),h+=_.length-1}n++}}static createElement(t,i){const s=m.createElement("template");return s.innerHTML=t,s}};function b(e,t,i=e,s){var r,n,o,a;if(t===E)return t;let l=s!==void 0?(r=i._$Co)===null||r===void 0?void 0:r[s]:i._$Cl;const v=T(t)?void 0:t._$litDirective$;return l?.constructor!==v&&((n=l?._$AO)===null||n===void 0||n.call(l,!1),v===void 0?l=void 0:(l=new v(e),l._$AT(e,i,s)),s!==void 0?((o=(a=i)._$Co)!==null&&o!==void 0?o:a._$Co=[])[s]=l:i._$Cl=l),l!==void 0&&(t=b(e,l._$AS(e,t.values),l,s)),t}var It=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:i},parts:s}=this._$AD,r=((t=e?.creationScope)!==null&&t!==void 0?t:m).importNode(i,!0);$.currentNode=r;let n=$.nextNode(),o=0,a=0,l=s[0];for(;l!==void 0;){if(o===l.index){let v;l.type===2?v=new q(n,n.nextSibling,this,e):l.type===1?v=new l.ctor(n,l.name,l.strings,this,e):l.type===6&&(v=new zt(n,this,e)),this._$AV.push(v),l=s[++a]}o!==l?.index&&(n=$.nextNode(),o++)}return $.currentNode=m,r}v(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}},q=class $t{constructor(t,i,s,r){var n;this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=r,this._$Cp=(n=r?.isConnected)===null||n===void 0||n}get _$AU(){var t,i;return(i=(t=this._$AM)===null||t===void 0?void 0:t._$AU)!==null&&i!==void 0?i:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return i!==void 0&&t?.nodeType===11&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=b(this,t,i),T(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==E&&this._(t):t._$litType$!==void 0?this.g(t):t.nodeType!==void 0?this.$(t):Nt(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==d&&T(this._$AH)?this._$AA.nextSibling.data=t:this.$(m.createTextNode(t)),this._$AH=t}g(t){var i;const{values:s,_$litType$:r}=t,n=typeof r=="number"?this._$AC(t):(r.el===void 0&&(r.el=z.createElement(_t(r.h,r.h[0]),this.options)),r);if(((i=this._$AH)===null||i===void 0?void 0:i._$AD)===n)this._$AH.v(s);else{const o=new It(n,this),a=o.u(this.options);o.v(s),this.$(a),this._$AH=o}}_$AC(t){let i=ot.get(t.strings);return i===void 0&&ot.set(t.strings,i=new z(t)),i}T(t){vt(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,r=0;for(const n of t)r===i.length?i.push(s=new $t(this.k(R()),this.k(R()),this,this.options)):s=i[r],s._$AI(n),r++;r<i.length&&(this._$AR(s&&s._$AB.nextSibling,r),i.length=r)}_$AR(t=this._$AA.nextSibling,i){var s;for((s=this._$AP)===null||s===void 0||s.call(this,!1,!0,i);t&&t!==this._$AB;){const r=t.nextSibling;t.remove(),t=r}}setConnected(t){var i;this._$AM===void 0&&(this._$Cp=t,(i=this._$AP)===null||i===void 0||i.call(this,t))}},M=class{constructor(e,t,i,s,r){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=d}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,s){const r=this.strings;let n=!1;if(r===void 0)e=b(this,e,t,0),n=!T(e)||e!==this._$AH&&e!==E,n&&(this._$AH=e);else{const o=e;let a,l;for(e=r[0],a=0;a<r.length-1;a++)l=b(this,o[i+a],t,a),l===E&&(l=this._$AH[a]),n||(n=!T(l)||l!==this._$AH[a]),l===d?e=d:e!==d&&(e+=(l??"")+r[a+1]),this._$AH[a]=l}n&&!s&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},Vt=class extends M{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}},Dt=y?y.emptyScript:"",Bt=class extends M{constructor(){super(...arguments),this.type=4}j(e){e&&e!==d?this.element.setAttribute(this.name,Dt):this.element.removeAttribute(this.name)}},jt=class extends M{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){var i;if((e=(i=b(this,e,t,0))!==null&&i!==void 0?i:d)===E)return;const s=this._$AH,r=e===d&&s!==d||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,n=e!==d&&(s===d||r);r&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;typeof this._$AH=="function"?this._$AH.call((i=(t=this.options)===null||t===void 0?void 0:t.host)!==null&&i!==void 0?i:this.element,e):this._$AH.handleEvent(e)}},zt=class{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){b(this,e)}},lt=P.litHtmlPolyfillSupport;lt?.(z,q),((U=P.litHtmlVersions)!==null&&U!==void 0?U:P.litHtmlVersions=[]).push("2.8.0");var Wt=(e,t,i)=>{var s,r;const n=(s=i?.renderBefore)!==null&&s!==void 0?s:t;let o=n._$litPart$;if(o===void 0){const a=(r=i?.renderBefore)!==null&&r!==void 0?r:null;n._$litPart$=o=new q(t.insertBefore(R(),a),a,void 0,i??{})}return o._$AI(e),o},L,I,x=class extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const i=super.createRenderRoot();return(e=(t=this.renderOptions).renderBefore)!==null&&e!==void 0||(t.renderBefore=i.firstChild),i}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Wt(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!1)}render(){return E}};x.finalized=!0,x._$litElement$=!0,(L=globalThis.litElementHydrateSupport)===null||L===void 0||L.call(globalThis,{LitElement:x});var at=globalThis.litElementPolyfillSupport;at?.({LitElement:x});((I=globalThis.litElementVersions)!==null&&I!==void 0?I:globalThis.litElementVersions=[]).push("3.3.3");var Kt=(e,t)=>t.kind==="method"&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(i){i.createProperty(t.key,e)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){typeof t.initializer=="function"&&(this[t.key]=t.initializer.call(this))},finisher(i){i.createProperty(t.key,e)}},qt=(e,t,i)=>{t.constructor.createProperty(i,e)};function mt(e){return(t,i)=>i!==void 0?qt(e,t,i):Kt(e,t)}var V;((V=globalThis.HTMLSlotElement)===null||V===void 0?void 0:V.prototype.assignedElements)!=null;var F=class W extends x{constructor(){super(...arguments),this.activeAttribute="selected",this.multiple=!1,this.activeChildren=[],this.selected=-1}static getChildValue(t){return t.getAttribute("value")||t.dataset.value}get value(){return this.activeChildren}set value(t){this.activeChildren=t,this.updateChildren()}focusCallback(t){let i=0;for(const s of this.children){if(s.contains(t.target)){this.selected=i,this.onSelected();break}i++}}onPress(t){t.stopPropagation();let i=!1,s=0;for(const n of this.children){if(t.target===n||n.contains(t.target)){i=!0;const o=W.getChildValue(n)||s.toString();this.activeChildren.includes(o)?this.activeChildren.splice(this.activeChildren.indexOf(o),1):this.activeChildren.push(o)}s++}if(!i)return;this.multiple||this.activeChildren.splice(0,this.activeChildren.length-1);const r=new Event("input",{bubbles:!0,cancelable:!0});this.dispatchEvent(r),!r.defaultPrevented&&this.updateChildren()}updateChildren(){let t=0;for(const i of this.children){const s=W.getChildValue(i)||t.toString();this.activeChildren.map(r=>r.toString()).indexOf(s.toString())!==-1?i.setAttribute(this.activeAttribute,""):i.removeAttribute(this.activeAttribute),t++}}selectNext(){this.selected=Math.min(this.selected+1,this.children.length-1),this.onSelected()}selectPrev(){this.selected=Math.max(this.selected-1,0),this.onSelected()}onSelected(){const t=this.children[this.selected];t&&t.focus(),this.updateChildren()}onKey(t){const i=document.activeElement;if(i!=null){let s=i.nextElementSibling;if((t.key==="ArrowLeft"||t.key==="ArrowUp")&&(s=i.previousElementSibling),s){const r=i.getClientRects()[0],n=s.getClientRects()[0];if(!r||!n)return;const o=Math.abs(n.x-r.x),a=Math.abs(n.y-r.y);o>a?(t.key==="ArrowLeft"&&this.selectPrev(),t.key==="ArrowRight"&&this.selectNext()):(t.key==="ArrowUp"&&this.selectPrev(),t.key==="ArrowDown"&&this.selectNext())}}}updated(){this.updateChildren()}render(){return Ot`<slot />`}connectedCallback(){super.connectedCallback(),this.activeChildren?this.updateChildren():this.activeChildren=[],this.addEventListener("keyup",this.onKey,{capture:!0}),this.addEventListener("click",this.onPress),this.addEventListener("focus",this.focusCallback,{capture:!0})}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keyup",this.onKey,{capture:!0}),this.removeEventListener("click",this.onPress),this.removeEventListener("focus",this.focusCallback,{capture:!0})}};ht([mt({type:String,attribute:"active-attribute"})],F.prototype,"activeAttribute",2);ht([mt({type:Boolean,reflect:!1})],F.prototype,"multiple",2);var Ft=F;customElements.define("a-toggle",Ft);/*! Bundled license information:

@lit-labs/ssr-dom-shim/lib/element-internals.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit-labs/ssr-dom-shim/index.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/node/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/node/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/node/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/node/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/node/decorators/custom-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/node/decorators/property.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/node/decorators/state.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/node/decorators/base.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/node/decorators/event-options.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/node/decorators/query.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/node/decorators/query-all.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/node/decorators/query-async.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/node/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/node/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
