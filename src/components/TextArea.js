import m from 'mithril';

/**
 * TextArea Component
 */
export const TextArea = () => {
    /**
     * Local State
     */
    let value;
    let inputStream;

    let maxlength;
    let rows;
    let placeholder;
    let textareaOncreate;

    return {
        /**
         * Oninit Method
         * @param {Object} attrs View Attributes
         */
        oninit: ({attrs}) => {
            value = attrs.value || '';
            inputStream = attrs.input;
            if (value) inputStream(value);

            maxlength = attrs.maxlength || '';
            rows = attrs.rows || '4';
            placeholder = attrs.placeholder || '';

            if (attrs.textareaOncreate) textareaOncreate = attrs.textareaOncreate;
            else textareaOncreate = ({dom}) => dom.value = value;
        },

        /**
         * View Method
         */
        view: () => m('div', [
            m('textarea.textarea.bg-paper.charcoal.my1', {
                maxlength,
                rows,
                placeholder,
                oncreate: textareaOncreate,
                oninput: m.withAttr('value', inputStream)
            })
        ])
    };
};