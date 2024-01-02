import {baseConfig,baseClass} from './config';
import {getWorker} from './worker';


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
        this.#worker = getWorker();
        if(!this.#isStart){
            
        }
    }

    stop(){
        this.#isStart = false;
    }
}


export default detector