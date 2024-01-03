
self.onmessage = function(e){
    let {interval,checkSiteHost,intervalAddTime,maxInterval,isStop,isCanRun,domSccripts,domCsss,checkWho} = e.data,
    htmlText = '',
    errText = '';


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
        const regexLink = /<link[^>]+href=['"]([^'"]+\.(css))['"][^>]*>/g;
        const regexLinkJs = /<link[^>]+href=['"]([^'"]+\.(js))['"][^>]*>/g;
        const regexScript = /<script[^>]+src=['"]([^'"]+\.(js))['"][^>]*><\/script>/g;
        const result = {
          _css: [],
          _script: []
        };
      
        let match;
        while ((match = regexLink.exec(str))) {
          result._css.push(match[1]);
        }
      
        while ((match = regexScript.exec(str))) {
          result._script.push(match[1]);
        }
        
        while ((match = regexLinkJs.exec(str))) {
          result._script.push(match[1]);
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

    
    getWebSite.then(res=>{
        let siteObj = extractLinksAndScripts(htmlText);
        if(checkWho.includes('script')){
            
        }

        if(checkWho.includes('css')){

        }
    }).catch(err=>{
        
    })
      
}

function getWorkerBlob(){
    let js = `
        self.onmessage = function(e){
            let {interval,checkSiteHost,intervalAddTime,maxInterval} = e.data;
            
        }

        self.onerror = function(e){
            console.error('webDetectorWorker worker error:',e);
        }

        self.onmessageerror = function(e){
            console.error('webDetectorWorker woker onmessageerror:',e);
        }
    `,
    _blob = new Blob([js]);

    return window.URL.createObjectURL(_blob);
}

function createWorker(opts){
    let _worker = Object.create(null);

    if(window.Worker){
        _worker = new Worker(getWorkerBlob(),{
            type:'classic',
            credentials:'omit',
            name:'webDetectorWorker'
        })
    }else{
        console.error('你的浏览器不支持web worker；web worker支持IE10+')
    }

    return _worker;
}


const getWorker = (function(){
    let worker = null;
    return function(opts){
        if(worker === null){
            worker = new createWorker(opts)
        }

        return worker;
    }
})()

export default getWorker