import {baseConfig,baseClass} from './config';
import {getWorker} from './worker';



/* function extractLinksAndScripts() {
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
} */

/**
 * 暂不考虑不支持webWorker的情况
 */
class detector extends baseClass{
    #isStart = false;
    #worker = void 0;

    constructor(opts){
        super()
        this.#isStart = false;
        
    }

    start(){
        this.#isStart = true;
        this.#worker = getWorker(opts);
        if(!this.#isStart){
            
        }
    }

    stop(){
        this.#isStart = false;
    }
}


export default detector