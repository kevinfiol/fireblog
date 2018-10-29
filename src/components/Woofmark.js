import m from 'mithril';
import woofmark from 'woofmark';

/**
 * Woofmark Component
 */
export const Woofmark = {
    /**
     * View Method
     * @param {Object} attrs View Attributes
     */
    view: ({attrs}) => m('div', [
        m('textarea.textarea.bg-paper.charcoal.mt1.mb0', {
            rows: '28',
            placeholder: attrs.placeholder,
            oncreate: ({dom}) => {
                dom.value = attrs.value || '';
                const woof = woofmark(dom, { html: false, wysiwyg: false });
                attrs.woofmarkRef.textarea = woof.textarea;
            }
        })
    ])
};