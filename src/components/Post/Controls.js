import m from 'mithril';
import { Editor } from 'components/Editor';
import { Btn } from 'components/Btn';
import { Modal } from 'components/Modal';

export const Controls = {
    view: ({attrs}) => [
        m(Btn, { className: 'mx1', onclick: () => attrs.showPostEditor(true) }, 'Edit'),

        attrs.showEditor
            ? m(Modal, {
                showModal: attrs.showPostEditor,
            }, [
                m(Editor, {
                    // State
                    username: attrs.username,
                    title: attrs.title,
                    content: attrs.content,
                    doc_id: attrs.doc_id,

                    // Actions
                    updateBlogPost: attrs.updateBlogPost,
                    getPost: attrs.getPost,
                    showPostEditor: attrs.showPostEditor
                })
            ])
            : null
        ,
    ]
};