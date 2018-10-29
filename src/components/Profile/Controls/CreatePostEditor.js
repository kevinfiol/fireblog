import m from 'mithril';
import stream from 'mithril/stream';
import { LoadingBtn } from 'components/LoadingBtn';
import { Editor } from 'components/Editor';

export const CreatePostEditor = () => {
    /**
     * Local State
     */
    const titleStream   = stream('');
    const editorRef = {};

    /**
     * Actions
     */
    let enableEditor;
    let createProfileBlogPost;

    return {
        /**
         * Oninit Method
         * @param {Object} attrs View Attributes
         */
        oninit: ({attrs}) => {
            enableEditor          = attrs.enableEditor;
            createProfileBlogPost = attrs.createProfileBlogPost;
        },

        /**
         * View Method
         * @param {Object} attrs View Attributes
         */
        view: ({attrs}) => {
            /**
             * State
             */
            const username = attrs.username;

            /**
             * Computed
             */
            const isTitleFilled = titleStream() && titleStream().length;

            /**
             * View
             */
            return [
                // Editor
                m(Editor, {
                    // State
                    titleStream,
                    editorRef
                }),

                // Buttons
                m('.clearfix.mt2', [
                    m('.col.col-12', [
                        isTitleFilled
                            ? m(LoadingBtn, {
                                className: 'my1 btn-outline left',
                                onclick: () => {
                                    const content = editorRef.textarea.value;

                                    createProfileBlogPost(username, titleStream(), content)
                                        .then(() => enableEditor(false))
                                    ;
                                }
                            }, 'Create New Post')
                            : null
                        ,

                        m(LoadingBtn, {
                            className: 'my1 btn-outline right',
                            onclick: () => enableEditor(false)
                        }, 'Cancel'),
                    ])
                ])
            ];
        }
    };
};