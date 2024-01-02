import detector from './core/detector'

const createDetector = (function(){
    let _detector = null;
    return function(){
        if(_detector === null){
           _detector = new detector();
        }

        return _detector;
    }
})()


export default createDetector;