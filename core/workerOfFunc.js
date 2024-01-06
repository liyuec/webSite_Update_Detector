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


    function start(){
        if(!!timeId){
            suminterval <= maxInterval ? suminterval += intervalAddTime : suminterval;
        }
        getWebSite.then(res=>{
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
                msg:`error:${err}`
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