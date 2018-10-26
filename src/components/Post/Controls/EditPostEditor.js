import m from 'mithril';
import stream from 'mithril/stream';
import { LoadingBtn } from 'components/LoadingBtn';
import { Editor } from 'components/Editor';

export const EditPostEditor = () => {
    /**
     * Local State
     */
    const titleStream   = stream('');
    const contentStream = stream('');
    const editorRef = {};

    /**
     * Actions
     */
    let enableEditor;
    let updatePost;
    let updateBlogTimestamp;

    return {
        /**
         * Oninit Method
         * @param {Object} attrs View Attributes
         */
        oninit: ({attrs}) => {
            enableEditor        = attrs.enableEditor;
            updatePost          = attrs.updatePost;
            updateBlogTimestamp = attrs.updateBlogTimestamp;
        },

        /**
         * View Method
         * @param {Object} attrs View Attributes
         */
        view: ({attrs}) => {
            /**
             * State
             */
            const doc_id   = attrs.doc_id;
            const username = attrs.username;
            const title    = attrs.title;
            const content  = attrs.content;

            /**
             * View
             */
            return [
                // Editor
                m(Editor, {
                    // State
                    title,
                    content,
                    titleStream,
                    contentStream,
                    editorRef
                }),

                // Buttons
                m('.clearfix', [
                    m('.col.col-12', [
                        m(LoadingBtn, {
                            className: 'my1 btn-outline left',
                            onclick: () => {
                                contentStream( editorRef.textarea.value );

                                updatePost(doc_id, titleStream(), contentStream())
                                    .then(() => updateBlogTimestamp(username))
                                    .then(() => enableEditor(false))
                                ;
                            }
                        }, 'Save'),

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