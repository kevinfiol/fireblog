import m from 'mithril';
import { Counter } from 'components/Index/Counter';

export const Index = (update) => {
    const counter = Counter(update);

    return (model) => ({
        oninit() {
            console.log(model);
        },

        view() {
            return m(counter(model));
        }
    });
};

// export const Index = () => (update) => {
//     return {
//         render: (model) => ({
//             oninit() {
//                 console.log(model);
//             },

//             view(v) {
//                 console.log(v);
//                 return m('p', 'index comp');
//             }
//         })
//     };
// };

// export const Index = () => {
//     return (update) => {
//         const counter = Counter()(update);

//         const view = (model) => {
//             return m('div', [
//                 counter.view(model),
//                 m('a', { href: '/profiles', oncreate: m.route.link }, 'profiles')
//             ]);
//         };

//         return { view };
//     };
// };



// export const Index = (update) => {
//     const add = (amount) => (_ev) => update((model) => {
//         model.age += amount;
//         return model;
//     });

//     return (model) => {
//         return m('div', [
//             m('p', model.age),
//             m('button', { onclick: add(1) }, 'add'),
//             m('p', 'totally unrelated element'),

//             m('a', { href: '/profiles', oncreate: m.route.link }, 'profiles')
//         ]);
//     };
// };