import m from 'mithril';
import stream from 'mithril/stream';
import { LoadingBtn } from 'components/LoadingBtn';
import { InputText } from 'components/InputText';
import { Woofmark } from 'components/Woofmark';

/**
 * Editor Component
 */
export const Editor = () => {
    /**
     * Local State
     */
    const titleStream = stream('');
    const contentStream = stream('');

    /**
     * State
     */
    let username;
    let blog;
    let doc_id;
    let title;
    let content;

    /**
     * Actions
     */
    let enableEditor;
    let createProfileBlogPost;
    let updatePostBlogPost;
    let getProfileBlogPage;
    let getPost;
    let getProfileBlogPageNos;

    return {
        /**
         * Oninit Method
         * @param {Object} attrs View Attributes
         */
        oninit: ({attrs}) => {
            username = attrs.username;
            blog     = attrs.blog;
            doc_id   = attrs.doc_id;
            title    = attrs.title;
            content  = attrs.content;

            enableEditor          = attrs.enableEditor;
            createProfileBlogPost = attrs.createProfileBlogPost || null;
            updatePostBlogPost    = attrs.updatePostBlogPost    || null;
            getProfileBlogPage    = attrs.getProfileBlogPage    || null;
            getPost               = attrs.getPost               || null;
            getProfileBlogPageNos = attrs.getProfileBlogPageNos || null;
        },

        /**
         * View Method
         */
        view: () => {
            /**
             * Computed
             */
            const isEditorFilled = titleStream() && contentStream();

            /**
             * View
             */
            return m('.clearfix', [
                m(InputText, {
                    placeholder: 'title...',
                    value: title || null,
                    input: titleStream
                }),
                
                m(Woofmark, {
                    placeholder: 'content...',
                    value: content || null,
                    input: contentStream
                }),
    
                isEditorFilled
                    ? m(LoadingBtn, {
                        className: 'mx1 my2 btn-outline',
                        onclick: () => {
                            if (createProfileBlogPost) {
                                // Creating Blog Post
                                createProfileBlogPost(username, titleStream(), contentStream())
                                    .then(() => getProfileBlogPage(username, blog.page.pageNo))
                                    .then(() => getProfileBlogPageNos(username))
                                    .then(() => enableEditor(false))
                                ;
                            } else if (updatePostBlogPost) {
                                // Editing Blog Post
                                updatePostBlogPost(doc_id, titleStream(), contentStream())
                                    .then(() => getPost(doc_id))
                                    .then(() => enableEditor(false))
                                ;
                            }
                        }
                    }, 'Save Post')
                    : null
                ,
            ]);
        }
    };
};