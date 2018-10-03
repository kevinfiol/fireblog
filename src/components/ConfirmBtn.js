import m from 'mithril';
import { LoadingBtn } from 'components/LoadingBtn';

/**
 * ConfirmBtn Component
 */
export const ConfirmBtn = () => {
    /**
     * Local State
     */
    let confirm = false;

    return {
        /**
         * View Method
         * @param {Object} attrs View Attributes
         */
        view: ({attrs}) => {
            /**
             * State
             */
            const className = attrs.className;
            const label = attrs.label;

            /**
             * Actions
             */
            const action = attrs.action;

            /**
             * View
             */
            return m('span', { className }, [
                confirm
                    ? [
                        m('span.btn.c-default', 'Are you sure?'),
    
                        m(LoadingBtn, {
                            onclick: () => { action(); confirm = false; }
                        }, 'Yes'),
    
                        m(LoadingBtn, { onclick: () => confirm = false }, 'No')
                    ]
                    : m(LoadingBtn, { onclick: () => confirm = true }, label)
                ,
            ]);
        }
    };
};