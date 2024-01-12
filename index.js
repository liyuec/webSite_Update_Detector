import detector from './core/detector'

const createDetector = (function(){
    let _detector = null;
    return function(opts){
        if(_detector === null){
           _detector = new detector(opts);
        }

        return _detector;
    }
})()


export default createDetector;