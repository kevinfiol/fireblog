import m from 'mithril';
import stream from 'mithril/stream';
import { Btn } from 'components/Btn';
import { InputText } from 'components/InputText';
import { Woofmark } from 'components/Woofmark';

export const Editor = () => {
    const title = stream('');
    const content = stream('');

    return {
        view: ({attrs}) => m('.clearfix', [
            m(InputText, {
                placeholder: 'title...',
                value: attrs.title || null,
                input: title
            }),
            
            m(Woofmark, {
                placeholder: 'content...',
                value: attrs.content || null,
                input: content
            }),

            title() && content()
                ? m(Btn, {
                    className: 'mx1 my2 btn-outline',
                    onclick: () => {
                        if (attrs.createBlogPost) {
                            // Creating Blog Post
                            attrs.createBlogPost(attrs.username, title(), content())
                                .then(() => attrs.getBlogPage(attrs.username, attrs.blog.page.pageNo))
                                .then(() => attrs.showPostEditor(false))
                            ;
                        } else if (attrs.updateBlogPost) {
                            // Editing Blog Post
                            attrs.updateBlogPost(attrs.doc_id, title(), content())
                                .then(() => attrs.getPost(attrs.doc_id))
                                .then(() => attrs.showPostEditor(false))
                            ;
                        }
                    }
                }, 'Save Post')
                : null
            ,
        ])
    };
}