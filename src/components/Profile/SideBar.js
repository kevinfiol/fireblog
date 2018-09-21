import m from 'mithril';

export const Sidebar = {
    view: ({attrs}) => m('div', [
        // Username
        m('.col.col-12', [
            m('h2', attrs.user.username)
        ]),

        // Display Photo
        m('.col.col-12', [
            m('img.fit', {
                src: attrs.user.photoURL,
                onerror: e => e.target.src = 'https://images2.imgbox.com/a9/72/O6bXtE7c_o.png'
            })
        ]),

        // User Bio
        m('.col.col-12', [
            m('code', attrs.user.bio)
        ])
    ])
};