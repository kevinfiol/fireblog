const compose = (...fs) => x => fs.reduceRight((val, f) => f(val), x);

const range = num => {
    const values = [];

    for (let i = 0; i < num; i += 1) {
        values.push(i);
    }

    return values;
};

export { compose, range };