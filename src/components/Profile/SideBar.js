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
            // Display Pic
            m('.col.col-12.pt1', [
                m('img.fit', {
                    style: { maxHeight: '120px', maxWidth: '120px' },
                    src: user.photoURL || '/img/favicon.png'
                }),
            ]),

            // Bio
            m('.col.col-12', [
                m('h2', user.username),
                m('p', user.bio)
            ])
        ];
    }
};