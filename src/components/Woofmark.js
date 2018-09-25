import m from 'mithril';
import woofmark from 'woofmark';

export const Woofmark = {
    view: ({attrs}) => m('.clearfix', [
        m('textarea.textarea.bg-black.white.my1', {
            rows: '6',
            style: { margin: 0, borderRadius: 0 },
            placeholder: attrs.placeholder || '',
            oncreate: ({dom}) => woofmark(dom, { html: false, wysiwyg: false }),
            oninput: m.withAttr('value', attrs.content)
        })
    ])
};