import m from 'mithril';
import linkify from 'linkify-lite';

/**
 * Profile UserInfo Component
 */
export const UserInfo = {
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
        return m('.clearfix', [
            // // Display Pic
            // m('.col.col-12.pt1', [
            //     m('img.fit', {
            //         style: { maxHeight: '120px', maxWidth: '120px' },
            //         src: user.photoURL || '/img/favicon.png'
            //     }),
            // ]),

            // Bio
            m('.col.col-10.pr4', [
                m('h2', user.username),
                m('p', m.trust( linkify(user.bio) ))
            ]),

            m('.col.col-2', [
                m('img.fit.rounded.mt3.right', {
                    style: { maxHeight: '120px', maxWidth: '120px' },
                    src: user.photoURL || '/img/favicon.png'
                }),
            ])
        ]);
    }
};