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
        m('textarea.textarea.bg-paper.charcoal.my1', {
            rows: '14',
            placeholder: attrs.placeholder,
            oncreate: ({dom}) => {
                dom.value = attrs.value || '';
                const woof = woofmark(dom, { html: false, wysiwyg: false });
                attrs.woofmarkInstance.textarea = woof.textarea;
            }
        })
    ])
};