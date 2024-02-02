const baseConfig = {
    //1分钟
    minInterval:(1000 * 60),
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
}

class baseClass{
    constructor(ops){
        this.interval = ops.interval === void 0 ? baseConfig.interval : ops.interval;
        this.isCheckWaitTime = ops.isCheckWaitTime === void 0 ? baseConfig.isCheckWaitTime : ops.isCheckWaitTimes;
        this.checkSiteHost = ops.checkSiteHost;
        this.intervalAddTime = ops.intervalAddTime === void 0 ? baseConfig.intervalAddTime : ops.intervalAddTime;
        this.maxInterval = ops.maxInterval === void 0 ? baseConfig.maxInterval : ops.maxInterval;
        this.checkWho = ops.checkWho === void 0 ? baseConfig.checkWho : ops.checkWho;
    }
}


const channelName = 'webUpdateDetector'
const channelMsg = {
    //开始
    begin:channelName + ':begin',
    upgradation:channelName + ":upgradation"
}

const localEnum = {
    detectorName:'localDetector'
}


const interval = 2000;
const expireInterval = 5000;


export {
    baseConfig,
    baseClass,
    channelName,
    channelMsg,
    localEnum,
    interval,
    expireInterval
}