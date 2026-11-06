import assert from 'node:assert/strict';
import {initAnchors} from '../src/navigation.js';
class Link extends EventTarget { constructor(href){super();this.href=href;} getAttribute(){return this.href;} }
const links=[new Link('#work'),new Link('#contact')], listeners={}, visits=[];
function section(id){return {id,attrs:{},scrollIntoView(options){visits.push([id,options.behavior]);},hasAttribute(k){return k in this.attrs;},setAttribute(k,v){this.attrs[k]=v;},focus(){visits.push([id,'focus']);}};}
const sections={work:section('work'),contact:section('contact')};
globalThis.location={hash:''};
globalThis.history={pushState(_a,_b,id){location.hash=id;}};
globalThis.window={matchMedia:()=>({matches:true}),addEventListener:(type,fn)=>{listeners[type]=fn;},scrollTo:()=>visits.push(['top','auto'])};
globalThis.document={querySelectorAll:()=>links,querySelector:id=>sections[id.slice(1)],getElementById:id=>sections[id]};
initAnchors();
links[0].dispatchEvent(new Event('click',{cancelable:true}));
assert.equal(location.hash,'#work'); assert.deepEqual(visits.slice(0,2),[['work','auto'],['work','focus']]);
links[1].dispatchEvent(new Event('click',{cancelable:true}));
assert.equal(location.hash,'#contact');
location.hash='#work'; listeners.popstate(); assert.deepEqual(visits.at(-1),['work','auto']);
location.hash=''; listeners.popstate(); assert.deepEqual(visits.at(-1),['top','auto']);
console.log('PASS section links and back navigation (simulated DOM)');
