import {terser} from "rollup-plugin-minification";
import resolve from '@rollup/plugin-node-resolve';
import vue from 'rollup-plugin-vue';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import common from 'rollup-plugin-commonjs';
import babel from '@rollup/plugin-babel';


export default{
    input:'../../index.js',
    output:[
        {
            file:'../dist/index.esm.js',
            format:'esm',
            //sourcemap:true
            exports:'named'
        },
        {
            file:'../dist/index.umd.js',
            format:'umd',
            name:'detectorumd'
        }
    ],
    plugins:[
        common(),
        resolve(),
        terser()
    ]
}