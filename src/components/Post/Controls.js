import m from 'mithril';
import { Editor } from 'components/Editor';
import { LoadingBtn } from 'components/LoadingBtn';
import { ConfirmBtn } from 'components/ConfirmBtn';
import { Modal } from 'components/Modal';

/**
 * Post Controls Component
 */
export const Controls = {
    /**
     * View Method
     * @param {Object} attrs View Attributes
     */
    view: ({attrs}) => {
        /**
         * State
         */
        const username   = attrs.username;
        const doc_id     = attrs.doc_id;
        const title      = attrs.title;
        const content    = attrs.content;
        const showEditor = attrs.showEditor;

        /**
         * Actions
         */
        const enableEditor       = attrs.enableEditor;
        const deletePostBlogPost = attrs.deletePostBlogPost;
        const updatePostBlogPost = attrs.updatePostBlogPost;
        const getPost            = attrs.getPost;

        /**
         * View
         */
        return [
            m(LoadingBtn, { className: 'btn-outline mr1', onclick: () => enableEditor(true) }, 'Edit'),
    
            m(ConfirmBtn, {
                className: 'mx1',
                btnClassName: 'btn-outline mx1',
                label: 'Delete',
                action: () => {
                    deletePostBlogPost(doc_id)
                        .then(() => {
                            // Route back to profile upon deletion
                            m.route.set(`/u/${username}`);
                        })
                    ;
                }
            }),
    
            showEditor
                ? m(Modal, {
                    enableModal: enableEditor,
                }, [
                    m(Editor, {
                        // State
                        title,
                        content,

                        onSaveEvent: (newTitle, newContent) => {
                            updatePostBlogPost(doc_id, newTitle, newContent)
                                .then(() => getPost(doc_id))
                                .then(() => enableEditor(false))
                            ;
                        }
                    })
                ])
                : null
            ,
        ];
    }
};