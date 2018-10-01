import m from 'mithril';
import woofmark from 'woofmark';

export const Woofmark = {
    oninit: ({attrs}) => {
        if (attrs.value) attrs.input(attrs.value);
    },

    view: ({attrs}) => m('.clearfix', [
        m('textarea.textarea.bg-paper.charcoal.my1', {
            rows: '14',
            style: { margin: 0, borderRadius: 0 },
            placeholder: attrs.placeholder || '',
            oncreate: ({dom}) => {
                woofmark(dom, { html: false, wysiwyg: false });
                dom.value = attrs.value || '';
            },
            oninput: m.withAttr('value', attrs.input)
        })
    ])
};