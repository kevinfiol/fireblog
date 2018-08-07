import m from 'mithril';

export const Counter = (update) => {
    const increase = (model, amount) => {
        return () => update({ age: model.age + amount });
    };

    return (model) => {
        return m('div', [
            m('p', model.age),
            m('button', { onclick: increase(model, 1) }, 'increase'),
            m('p', 'totally unrelated element'),
        ]);
    };
};