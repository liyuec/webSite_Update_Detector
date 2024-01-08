import resolve from '@rollup/plugin-node-resolve';
import common from 'rollup-plugin-commonjs';

console.log('****************rollup.link.config.js******************')
export default{
    input:'./index.js',
    output:[
        {
            file:'./dist/index.esm.js',
            format:'esm',
            //sourcemap:true
            exports:'named'
        },
        {
            file:'./dist/index.umd.js',
            format:'umd',
            name:'detectorumd'
        }
    ],
    plugins:[
        common(),
        resolve()
    ]
}