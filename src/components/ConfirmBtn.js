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
            const btnClassName = attrs.btnClassName;
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
                        m('span.btn.c-default', { className: btnClassName, style: { border: '0' } }, 'Are you sure?'),
    
                        m(LoadingBtn, {
                            className: btnClassName,
                            onclick: () => { action(); confirm = false; }
                        }, 'Yes'),
    
                        m(LoadingBtn, {
                            className: btnClassName,
                            onclick: () => confirm = false
                        }, 'No')
                    ]
                    : m(LoadingBtn, {
                        className: btnClassName,
                        onclick: () => confirm = true
                    }, label)
                ,
            ]);
        }
    };
};