import m from 'mithril';

/**
 * InputText Component
 */
export const InputText = {
    /**
     * Oninit Method
     * @param {Object} attrs View Attributes
     */
    oninit: ({attrs}) => {
        if (attrs.value) attrs.input(attrs.value);
    },

    /**
     * View Method
     * @param {Object} attrs View Attributes
     */
    view: ({attrs}) => m('div', [
        m('label', attrs.label),
        m('input.input.bg-paper.charcoal.my1', {
            type: attrs.type || 'text',
            placeholder: attrs.placeholder || '',
            oncreate: ({dom}) => dom.value = attrs.value || '',
            oninput: m.withAttr('value', attrs.input)
        })
    ])
};