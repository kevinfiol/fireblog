import m from 'mithril';

export const Link = {
    view({attrs, children}) {
        return m('a.c-hand.charcoal', attrs, children);
    }
};