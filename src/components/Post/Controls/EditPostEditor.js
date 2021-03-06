import m from 'mithril';
import stream from 'mithril/stream';
import { LoadingBtn } from 'components/LoadingBtn';
import { Editor } from 'components/Editor';

export const EditPostEditor = () => {
    /**
     * Local State
     */
    const titleStream   = stream('');
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
            // Prepopulate titleStream
            if (attrs.title) titleStream(attrs.title);

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
                    title,
                    content,
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
    
                                    updatePost(doc_id, titleStream(), content)
                                        .then(() => updateBlogTimestamp(username))
                                        .then(() => enableEditor(false))
                                    ;
                                }
                            }, 'Save Changes')
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