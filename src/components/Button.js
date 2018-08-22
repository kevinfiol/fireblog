import m from 'mithril';
import { model } from 'state';

export const Button = {
    view({attrs, children}) {
        return m('button.btn.btn-outline',
            Object.assign({}, attrs, { disabled: model().global.isLoading }),
            children
        );
    }
};