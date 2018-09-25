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
            
            m(Woofmark, { placeholder: 'content...', content }),

            title() && content()
                ? m(Btn, {
                    className: 'mx1 my2 btn-outline',
                    onclick: () => {
                        if (attrs.createBlogPost) {
                            attrs.createBlogPost(attrs.username, title(), content())
                                .then(() => attrs.getBlogPage(attrs.username, 1))
                            ;
                        }
                    }
                }, 'Save Post')
                : null
            ,
        ])
    };
};