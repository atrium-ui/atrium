var wt=class{get shadowRoot(){return this.__host.__shadowRoot}constructor(t){this.ariaAtomic="",this.ariaAutoComplete="",this.ariaBraileLabel="",this.ariaBraileRoleDescription="",this.ariaBusy="",this.ariaChecked="",this.ariaColCount="",this.ariaColIndex="",this.ariaColSpan="",this.ariaCurrent="",this.ariaDescription="",this.ariaDisabled="",this.ariaExpanded="",this.ariaHasPopup="",this.ariaHidden="",this.ariaInvalid="",this.ariaKeyShortcuts="",this.ariaLabel="",this.ariaLevel="",this.ariaLive="",this.ariaModal="",this.ariaMultiLine="",this.ariaMultiSelectable="",this.ariaOrientation="",this.ariaPlaceholder="",this.ariaPosInSet="",this.ariaPressed="",this.ariaReadOnly="",this.ariaRequired="",this.ariaRoleDescription="",this.ariaRowCount="",this.ariaRowIndex="",this.ariaRowSpan="",this.ariaSelected="",this.ariaSetSize="",this.ariaSort="",this.ariaValueMax="",this.ariaValueMin="",this.ariaValueNow="",this.ariaValueText="",this.role="",this.form=null,this.labels=[],this.states=new Set,this.validationMessage="",this.validity={},this.willValidate=!0,this.__host=t}checkValidity(){return console.warn("`ElementInternals.checkValidity()` was called on the server.This method always returns true."),!0}reportValidity(){return!0}setFormValue(){}setValidity(){}},G=new WeakMap,S=e=>{let t=G.get(e);return t===void 0&&G.set(e,t=new Map),t},St=class{constructor(){this.__shadowRootMode=null,this.__shadowRoot=null,this.__internals=null}get attributes(){return Array.from(S(this)).map(([t,s])=>({name:t,value:s}))}get shadowRoot(){return this.__shadowRootMode==="closed"?null:this.__shadowRoot}setAttribute(t,s){S(this).set(t,String(s))}removeAttribute(t){S(this).delete(t)}toggleAttribute(t,s){if(this.hasAttribute(t)){if(s===void 0||!s)return this.removeAttribute(t),!1}else return s===void 0||s?(this.setAttribute(t,""),!0):!1;return!0}hasAttribute(t){return S(this).has(t)}attachShadow(t){const s={host:this};return this.__shadowRootMode=t.mode,t&&t.mode==="open"&&(this.__shadowRoot=s),s}attachInternals(){if(this.__internals!==null)throw new Error("Failed to execute 'attachInternals' on 'HTMLElement': ElementInternals for the specified element was already attached.");const t=new wt(this);return this.__internals=t,t}getAttribute(t){const s=S(this).get(t);return s??null}},Ct=class extends St{},xt=Ct,Tt=class{constructor(){this.__definitions=new Map}define(t,s){var i;if(this.__definitions.has(t))throw new Error(`Failed to execute 'define' on 'CustomElementRegistry': the name "${t}" has already been used with this registry`);this.__definitions.set(t,{ctor:s,observedAttributes:(i=s.observedAttributes)!=null?i:[]})}get(t){const s=this.__definitions.get(t);return s?.ctor}},Rt=Tt,Ht=new Rt,x=globalThis,q=x.ShadowRoot&&(x.ShadyCSS===void 0||x.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Z=Symbol(),Q=new WeakMap,ct=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==Z)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(q&&e===void 0){const s=t!==void 0&&t.length===1;s&&(e=Q.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&Q.set(t,e))}return e}toString(){return this.cssText}},Mt=e=>new ct(typeof e=="string"?e:e+"",void 0,Z),K=(e,...t)=>{const s=e.length===1?e[0]:t.reduce((i,r,n)=>i+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+e[n+1],e[0]);return new ct(s,e,Z)},Pt=(e,t)=>{q?e.adoptedStyleSheets=t.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet):t.forEach(s=>{const i=document.createElement("style"),r=x.litNonce;r!==void 0&&i.setAttribute("nonce",r),i.textContent=s.cssText,e.appendChild(i)})},X=q||x.CSSStyleSheet===void 0?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let s="";for(const i of t.cssRules)s+=i.cssText;return Mt(s)})(e):e,tt,N,y=globalThis;(tt=y.customElements)!==null&&tt!==void 0||(y.customElements=Ht);var et=y.trustedTypes,kt=et?et.emptyScript:"",st=y.reactiveElementPolyfillSupport,z={toAttribute(e,t){switch(t){case Boolean:e=e?kt:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let s=e;switch(t){case Boolean:s=e!==null;break;case Number:s=e===null?null:Number(e);break;case Object:case Array:try{s=JSON.parse(e)}catch{s=null}}return s}},pt=(e,t)=>t!==e&&(t==t||e==e),O={attribute:!0,type:String,converter:z,reflect:!1,hasChanged:pt},j="finalized",it,g=class extends((it=globalThis.HTMLElement)!=null?it:xt){constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),((t=this.h)!==null&&t!==void 0?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach((t,s)=>{const i=this._$Ep(s,t);i!==void 0&&(this._$Ev.set(i,s),e.push(i))}),e}static createProperty(e,t=O){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const s=typeof e=="symbol"?Symbol():"__"+e,i=this.getPropertyDescriptor(e,s,t);i!==void 0&&Object.defineProperty(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){return{get(){return this[t]},set(i){const r=this[e];this[t]=i,this.requestUpdate(e,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||O}static finalize(){if(this.hasOwnProperty(j))return!1;this[j]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),e.h!==void 0&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,s=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of s)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const i of s)t.unshift(X(i))}else e!==void 0&&t.push(X(e));return t}static _$Ep(e,t){const s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(e=this.constructor.h)===null||e===void 0||e.forEach(t=>t(this))}addController(e){var t,s;((t=this._$ES)!==null&&t!==void 0?t:this._$ES=[]).push(e),this.renderRoot!==void 0&&this.isConnected&&((s=e.hostConnected)===null||s===void 0||s.call(e))}removeController(e){var t;(t=this._$ES)===null||t===void 0||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;const t=(e=this.shadowRoot)!==null&&e!==void 0?e:this.attachShadow(this.constructor.shadowRootOptions);return Pt(t,this.constructor.elementStyles),t}connectedCallback(){var e;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$ES)===null||e===void 0||e.forEach(t=>{var s;return(s=t.hostConnected)===null||s===void 0?void 0:s.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$ES)===null||e===void 0||e.forEach(t=>{var s;return(s=t.hostDisconnected)===null||s===void 0?void 0:s.call(t)})}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$EO(e,t,s=O){var i;const r=this.constructor._$Ep(e,s);if(r!==void 0&&s.reflect===!0){const n=(((i=s.converter)===null||i===void 0?void 0:i.toAttribute)!==void 0?s.converter:z).toAttribute(t,s.type);this._$El=e,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$El=null}}_$AK(e,t){var s;const i=this.constructor,r=i._$Ev.get(e);if(r!==void 0&&this._$El!==r){const n=i.getPropertyOptions(r),o=typeof n.converter=="function"?{fromAttribute:n.converter}:((s=n.converter)===null||s===void 0?void 0:s.fromAttribute)!==void 0?n.converter:z;this._$El=r,this[r]=o.fromAttribute(t,n.type),this._$El=null}}requestUpdate(e,t,s){let i=!0;e!==void 0&&(((s=s||this.constructor.getPropertyOptions(e)).hasChanged||pt)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),s.reflect===!0&&this._$El!==e&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(e,s))):i=!1),!this.isUpdatePending&&i&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((i,r)=>this[r]=i),this._$Ei=void 0);let t=!1;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),(e=this._$ES)===null||e===void 0||e.forEach(i=>{var r;return(r=i.hostUpdate)===null||r===void 0?void 0:r.call(i)}),this.update(s)):this._$Ek()}catch(i){throw t=!1,this._$Ek(),i}t&&this._$AE(s)}willUpdate(e){}_$AE(e){var t;(t=this._$ES)===null||t===void 0||t.forEach(s=>{var i;return(i=s.hostUpdated)===null||i===void 0?void 0:i.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){this._$EC!==void 0&&(this._$EC.forEach((t,s)=>this._$EO(s,this[s],t)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}};g[j]=!0,g.elementProperties=new Map,g.elementStyles=[],g.shadowRootOptions={mode:"open"},st?.({ReactiveElement:g}),((N=y.reactiveElementVersions)!==null&&N!==void 0?N:y.reactiveElementVersions=[]).push("1.6.3");var L,T=globalThis,b=T.trustedTypes,rt=b?b.createPolicy("lit-html",{createHTML:e=>e}):void 0,D="$lit$",_=`lit$${(Math.random()+"").slice(9)}$`,vt="?"+_,Ut=`<${vt}>`,m=T.document===void 0?{createTreeWalker:()=>({})}:document,R=()=>m.createComment(""),H=e=>e===null||typeof e!="object"&&typeof e!="function",_t=Array.isArray,Nt=e=>_t(e)||typeof e?.[Symbol.iterator]=="function",I=`[ 	
\f\r]`,C=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,nt=/-->/g,ot=/>/g,$=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),at=/'/g,lt=/"/g,$t=/^(?:script|style|textarea|title)$/i,Ot=e=>(t,...s)=>({_$litType$:e,strings:t,values:s}),J=Ot(1),E=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),ht=new WeakMap,f=m.createTreeWalker(m,129,null,!1);function ft(e,t){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return rt!==void 0?rt.createHTML(t):t}var Lt=(e,t)=>{const s=e.length-1,i=[];let r,n=t===2?"<svg>":"",o=C;for(let l=0;l<s;l++){const a=e[l];let p,u,h=-1,c=0;for(;c<a.length&&(o.lastIndex=c,u=o.exec(a),u!==null);)c=o.lastIndex,o===C?u[1]==="!--"?o=nt:u[1]!==void 0?o=ot:u[2]!==void 0?($t.test(u[2])&&(r=RegExp("</"+u[2],"g")),o=$):u[3]!==void 0&&(o=$):o===$?u[0]===">"?(o=r??C,h=-1):u[1]===void 0?h=-2:(h=o.lastIndex-u[2].length,p=u[1],o=u[3]===void 0?$:u[3]==='"'?lt:at):o===lt||o===at?o=$:o===nt||o===ot?o=C:(o=$,r=void 0);const v=o===$&&e[l+1].startsWith("/>")?" ":"";n+=o===C?a+Ut:h>=0?(i.push(p),a.slice(0,h)+D+a.slice(h)+_+v):a+_+(h===-2?(i.push(void 0),l):v)}return[ft(e,n+(e[s]||"<?>")+(t===2?"</svg>":"")),i]},W=class mt{constructor({strings:t,_$litType$:s},i){let r;this.parts=[];let n=0,o=0;const l=t.length-1,a=this.parts,[p,u]=Lt(t,s);if(this.el=mt.createElement(p,i),f.currentNode=this.el.content,s===2){const h=this.el.content,c=h.firstChild;c.remove(),h.append(...c.childNodes)}for(;(r=f.nextNode())!==null&&a.length<l;){if(r.nodeType===1){if(r.hasAttributes()){const h=[];for(const c of r.getAttributeNames())if(c.endsWith(D)||c.startsWith(_)){const v=u[o++];if(h.push(c),v!==void 0){const Et=r.getAttribute(v.toLowerCase()+D).split(_),M=/([.?@])?(.*)/.exec(v);a.push({type:1,index:n,name:M[2],strings:Et,ctor:M[1]==="."?Vt:M[1]==="?"?zt:M[1]==="@"?jt:U})}else a.push({type:6,index:n})}for(const c of h)r.removeAttribute(c)}if($t.test(r.tagName)){const h=r.textContent.split(_),c=h.length-1;if(c>0){r.textContent=b?b.emptyScript:"";for(let v=0;v<c;v++)r.append(h[v],R()),f.nextNode(),a.push({type:2,index:++n});r.append(h[c],R())}}}else if(r.nodeType===8)if(r.data===vt)a.push({type:2,index:n});else{let h=-1;for(;(h=r.data.indexOf(_,h+1))!==-1;)a.push({type:7,index:n}),h+=_.length-1}n++}}static createElement(t,s){const i=m.createElement("template");return i.innerHTML=t,i}};function w(e,t,s=e,i){var r,n,o,l;if(t===E)return t;let a=i!==void 0?(r=s._$Co)===null||r===void 0?void 0:r[i]:s._$Cl;const p=H(t)?void 0:t._$litDirective$;return a?.constructor!==p&&((n=a?._$AO)===null||n===void 0||n.call(a,!1),p===void 0?a=void 0:(a=new p(e),a._$AT(e,s,i)),i!==void 0?((o=(l=s)._$Co)!==null&&o!==void 0?o:l._$Co=[])[i]=a:s._$Cl=a),a!==void 0&&(t=w(e,a._$AS(e,t.values),a,i)),t}var It=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:s},parts:i}=this._$AD,r=((t=e?.creationScope)!==null&&t!==void 0?t:m).importNode(s,!0);f.currentNode=r;let n=f.nextNode(),o=0,l=0,a=i[0];for(;a!==void 0;){if(o===a.index){let p;a.type===2?p=new Y(n,n.nextSibling,this,e):a.type===1?p=new a.ctor(n,a.name,a.strings,this,e):a.type===6&&(p=new Dt(n,this,e)),this._$AV.push(p),a=i[++l]}o!==a?.index&&(n=f.nextNode(),o++)}return f.currentNode=m,r}v(e){let t=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}},Y=class gt{constructor(t,s,i,r){var n;this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=s,this._$AM=i,this.options=r,this._$Cp=(n=r?.isConnected)===null||n===void 0||n}get _$AU(){var t,s;return(s=(t=this._$AM)===null||t===void 0?void 0:t._$AU)!==null&&s!==void 0?s:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&t?.nodeType===11&&(t=s.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,s=this){t=w(this,t,s),H(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==E&&this._(t):t._$litType$!==void 0?this.g(t):t.nodeType!==void 0?this.$(t):Nt(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==d&&H(this._$AH)?this._$AA.nextSibling.data=t:this.$(m.createTextNode(t)),this._$AH=t}g(t){var s;const{values:i,_$litType$:r}=t,n=typeof r=="number"?this._$AC(t):(r.el===void 0&&(r.el=W.createElement(ft(r.h,r.h[0]),this.options)),r);if(((s=this._$AH)===null||s===void 0?void 0:s._$AD)===n)this._$AH.v(i);else{const o=new It(n,this),l=o.u(this.options);o.v(i),this.$(l),this._$AH=o}}_$AC(t){let s=ht.get(t.strings);return s===void 0&&ht.set(t.strings,s=new W(t)),s}T(t){_t(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let i,r=0;for(const n of t)r===s.length?s.push(i=new gt(this.k(R()),this.k(R()),this,this.options)):i=s[r],i._$AI(n),r++;r<s.length&&(this._$AR(i&&i._$AB.nextSibling,r),s.length=r)}_$AR(t=this._$AA.nextSibling,s){var i;for((i=this._$AP)===null||i===void 0||i.call(this,!1,!0,s);t&&t!==this._$AB;){const r=t.nextSibling;t.remove(),t=r}}setConnected(t){var s;this._$AM===void 0&&(this._$Cp=t,(s=this._$AP)===null||s===void 0||s.call(this,t))}},U=class{constructor(e,t,s,i,r){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,s,i){const r=this.strings;let n=!1;if(r===void 0)e=w(this,e,t,0),n=!H(e)||e!==this._$AH&&e!==E,n&&(this._$AH=e);else{const o=e;let l,a;for(e=r[0],l=0;l<r.length-1;l++)a=w(this,o[s+l],t,l),a===E&&(a=this._$AH[l]),n||(n=!H(a)||a!==this._$AH[l]),a===d?e=d:e!==d&&(e+=(a??"")+r[l+1]),this._$AH[l]=a}n&&!i&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},Vt=class extends U{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}},Bt=b?b.emptyScript:"",zt=class extends U{constructor(){super(...arguments),this.type=4}j(e){e&&e!==d?this.element.setAttribute(this.name,Bt):this.element.removeAttribute(this.name)}},jt=class extends U{constructor(e,t,s,i,r){super(e,t,s,i,r),this.type=5}_$AI(e,t=this){var s;if((e=(s=w(this,e,t,0))!==null&&s!==void 0?s:d)===E)return;const i=this._$AH,r=e===d&&i!==d||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==d&&(i===d||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,s;typeof this._$AH=="function"?this._$AH.call((s=(t=this.options)===null||t===void 0?void 0:t.host)!==null&&s!==void 0?s:this.element,e):this._$AH.handleEvent(e)}},Dt=class{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){w(this,e)}},dt=T.litHtmlPolyfillSupport;dt?.(W,Y),((L=T.litHtmlVersions)!==null&&L!==void 0?L:T.litHtmlVersions=[]).push("2.8.0");var Wt=(e,t,s)=>{var i,r;const n=(i=s?.renderBefore)!==null&&i!==void 0?i:t;let o=n._$litPart$;if(o===void 0){const l=(r=s?.renderBefore)!==null&&r!==void 0?r:null;n._$litPart$=o=new Y(t.insertBefore(R(),l),l,void 0,s??{})}return o._$AI(e),o},V,B,A=class extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const s=super.createRenderRoot();return(e=(t=this.renderOptions).renderBefore)!==null&&e!==void 0||(t.renderBefore=s.firstChild),s}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Wt(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!1)}render(){return E}};A.finalized=!0,A._$litElement$=!0,(V=globalThis.litElementHydrateSupport)===null||V===void 0||V.call(globalThis,{LitElement:A});var ut=globalThis.litElementPolyfillSupport;ut?.({LitElement:A});((B=globalThis.litElementVersions)!==null&&B!==void 0?B:globalThis.litElementVersions=[]).push("3.3.3");var P=null,At=class yt extends A{static get styles(){return K`
      :host {
        display: block;
      }
    `}constructor(){super(),P=this}render(){return J`
      <div>
        <slot></slot>
      </div>
    `}static getInstance(){return P||(P=new yt),P}},Jt=class F{static push(t){const s=At.getInstance();if(s)return s?.append(t),t}static info(t){F.push(new k({message:`${t}`,time:3e3}))}static error(t){F.push(new bt({message:`Error: ${t}`,time:3e3}))}},k=class extends A{static get styles(){return K`
      :host {
        display: block;
        position: relative;
        font-size: 14px;
        line-height: 100%;
        color: #eee;
        transition: opacity 1s ease, height 0.75s ease;
        cursor: default;
      }

      :host(:hover) .wrapper {
        filter: brightness(0.98);
      }

      :host(:active) .wrapper {
        filter: brightness(0.95);
      }

      .wrapper {
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 2px, 8px, 0.07);
        padding: 6px 18px;
        background: rgb(39 39 42 / 1);
        border: 1px solid rgb(24 24 27 / 1);
        min-height: 40px;
        min-width: 220px;
        display: flex;
        align-items: center;
        animation: slide-in 0.5s ease;
        box-sizing: border-box;
        margin-bottom: 5px;
        z-index: -1;
      }

      @keyframes slide-in {
        from {
          opacity: 0;
          transform: translateY(-40px);
        }
      }
    `}constructor(e){super(),this.message=e.message,this.time=e.time,this.addEventListener("click",()=>{setTimeout(()=>{this.kill()},100)})}connectedCallback(){super.connectedCallback(),this.time&&setTimeout(()=>{this.kill()},this.time)}kill(){this.style.height=`${this.offsetHeight+5}px`,this.offsetHeight,this.style.opacity="0",this.style.height="0px",setTimeout(()=>{this.remove()},1e3)}render(){return J`
      <div class="wrapper">
        <span>${this.message}</span>
        <slot></slot>
      </div>
    `}},bt=class extends k{static get styles(){return K`
      ${k.styles}

      span {
        display: flex;
        align-items: center;
      }

      .wrapper {
        justify-content: space-between;
        background: #f44040;
        color: white;
      }

      .icon {
        display: inline-block;
        margin-right: 8px;
        margin-bottom: -1px;
        margin-left: -5px;
        flex: none;
      }
    `}render(){return J`
      <div class="wrapper">
        <span>
          <svg class="icon" width="16" height="16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" stroke="white" stroke-width="4"/>
            <path d="M30.091 37.273L30.091 16L33.829 16L33.829 37.273L30.091 37.273ZM29.293 43.951C29.293 43.587 29.37 43.244 29.524 42.922C29.664 42.614 29.86 42.334 30.112 42.082C30.35 41.844 30.637 41.655 30.973 41.515C31.295 41.375 31.638 41.305 32.002 41.305C32.366 41.305 32.709 41.375 33.031 41.515C33.339 41.655 33.612 41.844 33.85 42.082C34.088 42.334 34.277 42.614 34.417 42.922C34.557 43.244 34.627 43.587 34.627 43.951C34.627 44.315 34.557 44.658 34.417 44.98C34.277 45.316 34.088 45.603 33.85 45.841C33.612 46.093 33.339 46.289 33.031 46.429C32.709 46.569 32.366 46.639 32.002 46.639C31.638 46.639 31.295 46.569 30.973 46.429C30.637 46.289 30.35 46.093 30.112 45.841C29.86 45.603 29.664 45.316 29.524 44.98C29.37 44.658 29.293 44.315 29.293 43.951Z" fill="white"/>
          </svg>

          <span>${this.message}</span>
        </span>
      </div>
    `}};customElements.define("a-toast-feed",At);customElements.define("a-toast",k);customElements.define("a-toast-error",bt);/*! Bundled license information:

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
*/export{Jt as T};
