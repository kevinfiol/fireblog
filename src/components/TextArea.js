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
            value       = attrs.value || '';
            inputStream = attrs.input;
            if (value) inputStream(value);

            maxlength   = attrs.maxlength   || '';
            rows        = attrs.rows        || '4';
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
                oninput: ({target}) => {
                    inputStream(target.value);
                    autoExpand(target);
                }
            })
        ])
    };
};

function autoExpand(field) {
    field.style.height = 'inherit';
    const computed = window.getComputedStyle(field);

    const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
        + parseInt(computed.getPropertyValue('padding-top'), 10)
        + field.scrollHeight
        + parseInt(computed.getPropertyValue('padding-bottom'), 10)
        + parseInt(computed.getPropertyValue('border-bottom-width'), 10)
    ;

    field.style.height = height + 'px';
}