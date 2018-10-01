import m from 'mithril';

export const TextArea = {
    oninit: ({attrs}) => {
        if (attrs.value) attrs.input(attrs.value);
    },

    view: ({attrs}) => m('div', [
        m('label', attrs.label),
        m('textarea.textarea.bg-paper.charcoal.my1', {
            maxlength: attrs.maxlength,
            rows: attrs.rows || '4',
            placeholder: attrs.placeholder || '',
            oncreate: ({dom}) => dom.value = attrs.value || '',
            oninput: m.withAttr('value', attrs.input)
        })
    ])
};