import m from 'mithril';

export const Button = {
    view({attrs, children}) {
        return m('button.btn.btn-outline.mx1', attrs, children);
    }
};