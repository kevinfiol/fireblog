import m from 'mithril';
import { LoadingBtn } from 'components/LoadingBtn';

/**
 * ConfirmBtn Component
 */
export const ConfirmBtn = () => {
    /**
     * Local State & Actions
     */
    let confirm = false;
    let className;
    let btnClassName;
    let label;
    let action;

    return {
        /**
         * Oninit Method
         * @param {Object} attrs View Attributes
         */
        oninit: ({attrs}) => {
            className    = attrs.className;
            btnClassName = attrs.btnClassName;
            label        = attrs.label;
            action       = attrs.action;
        },

        /**
         * View Method
         * @param {Object} attrs View Attributes
         */
        view: () => {
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