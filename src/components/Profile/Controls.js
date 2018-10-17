import m from 'mithril';
import { Editor } from 'components/Editor';
import { LoadingBtn } from 'components/LoadingBtn';
import { Modal } from 'components/Modal';

/**
 * Profile Controls Component
 */
export const Controls = () => {
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
            const showEditor = attrs.showEditor;
            const username   = attrs.username;

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
                            onSaveEvent: (newTitle, newContent) => {
                                createProfileBlogPost(username, newTitle, newContent)
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
};