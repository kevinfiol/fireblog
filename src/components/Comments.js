import m from 'mithril';
import stream from 'mithril/stream';
import { Btn } from 'components/Btn';
import { TextArea } from 'components/TextArea';

export const Comments = () => {
    /**
     * Local State
     */
    const newCommentStream = stream('');
    let textareaElement;

    /**
     * Actions
     */
    let createComment;

    return {
        /**
         * Oninit Method
         * @param {Object} attrs View Attributes
         */
        oninit: ({attrs}) => {
            createComment = attrs.createComment;
        },

        /**
         * View Method
         * @param {Object} attrs View Attributes
         */
        view: ({attrs}) => {
            /**
             * State
             */
            const globalUsername  = attrs.globalUsername;
            const identifier      = attrs.identifier;
            const comments        = attrs.comments;

            return [
                m('h4', 'comments'),

                // New Comment Box
                m(TextArea, {
                    // State
                    input: newCommentStream,
                    maxlength: '800',
                    rows: '1',
                    textareaOncreate: ({dom}) => textareaElement = dom
                }),

                // Create Comment Button
                m(Btn, {
                    className: 'my1 btn-outline right',
                    disabled: !newCommentStream(),
                    onclick: () => {
                        createComment(globalUsername, identifier, newCommentStream())
                            .then(() => {
                                // Empty Comment Box after posting comment.
                                newCommentStream('');
                                textareaElement.value = '';
                            })
                        ;
                    }
                }, 'Post'),

                // Comments List
                comments.length > 0
                    ? comments.map(c => m('div', [
                        m('span.h6', [
                            // m('img.inline.micro', { src: c.photoURL || '/img/favicon.png' }),
                            m('a.inline', { href: `/u/${c.username}`, oncreate: m.route.link }, c.username),
                            m('span.inline.muted.px1', '•'),
                            m('.inline.muted', c.date),
                        ]),
                        m('p', c.content)
                    ]))
                    : null
                ,
            ];
        }
    };
};