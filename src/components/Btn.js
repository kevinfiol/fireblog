import m from 'mithril';
import { model } from 'state';

export const Btn = {
    view: ({attrs, children}) => m('button.btn',
        Object.assign({}, attrs, { disabled: model().isLoading }),
        children
    )
};