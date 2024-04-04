var At=Object.defineProperty,Et=Object.getOwnPropertyDescriptor,F=(e,t,i,s)=>{for(var r=s>1?void 0:s?Et(t,i):t,n=e.length-1,o;n>=0;n--)(o=e[n])&&(r=(s?o(t,i,r):o(r))||r);return s&&r&&At(t,i,r),r},bt=class{get shadowRoot(){return this.__host.__shadowRoot}constructor(t){this.ariaAtomic="",this.ariaAutoComplete="",this.ariaBraileLabel="",this.ariaBraileRoleDescription="",this.ariaBusy="",this.ariaChecked="",this.ariaColCount="",this.ariaColIndex="",this.ariaColSpan="",this.ariaCurrent="",this.ariaDescription="",this.ariaDisabled="",this.ariaExpanded="",this.ariaHasPopup="",this.ariaHidden="",this.ariaInvalid="",this.ariaKeyShortcuts="",this.ariaLabel="",this.ariaLevel="",this.ariaLive="",this.ariaModal="",this.ariaMultiLine="",this.ariaMultiSelectable="",this.ariaOrientation="",this.ariaPlaceholder="",this.ariaPosInSet="",this.ariaPressed="",this.ariaReadOnly="",this.ariaRequired="",this.ariaRoleDescription="",this.ariaRowCount="",this.ariaRowIndex="",this.ariaRowSpan="",this.ariaSelected="",this.ariaSetSize="",this.ariaSort="",this.ariaValueMax="",this.ariaValueMin="",this.ariaValueNow="",this.ariaValueText="",this.role="",this.form=null,this.labels=[],this.states=new Set,this.validationMessage="",this.validity={},this.willValidate=!0,this.__host=t}checkValidity(){return console.warn("`ElementInternals.checkValidity()` was called on the server.This method always returns true."),!0}reportValidity(){return!0}setFormValue(){}setValidity(){}},Z=new WeakMap,S=e=>{let t=Z.get(e);return t===void 0&&Z.set(e,t=new Map),t},St=class{constructor(){this.__shadowRootMode=null,this.__shadowRoot=null,this.__internals=null}get attributes(){return Array.from(S(this)).map(([t,i])=>({name:t,value:i}))}get shadowRoot(){return this.__shadowRootMode==="closed"?null:this.__shadowRoot}setAttribute(t,i){S(this).set(t,String(i))}removeAttribute(t){S(this).delete(t)}toggleAttribute(t,i){if(this.hasAttribute(t)){if(i===void 0||!i)return this.removeAttribute(t),!1}else return i===void 0||i?(this.setAttribute(t,""),!0):!1;return!0}hasAttribute(t){return S(this).has(t)}attachShadow(t){const i={host:this};return this.__shadowRootMode=t.mode,t&&t.mode==="open"&&(this.__shadowRoot=i),i}attachInternals(){if(this.__internals!==null)throw new Error("Failed to execute 'attachInternals' on 'HTMLElement': ElementInternals for the specified element was already attached.");const t=new bt(this);return this.__internals=t,t}getAttribute(t){const i=S(this).get(t);return i??null}},wt=class extends St{},Ct=wt,xt=class{constructor(){this.__definitions=new Map}define(t,i){var s;if(this.__definitions.has(t))throw new Error(`Failed to execute 'define' on 'CustomElementRegistry': the name "${t}" has already been used with this registry`);this.__definitions.set(t,{ctor:i,observedAttributes:(s=i.observedAttributes)!=null?s:[]})}get(t){const i=this.__definitions.get(t);return i?.ctor}},Rt=xt,Pt=new Rt,C=globalThis,q=C.ShadowRoot&&(C.ShadyCSS===void 0||C.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,K=Symbol(),G=new WeakMap,ct=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==K)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(q&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=G.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&G.set(t,e))}return e}toString(){return this.cssText}},Tt=e=>new ct(typeof e=="string"?e:e+"",void 0,K),Mt=(e,...t)=>{const i=e.length===1?e[0]:t.reduce((s,r,n)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+e[n+1],e[0]);return new ct(i,e,K)},Ht=(e,t)=>{q?e.adoptedStyleSheets=t.map(i=>i instanceof CSSStyleSheet?i:i.styleSheet):t.forEach(i=>{const s=document.createElement("style"),r=C.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=i.cssText,e.appendChild(s)})},Q=q||C.CSSStyleSheet===void 0?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let i="";for(const s of t.cssRules)i+=s.cssText;return Tt(i)})(e):e,X,N,y=globalThis;(X=y.customElements)!==null&&X!==void 0||(y.customElements=Pt);var tt=y.trustedTypes,Ut=tt?tt.emptyScript:"",et=y.reactiveElementPolyfillSupport,D={toAttribute(e,t){switch(t){case Boolean:e=e?Ut:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=e!==null;break;case Number:i=e===null?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch{i=null}}return i}},vt=(e,t)=>t!==e&&(t==t||e==e),O={attribute:!0,type:String,converter:D,reflect:!1,hasChanged:vt},j="finalized",it,g=class extends((it=globalThis.HTMLElement)!=null?it:Ct){constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),((t=this.h)!==null&&t!==void 0?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach((t,i)=>{const s=this._$Ep(i,t);s!==void 0&&(this._$Ev.set(s,i),e.push(s))}),e}static createProperty(e,t=O){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const i=typeof e=="symbol"?Symbol():"__"+e,s=this.getPropertyDescriptor(e,i,t);s!==void 0&&Object.defineProperty(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(s){const r=this[e];this[t]=s,this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||O}static finalize(){if(this.hasOwnProperty(j))return!1;this[j]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),e.h!==void 0&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)t.unshift(Q(s))}else e!==void 0&&t.push(Q(e));return t}static _$Ep(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(e=this.constructor.h)===null||e===void 0||e.forEach(t=>t(this))}addController(e){var t,i;((t=this._$ES)!==null&&t!==void 0?t:this._$ES=[]).push(e),this.renderRoot!==void 0&&this.isConnected&&((i=e.hostConnected)===null||i===void 0||i.call(e))}removeController(e){var t;(t=this._$ES)===null||t===void 0||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;const t=(e=this.shadowRoot)!==null&&e!==void 0?e:this.attachShadow(this.constructor.shadowRootOptions);return Ht(t,this.constructor.elementStyles),t}connectedCallback(){var e;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$ES)===null||e===void 0||e.forEach(t=>{var i;return(i=t.hostConnected)===null||i===void 0?void 0:i.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$ES)===null||e===void 0||e.forEach(t=>{var i;return(i=t.hostDisconnected)===null||i===void 0?void 0:i.call(t)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=O){var s;const r=this.constructor._$Ep(e,i);if(r!==void 0&&i.reflect===!0){const n=(((s=i.converter)===null||s===void 0?void 0:s.toAttribute)!==void 0?i.converter:D).toAttribute(t,i.type);this._$El=e,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$El=null}}_$AK(e,t){var i;const s=this.constructor,r=s._$Ev.get(e);if(r!==void 0&&this._$El!==r){const n=s.getPropertyOptions(r),o=typeof n.converter=="function"?{fromAttribute:n.converter}:((i=n.converter)===null||i===void 0?void 0:i.fromAttribute)!==void 0?n.converter:D;this._$El=r,this[r]=o.fromAttribute(t,n.type),this._$El=null}}requestUpdate(e,t,i){let s=!0;e!==void 0&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||vt)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),i.reflect===!0&&this._$El!==e&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(e,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((s,r)=>this[r]=s),this._$Ei=void 0);let t=!1;const i=this._$AL;try{t=this.shouldUpdate(i),t?(this.willUpdate(i),(e=this._$ES)===null||e===void 0||e.forEach(s=>{var r;return(r=s.hostUpdate)===null||r===void 0?void 0:r.call(s)}),this.update(i)):this._$Ek()}catch(s){throw t=!1,this._$Ek(),s}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;(t=this._$ES)===null||t===void 0||t.forEach(i=>{var s;return(s=i.hostUpdated)===null||s===void 0?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){this._$EC!==void 0&&(this._$EC.forEach((t,i)=>this._$EO(i,this[i],t)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}};g[j]=!0,g.elementProperties=new Map,g.elementStyles=[],g.shadowRootOptions={mode:"open"},et?.({ReactiveElement:g}),((N=y.reactiveElementVersions)!==null&&N!==void 0?N:y.reactiveElementVersions=[]).push("1.6.3");var k,R=globalThis,A=R.trustedTypes,st=A?A.createPolicy("lit-html",{createHTML:e=>e}):void 0,z="$lit$",_=`lit$${(Math.random()+"").slice(9)}$`,pt="?"+_,Nt=`<${pt}>`,m=R.document===void 0?{createTreeWalker:()=>({})}:document,P=()=>m.createComment(""),T=e=>e===null||typeof e!="object"&&typeof e!="function",_t=Array.isArray,Ot=e=>_t(e)||typeof e?.[Symbol.iterator]=="function",L=`[ 	
\f\r]`,w=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,rt=/-->/g,nt=/>/g,$=RegExp(`>|${L}(?:([^\\s"'>=/]+)(${L}*=${L}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ot=/'/g,at=/"/g,$t=/^(?:script|style|textarea|title)$/i,kt=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),lt=kt(1),E=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),ht=new WeakMap,f=m.createTreeWalker(m,129,null,!1);function ft(e,t){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return st!==void 0?st.createHTML(t):t}var Lt=(e,t)=>{const i=e.length-1,s=[];let r,n=t===2?"<svg>":"",o=w;for(let l=0;l<i;l++){const a=e[l];let v,u,h=-1,c=0;for(;c<a.length&&(o.lastIndex=c,u=o.exec(a),u!==null);)c=o.lastIndex,o===w?u[1]==="!--"?o=rt:u[1]!==void 0?o=nt:u[2]!==void 0?($t.test(u[2])&&(r=RegExp("</"+u[2],"g")),o=$):u[3]!==void 0&&(o=$):o===$?u[0]===">"?(o=r??w,h=-1):u[1]===void 0?h=-2:(h=o.lastIndex-u[2].length,v=u[1],o=u[3]===void 0?$:u[3]==='"'?at:ot):o===at||o===ot?o=$:o===rt||o===nt?o=w:(o=$,r=void 0);const p=o===$&&e[l+1].startsWith("/>")?" ":"";n+=o===w?a+Nt:h>=0?(s.push(v),a.slice(0,h)+z+a.slice(h)+_+p):a+_+(h===-2?(s.push(void 0),l):p)}return[ft(e,n+(e[i]||"<?>")+(t===2?"</svg>":"")),s]},W=class mt{constructor({strings:t,_$litType$:i},s){let r;this.parts=[];let n=0,o=0;const l=t.length-1,a=this.parts,[v,u]=Lt(t,i);if(this.el=mt.createElement(v,s),f.currentNode=this.el.content,i===2){const h=this.el.content,c=h.firstChild;c.remove(),h.append(...c.childNodes)}for(;(r=f.nextNode())!==null&&a.length<l;){if(r.nodeType===1){if(r.hasAttributes()){const h=[];for(const c of r.getAttributeNames())if(c.endsWith(z)||c.startsWith(_)){const p=u[o++];if(h.push(c),p!==void 0){const yt=r.getAttribute(p.toLowerCase()+z).split(_),M=/([.?@])?(.*)/.exec(p);a.push({type:1,index:n,name:M[2],strings:yt,ctor:M[1]==="."?Bt:M[1]==="?"?Dt:M[1]==="@"?jt:H})}else a.push({type:6,index:n})}for(const c of h)r.removeAttribute(c)}if($t.test(r.tagName)){const h=r.textContent.split(_),c=h.length-1;if(c>0){r.textContent=A?A.emptyScript:"";for(let p=0;p<c;p++)r.append(h[p],P()),f.nextNode(),a.push({type:2,index:++n});r.append(h[c],P())}}}else if(r.nodeType===8)if(r.data===pt)a.push({type:2,index:n});else{let h=-1;for(;(h=r.data.indexOf(_,h+1))!==-1;)a.push({type:7,index:n}),h+=_.length-1}n++}}static createElement(t,i){const s=m.createElement("template");return s.innerHTML=t,s}};function b(e,t,i=e,s){var r,n,o,l;if(t===E)return t;let a=s!==void 0?(r=i._$Co)===null||r===void 0?void 0:r[s]:i._$Cl;const v=T(t)?void 0:t._$litDirective$;return a?.constructor!==v&&((n=a?._$AO)===null||n===void 0||n.call(a,!1),v===void 0?a=void 0:(a=new v(e),a._$AT(e,i,s)),s!==void 0?((o=(l=i)._$Co)!==null&&o!==void 0?o:l._$Co=[])[s]=a:i._$Cl=a),a!==void 0&&(t=b(e,a._$AS(e,t.values),a,s)),t}var It=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:i},parts:s}=this._$AD,r=((t=e?.creationScope)!==null&&t!==void 0?t:m).importNode(i,!0);f.currentNode=r;let n=f.nextNode(),o=0,l=0,a=s[0];for(;a!==void 0;){if(o===a.index){let v;a.type===2?v=new Y(n,n.nextSibling,this,e):a.type===1?v=new a.ctor(n,a.name,a.strings,this,e):a.type===6&&(v=new zt(n,this,e)),this._$AV.push(v),a=s[++l]}o!==a?.index&&(n=f.nextNode(),o++)}return f.currentNode=m,r}v(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}},Y=class gt{constructor(t,i,s,r){var n;this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=r,this._$Cp=(n=r?.isConnected)===null||n===void 0||n}get _$AU(){var t,i;return(i=(t=this._$AM)===null||t===void 0?void 0:t._$AU)!==null&&i!==void 0?i:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return i!==void 0&&t?.nodeType===11&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=b(this,t,i),T(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==E&&this._(t):t._$litType$!==void 0?this.g(t):t.nodeType!==void 0?this.$(t):Ot(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==d&&T(this._$AH)?this._$AA.nextSibling.data=t:this.$(m.createTextNode(t)),this._$AH=t}g(t){var i;const{values:s,_$litType$:r}=t,n=typeof r=="number"?this._$AC(t):(r.el===void 0&&(r.el=W.createElement(ft(r.h,r.h[0]),this.options)),r);if(((i=this._$AH)===null||i===void 0?void 0:i._$AD)===n)this._$AH.v(s);else{const o=new It(n,this),l=o.u(this.options);o.v(s),this.$(l),this._$AH=o}}_$AC(t){let i=ht.get(t.strings);return i===void 0&&ht.set(t.strings,i=new W(t)),i}T(t){_t(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,r=0;for(const n of t)r===i.length?i.push(s=new gt(this.k(P()),this.k(P()),this,this.options)):s=i[r],s._$AI(n),r++;r<i.length&&(this._$AR(s&&s._$AB.nextSibling,r),i.length=r)}_$AR(t=this._$AA.nextSibling,i){var s;for((s=this._$AP)===null||s===void 0||s.call(this,!1,!0,i);t&&t!==this._$AB;){const r=t.nextSibling;t.remove(),t=r}}setConnected(t){var i;this._$AM===void 0&&(this._$Cp=t,(i=this._$AP)===null||i===void 0||i.call(this,t))}},H=class{constructor(e,t,i,s,r){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=d}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,s){const r=this.strings;let n=!1;if(r===void 0)e=b(this,e,t,0),n=!T(e)||e!==this._$AH&&e!==E,n&&(this._$AH=e);else{const o=e;let l,a;for(e=r[0],l=0;l<r.length-1;l++)a=b(this,o[i+l],t,l),a===E&&(a=this._$AH[l]),n||(n=!T(a)||a!==this._$AH[l]),a===d?e=d:e!==d&&(e+=(a??"")+r[l+1]),this._$AH[l]=a}n&&!s&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},Bt=class extends H{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}},Vt=A?A.emptyScript:"",Dt=class extends H{constructor(){super(...arguments),this.type=4}j(e){e&&e!==d?this.element.setAttribute(this.name,Vt):this.element.removeAttribute(this.name)}},jt=class extends H{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){var i;if((e=(i=b(this,e,t,0))!==null&&i!==void 0?i:d)===E)return;const s=this._$AH,r=e===d&&s!==d||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,n=e!==d&&(s===d||r);r&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;typeof this._$AH=="function"?this._$AH.call((i=(t=this.options)===null||t===void 0?void 0:t.host)!==null&&i!==void 0?i:this.element,e):this._$AH.handleEvent(e)}},zt=class{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){b(this,e)}},dt=R.litHtmlPolyfillSupport;dt?.(W,Y),((k=R.litHtmlVersions)!==null&&k!==void 0?k:R.litHtmlVersions=[]).push("2.8.0");var Wt=(e,t,i)=>{var s,r;const n=(s=i?.renderBefore)!==null&&s!==void 0?s:t;let o=n._$litPart$;if(o===void 0){const l=(r=i?.renderBefore)!==null&&r!==void 0?r:null;n._$litPart$=o=new Y(t.insertBefore(P(),l),l,void 0,i??{})}return o._$AI(e),o},I,B,x=class extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const i=super.createRenderRoot();return(e=(t=this.renderOptions).renderBefore)!==null&&e!==void 0||(t.renderBefore=i.firstChild),i}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Wt(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!1)}render(){return E}};x.finalized=!0,x._$litElement$=!0,(I=globalThis.litElementHydrateSupport)===null||I===void 0||I.call(globalThis,{LitElement:x});var ut=globalThis.litElementPolyfillSupport;ut?.({LitElement:x});((B=globalThis.litElementVersions)!==null&&B!==void 0?B:globalThis.litElementVersions=[]).push("3.3.3");var Ft=(e,t)=>t.kind==="method"&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(i){i.createProperty(t.key,e)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){typeof t.initializer=="function"&&(this[t.key]=t.initializer.call(this))},finisher(i){i.createProperty(t.key,e)}},qt=(e,t,i)=>{t.constructor.createProperty(i,e)};function J(e){return(t,i)=>i!==void 0?qt(e,t,i):Ft(e,t)}var V;((V=globalThis.HTMLSlotElement)===null||V===void 0?void 0:V.prototype.assignedElements)!=null;var U=class extends x{constructor(){super(...arguments),this.opened=!1,this.direction="down",this._id=`expandable_${Math.floor(Math.random()*1e5)}`}static get styles(){return[Mt`
        :host {
          display: block;

          --transition-speed: 0.33s;
          --animation-easing: ease;
        }

        .container {
          display: grid;
          grid-template-rows: 0fr;
					grid-template-columns: 100%;
          overflow: hidden;
          transition: grid-template-rows var(--transition-speed) var(--animation-easing);
        }

        :host([opened]) .container {
          grid-template-rows: 1fr;
        }

        .content {
          display: block;
          min-height: 0;
        }

        ::slotted(*) {
          pointer-events: all;
        }

        button {
          all: unset;
          display: block;
          width: 100%;
          pointer-events: none;
        }
      `]}close(){this.opened=!1,this.onAnimationFrame(),this.dispatchEvent(new Event("change"))}open(){this.opened=!0,this.onAnimationFrame(),this.dispatchEvent(new Event("change"))}toggle(){this.opened?this.close():this.open()}onAnimationFrame(){const e=this.getClientRects()[0];if(e){const t=e.y,i=this.scrollOffsetY||0;t<=i&&window.scrollBy(0,(t-i)/10)}}renderButton(){return lt`<button
      aria-controls="${this._id}"
      aria-expanded=${this.opened}
      @click=${e=>{this.toggle()}}
    >
      <slot name="toggle"></slot>
    </button>`}render(){return lt`
      ${this.direction==="down"?this.renderButton():void 0}
      <div class="container" id="${this._id}" aria-hidden=${!this.opened&&"true"}>
        <slot class="content"></slot>
      </div>
      ${this.direction==="up"?this.renderButton():void 0}
    `}};F([J({type:Boolean,reflect:!0})],U.prototype,"opened",2);F([J({type:String,reflect:!0})],U.prototype,"direction",2);F([J({type:Number})],U.prototype,"scrollOffsetY",2);customElements.get("a-expandable")||customElements.define("a-expandable",U);/*! Bundled license information:

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
