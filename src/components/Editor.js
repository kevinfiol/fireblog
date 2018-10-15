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
    const woofmarkInstance = {};

    /**
     * State
     */
    let title;
    let content;

    /**
     * Actions
     */
    let onSaveEvent;

    return {
        /**
         * Oninit Method
         * @param {Object} attrs View Attributes
         */
        oninit: ({attrs}) => {
            title       = attrs.title   || null;
            content     = attrs.content || null;
            onSaveEvent = attrs.onSaveEvent;
        },

        /**
         * View Method
         */
        view: () => {
            /**
             * Computed
             */
            const isEditorFilled = titleStream();

            /**
             * View
             */
            return m('.clearfix', [
                m(InputText, {
                    placeholder: 'title...',
                    value: title,
                    input: titleStream
                }),
                
                m(Woofmark, {
                    placeholder: 'content...',
                    value: content,
                    woofmarkInstance,
                }),
    
                isEditorFilled
                    ? m(LoadingBtn, {
                        className: 'mx1 my2 btn-outline',
                        onclick: () => {
                            const content = woofmarkInstance.textarea.value;
                            onSaveEvent( titleStream(), content );
                        }
                    }, 'Save Post')
                    : null
                ,
            ]);
        }
    };
};