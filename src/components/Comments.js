import m from 'mithril';
import stream from 'mithril/stream';
import { EmptyState } from 'components/EmptyState';
import { LoadingBtn } from 'components/LoadingBtn';
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
    let deleteComment;

    return {
        /**
         * Oninit Method
         * @param {Object} attrs View Attributes
         */
        oninit: ({attrs}) => {
            createComment = attrs.createComment;
            deleteComment = attrs.deleteComment;
        },

        /**
         * View Method
         * @param {Object} attrs View Attributes
         */
        view: ({attrs}) => {
            /**
             * State
             */
            const isUserLoggedIn  = attrs.isUserLoggedIn || false;
            const globalUsername  = attrs.globalUsername;
            const identifier      = attrs.identifier;
            const comments        = [...attrs.comments].reverse();

            return [
                isUserLoggedIn
                    ? m('div', [
                        // New Comment Box
                        m(TextArea, {
                            // State
                            input: newCommentStream,
                            maxlength: '800',
                            rows: '1',
                            textareaOncreate: ({dom}) => textareaElement = dom
                        }),

                        // Create Comment Button
                        m('.right-align', [
                            m(LoadingBtn, {
                                className: 'btn-outline',
                                altDisabled: !newCommentStream(),
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
                        ])
                    ])
                    : null
                ,

                // Comments List
                comments.length > 0
                    ? comments.map(c => {
                        const isGlobalUsersPost = globalUsername === c.username;

                        return m('.my3', [
                            m('span.h5', [
                                // m('img.inline.micro', { src: c.photoURL || '/img/favicon.png' }),
                                m('a.inline', { href: `/u/${c.username}`, oncreate: m.route.link }, c.username),
                                m('span.inline.light-subdue.px1', '•'),
                                m('.inline.light-subdue', c.date),

                                isGlobalUsersPost
                                    ? m('.inline.light-subdue.c-hand.right.a-btn', { onclick: () => deleteComment(identifier, c.id) }, 'delete')
                                    : null
                                ,
                            ]),
                            m('p.my1', c.content)
                        ]);
                    })
                    : m(EmptyState, 'There are no comments here yet.')
                ,
            ];
        }
    };
};