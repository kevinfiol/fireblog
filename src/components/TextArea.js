import m from 'mithril';

export const TextArea = {
    oninit: ({attrs}) => {
        if (attrs.value) attrs.input(attrs.value);
    },

    view: ({attrs}) => m('div', [
        m('label', attrs.label),
        m('textarea.textarea.bg-black.white.my1', {
            rows: attrs.rows || '4',
            placeholder: attrs.placeholder || '',
            oncreate: ({dom}) => dom.value = attrs.value || '',
            oninput: m.withAttr('value', attrs.input)
        })
    ])
};