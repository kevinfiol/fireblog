import m from 'mithril';

export const Link = {
    view({attrs, children}) {
        return m('a.navbar-a.c-hand.py1.px2.rounded', attrs, children);
    }
};