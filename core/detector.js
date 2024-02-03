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
      console.log('BroadcastChannel onmessage:',msg)
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

function _localStorage(){
  const key = localEnum.detectorName;
  
  function _masterAndSlave(masterTick){
    let master = localStorage.getItem(key),
    slave = sessionStorage.getItem(key),
    isCanStart = !0;

    if(slave === null){
      if(master === null){
        //都是空，那么是第一次开，之前也没用过，应该作为master进行请求
        slave = masterTick;
        master = masterTick;
  
        let res = {
          tick:Date.now(),
          master: master
        }
        sessionStorage.setItem(key,slave)
        localStorage.setItem(key,JSON.stringify(res));
      }else{
        //master有值，可能是新开tab，判断一下是否启动；
        
      }
    }else{
      //slave 有值
    }

    //第一次用，第一次来
    if(slave === null && master === null){
      slave = masterTick;
      master = masterTick;

      let res = {
        tick:Date.now(),
        master: master
      }
      sessionStorage.setItem(key,slave)
      localStorage.setItem(key,JSON.stringify(res));
    }
    //之前可能有tab，当前情况是新开的tab
    else if(slave === null && master !== null){
      slave = masterTick;
      sessionStorage.setItem(key,slave);
      master = JSON.parse(master);

      //判断是否是自己    不是当前tab做的Master
      if(slave === master.master){
          isCanStart = !1;
        }else{
          if(Date.now() - master.tick > expireInterval){
            let res = {
              tick:Date.now(),
              master: slave
            }
            localStorage.setItem(key,JSON.stringify(res));
          }
      }
    } 
    //当前tab或则新Tab刷新 自己刷新
    else if(slave !== null && master !== null){
      master = JSON.parse(master);
    }
    else if(slave !== null && master === null){

    }

    return {
      master:master,
      slave:slave,
      /*
        true:   表示没有其他tab在请求，当前tab可以请求
        false:  已经有tab在请求了，暂时不请求,只做监听
      */
      isCanStart:isCanStart
    }
  }
  return {
    /*
      true:   表示没有其他tab在请求，当前tab可以请求
      false:  已经有tab在请求了，暂时不请求,只做监听
    */
    checkDetector(){
      let detector = localStorage.getItem(key),
      result = !0,
      master = null;

      master = sessionStorage.getItem(detector);

      if(detector === null){
        return result;
      }

      try{
        let detectorJson = JSON.parse(detector);
        if(Date.now() - detectorJson.tick > expireInterval){
          result = !0;
        }else{
          if(master === detectorJson.master){
            result = !1;
          }
        }
      }catch(e){
        console.warn(e)
      }finally{
        return result;
      }
      
    },
    setDetector(masterTick){
      //master设置逻辑
      let _mePk = sessionStorage.getItem(key);
      if(_mePk === null){
        sessionStorage.setItem(key,masterTick)
        _mePk = masterTick;
      }

      let master = 
      
      let res = {
        tick:Date.now(),
        master:!!_master ? _master : masterTick
      }
      localStorage.setItem(key,JSON.stringify(res));
      setTimeout(()=>{
          _localStorage().setDetector(masterTick)
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
        if(document.readyState !== 'complete'){
            setTimeout(()=>{
              this.start()
            },interval);
            return;
        }
        if(!this.#isStart){
            this.#isStart = true;

            if(this.#channel === null){
              this.#channel = getChannel({
                callBack:this.callBack
              });
            }

            if(_localStorage().checkDetector()){
              setInterval(()=>{
                  this.#channel.postMessage({
                    msg:channelMsg.begin
                  });
              },interval)
              
              
              _localStorage().setDetector(Date.now());

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