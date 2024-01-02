
function getWorkerBlob(){
    let js = `
        self.onmessage = function(e){

        }
    `,
    _blob = new Blob([js]);

    return window.URL.createObjectURL(_blob);
}

function createWorker(){
    let _res = Object.create(null);

    _res = {
        _worker:void 0,
        on:void 0,
        off:void 0,
        stop:void 0
    }


    if(window.Worker){
        _res._worker = new Worker(getWorkerBlob(),{
            type:'classic',
            credentials:'omit',
            name:'webDetectorWorker'
        })
    }else{

    }

    return _res;
}


const getWorker = (function(){
    let worker = null;
    return function(){
        if(worker === null){
            worker = new createWorker()
        }

        return worker;
    }
})()

export default getWorker