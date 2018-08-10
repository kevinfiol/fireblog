const compose = (...fs) => x => fs.reduceRight((val, f) => f(val), x);

export {
    compose,
};