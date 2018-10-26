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
     * State
     */
    let title;
    let content;
    let titleStream;
    let contentStream;
    let editorRef;

    return {
        /**
         * Oninit Method
         * @param {Object} attrs View Attributes
         */
        oninit: ({attrs}) => {
            title         = attrs.title   || null;
            content       = attrs.content || null;
            titleStream   = attrs.titleStream;
            contentStream = attrs.contentStream;
            editorRef     = attrs.editorRef;
        },

        /**
         * View Method
         */
        view: () => {
            /**
             * View
             */
            return [
                m(InputText, {
                    placeholder: 'title...',
                    value: title,
                    input: titleStream
                }),
                
                m(Woofmark, {
                    placeholder: 'content...',
                    value: content,
                    woofmarkInstance: editorRef,
                })
            ];
        }
    };
};