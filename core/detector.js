import {baseConfig,baseClass} from './config'

class detector extends baseClass{
    #isStart = false;
    #webWorker = void 0;

    constructor(){
        super()
        this.#isStart = false;
    }

    start(){
        this.#isStart = true;
        if(!this.#isStart){

        }
    }

    stop(){
        this.#isStart = false;
    }
}


export default detector