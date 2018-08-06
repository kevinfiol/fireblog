// import merge from 'deepmerge';

// const compose = function(f, g) {
//     return function(x) {
//         return f(g(x));
//     };
// };

const compose = (...fs) => x => fs.reduceRight((val, f) => f(val), x);

// const nest = (update, prop) => (obj) => update({ [prop]: obj });
// const nest = (update, prop) => {
//     return (f) => {
//         update((model) => {
//             model[prop] = f(model[prop]);
//             return model;
//         });
//     };
// };

// const nestComponent = (create, update, prop) => {
//     const component = create( nest(update, prop) );
//     const res = Object.assign({}, component);

//     if (component.model) res.model = () => ({ [prop]: component.model() });
//     if (component.view) res.view = (model) => component.view(model[prop]);

//     return res;
// };

export {
    compose,
};