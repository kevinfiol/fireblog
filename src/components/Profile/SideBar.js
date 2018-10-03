import m from 'mithril';

/**
 * Profile Sidebar Component
 */
export const Sidebar = {
    /**
     * View Method
     * @param {Object} attrs View Attributes
     */
    view: ({attrs}) => {
        /**
         * State
         */
        const user = attrs.user;

        /**
         * View
         */
        return [
            // Username & Display Pic
            m('.col.col-12.py1', [
                m('h2', user.username),

                m('img.fit.py1', {
                    style: { maxHeight: '150px', maxWidth: '150px' },
                    src: user.photoURL,
                    onerror: e => e.target.src = '/img/favicon.png'
                }),
            ]),

            // Bio
            m('.col.col-12.py1', [
                m('code', user.bio)
            ])
        ];
    }
};