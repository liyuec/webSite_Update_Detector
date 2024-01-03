const baseConfig = {
    //1分钟
    minInterval:(1000 * 60)
}

class baseClass{
    constructor(ops = {
        //间隔轮询
        interval:10000,
        //是否检查当前轮询时间，自动间隔
        isCheckWaitTime:true,
        //获取的站点 http || https + host
        checkSiteHost:'',
        //每次检查完毕，用户无论干嘛，都增加这个时长
        intervalAddTime:30000,
        //最大间隔检查上线
        maxInterval:1000 * 60,
        //检查什么
        checkWho:['script','css']
    }){
        this.interval = ops.interval < baseConfig.minInterval ? baseConfig.minInterval : ops.interval;
        this.isCheckWaitTime = ops.isCheckWaitTime;
        this.checkSiteHost = ops.checkSiteHost
    }
}


export {
    baseConfig,
    baseClass
}