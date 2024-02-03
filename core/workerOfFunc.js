self.onmessage = function(e){
    let {checkSiteHost,domSccripts,domCsss,checkWho,msg,interval,intervalAddTime,maxInterval} = e.data,
    htmlText = '',
    errText = '',
    timeId = null,
    suminterval = interval;


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


    const channelName = 'webUpdateDetector'
    const channelMsg = {
        //开始
        begin:channelName + ':begin',
        script_diff:channelName + ':script_diff',
        css_diff:channelName + ':css_diff',
        no_file_update:channelName + ':no_file_update',
        error:channelName + ':error'
    }

    const expireInterval = 4500;
    let SlaveTimerId = null;
    let setIntervalId = null;
    function getChannel(opts){
        const _channnel = new BroadcastChannel(channelName);

        _channnel.onmessage = function(_messageEvent){
          let {msg} = _messageEvent.data;
          console.log('BroadcastChannel onmessage:',msg)
          switch(msg){
            //其他tab已经有请求了
            case channelMsg.begin:
              clearTimeout(SlaveTimerId);
              clearInterval(setIntervalId);
              SlaveTimerId = setTimeout(() => {
                start();
              }, expireInterval);
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

    var _channel = getChannel();

    function sendChannel(){
      setIntervalId = setInterval(()=>{
        _channel.postMessage({
          msg:channelMsg.begin
        })
      },1000);
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