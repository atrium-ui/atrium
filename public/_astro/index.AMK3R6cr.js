import"./index.CF4ocMTR.js";var Et=Object.defineProperty,St=Object.getOwnPropertyDescriptor,w=(t,e,i,s)=>{for(var r=s>1?void 0:s?St(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(r=(s?n(e,i,r):n(r))||r);return s&&r&&Et(e,i,r),r},wt=class{get shadowRoot(){return this.__host.__shadowRoot}constructor(e){this.ariaAtomic="",this.ariaAutoComplete="",this.ariaBraileLabel="",this.ariaBraileRoleDescription="",this.ariaBusy="",this.ariaChecked="",this.ariaColCount="",this.ariaColIndex="",this.ariaColSpan="",this.ariaCurrent="",this.ariaDescription="",this.ariaDisabled="",this.ariaExpanded="",this.ariaHasPopup="",this.ariaHidden="",this.ariaInvalid="",this.ariaKeyShortcuts="",this.ariaLabel="",this.ariaLevel="",this.ariaLive="",this.ariaModal="",this.ariaMultiLine="",this.ariaMultiSelectable="",this.ariaOrientation="",this.ariaPlaceholder="",this.ariaPosInSet="",this.ariaPressed="",this.ariaReadOnly="",this.ariaRequired="",this.ariaRoleDescription="",this.ariaRowCount="",this.ariaRowIndex="",this.ariaRowSpan="",this.ariaSelected="",this.ariaSetSize="",this.ariaSort="",this.ariaValueMax="",this.ariaValueMin="",this.ariaValueNow="",this.ariaValueText="",this.role="",this.form=null,this.labels=[],this.states=new Set,this.validationMessage="",this.validity={},this.willValidate=!0,this.__host=e}checkValidity(){return console.warn("`ElementInternals.checkValidity()` was called on the server.This method always returns true."),!0}reportValidity(){return!0}setFormValue(){}setValidity(){}},G=new WeakMap,x=t=>{let e=G.get(t);return e===void 0&&G.set(t,e=new Map),e},Ct=class{constructor(){this.__shadowRootMode=null,this.__shadowRoot=null,this.__internals=null}get attributes(){return Array.from(x(this)).map(([e,i])=>({name:e,value:i}))}get shadowRoot(){return this.__shadowRootMode==="closed"?null:this.__shadowRoot}setAttribute(e,i){x(this).set(e,String(i))}removeAttribute(e){x(this).delete(e)}toggleAttribute(e,i){if(this.hasAttribute(e)){if(i===void 0||!i)return this.removeAttribute(e),!1}else return i===void 0||i?(this.setAttribute(e,""),!0):!1;return!0}hasAttribute(e){return x(this).has(e)}attachShadow(e){const i={host:this};return this.__shadowRootMode=e.mode,e&&e.mode==="open"&&(this.__shadowRoot=i),i}attachInternals(){if(this.__internals!==null)throw new Error("Failed to execute 'attachInternals' on 'HTMLElement': ElementInternals for the specified element was already attached.");const e=new wt(this);return this.__internals=e,e}getAttribute(e){const i=x(this).get(e);return i??null}},xt=class extends Ct{},Ot=xt,kt=class{constructor(){this.__definitions=new Map}define(e,i){var s;if(this.__definitions.has(e))throw new Error(`Failed to execute 'define' on 'CustomElementRegistry': the name "${e}" has already been used with this registry`);this.__definitions.set(e,{ctor:i,observedAttributes:(s=i.observedAttributes)!=null?s:[]})}get(e){const i=this.__definitions.get(e);return i?.ctor}},Pt=kt,Tt=new Pt,k=globalThis,F=k.ShadowRoot&&(k.ShadyCSS===void 0||k.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,J=Symbol(),Q=new WeakMap,ct=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==J)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(F&&t===void 0){const i=e!==void 0&&e.length===1;i&&(t=Q.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&Q.set(e,t))}return t}toString(){return this.cssText}},Rt=t=>new ct(typeof t=="string"?t:t+"",void 0,J),ut=(t,...e)=>{const i=t.length===1?t[0]:e.reduce((s,r,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+t[o+1],t[0]);return new ct(i,t,J)},Ut=(t,e)=>{F?t.adoptedStyleSheets=e.map(i=>i instanceof CSSStyleSheet?i:i.styleSheet):e.forEach(i=>{const s=document.createElement("style"),r=k.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=i.cssText,t.appendChild(s)})},X=F||k.CSSStyleSheet===void 0?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let i="";for(const s of e.cssRules)i+=s.cssText;return Rt(i)})(t):t,Y,N,A=globalThis;(Y=A.customElements)!==null&&Y!==void 0||(A.customElements=Tt);var tt=A.trustedTypes,Mt=tt?tt.emptyScript:"",et=A.reactiveElementPolyfillSupport,z={toAttribute(t,e){switch(e){case Boolean:t=t?Mt:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=t!==null;break;case Number:i=t===null?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch{i=null}}return i}},pt=(t,e)=>e!==t&&(e==e||t==t),V={attribute:!0,type:String,converter:z,reflect:!1,hasChanged:pt},q="finalized",it,m=class extends((it=globalThis.HTMLElement)!=null?it:Ot){constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var e;this.finalize(),((e=this.h)!==null&&e!==void 0?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach((e,i)=>{const s=this._$Ep(i,e);s!==void 0&&(this._$Ev.set(s,i),t.push(s))}),t}static createProperty(t,e=V){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i=typeof t=="symbol"?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);s!==void 0&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const r=this[t];this[e]=s,this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||V}static finalize(){if(this.hasOwnProperty(q))return!1;this[q]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),t.h!==void 0&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,i=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const s of i)this.createProperty(s,e[s])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const s of i)e.unshift(X(s))}else t!==void 0&&e.push(X(t));return e}static _$Ep(t,e){const i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(t=this.constructor.h)===null||t===void 0||t.forEach(e=>e(this))}addController(t){var e,i;((e=this._$ES)!==null&&e!==void 0?e:this._$ES=[]).push(t),this.renderRoot!==void 0&&this.isConnected&&((i=t.hostConnected)===null||i===void 0||i.call(t))}removeController(t){var e;(e=this._$ES)===null||e===void 0||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])})}createRenderRoot(){var t;const e=(t=this.shadowRoot)!==null&&t!==void 0?t:this.attachShadow(this.constructor.shadowRootOptions);return Ut(e,this.constructor.elementStyles),e}connectedCallback(){var t;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$ES)===null||t===void 0||t.forEach(e=>{var i;return(i=e.hostConnected)===null||i===void 0?void 0:i.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$ES)===null||t===void 0||t.forEach(e=>{var i;return(i=e.hostDisconnected)===null||i===void 0?void 0:i.call(e)})}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=V){var s;const r=this.constructor._$Ep(t,i);if(r!==void 0&&i.reflect===!0){const o=(((s=i.converter)===null||s===void 0?void 0:s.toAttribute)!==void 0?i.converter:z).toAttribute(e,i.type);this._$El=t,o==null?this.removeAttribute(r):this.setAttribute(r,o),this._$El=null}}_$AK(t,e){var i;const s=this.constructor,r=s._$Ev.get(t);if(r!==void 0&&this._$El!==r){const o=s.getPropertyOptions(r),n=typeof o.converter=="function"?{fromAttribute:o.converter}:((i=o.converter)===null||i===void 0?void 0:i.fromAttribute)!==void 0?o.converter:z;this._$El=r,this[r]=n.fromAttribute(e,o.type),this._$El=null}}requestUpdate(t,e,i){let s=!0;t!==void 0&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||pt)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),i.reflect===!0&&this._$El!==t&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((s,r)=>this[r]=s),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),(t=this._$ES)===null||t===void 0||t.forEach(s=>{var r;return(r=s.hostUpdate)===null||r===void 0?void 0:r.call(s)}),this.update(i)):this._$Ek()}catch(s){throw e=!1,this._$Ek(),s}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;(e=this._$ES)===null||e===void 0||e.forEach(i=>{var s;return(s=i.hostUpdated)===null||s===void 0?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){this._$EC!==void 0&&(this._$EC.forEach((e,i)=>this._$EO(i,this[i],e)),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}};m[q]=!0,m.elementProperties=new Map,m.elementStyles=[],m.shadowRootOptions={mode:"open"},et?.({ReactiveElement:m}),((N=A.reactiveElementVersions)!==null&&N!==void 0?N:A.reactiveElementVersions=[]).push("1.6.3");var L,P=globalThis,b=P.trustedTypes,st=b?b.createPolicy("lit-html",{createHTML:t=>t}):void 0,K="$lit$",f=`lit$${(Math.random()+"").slice(9)}$`,vt="?"+f,Ht=`<${vt}>`,y=P.document===void 0?{createTreeWalker:()=>({})}:document,T=()=>y.createComment(""),R=t=>t===null||typeof t!="object"&&typeof t!="function",ft=Array.isArray,Nt=t=>ft(t)||typeof t?.[Symbol.iterator]=="function",D=`[ 	
\f\r]`,O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,rt=/-->/g,ot=/>/g,_=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),nt=/'/g,lt=/"/g,_t=/^(?:script|style|textarea|title)$/i,Vt=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),$t=Vt(1),E=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),at=new WeakMap,$=y.createTreeWalker(y,129,null,!1);function yt(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return st!==void 0?st.createHTML(e):e}var Lt=(t,e)=>{const i=t.length-1,s=[];let r,o=e===2?"<svg>":"",n=O;for(let a=0;a<i;a++){const l=t[a];let p,c,h=-1,u=0;for(;u<l.length&&(n.lastIndex=u,c=n.exec(l),c!==null);)u=n.lastIndex,n===O?c[1]==="!--"?n=rt:c[1]!==void 0?n=ot:c[2]!==void 0?(_t.test(c[2])&&(r=RegExp("</"+c[2],"g")),n=_):c[3]!==void 0&&(n=_):n===_?c[0]===">"?(n=r??O,h=-1):c[1]===void 0?h=-2:(h=n.lastIndex-c[2].length,p=c[1],n=c[3]===void 0?_:c[3]==='"'?lt:nt):n===lt||n===nt?n=_:n===rt||n===ot?n=O:(n=_,r=void 0);const v=n===_&&t[a+1].startsWith("/>")?" ":"";o+=n===O?l+Ht:h>=0?(s.push(p),l.slice(0,h)+K+l.slice(h)+f+v):l+f+(h===-2?(s.push(void 0),a):v)}return[yt(t,o+(t[i]||"<?>")+(e===2?"</svg>":"")),s]},W=class mt{constructor({strings:e,_$litType$:i},s){let r;this.parts=[];let o=0,n=0;const a=e.length-1,l=this.parts,[p,c]=Lt(e,i);if(this.el=mt.createElement(p,s),$.currentNode=this.el.content,i===2){const h=this.el.content,u=h.firstChild;u.remove(),h.append(...u.childNodes)}for(;(r=$.nextNode())!==null&&l.length<a;){if(r.nodeType===1){if(r.hasAttributes()){const h=[];for(const u of r.getAttributeNames())if(u.endsWith(K)||u.startsWith(f)){const v=c[n++];if(h.push(u),v!==void 0){const bt=r.getAttribute(v.toLowerCase()+K).split(f),M=/([.?@])?(.*)/.exec(v);l.push({type:1,index:o,name:M[2],strings:bt,ctor:M[1]==="."?Bt:M[1]==="?"?jt:M[1]==="@"?zt:H})}else l.push({type:6,index:o})}for(const u of h)r.removeAttribute(u)}if(_t.test(r.tagName)){const h=r.textContent.split(f),u=h.length-1;if(u>0){r.textContent=b?b.emptyScript:"";for(let v=0;v<u;v++)r.append(h[v],T()),$.nextNode(),l.push({type:2,index:++o});r.append(h[u],T())}}}else if(r.nodeType===8)if(r.data===vt)l.push({type:2,index:o});else{let h=-1;for(;(h=r.data.indexOf(f,h+1))!==-1;)l.push({type:7,index:o}),h+=f.length-1}o++}}static createElement(e,i){const s=y.createElement("template");return s.innerHTML=e,s}};function S(t,e,i=t,s){var r,o,n,a;if(e===E)return e;let l=s!==void 0?(r=i._$Co)===null||r===void 0?void 0:r[s]:i._$Cl;const p=R(e)?void 0:e._$litDirective$;return l?.constructor!==p&&((o=l?._$AO)===null||o===void 0||o.call(l,!1),p===void 0?l=void 0:(l=new p(t),l._$AT(t,i,s)),s!==void 0?((n=(a=i)._$Co)!==null&&n!==void 0?n:a._$Co=[])[s]=l:i._$Cl=l),l!==void 0&&(e=S(t,l._$AS(t,e.values),l,s)),e}var Dt=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:s}=this._$AD,r=((e=t?.creationScope)!==null&&e!==void 0?e:y).importNode(i,!0);$.currentNode=r;let o=$.nextNode(),n=0,a=0,l=s[0];for(;l!==void 0;){if(n===l.index){let p;l.type===2?p=new Z(o,o.nextSibling,this,t):l.type===1?p=new l.ctor(o,l.name,l.strings,this,t):l.type===6&&(p=new qt(o,this,t)),this._$AV.push(p),l=s[++a]}n!==l?.index&&(o=$.nextNode(),n++)}return $.currentNode=y,r}v(t){let e=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}},Z=class gt{constructor(e,i,s,r){var o;this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=i,this._$AM=s,this.options=r,this._$Cp=(o=r?.isConnected)===null||o===void 0||o}get _$AU(){var e,i;return(i=(e=this._$AM)===null||e===void 0?void 0:e._$AU)!==null&&i!==void 0?i:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const i=this._$AM;return i!==void 0&&e?.nodeType===11&&(e=i.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,i=this){e=S(this,e,i),R(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==E&&this._(e):e._$litType$!==void 0?this.g(e):e.nodeType!==void 0?this.$(e):Nt(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==d&&R(this._$AH)?this._$AA.nextSibling.data=e:this.$(y.createTextNode(e)),this._$AH=e}g(e){var i;const{values:s,_$litType$:r}=e,o=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=W.createElement(yt(r.h,r.h[0]),this.options)),r);if(((i=this._$AH)===null||i===void 0?void 0:i._$AD)===o)this._$AH.v(s);else{const n=new Dt(o,this),a=n.u(this.options);n.v(s),this.$(a),this._$AH=n}}_$AC(e){let i=at.get(e.strings);return i===void 0&&at.set(e.strings,i=new W(e)),i}T(e){ft(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,r=0;for(const o of e)r===i.length?i.push(s=new gt(this.k(T()),this.k(T()),this,this.options)):s=i[r],s._$AI(o),r++;r<i.length&&(this._$AR(s&&s._$AB.nextSibling,r),i.length=r)}_$AR(e=this._$AA.nextSibling,i){var s;for((s=this._$AP)===null||s===void 0||s.call(this,!1,!0,i);e&&e!==this._$AB;){const r=e.nextSibling;e.remove(),e=r}}setConnected(e){var i;this._$AM===void 0&&(this._$Cp=e,(i=this._$AP)===null||i===void 0||i.call(this,e))}},H=class{constructor(t,e,i,s,r){this.type=1,this._$AH=d,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=d}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,s){const r=this.strings;let o=!1;if(r===void 0)t=S(this,t,e,0),o=!R(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else{const n=t;let a,l;for(t=r[0],a=0;a<r.length-1;a++)l=S(this,n[i+a],e,a),l===E&&(l=this._$AH[a]),o||(o=!R(l)||l!==this._$AH[a]),l===d?t=d:t!==d&&(t+=(l??"")+r[a+1]),this._$AH[a]=l}o&&!s&&this.j(t)}j(t){t===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Bt=class extends H{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===d?void 0:t}},It=b?b.emptyScript:"",jt=class extends H{constructor(){super(...arguments),this.type=4}j(t){t&&t!==d?this.element.setAttribute(this.name,It):this.element.removeAttribute(this.name)}},zt=class extends H{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){var i;if((t=(i=S(this,t,e,0))!==null&&i!==void 0?i:d)===E)return;const s=this._$AH,r=t===d&&s!==d||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==d&&(s===d||r);r&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;typeof this._$AH=="function"?this._$AH.call((i=(e=this.options)===null||e===void 0?void 0:e.host)!==null&&i!==void 0?i:this.element,t):this._$AH.handleEvent(t)}},qt=class{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t)}},ht=P.litHtmlPolyfillSupport;ht?.(W,Z),((L=P.litHtmlVersions)!==null&&L!==void 0?L:P.litHtmlVersions=[]).push("2.8.0");var Kt=(t,e,i)=>{var s,r;const o=(s=i?.renderBefore)!==null&&s!==void 0?s:e;let n=o._$litPart$;if(n===void 0){const a=(r=i?.renderBefore)!==null&&r!==void 0?r:null;o._$litPart$=n=new Z(e.insertBefore(T(),a),a,void 0,i??{})}return n._$AI(t),n},B,I,g=class extends m{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return(t=(e=this.renderOptions).renderBefore)!==null&&t!==void 0||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Kt(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)===null||t===void 0||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)===null||t===void 0||t.setConnected(!1)}render(){return E}};g.finalized=!0,g._$litElement$=!0,(B=globalThis.litElementHydrateSupport)===null||B===void 0||B.call(globalThis,{LitElement:g});var dt=globalThis.litElementPolyfillSupport;dt?.({LitElement:g});((I=globalThis.litElementVersions)!==null&&I!==void 0?I:globalThis.litElementVersions=[]).push("3.3.3");var Wt=(t,e)=>e.kind==="method"&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){typeof e.initializer=="function"&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}},Ft=(t,e,i)=>{e.constructor.createProperty(i,t)};function U(t){return(e,i)=>i!==void 0?Ft(t,e,i):Wt(t,e)}var Jt=({finisher:t,descriptor:e})=>(i,s)=>{var r;if(s===void 0){const o=(r=i.originalKey)!==null&&r!==void 0?r:i.key,n=e!=null?{kind:"method",placement:"prototype",key:o,descriptor:e(i.key)}:{...i,key:o};return t!=null&&(n.finisher=function(a){t(a,o)}),n}{const o=i.constructor;e!==void 0&&Object.defineProperty(i,s,e(s)),t?.(o,s)}};function Zt(t,e){return Jt({descriptor:i=>{const s={get(){var r,o;return(o=(r=this.renderRoot)===null||r===void 0?void 0:r.querySelector(t))!==null&&o!==void 0?o:null},enumerable:!0,configurable:!0};if(e){const r=typeof i=="symbol"?Symbol():"__"+i;s.get=function(){var o,n;return this[r]===void 0&&(this[r]=(n=(o=this.renderRoot)===null||o===void 0?void 0:o.querySelector(t))!==null&&n!==void 0?n:null),this[r]}}return s}})}var j;((j=globalThis.HTMLSlotElement)===null||j===void 0?void 0:j.prototype.assignedElements)!=null;var Gt=class extends Event{constructor(t){super("select",{bubbles:!0}),this.option=t}},C=class extends g{constructor(){super(...arguments),this.direction="down",this.opened=!1,this.disabled=!1,this.options=[]}static get styles(){return ut`
      :host {
        display: inline-block;
        position: relative;
        outline: none;

        --dropdown-max-height: 200px;
        --dropdown-speed: 0.15s;
				--dropdown-position: absolute;
      }
      :host([opened]) {
        z-index: 10;
      }
      .dropdown-container {
        position: var(--dropdown-position);
        top: 100%;
        width: 100%;
        background: inherit;
      }
      :host([direction="up"]) .dropdown-container {
        bottom: 100%;
        top: auto;
        width: 100%;
      }
      a-expandable {
        display: block;

        --transition-speed: var(--dropdown-speed);
      }
      .dropdown {
        max-height: var(--dropdown-max-height);
        overflow: auto;
        width: 100%;
      }
    `}connectedCallback(){super.connectedCallback(),this.addEventListener("focusout",this.onBlur),this.addEventListener("keydown",this.onKeyDown),this.addEventListener("keyup",this.onKeyUp)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focusout",this.onBlur),this.removeEventListener("keydown",this.onKeyDown),this.removeEventListener("keyup",this.onKeyUp)}selectNext(){const t=this.getOptionByValue(this.selected),e=t?this.options.indexOf(t):-1,i=Math.max(e-1,0),s=this.options[i];s&&(this.selected=this.getValueOfOption(s),this.updateOptionSelection())}selectPrev(){const t=this.getOptionByValue(this.selected),e=t?this.options.indexOf(t):-1,i=Math.min(e+1,this.options.length-1),s=this.options[i];s&&(this.selected=this.getValueOfOption(s),this.updateOptionSelection())}reset(){this.selected=void 0,this.updateOptionSelection()}submitSelected(){if(this.selected){const t=this.getOptionByValue(this.selected);t&&(this.close(),this.dispatchEvent(new Gt(t)))}}close(){this.opened=!1,this.requestUpdate(),this.dispatchEvent(new Event("close"))}open(){if(this.disabled)return;this.dispatchEvent(new Event("open")),this.opened=!0,this.requestUpdate();const t=this.querySelector('[slot="input"]');t&&t.focus(),this.direction==="up"&&this.dropdown.scrollTo(0,this.dropdown.scrollHeight)}onBlur(t){const e=()=>{window.removeEventListener("pointerup",e),this.querySelector("*:focus-within")||this.close()};window.addEventListener("pointerup",e)}onClick(t){this.opened?this.close():this.open()}scrollToSelected(){if(this.selected){const t=this.getOptionByValue(this.selected);t?.scrollIntoView({block:"nearest"})}}onKeyDown(t){switch(t.key){case"ArrowUp":this.querySelector("*:focus")&&(this.direction==="up"?this.selectPrev():this.selectNext(),this.scrollToSelected(),t.preventDefault());break;case"ArrowDown":this.querySelector("*:focus")&&(this.direction==="up"?this.selectNext():this.selectPrev(),this.scrollToSelected(),t.preventDefault());break;case"Tab":setTimeout(()=>{this.querySelector("*:focus-within")||this.close()},10);break;case"Enter":t.preventDefault();break}}onKeyUp(t){switch(t.key){case"Enter":this.opened&&this.selected!==void 0&&this.submitSelected();break;case"Escape":this.close();break;case"Tab":this.opened||this.open();break}}onSlotChange(){this.options=[...this.querySelectorAll("a-option")],this.direction==="up"&&this.options.reverse()}onOptionsClick(t){let e=0;for(const i of this.options){if(i===t.target||i.contains(t.target)){const s=i.getAttribute("value")||e.toString();this.selected=s,this.submitSelected();break}e++}}getValueOfOption(t){return t.getAttribute("value")||this.options.indexOf(t).toString()}getOptionByValue(t){if(t!==void 0){for(const e of this.options)if(this.getValueOfOption(e)===t)return e}}updated(){this.updateOptionSelection()}updateOptionSelection(){const t=this.options;for(const e of t)this.getValueOfOption(e)===this.selected?e.setAttribute("selected",""):e.removeAttribute("selected")}render(){return $t`
      <slot name="input" @click=${this.onClick}></slot>
      <div class="dropdown-container" part="dropdown">
        <a-expandable ?opened="${this.opened}">
          <div class="dropdown" part="options">
            <slot @click=${this.onOptionsClick} @slotchange=${this.onSlotChange}></slot>
          </div>
        </a-expandable>
      </div>
    `}};w([U({type:String,reflect:!0})],C.prototype,"direction",2);w([U({type:String,reflect:!0})],C.prototype,"selected",2);w([U({type:Boolean,reflect:!0})],C.prototype,"opened",2);w([U({type:Boolean,reflect:!0})],C.prototype,"disabled",2);w([Zt(".dropdown")],C.prototype,"dropdown",2);customElements.define("a-dropdown",C);var At=class extends g{static get styles(){return ut`
      :host {
        display: block;
      }
    `}render(){return $t`<slot></slot>`}};w([U({type:String,reflect:!0})],At.prototype,"value",2);customElements.define("a-option",At);/*! Bundled license information:

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
