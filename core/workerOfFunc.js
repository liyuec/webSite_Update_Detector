self.onmessage = function(e){
    let {checkSiteHost,domSccripts,domCsss,checkWho,msg,interval,intervalAddTime,maxInterval} = e.data,
    htmlText = '',
    errText = '',
    timeId = null,
    suminterval = interval,
    sendChannelIntervalId = null;

    let expireInterval = 3000,
    myStartTimeInterval = 4000,
    /**
     * channelIntervals
     * expireTime
     */
    otherChannelIntervals = [];



    function getWebSite(){
        return new Promise((r,rj)=>{
            let _checkSiteHost = checkSiteHost + '?timekey=' + new Date().getTime()
            fetch(_checkSiteHost).then(res=>{
                return res.text();
            }).then(_htmlText =>{
                htmlText = _htmlText;
                r('ok')
            }).catch(err=>{
                errText = err;
                console.warn('get web site error:',errText)
                rj('wrong')
            })
        })
    }

    function extractLinksAndScripts(htmlString) {
        const css = [];
        const js = [];
      
        // 提取 CSS 链接
        let startIndex = 0;
        while (startIndex < htmlString.length) {
          const linkStartIndex = htmlString.indexOf('<link', startIndex);
          if (linkStartIndex === -1) {
            break;
          }
          const hrefStartIndex = htmlString.indexOf('href="', linkStartIndex);
          if (hrefStartIndex === -1) {
            break;
          }
          const hrefEndIndex = htmlString.indexOf('"', hrefStartIndex + 6);
          if (hrefEndIndex === -1) {
            break;
          }
          const href = htmlString.substring(hrefStartIndex + 6, hrefEndIndex);
          if (href.endsWith('.css')) {
            css.push(href);
          }
          if(href.endsWith('.js')){
            js.push(href);
          }
          startIndex = hrefEndIndex + 1;
        }
      
        // 提取 JS 链接
        startIndex = 0;
        while (startIndex < htmlString.length) {
          const scriptStartIndex = htmlString.indexOf('<script', startIndex);
          if (scriptStartIndex === -1) {
            break;
          }
          const srcStartIndex = htmlString.indexOf('src="', scriptStartIndex);
          if (srcStartIndex === -1) {
            break;
          }
          const srcEndIndex = htmlString.indexOf('"', srcStartIndex + 5);
          if (srcEndIndex === -1) {
            break;
          }
          const src = htmlString.substring(srcStartIndex + 5, srcEndIndex);
          if (src.endsWith('.js')) {
            js.push(src);
          }
          startIndex = srcEndIndex + 1;
        }
      
        return { css, js };
    }

    function differentValue(arr1, arr2) {
        var targetArray = arr1.length <= arr2.length ? arr1 : arr2;
        var otherArray = targetArray === arr1 ? arr2 : arr1;
      
        for (var i = 0; i < targetArray.length; i++) {
          if (targetArray[i] !== otherArray[i]) {
            return targetArray[i];
          }
        }
      
        return null;
    }

    /*
      调整自己的myStartTimeInterval；
      以便主tab挂了或则关闭，其他tab 只会启动单个请求
      只change自己一次
    */
    let isMyChange = false;
    function myStartTimeIntervalChange(){
      if(isMyChange){
        return;
      }

     

      let _myStartTimeInterval = myStartTimeInterval,
      {result,min,max} = getChannelIntervals();

      //console.error('我的 _myStartTimeInterval:',_myStartTimeInterval,result.toString());

      if(result.includes(_myStartTimeInterval)){
        /* if(min - 500 >= expireInterval){
          _myStartTimeInterval = min + 500;
        }else{
          _myStartTimeInterval = max + 500;
        } */
        _myStartTimeInterval = max + 500;
      }
      
      isMyChange = true;
      //console.error('替换后的 _myStartTimeInterval:',_myStartTimeInterval,result.toString())
      myStartTimeInterval = _myStartTimeInterval;
      sendChannelInterval();
    }

    function setChannelIntervals(channelIntervals,expireTime,type){
      if(type === channelMsg.begin){
        otherChannelIntervals = [];
      }
      //console.log('otherChannelIntervals length:',otherChannelIntervals.length)
      if(Object.prototype.toString.call(channelIntervals).slice(8,-1) === 'Array'){
        channelIntervals.forEach(i=>{
          otherChannelIntervals.push({
            channelIntervals:i.channelIntervals,
            expireTime:i.expireTime
          });
        })
      }else{
        otherChannelIntervals.push({
          channelIntervals:channelIntervals,
          expireTime:expireTime
        });
      }
    }

    /**
     * 超过3秒没更新，算过期，因为每秒都要广播；
     */
    function getChannelIntervals(){
      let _otherChannelIntervals = otherChannelIntervals,
      res = [],
      min = void 0,
      max = void 0,
      result = [],
      now = Date.now();

      _otherChannelIntervals.forEach(i=>{
        //if(now - i.expireTime <= 3000){
          res.push(i)
          result.push(i.channelIntervals)
        //}
      })

      otherChannelIntervals = JSON.parse(JSON.stringify(res));

      min = Math.min(...result);
      max = Math.max(...result);
      return {
        result,
        min,
        max
      }
    }

    const channelName = 'webUpdateDetector'
    const channelMsg = {
        //开始
        begin:channelName + ':begin',
        interval:channelName + ':interval',
        script_diff:channelName + ':script_diff',
        css_diff:channelName + ':css_diff',
        no_file_update:channelName + ':no_file_update',
        error:channelName + ':error'
    }

    var _channel = getChannel();
   
    let SlaveTimerId = null;
    let setIntervalId = null;
    function getChannel(opts){
        const _channnel = new BroadcastChannel(channelName);

        _channnel.onmessage = function(_messageEvent){
          let {msg,channelIntervals,expireTime} = _messageEvent.data;
          
          switch(msg){
            //其他tab已经有请求了
            case channelMsg.begin:
              clearTimeout(SlaveTimerId);
              clearInterval(setIntervalId);
              setChannelIntervals(channelIntervals,expireTime,channelMsg.begin);
              myStartTimeIntervalChange();
              SlaveTimerId = setTimeout(() => {
                start();
              }, myStartTimeInterval);
              //console.log('其他tab已经有请求了:',myStartTimeInterval,msg,channelIntervals,expireTime,otherChannelIntervals)
            break;
            //记录其他channel的存活情况；
            case channelMsg.interval:
              setChannelIntervals(channelIntervals,expireTime,channelMsg.interval);
              myStartTimeIntervalChange();
              //console.log('记录其他channel的存活情况:',myStartTimeInterval,msg,channelIntervals,expireTime,otherChannelIntervals)
            break;
            case channelMsg.script_diff:
              self.postMessage({
                update:1,
                msg:'script_diff'
              })
            break;
            case channelMsg.css_diff:
              self.postMessage({
                  update:1,
                  msg:'css_diff'
              })
            break;
            case channelMsg.no_file_update:
              self.postMessage({
                update:0,
                msg:'no_file_update'
              })
            break;
            case channelMsg.error:
              self.postMessage({
                update:-1,
                msg:'error:' + err
              })
            break;
          }
        }
        return _channnel;
    }

    function sendChannelInterval(isInterval = false){
      function send(){
        _channel.postMessage({
          msg:channelMsg.interval,
          //channelIntervals:otherChannelIntervals.length > 0 ? otherChannelIntervals : myStartTimeInterval,
          channelIntervals:myStartTimeInterval,
          expireTime:Date.now()
        })
      }
      if(isInterval){
        sendChannelIntervalId = setInterval(()=>{
          send();
        },2000);
      }else{
        send();
      }

    }

    let isSendChannel = false;
    function sendChannel(){
      function send(){
        
        _channel.postMessage({
          msg:channelMsg.begin,
          channelIntervals:otherChannelIntervals.length > 0 ? otherChannelIntervals : myStartTimeInterval,
          expireTime:Date.now()
        })
        setTimeout(send,2000)
      }
      if(!isSendChannel){
        send();
      }
     /*  setIntervalId = setInterval(()=>{
        send();
      },2000); */
    }
    function start(){
        if(!!timeId){
            suminterval = suminterval <= maxInterval ? suminterval += intervalAddTime : suminterval;
        }

        sendChannel();

        getWebSite().then(res=>{
            let extractObj = extractLinksAndScripts(htmlText),
            diffResult = null,
            siteObj = {
                _script:[],
                _css:[]
            };

            siteObj._script = extractObj.js;
            siteObj._css = extractObj.css;


            if(checkWho.includes('script')){
                diffResult = differentValue(domSccripts,siteObj._script);
                if(diffResult !== null){
                    _channel.postMessage({
                      msg:channelMsg.script_diff
                    })
                    self.postMessage({
                        update:1,
                        msg:'script_diff'
                    })
                    return;
                }
            }
    
            if(checkWho.includes('css')){
                diffResult = differentValue(domCsss,siteObj._css);
                if(diffResult !== null){
                    _channel.postMessage({
                      msg:channelMsg.css_diff
                    })
                    self.postMessage({
                        update:1,
                        msg:'css_diff'
                    })
                    return;
                }
            }
    
            timeId = setTimeout(()=>{
                _channel.postMessage({
                  msg:channelMsg.no_file_update
                })
                self.postMessage({
                    update:0,
                    msg:'no_file_update'
                })
                start();
            },suminterval)
            
        }).catch(err=>{
            _channel.postMessage({
              msg:channelMsg.error
            })
            self.postMessage({
                update:-1,
                msg:'error:' + err
            })
        })
    }
    



    switch(msg){
        case 'start':
          //这里直接频道判断，因为浏览器不会保存之前的消息；
         /*  setIntervalId = setInterval(()=>{
            _channel.postMessage({
              msg:channelMsg.begin
            })
          },1000); */
          SlaveTimerId = setTimeout(()=>{
              start();
          },expireInterval)
            //start();
        break;
        case 'stop':
            clearTimeout(timeId);
        break;
        case 'beforeunload':
            clearInterval(setIntervalId);
            _channel.close();
          break;
    }
   
   
}