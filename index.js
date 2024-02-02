import detector from './core/detector'

const createDetector = (function(){
    let _detector = null,
    _opts = null;

    return function(opts){
        if(_detector === null){
            if(opts !== null){
                _opts = opts;
            }
           _detector = new detector(_opts);
        }

        return _detector;
    }
})()


export default createDetector;