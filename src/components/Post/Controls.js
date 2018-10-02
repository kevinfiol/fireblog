import m from 'mithril';
import { Editor } from 'components/Editor';
import { Btn } from 'components/Btn';
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
        const username = attrs.username;
        const doc_id = attrs.doc_id;
        const title = attrs.title;
        const content = attrs.content;
        const showEditor = attrs.showEditor;

        /**
         * Actions
         */
        const showPostEditor = attrs.showPostEditor;
        const deleteBlogPost = attrs.deleteBlogPost;
        const updateBlogPost = attrs.updateBlogPost;
        const getPost = attrs.getPost;

        /**
         * Computed
         */

        return [
            m(Btn, { className: 'mx1', onclick: () => showPostEditor(true) }, 'Edit'),
    
            m(ConfirmBtn, {
                className: 'mx1',
                label: 'Delete',
                action: () => {
                    deleteBlogPost(doc_id)
                        .then(() => {
                            // Route back to profile upon deletion
                            m.route.set(`/u/${username}`);
                        })
                    ;
                }
            }),
    
            showEditor
                ? m(Modal, {
                    showModal: showPostEditor,
                }, [
                    m(Editor, {
                        // State
                        username,
                        title,
                        content,
                        doc_id,
    
                        // Actions
                        updateBlogPost,
                        getPost,
                        showPostEditor
                    })
                ])
                : null
            ,
        ];
    }
};