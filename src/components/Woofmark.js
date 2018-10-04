import m from 'mithril';
import woofmark from 'woofmark';
import { TextArea } from 'components/TextArea';

/**
 * Woofmark Component
 */
export const Woofmark = {
    /**
     * View Method
     * @param {Object} attrs View Attributes
     */
    view: ({attrs}) => m('.clearfix', [
        m(TextArea, {
            value: attrs.value,
            input: attrs.input,
            rows: '14',
            placeholder: attrs.placeholder, 
            textareaOncreate: ({dom}) => {
                woofmark(dom, { html: false, wysiwyg: false });
                dom.value = attrs.value || '';
            }
        })
    ])
};