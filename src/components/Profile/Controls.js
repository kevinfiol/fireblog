import m from 'mithril';
import { Editor } from 'components/Editor';
import { Btn } from 'components/Btn';
import { Modal } from 'components/Modal';

export const Controls = {
    view: ({attrs}) => [
        m(Btn, { className: 'mx1', onclick: () => attrs.showPostEditor(true) }, '+ New Post'),

        attrs.showEditor
            ? m(Modal, {
                showModal: attrs.showPostEditor,
            }, [
                m(Editor, {
                    // State
                    username: attrs.username,
                    blog: attrs.blog,

                    // Actions
                    createBlogPost: attrs.createBlogPost,
                    showPostEditor: attrs.showPostEditor,
                    getBlogPage: attrs.getBlogPage
                })
            ])
            : null
        ,
    ]
};