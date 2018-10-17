import m from 'mithril';
import { Editor } from 'components/Editor';
import { LoadingBtn } from 'components/LoadingBtn';
import { ConfirmBtn } from 'components/ConfirmBtn';
import { Modal } from 'components/Modal';

/**
 * Post Controls Component
 */
export const Controls = () => {
    /**
     * Actions
     */
    let enableEditor;
    let deletePost;
    let updatePost;
    let updateBlogTimestamp;
    let removeCache;

    return {
        /**
         * Oninit Method
         * @param {Object} attrs View Attributes
         */
        oninit: ({attrs}) => {
            enableEditor        = attrs.enableEditor;
            deletePost          = attrs.deletePost;
            updatePost          = attrs.updatePost;
            updateBlogTimestamp = attrs.updateBlogTimestamp;
            removeCache         = attrs.removeCache;
        },

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
             * View
             */
            return [
                m(LoadingBtn, { className: 'btn-outline mr1', onclick: () => enableEditor(true) }, 'Edit'),
        
                m(ConfirmBtn, {
                    className: 'mx1',
                    btnClassName: 'btn-outline mx1',
                    label: 'Delete',
                    action: () => {
                        m.route.set('/u/:username', { username });
                        const route = m.route.get();

                        deletePost(doc_id);
                        removeCache(route);
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

                            // Actions
                            onSaveEvent: (newTitle, newContent) => {
                                updatePost(doc_id, newTitle, newContent)
                                    .then(() => updateBlogTimestamp(username))
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