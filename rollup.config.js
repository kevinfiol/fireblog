import path from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
import alias from 'rollup-plugin-alias';

const aliases = {
    'components': path.resolve(__dirname, 'src/components'),
    'views': path.resolve(__dirname, 'src/views'),
    'config': path.resolve(__dirname, 'src/config'),
    'state': path.resolve(__dirname, 'src/state'),

    'services': path.resolve(__dirname, 'src/services/index'),
    'observers': path.resolve(__dirname, 'src/observers/index'),
    'actions': path.resolve(__dirname, 'src/actions/index'),
    'util': path.resolve(__dirname, 'src/util')
};

const config = {
    input: './src/index.js',
    output: {
        file: './public/app.js',
        format: 'iife',
        sourcemap: true
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        alias(aliases),
        buble({ objectAssign: 'Object.assign' }),
    ],
};

if (process.env.PROD === 'true') {
    config.output.sourcemap = false;
    config.plugins.push( uglify.uglify() );
}

export default config;