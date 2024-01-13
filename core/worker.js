
function getWorkerBlobStr(){
    let js = `
    self.onmessage = function(e){
        let {checkSiteHost,domSccripts,domCsss,checkWho,msg,interval,intervalAddTime,maxInterval} = e.data,
        htmlText = '',
        errText = '',
        timeId = null,
        suminterval = interval;
    
    
        function getWebSite(){
            return new Promise((r,rj)=>{
                fetch(checkSiteHost).then(res=>{
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
    
        function extractLinksAndScripts(str) {
            str = str.replaceAll('\x3C','<');
            str = str.replaceAll('async',' ');
            str = str.replaceAll('defer',' ');
            const _regexLinkStr = '<link[^>]+href=[\\'"]([^\\'"]+\\\\.(css))[\\'"][^>]*>',
            _regexLinkJsStr = '<link[^>]+href=[\\'"]([^\\'"]+\\\\.(js))[\\'"][^>]*>',
            _regexScriptStr = '<script[^>]+src=[\\'"]([^\\']+)[\\']',
            regexLinkStr = new RegExp(_regexLinkStr, 'g'),
            regexLinkJsStr = new RegExp(_regexLinkJsStr, 'g'),
            regexScriptStr = new RegExp(_regexScriptStr, 'g'),
            matchStr = regexLinkStr.exec(str),
            matchLinkJsStr = regexLinkJsStr.exec(str),
            matchScriptStr = regexScriptStr.exec(str),
            result = {
              _css: [],
              _script: []
            };
          
            if(matchStr !== null){
                matchStr.forEach(i => {
                    result._css.push(i);
                });
            }
    
            if(matchLinkJsStr !== null){
                matchLinkJsStr.forEach(i => {
                    result._script.push(i);
                });
            }
    
            if(matchScriptStr !== null){
                matchScriptStr.forEach(i => {
                    if(i !== 'js'){
                        result._script.push(i);
                    }
                });
            }
           
            return result;
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
    
    
        function start(){
            if(!!timeId){
                suminterval <= maxInterval ? suminterval += intervalAddTime : suminterval;
            }
            getWebSite().then(res=>{
                let siteObj = extractLinksAndScripts(htmlText),
                diffResult = null;
                if(checkWho.includes('script')){
                    diffResult = differentValue(domSccripts,siteObj._script);
                    if(diffResult !== null){
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
                        self.postMessage({
                            update:1,
                            msg:'css_diff'
                        })
                        return;
                    }
                }
        
                timeId = setTimeout(()=>{
                    self.postMessage({
                        update:0,
                        msg:'no_file_update'
                    })
                },suminterval)
                
            }).catch(err=>{
                self.postMessage({
                    update:-1,
                    msg:'error:' + err
                })
            })
        }
        
        switch(msg){
            case 'start':
                start();
            break;
            case 'stop':
                clearTimeout(timeId);
            break;
        }
       
       
    }
    `,
    _blob = new Blob([js]);

    return window.URL.createObjectURL(_blob);
}

function createWorker(opts){
    let _worker = Object.create(null),
    callBack = opts.callBack;

    if(window.Worker){
        _worker = new Worker(getWorkerBlobStr(),{
            type:'classic',
            credentials:'omit',
            name:'webDetectorWorker'
        })
    }else{
        console.error('你的浏览器不支持web worker；web worker支持IE10+')
    }

    _worker.addEventListener("message", function (e) {
        let {update,msg} = e.data;
        switch(update){
            case -1:
                callBack(msg)
            break;
            case 0:
                callBack(msg)
            break;
            case 1:
            //有不一致的情况；
                callBack(msg)
            break;
        }
    })

    _worker.addEventListener("error", function (e,event) {
        console.error(`__worker error:`,e,event)
    })

    _worker.addEventListener("messageerror", function (e,event) {
        console.error(`__worker error:`,e,event)
    })

    return _worker;
}
 
const getWorker = (function(){
    let worker = null;
    /**
     * type :预留
     */
    return function(opts,type = 'default'){
        if(worker === null){
            worker = new createWorker(opts)
        }

        return worker;
    }
})()

export {
    getWorker
}