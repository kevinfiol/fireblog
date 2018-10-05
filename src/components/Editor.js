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

    return {
        /**
         * View Method
         * @param {Object} attrs View Attributes
         */
        view: ({attrs}) => {
            /**
             * State
             */
            const username = attrs.username;
            const blog = attrs.blog;
            const doc_id = attrs.doc_id;
            const title = attrs.title;
            const content = attrs.content;

            /**
             * Actions
             */
            const enableEditor = attrs.enableEditor;
            const createBlogPost = attrs.createBlogPost || null;
            const updateBlogPost = attrs.updateBlogPost || null;
            const getBlogPage = attrs.getBlogPage || null;
            const getPost = attrs.getPost || null;
            const getBlogPageNumbers = attrs.getBlogPageNumbers || null;

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
                            if (createBlogPost) {
                                // Creating Blog Post
                                createBlogPost(username, titleStream(), contentStream())
                                    .then(() => getBlogPage(username, blog.page.pageNo))
                                    .then(() => getBlogPageNumbers(username))
                                    .then(() => enableEditor(false))
                                ;
                            } else if (updateBlogPost) {
                                // Editing Blog Post
                                updateBlogPost(doc_id, titleStream(), contentStream())
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