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
        return [
            m('.col.col-12.md-col-3', [
                m('.left.my1', { style: { height: '120px', width: '120px' } }, [
                    m('img.fit.rounded', {
                        style: { maxHeight: '120px', maxWidth: '120px' },
                        src: user.photoURL || '/img/favicon.png'
                    })
                ])
            ]),

            // Bio
            m('.col.col-12.md-col-9', [
                m('h2', { style: { marginTop: '0' } }, user.username),
                m('div', { style: { whiteSpace: 'pre-wrap' } }, m.trust( linkify(user.bio) ))
            ]),
        ];
    }
};