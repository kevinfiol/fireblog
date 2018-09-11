import m from 'mithril';

export const InputText = {
    oninit: ({attrs}) => {
        if (attrs.value) attrs.input(attrs.value);
    },

    view: ({attrs}) => m('div', [
        m('label', attrs.label),
        m('input.input.bg-black.white.my1', {
            type: attrs.type || 'text',
            placeholder: attrs.placeholder || '',
            oncreate: ({dom}) => dom.value = attrs.value || '',
            oninput: m.withAttr('value', attrs.input)
        })
    ])
};