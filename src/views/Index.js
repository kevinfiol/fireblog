import m from 'mithril';

export const Index = (init) => {
    return (update) => {
        const model = () => Object.assign({ name: 'NotKevin', age: 2 }, init);
        
        const increase = (model, amount) => {
            return (_ev) => update({ age: model.age + amount });
        };

        const view = (model) => {
            return m('div', [
                m('p', model.age),
                m('button', { onclick: increase(model, 1) }, 'increase'),
                m('p', 'totally unrelated element'),

                m('a', { href: '/profiles', oncreate: m.route.link }, 'profiles')
            ]);
        };

        return { model, view };
    };
};

// export const Index = (update) => {    
//     const increase = (model, amount) => {
//         return (_ev) => update({ age: model.age + amount });
//     };

//     return (model) => {
//         return m('div', [
//             m('p', model.age),
//             m('button', { onclick: increase(model, 1) }, 'increase'),
//             m('p', 'totally unrelated element'),

//             m('a', { href: '/profiles', oncreate: m.route.link }, 'profiles')
//         ]);
//     };
// };