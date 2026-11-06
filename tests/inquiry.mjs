import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
assert.ok(existsSync(new URL('../src/inquiry.js', import.meta.url)), 'Inquiry controller must be testable independently');
const { initInquiryForm } = await import('../src/inquiry.js');
function setup(send) {
  class Form extends EventTarget {
    constructor() { super(); this.action='https://formspree.io/f/xwlljeoq'; this.value='keep this draft'; this.button={disabled:false, attrs:{}, setAttribute(k,v){this.attrs[k]=v}, removeAttribute(k){delete this.attrs[k]}}; }
    querySelector(){return this.button;}
    reset(){this.value='';}
  }
  const form=new Form(), status={textContent:''};
  const root={querySelector: selector => selector==='#inquiry-form' ? form : status};
  initInquiryForm({root, send, createData:()=>({draft:form.value})});
  return {form,status,submit:()=>form.dispatchEvent(new Event('submit',{cancelable:true}))};
}
let release, calls=0;
const pending=setup(()=>{calls++;return new Promise(resolve=>{release=resolve;});});
pending.submit();
assert.equal(pending.form.button.disabled,true);
assert.match(pending.status.textContent,/Sending/);
pending.submit(); assert.equal(calls,1,'A pending request must not be duplicated');
release({ok:true}); await new Promise(resolve=>setImmediate(resolve));
assert.match(pending.status.textContent,/sent/i); assert.equal(pending.form.value,''); assert.equal(pending.form.button.disabled,false);
const failed=setup(async()=>({ok:false})); failed.submit(); await new Promise(resolve=>setImmediate(resolve));
assert.match(failed.status.textContent,/could not be sent/i); assert.equal(failed.form.value,'keep this draft'); assert.equal(failed.form.button.disabled,false);
console.log('PASS inquiry success, failed draft preservation, and duplicate prevention (simulated service)');
