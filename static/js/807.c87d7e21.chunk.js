"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[807],{7807:(t,e,i)=>{i.d(e,{Ay:()=>I});var n=i(1922),s=i(6499);s.bI.touchMouseIgnoreWait=500;let r=0,o=0,l=!1;class a{constructor(t){this.subjectEl=null,this.selector="",this.handleSelector="",this.shouldIgnoreMove=!1,this.shouldWatchScroll=!0,this.isDragging=!1,this.isTouchDragging=!1,this.wasTouchScroll=!1,this.handleMouseDown=t=>{if(!this.shouldIgnoreMouse()&&function(t){return 0===t.button&&!t.ctrlKey}(t)&&this.tryStart(t)){let e=this.createEventFromMouse(t,!0);this.emitter.trigger("pointerdown",e),this.initScrollWatch(e),this.shouldIgnoreMove||document.addEventListener("mousemove",this.handleMouseMove),document.addEventListener("mouseup",this.handleMouseUp)}},this.handleMouseMove=t=>{let e=this.createEventFromMouse(t);this.recordCoords(e),this.emitter.trigger("pointermove",e)},this.handleMouseUp=t=>{document.removeEventListener("mousemove",this.handleMouseMove),document.removeEventListener("mouseup",this.handleMouseUp),this.emitter.trigger("pointerup",this.createEventFromMouse(t)),this.cleanup()},this.handleTouchStart=t=>{if(this.tryStart(t)){this.isTouchDragging=!0;let e=this.createEventFromTouch(t,!0);this.emitter.trigger("pointerdown",e),this.initScrollWatch(e);let i=t.target;this.shouldIgnoreMove||i.addEventListener("touchmove",this.handleTouchMove),i.addEventListener("touchend",this.handleTouchEnd),i.addEventListener("touchcancel",this.handleTouchEnd),window.addEventListener("scroll",this.handleTouchScroll,!0)}},this.handleTouchMove=t=>{let e=this.createEventFromTouch(t);this.recordCoords(e),this.emitter.trigger("pointermove",e)},this.handleTouchEnd=t=>{if(this.isDragging){let e=t.target;e.removeEventListener("touchmove",this.handleTouchMove),e.removeEventListener("touchend",this.handleTouchEnd),e.removeEventListener("touchcancel",this.handleTouchEnd),window.removeEventListener("scroll",this.handleTouchScroll,!0),this.emitter.trigger("pointerup",this.createEventFromTouch(t)),this.cleanup(),this.isTouchDragging=!1,r+=1,setTimeout((()=>{r-=1}),s.bI.touchMouseIgnoreWait)}},this.handleTouchScroll=()=>{this.wasTouchScroll=!0},this.handleScroll=t=>{if(!this.shouldIgnoreMove){let e=window.scrollX-this.prevScrollX+this.prevPageX,i=window.scrollY-this.prevScrollY+this.prevPageY;this.emitter.trigger("pointermove",{origEvent:t,isTouch:this.isTouchDragging,subjectEl:this.subjectEl,pageX:e,pageY:i,deltaX:e-this.origPageX,deltaY:i-this.origPageY})}},this.containerEl=t,this.emitter=new s.F,t.addEventListener("mousedown",this.handleMouseDown),t.addEventListener("touchstart",this.handleTouchStart,{passive:!0}),o+=1,1===o&&window.addEventListener("touchmove",h,{passive:!1})}destroy(){this.containerEl.removeEventListener("mousedown",this.handleMouseDown),this.containerEl.removeEventListener("touchstart",this.handleTouchStart,{passive:!0}),o-=1,o||window.removeEventListener("touchmove",h,{passive:!1})}tryStart(t){let e=this.querySubjectEl(t),i=t.target;return!(!e||this.handleSelector&&!(0,s.$)(i,this.handleSelector))&&(this.subjectEl=e,this.isDragging=!0,this.wasTouchScroll=!1,!0)}cleanup(){l=!1,this.isDragging=!1,this.subjectEl=null,this.destroyScrollWatch()}querySubjectEl(t){return this.selector?(0,s.$)(t.target,this.selector):this.containerEl}shouldIgnoreMouse(){return r||this.isTouchDragging}cancelTouchScroll(){this.isDragging&&(l=!0)}initScrollWatch(t){this.shouldWatchScroll&&(this.recordCoords(t),window.addEventListener("scroll",this.handleScroll,!0))}recordCoords(t){this.shouldWatchScroll&&(this.prevPageX=t.pageX,this.prevPageY=t.pageY,this.prevScrollX=window.scrollX,this.prevScrollY=window.scrollY)}destroyScrollWatch(){this.shouldWatchScroll&&window.removeEventListener("scroll",this.handleScroll,!0)}createEventFromMouse(t,e){let i=0,n=0;return e?(this.origPageX=t.pageX,this.origPageY=t.pageY):(i=t.pageX-this.origPageX,n=t.pageY-this.origPageY),{origEvent:t,isTouch:!1,subjectEl:this.subjectEl,pageX:t.pageX,pageY:t.pageY,deltaX:i,deltaY:n}}createEventFromTouch(t,e){let i,n,s=t.touches,r=0,o=0;return s&&s.length?(i=s[0].pageX,n=s[0].pageY):(i=t.pageX,n=t.pageY),e?(this.origPageX=i,this.origPageY=n):(r=i-this.origPageX,o=n-this.origPageY),{origEvent:t,isTouch:!0,subjectEl:this.subjectEl,pageX:i,pageY:n,deltaX:r,deltaY:o}}}function h(t){l&&t.preventDefault()}class c{constructor(){this.isVisible=!1,this.sourceEl=null,this.mirrorEl=null,this.sourceElRect=null,this.parentNode=document.body,this.zIndex=9999,this.revertDuration=0}start(t,e,i){this.sourceEl=t,this.sourceElRect=this.sourceEl.getBoundingClientRect(),this.origScreenX=e-window.scrollX,this.origScreenY=i-window.scrollY,this.deltaX=0,this.deltaY=0,this.updateElPosition()}handleMove(t,e){this.deltaX=t-window.scrollX-this.origScreenX,this.deltaY=e-window.scrollY-this.origScreenY,this.updateElPosition()}setIsVisible(t){t?this.isVisible||(this.mirrorEl&&(this.mirrorEl.style.display=""),this.isVisible=t,this.updateElPosition()):this.isVisible&&(this.mirrorEl&&(this.mirrorEl.style.display="none"),this.isVisible=t)}stop(t,e){let i=()=>{this.cleanup(),e()};t&&this.mirrorEl&&this.isVisible&&this.revertDuration&&(this.deltaX||this.deltaY)?this.doRevertAnimation(i,this.revertDuration):setTimeout(i,0)}doRevertAnimation(t,e){let i=this.mirrorEl,n=this.sourceEl.getBoundingClientRect();i.style.transition="top "+e+"ms,left "+e+"ms",(0,s.aP)(i,{left:n.left,top:n.top}),(0,s.b2)(i,(()=>{i.style.transition="",t()}))}cleanup(){this.mirrorEl&&((0,s.aO)(this.mirrorEl),this.mirrorEl=null),this.sourceEl=null}updateElPosition(){this.sourceEl&&this.isVisible&&(0,s.aP)(this.getMirrorEl(),{left:this.sourceElRect.left+this.deltaX,top:this.sourceElRect.top+this.deltaY})}getMirrorEl(){let t=this.sourceElRect,e=this.mirrorEl;return e||(e=this.mirrorEl=this.sourceEl.cloneNode(!0),e.style.userSelect="none",e.style.webkitUserSelect="none",e.style.pointerEvents="none",e.classList.add("fc-event-dragging"),(0,s.aP)(e,{position:"fixed",zIndex:this.zIndex,visibility:"",boxSizing:"border-box",width:t.right-t.left,height:t.bottom-t.top,right:"auto",bottom:"auto",margin:0}),this.parentNode.appendChild(e)),e}}class d extends s.bb{constructor(t,e){super(),this.handleScroll=()=>{this.scrollTop=this.scrollController.getScrollTop(),this.scrollLeft=this.scrollController.getScrollLeft(),this.handleScrollChange()},this.scrollController=t,this.doesListening=e,this.scrollTop=this.origScrollTop=t.getScrollTop(),this.scrollLeft=this.origScrollLeft=t.getScrollLeft(),this.scrollWidth=t.getScrollWidth(),this.scrollHeight=t.getScrollHeight(),this.clientWidth=t.getClientWidth(),this.clientHeight=t.getClientHeight(),this.clientRect=this.computeClientRect(),this.doesListening&&this.getEventTarget().addEventListener("scroll",this.handleScroll)}destroy(){this.doesListening&&this.getEventTarget().removeEventListener("scroll",this.handleScroll)}getScrollTop(){return this.scrollTop}getScrollLeft(){return this.scrollLeft}setScrollTop(t){this.scrollController.setScrollTop(t),this.doesListening||(this.scrollTop=Math.max(Math.min(t,this.getMaxScrollTop()),0),this.handleScrollChange())}setScrollLeft(t){this.scrollController.setScrollLeft(t),this.doesListening||(this.scrollLeft=Math.max(Math.min(t,this.getMaxScrollLeft()),0),this.handleScrollChange())}getClientWidth(){return this.clientWidth}getClientHeight(){return this.clientHeight}getScrollWidth(){return this.scrollWidth}getScrollHeight(){return this.scrollHeight}handleScrollChange(){}}class g extends d{constructor(t,e){super(new s.bc(t),e)}getEventTarget(){return this.scrollController.el}computeClientRect(){return(0,s.b3)(this.scrollController.el)}}class u extends d{constructor(t){super(new s.bd,t)}getEventTarget(){return window}computeClientRect(){return{left:this.scrollLeft,right:this.scrollLeft+this.clientWidth,top:this.scrollTop,bottom:this.scrollTop+this.clientHeight}}handleScrollChange(){this.clientRect=this.computeClientRect()}}const p="function"===typeof performance?performance.now:Date.now;class v{constructor(){this.isEnabled=!0,this.scrollQuery=[window,".fc-scroller"],this.edgeThreshold=50,this.maxVelocity=300,this.pointerScreenX=null,this.pointerScreenY=null,this.isAnimating=!1,this.scrollCaches=null,this.everMovedUp=!1,this.everMovedDown=!1,this.everMovedLeft=!1,this.everMovedRight=!1,this.animate=()=>{if(this.isAnimating){let t=this.computeBestEdge(this.pointerScreenX+window.scrollX,this.pointerScreenY+window.scrollY);if(t){let e=p();this.handleSide(t,(e-this.msSinceRequest)/1e3),this.requestAnimation(e)}else this.isAnimating=!1}}}start(t,e,i){this.isEnabled&&(this.scrollCaches=this.buildCaches(i),this.pointerScreenX=null,this.pointerScreenY=null,this.everMovedUp=!1,this.everMovedDown=!1,this.everMovedLeft=!1,this.everMovedRight=!1,this.handleMove(t,e))}handleMove(t,e){if(this.isEnabled){let i=t-window.scrollX,n=e-window.scrollY,s=null===this.pointerScreenY?0:n-this.pointerScreenY,r=null===this.pointerScreenX?0:i-this.pointerScreenX;s<0?this.everMovedUp=!0:s>0&&(this.everMovedDown=!0),r<0?this.everMovedLeft=!0:r>0&&(this.everMovedRight=!0),this.pointerScreenX=i,this.pointerScreenY=n,this.isAnimating||(this.isAnimating=!0,this.requestAnimation(p()))}}stop(){if(this.isEnabled){this.isAnimating=!1;for(let t of this.scrollCaches)t.destroy();this.scrollCaches=null}}requestAnimation(t){this.msSinceRequest=t,requestAnimationFrame(this.animate)}handleSide(t,e){let{scrollCache:i}=t,{edgeThreshold:n}=this,s=n-t.distance,r=s*s/(n*n)*this.maxVelocity*e,o=1;switch(t.name){case"left":o=-1;case"right":i.setScrollLeft(i.getScrollLeft()+r*o);break;case"top":o=-1;case"bottom":i.setScrollTop(i.getScrollTop()+r*o)}}computeBestEdge(t,e){let{edgeThreshold:i}=this,n=null,s=this.scrollCaches||[];for(let r of s){let s=r.clientRect,o=t-s.left,l=s.right-t,a=e-s.top,h=s.bottom-e;o>=0&&l>=0&&a>=0&&h>=0&&(a<=i&&this.everMovedUp&&r.canScrollUp()&&(!n||n.distance>a)&&(n={scrollCache:r,name:"top",distance:a}),h<=i&&this.everMovedDown&&r.canScrollDown()&&(!n||n.distance>h)&&(n={scrollCache:r,name:"bottom",distance:h}),o<=i&&this.everMovedLeft&&r.canScrollLeft()&&(!n||n.distance>o)&&(n={scrollCache:r,name:"left",distance:o}),l<=i&&this.everMovedRight&&r.canScrollRight()&&(!n||n.distance>l)&&(n={scrollCache:r,name:"right",distance:l}))}return n}buildCaches(t){return this.queryScrollEls(t).map((t=>t===window?new u(!1):new g(t,!1)))}queryScrollEls(t){let e=[];for(let i of this.scrollQuery)"object"===typeof i?e.push(i):e.push(...Array.prototype.slice.call(t.getRootNode().querySelectorAll(i)));return e}}class E extends s.bH{constructor(t,e){super(t),this.containerEl=t,this.delay=null,this.minDistance=0,this.touchScrollAllowed=!0,this.mirrorNeedsRevert=!1,this.isInteracting=!1,this.isDragging=!1,this.isDelayEnded=!1,this.isDistanceSurpassed=!1,this.delayTimeoutId=null,this.onPointerDown=t=>{this.isDragging||(this.isInteracting=!0,this.isDelayEnded=!1,this.isDistanceSurpassed=!1,(0,s.ar)(document.body),(0,s.at)(document.body),t.isTouch||t.origEvent.preventDefault(),this.emitter.trigger("pointerdown",t),this.isInteracting&&!this.pointer.shouldIgnoreMove&&(this.mirror.setIsVisible(!1),this.mirror.start(t.subjectEl,t.pageX,t.pageY),this.startDelay(t),this.minDistance||this.handleDistanceSurpassed(t)))},this.onPointerMove=t=>{if(this.isInteracting){if(this.emitter.trigger("pointermove",t),!this.isDistanceSurpassed){let e,i=this.minDistance,{deltaX:n,deltaY:s}=t;e=n*n+s*s,e>=i*i&&this.handleDistanceSurpassed(t)}this.isDragging&&("scroll"!==t.origEvent.type&&(this.mirror.handleMove(t.pageX,t.pageY),this.autoScroller.handleMove(t.pageX,t.pageY)),this.emitter.trigger("dragmove",t))}},this.onPointerUp=t=>{this.isInteracting&&(this.isInteracting=!1,(0,s.as)(document.body),(0,s.au)(document.body),this.emitter.trigger("pointerup",t),this.isDragging&&(this.autoScroller.stop(),this.tryStopDrag(t)),this.delayTimeoutId&&(clearTimeout(this.delayTimeoutId),this.delayTimeoutId=null))};let i=this.pointer=new a(t);i.emitter.on("pointerdown",this.onPointerDown),i.emitter.on("pointermove",this.onPointerMove),i.emitter.on("pointerup",this.onPointerUp),e&&(i.selector=e),this.mirror=new c,this.autoScroller=new v}destroy(){this.pointer.destroy(),this.onPointerUp({})}startDelay(t){"number"===typeof this.delay?this.delayTimeoutId=setTimeout((()=>{this.delayTimeoutId=null,this.handleDelayEnd(t)}),this.delay):this.handleDelayEnd(t)}handleDelayEnd(t){this.isDelayEnded=!0,this.tryStartDrag(t)}handleDistanceSurpassed(t){this.isDistanceSurpassed=!0,this.tryStartDrag(t)}tryStartDrag(t){this.isDelayEnded&&this.isDistanceSurpassed&&(this.pointer.wasTouchScroll&&!this.touchScrollAllowed||(this.isDragging=!0,this.mirrorNeedsRevert=!1,this.autoScroller.start(t.pageX,t.pageY,this.containerEl),this.emitter.trigger("dragstart",t),!1===this.touchScrollAllowed&&this.pointer.cancelTouchScroll()))}tryStopDrag(t){this.mirror.stop(this.mirrorNeedsRevert,this.stopDrag.bind(this,t))}stopDrag(t){this.isDragging=!1,this.emitter.trigger("dragend",t)}setIgnoreMove(t){this.pointer.shouldIgnoreMove=t}setMirrorIsVisible(t){this.mirror.setIsVisible(t)}setMirrorNeedsRevert(t){this.mirrorNeedsRevert=t}setAutoScrollEnabled(t){this.autoScroller.isEnabled=t}}class m{constructor(t){this.el=t,this.origRect=(0,s.b6)(t),this.scrollCaches=(0,s.b5)(t).map((t=>new g(t,!0)))}destroy(){for(let t of this.scrollCaches)t.destroy()}computeLeft(){let t=this.origRect.left;for(let e of this.scrollCaches)t+=e.origScrollLeft-e.getScrollLeft();return t}computeTop(){let t=this.origRect.top;for(let e of this.scrollCaches)t+=e.origScrollTop-e.getScrollTop();return t}isWithinClipping(t,e){let i={left:t,top:e};for(let n of this.scrollCaches)if(!S(n.getEventTarget())&&!(0,s.aF)(i,n.clientRect))return!1;return!0}}function S(t){let e=t.tagName;return"HTML"===e||"BODY"===e}class f{constructor(t,e){this.useSubjectCenter=!1,this.requireInitial=!0,this.disablePointCheck=!1,this.initialHit=null,this.movingHit=null,this.finalHit=null,this.handlePointerDown=t=>{let{dragging:e}=this;this.initialHit=null,this.movingHit=null,this.finalHit=null,this.prepareHits(),this.processFirstCoord(t),this.initialHit||!this.requireInitial?(e.setIgnoreMove(!1),this.emitter.trigger("pointerdown",t)):e.setIgnoreMove(!0)},this.handleDragStart=t=>{this.emitter.trigger("dragstart",t),this.handleMove(t,!0)},this.handleDragMove=t=>{this.emitter.trigger("dragmove",t),this.handleMove(t)},this.handlePointerUp=t=>{this.releaseHits(),this.emitter.trigger("pointerup",t)},this.handleDragEnd=t=>{this.movingHit&&this.emitter.trigger("hitupdate",null,!0,t),this.finalHit=this.movingHit,this.movingHit=null,this.emitter.trigger("dragend",t)},this.droppableStore=e,t.emitter.on("pointerdown",this.handlePointerDown),t.emitter.on("dragstart",this.handleDragStart),t.emitter.on("dragmove",this.handleDragMove),t.emitter.on("pointerup",this.handlePointerUp),t.emitter.on("dragend",this.handleDragEnd),this.dragging=t,this.emitter=new s.F}processFirstCoord(t){let e,i={left:t.pageX,top:t.pageY},n=i,r=t.subjectEl;r instanceof HTMLElement&&(e=(0,s.b6)(r),n=(0,s.aG)(n,e));let o=this.initialHit=this.queryHitForOffset(n.left,n.top);if(o){if(this.useSubjectCenter&&e){let t=(0,s.aE)(e,o.rect);t&&(n=(0,s.aH)(t))}this.coordAdjust=(0,s.aI)(n,i)}else this.coordAdjust={left:0,top:0}}handleMove(t,e){let i=this.queryHitForOffset(t.pageX+this.coordAdjust.left,t.pageY+this.coordAdjust.top);!e&&D(this.movingHit,i)||(this.movingHit=i,this.emitter.trigger("hitupdate",i,!1,t))}prepareHits(){this.offsetTrackers=(0,s.a)(this.droppableStore,(t=>(t.component.prepareHits(),new m(t.el))))}releaseHits(){let{offsetTrackers:t}=this;for(let e in t)t[e].destroy();this.offsetTrackers={}}queryHitForOffset(t,e){let{droppableStore:i,offsetTrackers:n}=this,r=null;for(let o in i){let l=i[o].component,a=n[o];if(a&&a.isWithinClipping(t,e)){let i=a.computeLeft(),n=a.computeTop(),h=t-i,c=e-n,{origRect:d}=a,g=d.right-d.left,u=d.bottom-d.top;if(h>=0&&h<g&&c>=0&&c<u){let t=l.queryHit(h,c,g,u);t&&(0,s.b9)(t.dateProfile.activeRange,t.dateSpan.range)&&(this.disablePointCheck||a.el.contains(a.el.getRootNode().elementFromPoint(h+i-window.scrollX,c+n-window.scrollY)))&&(!r||t.layer>r.layer)&&(t.componentId=o,t.context=l.context,t.rect.left+=i,t.rect.right+=i,t.rect.top+=n,t.rect.bottom+=n,r=t)}}}return r}}function D(t,e){return!t&&!e||Boolean(t)===Boolean(e)&&(0,s.bf)(t.dateSpan,e.dateSpan)}function w(t,e){let i={};for(let r of e.pluginHooks.datePointTransforms)Object.assign(i,r(t,e));var n,s;return Object.assign(i,(n=t,{date:(s=e.dateEnv).toDate(n.range.start),dateStr:s.formatIso(n.range.start,{omitTime:n.allDay}),allDay:n.allDay})),i}class b extends s.Z{constructor(t){super(t),this.handlePointerDown=t=>{let{dragging:e}=this,i=t.origEvent.target;e.setIgnoreMove(!this.component.isValidDateDownEl(i))},this.handleDragEnd=t=>{let{component:e}=this,{pointer:i}=this.dragging;if(!i.wasTouchScroll){let{initialHit:i,finalHit:n}=this.hitDragging;if(i&&n&&D(i,n)){let{context:n}=e,s=Object.assign(Object.assign({},w(i.dateSpan,n)),{dayEl:i.dayEl,jsEvent:t.origEvent,view:n.viewApi||n.calendarApi.view});n.emitter.trigger("dateClick",s)}}},this.dragging=new E(t.el),this.dragging.autoScroller.isEnabled=!1;let e=this.hitDragging=new f(this.dragging,(0,s.bG)(t));e.emitter.on("pointerdown",this.handlePointerDown),e.emitter.on("dragend",this.handleDragEnd)}destroy(){this.dragging.destroy()}}class y extends s.Z{constructor(t){super(t),this.dragSelection=null,this.handlePointerDown=t=>{let{component:e,dragging:i}=this,{options:n}=e.context,s=n.selectable&&e.isValidDateDownEl(t.origEvent.target);i.setIgnoreMove(!s),i.delay=t.isTouch?function(t){let{options:e}=t.context,i=e.selectLongPressDelay;null==i&&(i=e.longPressDelay);return i}(e):null},this.handleDragStart=t=>{this.component.context.calendarApi.unselect(t)},this.handleHitUpdate=(t,e)=>{let{context:i}=this.component,n=null,r=!1;if(t){let e=this.hitDragging.initialHit;t.componentId===e.componentId&&this.isHitComboAllowed&&!this.isHitComboAllowed(e,t)||(n=function(t,e,i){let n=t.dateSpan,r=e.dateSpan,o=[n.range.start,n.range.end,r.range.start,r.range.end];o.sort(s.av);let l={};for(let s of i){let i=s(t,e);if(!1===i)return null;i&&Object.assign(l,i)}return l.range={start:o[0],end:o[3]},l.allDay=n.allDay,l}(e,t,i.pluginHooks.dateSelectionTransformers)),n&&(0,s.b_)(n,t.dateProfile,i)||(r=!0,n=null)}n?i.dispatch({type:"SELECT_DATES",selection:n}):e||i.dispatch({type:"UNSELECT_DATES"}),r?(0,s.ax)():(0,s.aw)(),e||(this.dragSelection=n)},this.handlePointerUp=t=>{this.dragSelection&&((0,s.cu)(this.dragSelection,t,this.component.context),this.dragSelection=null)};let{component:e}=t,{options:i}=e.context,n=this.dragging=new E(t.el);n.touchScrollAllowed=!1,n.minDistance=i.selectMinDistance||0,n.autoScroller.isEnabled=i.dragScroll;let r=this.hitDragging=new f(this.dragging,(0,s.bG)(t));r.emitter.on("pointerdown",this.handlePointerDown),r.emitter.on("dragstart",this.handleDragStart),r.emitter.on("hitupdate",this.handleHitUpdate),r.emitter.on("pointerup",this.handlePointerUp)}destroy(){this.dragging.destroy()}}class T extends s.Z{constructor(t){super(t),this.subjectEl=null,this.subjectSeg=null,this.isDragging=!1,this.eventRange=null,this.relevantEvents=null,this.receivingContext=null,this.validMutation=null,this.mutatedRelevantEvents=null,this.handlePointerDown=t=>{let e=t.origEvent.target,{component:i,dragging:n}=this,{mirror:r}=n,{options:o}=i.context,l=i.context;this.subjectEl=t.subjectEl;let a=this.subjectSeg=(0,s._)(t.subjectEl),h=(this.eventRange=a.eventRange).instance.instanceId;this.relevantEvents=(0,s.aV)(l.getCurrentData().eventStore,h),n.minDistance=t.isTouch?0:o.eventDragMinDistance,n.delay=t.isTouch&&h!==i.props.eventSelection?function(t){let{options:e}=t.context,i=e.eventLongPressDelay;null==i&&(i=e.longPressDelay);return i}(i):null,o.fixedMirrorParent?r.parentNode=o.fixedMirrorParent:r.parentNode=(0,s.$)(e,".fc"),r.revertDuration=o.dragRevertDuration;let c=i.isValidSegDownEl(e)&&!(0,s.$)(e,".fc-event-resizer");n.setIgnoreMove(!c),this.isDragging=c&&t.subjectEl.classList.contains("fc-event-draggable")},this.handleDragStart=t=>{let e=this.component.context,i=this.eventRange,n=i.instance.instanceId;t.isTouch?n!==this.component.props.eventSelection&&e.dispatch({type:"SELECT_EVENT",eventInstanceId:n}):e.dispatch({type:"UNSELECT_EVENT"}),this.isDragging&&(e.calendarApi.unselect(t),e.emitter.trigger("eventDragStart",{el:this.subjectEl,event:new s.a0(e,i.def,i.instance),jsEvent:t.origEvent,view:e.viewApi}))},this.handleHitUpdate=(t,e)=>{if(!this.isDragging)return;let i=this.relevantEvents,n=this.hitDragging.initialHit,r=this.component.context,o=null,l=null,a=null,h=!1,c={affectedEvents:i,mutatedEvents:(0,s.I)(),isEvent:!0};if(t){o=t.context;let e=o.options;r===o||e.editable&&e.droppable?(l=function(t,e,i,n){let r=t.dateSpan,o=e.dateSpan,l=r.range.start,a=o.range.start,h={};r.allDay!==o.allDay&&(h.allDay=o.allDay,h.hasEnd=e.context.options.allDayMaintainDuration,l=o.allDay?(0,s.q)(i):i);let c=(0,s.aA)(l,a,t.context.dateEnv,t.componentId===e.componentId?t.largeUnit:null);c.milliseconds&&(h.allDay=!1);let d={datesDelta:c,standardProps:h};for(let s of n)s(d,t,e);return d}(n,t,this.eventRange.instance.range.start,o.getCurrentData().pluginHooks.eventDragMutationMassagers),l&&(a=(0,s.bX)(i,o.getCurrentData().eventUiBases,l,o),c.mutatedEvents=a,(0,s.bZ)(c,t.dateProfile,o)||(h=!0,l=null,a=null,c.mutatedEvents=(0,s.I)()))):o=null}this.displayDrag(o,c),h?(0,s.ax)():(0,s.aw)(),e||(r===o&&D(n,t)&&(l=null),this.dragging.setMirrorNeedsRevert(!l),this.dragging.setMirrorIsVisible(!t||!this.subjectEl.getRootNode().querySelector(".fc-event-mirror")),this.receivingContext=o,this.validMutation=l,this.mutatedRelevantEvents=a)},this.handlePointerUp=()=>{this.isDragging||this.cleanup()},this.handleDragEnd=t=>{if(this.isDragging){let e=this.component.context,i=e.viewApi,{receivingContext:n,validMutation:r}=this,o=this.eventRange.def,l=this.eventRange.instance,a=new s.a0(e,o,l),h=this.relevantEvents,c=this.mutatedRelevantEvents,{finalHit:d}=this.hitDragging;if(this.clearDrag(),e.emitter.trigger("eventDragStop",{el:this.subjectEl,event:a,jsEvent:t.origEvent,view:i}),r){if(n===e){let n=new s.a0(e,c.defs[o.defId],l?c.instances[l.instanceId]:null);e.dispatch({type:"MERGE_EVENTS",eventStore:c});let d={oldEvent:a,event:n,relatedEvents:(0,s.w)(c,e,l),revert(){e.dispatch({type:"MERGE_EVENTS",eventStore:h})}},g={};for(let t of e.getCurrentData().pluginHooks.eventDropTransformers)Object.assign(g,t(r,e));e.emitter.trigger("eventDrop",Object.assign(Object.assign(Object.assign({},d),g),{el:t.subjectEl,delta:r.datesDelta,jsEvent:t.origEvent,view:i})),e.emitter.trigger("eventChange",d)}else if(n){let r={event:a,relatedEvents:(0,s.w)(h,e,l),revert(){e.dispatch({type:"MERGE_EVENTS",eventStore:h})}};e.emitter.trigger("eventLeave",Object.assign(Object.assign({},r),{draggedEl:t.subjectEl,view:i})),e.dispatch({type:"REMOVE_EVENTS",eventStore:h}),e.emitter.trigger("eventRemove",r);let g=c.defs[o.defId],u=c.instances[l.instanceId],p=new s.a0(n,g,u);n.dispatch({type:"MERGE_EVENTS",eventStore:c});let v={event:p,relatedEvents:(0,s.w)(c,n,u),revert(){n.dispatch({type:"REMOVE_EVENTS",eventStore:c})}};n.emitter.trigger("eventAdd",v),t.isTouch&&n.dispatch({type:"SELECT_EVENT",eventInstanceId:l.instanceId}),n.emitter.trigger("drop",Object.assign(Object.assign({},w(d.dateSpan,n)),{draggedEl:t.subjectEl,jsEvent:t.origEvent,view:d.context.viewApi})),n.emitter.trigger("eventReceive",Object.assign(Object.assign({},v),{draggedEl:t.subjectEl,view:d.context.viewApi}))}}else e.emitter.trigger("_noEventDrop")}this.cleanup()};let{component:e}=this,{options:i}=e.context,n=this.dragging=new E(t.el);n.pointer.selector=T.SELECTOR,n.touchScrollAllowed=!1,n.autoScroller.isEnabled=i.dragScroll;let r=this.hitDragging=new f(this.dragging,s.a7);r.useSubjectCenter=t.useEventCenter,r.emitter.on("pointerdown",this.handlePointerDown),r.emitter.on("dragstart",this.handleDragStart),r.emitter.on("hitupdate",this.handleHitUpdate),r.emitter.on("pointerup",this.handlePointerUp),r.emitter.on("dragend",this.handleDragEnd)}destroy(){this.dragging.destroy()}displayDrag(t,e){let i=this.component.context,n=this.receivingContext;n&&n!==t&&(n===i?n.dispatch({type:"SET_EVENT_DRAG",state:{affectedEvents:e.affectedEvents,mutatedEvents:(0,s.I)(),isEvent:!0}}):n.dispatch({type:"UNSET_EVENT_DRAG"})),t&&t.dispatch({type:"SET_EVENT_DRAG",state:e})}clearDrag(){let t=this.component.context,{receivingContext:e}=this;e&&e.dispatch({type:"UNSET_EVENT_DRAG"}),t!==e&&t.dispatch({type:"UNSET_EVENT_DRAG"})}cleanup(){this.subjectSeg=null,this.isDragging=!1,this.eventRange=null,this.relevantEvents=null,this.receivingContext=null,this.validMutation=null,this.mutatedRelevantEvents=null}}T.SELECTOR=".fc-event-draggable, .fc-event-resizable";class M extends s.Z{constructor(t){super(t),this.draggingSegEl=null,this.draggingSeg=null,this.eventRange=null,this.relevantEvents=null,this.validMutation=null,this.mutatedRelevantEvents=null,this.handlePointerDown=t=>{let{component:e}=this,i=this.querySegEl(t),n=(0,s._)(i),r=this.eventRange=n.eventRange;this.dragging.minDistance=e.context.options.eventDragMinDistance,this.dragging.setIgnoreMove(!this.component.isValidSegDownEl(t.origEvent.target)||t.isTouch&&this.component.props.eventSelection!==r.instance.instanceId)},this.handleDragStart=t=>{let{context:e}=this.component,i=this.eventRange;this.relevantEvents=(0,s.aV)(e.getCurrentData().eventStore,this.eventRange.instance.instanceId);let n=this.querySegEl(t);this.draggingSegEl=n,this.draggingSeg=(0,s._)(n),e.calendarApi.unselect(),e.emitter.trigger("eventResizeStart",{el:n,event:new s.a0(e,i.def,i.instance),jsEvent:t.origEvent,view:e.viewApi})},this.handleHitUpdate=(t,e,i)=>{let{context:n}=this.component,r=this.relevantEvents,o=this.hitDragging.initialHit,l=this.eventRange.instance,a=null,h=null,c=!1,d={affectedEvents:r,mutatedEvents:(0,s.I)(),isEvent:!0};if(t){t.componentId===o.componentId&&this.isHitComboAllowed&&!this.isHitComboAllowed(o,t)||(a=function(t,e,i,n){let r=t.context.dateEnv,o=t.dateSpan.range.start,l=e.dateSpan.range.start,a=(0,s.aA)(o,l,r,t.largeUnit);if(i){if(r.add(n.start,a)<n.end)return{startDelta:a}}else if(r.add(n.end,a)>n.start)return{endDelta:a};return null}(o,t,i.subjectEl.classList.contains("fc-event-resizer-start"),l.range))}a&&(h=(0,s.bX)(r,n.getCurrentData().eventUiBases,a,n),d.mutatedEvents=h,(0,s.bZ)(d,t.dateProfile,n)||(c=!0,a=null,h=null,d.mutatedEvents=null)),h?n.dispatch({type:"SET_EVENT_RESIZE",state:d}):n.dispatch({type:"UNSET_EVENT_RESIZE"}),c?(0,s.ax)():(0,s.aw)(),e||(a&&D(o,t)&&(a=null),this.validMutation=a,this.mutatedRelevantEvents=h)},this.handleDragEnd=t=>{let{context:e}=this.component,i=this.eventRange.def,n=this.eventRange.instance,r=new s.a0(e,i,n),o=this.relevantEvents,l=this.mutatedRelevantEvents;if(e.emitter.trigger("eventResizeStop",{el:this.draggingSegEl,event:r,jsEvent:t.origEvent,view:e.viewApi}),this.validMutation){let a=new s.a0(e,l.defs[i.defId],n?l.instances[n.instanceId]:null);e.dispatch({type:"MERGE_EVENTS",eventStore:l});let h={oldEvent:r,event:a,relatedEvents:(0,s.w)(l,e,n),revert(){e.dispatch({type:"MERGE_EVENTS",eventStore:o})}};e.emitter.trigger("eventResize",Object.assign(Object.assign({},h),{el:this.draggingSegEl,startDelta:this.validMutation.startDelta||(0,s.d)(0),endDelta:this.validMutation.endDelta||(0,s.d)(0),jsEvent:t.origEvent,view:e.viewApi})),e.emitter.trigger("eventChange",h)}else e.emitter.trigger("_noEventResize");this.draggingSeg=null,this.relevantEvents=null,this.validMutation=null};let{component:e}=t,i=this.dragging=new E(t.el);i.pointer.selector=".fc-event-resizer",i.touchScrollAllowed=!1,i.autoScroller.isEnabled=e.context.options.dragScroll;let n=this.hitDragging=new f(this.dragging,(0,s.bG)(t));n.emitter.on("pointerdown",this.handlePointerDown),n.emitter.on("dragstart",this.handleDragStart),n.emitter.on("hitupdate",this.handleHitUpdate),n.emitter.on("dragend",this.handleDragEnd)}destroy(){this.dragging.destroy()}querySegEl(t){return(0,s.$)(t.subjectEl,".fc-event")}}const R={fixedMirrorParent:s.n},C={dateClick:s.n,eventDragStart:s.n,eventDragStop:s.n,eventDrop:s.n,eventResizeStart:s.n,eventResizeStop:s.n,eventResize:s.n,drop:s.n,eventReceive:s.n,eventLeave:s.n};s.bI.dataAttrPrefix="";s.bH;var I=(0,n.i1)({name:"@fullcalendar/interaction",componentInteractions:[b,y,T,M],calendarInteractions:[class{constructor(t){this.context=t,this.isRecentPointerDateSelect=!1,this.matchesCancel=!1,this.matchesEvent=!1,this.onSelect=t=>{t.jsEvent&&(this.isRecentPointerDateSelect=!0)},this.onDocumentPointerDown=t=>{let e=this.context.options.unselectCancel,i=(0,s.aR)(t.origEvent);this.matchesCancel=!!(0,s.$)(i,e),this.matchesEvent=!!(0,s.$)(i,T.SELECTOR)},this.onDocumentPointerUp=t=>{let{context:e}=this,{documentPointer:i}=this,n=e.getCurrentData();if(!i.wasTouchScroll){if(n.dateSelection&&!this.isRecentPointerDateSelect){let i=e.options.unselectAuto;!i||i&&this.matchesCancel||e.calendarApi.unselect(t)}n.eventSelection&&!this.matchesEvent&&e.dispatch({type:"UNSELECT_EVENT"})}this.isRecentPointerDateSelect=!1};let e=this.documentPointer=new a(document);e.shouldIgnoreMove=!0,e.shouldWatchScroll=!1,e.emitter.on("pointerdown",this.onDocumentPointerDown),e.emitter.on("pointerup",this.onDocumentPointerUp),t.emitter.on("select",this.onSelect)}destroy(){this.context.emitter.off("select",this.onSelect),this.documentPointer.destroy()}}],elementDraggingImpl:E,optionRefiners:R,listenerRefiners:C})}}]);
//# sourceMappingURL=807.c87d7e21.chunk.js.map