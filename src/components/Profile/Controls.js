import m from 'mithril';
import { Editor } from 'components/Editor';
import { LoadingBtn } from 'components/LoadingBtn';
import { Modal } from 'components/Modal';

/**
 * Profile Controls Component
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
        const showEditor = attrs.showEditor;
        const username   = attrs.username;
        const blog       = attrs.blog;

        /**
         * Actions
         */
        const enableEditor          = attrs.enableEditor;
        const createProfileBlogPost = attrs.createProfileBlogPost;
        const getProfileBlogPage    = attrs.getProfileBlogPage;
        const getProfileBlogPageNos = attrs.getProfileBlogPageNos;

        /**
         * View
         */
        return [
            m(LoadingBtn, { className: 'btn-outline', onclick: () => enableEditor(true) }, 'New Post'),
    
            showEditor
                ? m(Modal, {
                    enableModal: enableEditor,
                }, [
                    m(Editor, {
                        // State
                        username,
                        blog,
    
                        // Actions
                        createProfileBlogPost,
                        enableEditor,
                        getProfileBlogPage,
                        getProfileBlogPageNos
                    })
                ])
                : null
            ,
        ];
    }
};