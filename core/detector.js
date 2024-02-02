import {baseConfig,baseClass,channelName,channelMsg,localEnum,interval,expireInterval} from './config';
import {getWorker} from './worker';
import createDetector from '../index'

function extractLinksAndScripts(){
    const result = {
      _css: [],
      _script: []
    };

    const links = document.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const href = link.getAttribute('href');
      if (href && (href.endsWith('.css') || href.endsWith('.CSS'))) {
        result._css.push(href);
      }
      
      if (href && (href.endsWith('.js') || href.endsWith('.JS'))) {
        result._script.push(href);
      }
    }

    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      const src = script.getAttribute('src');
      if (src && (src.endsWith('.js') || src.endsWith('.JS'))) {
        result._script.push(src);
      }
    }

    return result;
}


let SlaveTimerId = null;
function getChannel(opts){
    const _channnel = new BroadcastChannel(channelName),
    _callBack = opts.callBack;

    _channnel.onmessage = function(_messageEvent){
      let {msg} = _messageEvent.data;
      switch(msg){
        //其他tab已经有请求了
        case channelMsg.begin:
          clearTimeout(SlaveTimerId);
          SlaveTimerId = setTimeout(() => {
            new createDetector(null).start();
          }, expireInterval);
        break;
        case channelMsg.upgradation:
          _callBack();
        break;
      }
    }

   /*  _channnel.postMessage({
      msg:channelMsg.begin
    })
 */
    return _channnel;
}

function localStorage(){
  const key = localEnum.detectorName;
  return {
    /*
      true:   已经有tab在请求了，暂时不请求
      false:  表示没有其他tab在请求，当前tab可以请求
    */
    checkDetector(){
      const detector = localStorage.getItem(key),
      result = !1;
      if(detector === null){
        return result;
      }

      try{
        detector = JSON.parse(detector);
        if(Date.now() - detector.tick > expireInterval){
          result = !0;
        }
      }catch(e){
        console.warn(e)
      }finally{
        return result;
      }
      
    },
    setDetector(masterTick){
      let res = {
        tick:Date.now(),
        master:masterTick
      }
      localStorage.setItem(key,Date.now());
      setTimeout(()=>{
        requestIdleCallback(localStorage().setDetector(masterTick))
      },interval);
    }
  }
}

/**
 * 暂不考虑不支持webWorker的情况
 */
class detector extends baseClass{
    #isStart = false;
    #worker = void 0;
    #scripts = null;
    #channel = null;

    constructor(opts){
        super(opts)
        this.#isStart = false;
        this.callBack = opts.callBack;
    }

    start(){
        if(document.readyState !== 'completes'){
            setTimeout(()=>{
              this.start()
            },interval);
        }
        if(!this.#isStart){
            this.#isStart = true;
            if(localStorage().checkDetector()){

              if(this.#channel === null){
                this.#channel = getChannel({
                  callBack:this.callBack
                });
              }

              setTimeout(()=>{
                requestIdleCallback(()=>{
                  this.#channel.postMessage({
                    msg:channelMsg.begin
                  });
                })
              },interval)
              
              
              localStorage().setDetector(Date.now());

              this.#worker = getWorker({
                callBack:this.callBack,
                channel:this.#channel
              });
              
              if(this.#scripts === null){
                  this.#scripts = extractLinksAndScripts();
              }


              this.#worker.postMessage({
                checkSiteHost:this.checkSiteHost,
                domSccripts:this.#scripts._script,
                domCsss:this.#scripts._css,
                checkWho:this.checkWho,
                msg:'start',
                interval:this.interval,
                intervalAddTime:this.intervalAddTime,
                maxInterval:this.maxInterval
              })
            }
        }
    }
    stop(){
        this.#isStart = false;
        this.#worker.postMessage({msg:'stop'})
    }
}


export default detector