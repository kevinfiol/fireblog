import m from 'mithril';

export const Sidebar = {
    view: ({attrs}) => [
        // Username & Display Pic
        m('.col.col-12.py1', [
            m('h2', attrs.user.username),

            m('img.fit.py1', {
                style: { maxHeight: '150px', maxWidth: '150px' },
                src: attrs.user.photoURL,
                onerror: e => e.target.src = 'https://images2.imgbox.com/a9/72/O6bXtE7c_o.png'
            }),
        ]),

        // Bio
        m('.col.col-12.py1', [
            m('code', attrs.user.bio)
        ])
    ]
};