import m from 'mithril';

export const Layout = {
    view({children}) {
        return m('.clearfix', [
            m('a.mx3', { href: '/' }, 'dash'),
            m('a.mx3', { href: '/profiles' }, 'profiles'),

            children
        ]);
    }
};