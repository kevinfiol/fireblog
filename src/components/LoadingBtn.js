import m from 'mithril';
import { model } from 'state';
import { Btn } from 'components/Btn';

/**
 * LoadingBtn Component
 */
export const LoadingBtn = {
    view: ({attrs, children}) => m(Btn,
        Object.assign({}, attrs, { disabled: model().isLoading || (attrs.altDisabled || false) }),
        children
    )
};