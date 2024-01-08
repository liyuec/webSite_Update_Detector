import {terser} from "rollup-plugin-minification";
import resolve from '@rollup/plugin-node-resolve';
import common from 'rollup-plugin-commonjs';
import babel from '@rollup/plugin-babel';
import clearDirectory from 'rollup-plugin-clear-directory';

console.log('****************rollup.config.js******************')
export default{
    input:'index.js',
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
        clearDirectory({
            targets: ['dist']
          }
        ),
        common(),
        resolve(),
        terser()
    ]
}