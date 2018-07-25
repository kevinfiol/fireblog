import path from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
import alias from 'rollup-plugin-alias';

const aliases = {
    'components': path.resolve(__dirname, 'src/components'),
    'views': path.resolve(__dirname, 'src/views'),
    'services': path.resolve(__dirname, 'src/services'),
    'config': path.resolve(__dirname, 'src/config'),
    'gstate': path.resolve(__dirname, 'src/gstate')
};

export default {
    input: './src/index.js',
    output: {
        file: './public/app.js',
        format: 'iife'
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        alias(aliases),
        buble(),
        ((process.env.PROD === 'true') && uglify.uglify())
    ]
}