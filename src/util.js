// const compose = function(f, g) {
//     return function(x) {
//         return f(g(x));
//     };
// };

const compose = (...fs) => x => fs.reduceRight((val, f) => f(val), x);

export {
    compose
};