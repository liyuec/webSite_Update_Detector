import {baseConfig,baseClass} from './config';
import {getWorker} from './worker';


/**
 * 暂不考虑不支持webWorker的情况
 */
class detector extends baseClass{
    #isStart = false;
    #worker = void 0;
    #scripts = null;
    #extractLinksAndScripts = function(){
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

    constructor(opts){
        super()
        this.#isStart = false;
        this.callBack = opts.callBack;
    }

    start(){
        if(document.readyState !== 'complete'){
            setTimeout(this.start(),500);
        }
        if(!this.#isStart){
            this.#isStart = true;
            this.#worker = getWorker({
                callBack:this.callBack
            });
            if(this.#scripts !== null){
                this.#scripts = this.#extractLinksAndScripts();
            }

            this.#worker.postMessage({
                checkSiteHost:this.checkSiteHost,
                domSccripts:this.#scripts._script,
                domCsss:this.#scripts._css,
                checkWho:this.checkWho,
                msg:'start',
                interval:this.interval,
                intervalAddTime:this.intervalAddTime,
                maxInterval:this.maxInterval})
        }
    }

    stop(){
        this.#isStart = false;
        this.#worker.postMessage({msg:'stop'})
    }
}


export default detector