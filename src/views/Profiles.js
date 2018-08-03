import m from 'mithril';

export const Profiles = () => {
    return (update) => {
        const increase = (model, amount) => {
            return () => update({ count: model.count + amount });
        };

        const view = (model) => {
            return m('div', [
                m('p', model.count),
                m('button', { onclick: increase(model, 1) }, 'increase'),
                m('p', `title: ${model.title}`),

                m('a', { href: '/', oncreate: m.route.link }, 'index')
            ]);
        };

        return { view };
    };
};

// export const Profiles = (update) => {    
//     const increase = (model, amount) => {
//         return (_ev) => update({ count: model.count + amount });
//     };

//     return (model) => {
//         return m('div', [
//             m('p', model.count),
//             m('button', { onclick: increase(model, 1) }, 'increase'),
//             m('p', `title: ${model.title}`),

//             m('a', { href: '/', oncreate: m.route.link }, 'index')
//         ]);
//     };
// };