import m from 'mithril';
import { LoadingBtn } from 'components/LoadingBtn';

/**
 * Modal Component
 */
export const Modal = {
    /**
     * Onbeforeremove Method
     * @param {Object} dom Reference to DOM Object
     */
    onbeforeremove({dom}) {
        dom.classList.add('exit');

        return new Promise(res => {
            dom.addEventListener('animationend', res);
        });
    },

    /**
     * View Method
     * @param {Object} attrs View Attributes
     * @param {Object} children Child Components 
     */
    view({attrs, children}) {
        /**
         * State
         */
        const disabledCondition = attrs.disabledCondition;

        /**
         * Actions
         */
        const saveMethod = attrs.saveMethod || null;
        const cancelMethod = attrs.cancelMethod || null;
        const enableModal = attrs.enableModal;

        /**
         * View
         */
        return m('.z4.fixed.left-0.right-0.top-0.bottom-0.charcoal.bg-paper.p3.overflow-auto', [
            m('.max-width-3.my3.mx-auto', [
                m('.col.col-12.my3', [
                    m(LoadingBtn, {
                        className: 'right mx1 btn-outline',
                        onclick: () => {
                            if (cancelMethod) cancelMethod();
                            enableModal(false);
                        }
                    }, 'Cancel'),
    
                    saveMethod
                        ? m(LoadingBtn, {
                            className: 'right mx1 btn-outline',
                            disabled: disabledCondition || false,
                            onclick: () => {
                                saveMethod();
                                enableModal(false);
                            }
                        }, 'Save')
                        : null
                    ,
    
                    m('.col.col-12.mt2', children)
                ])
            ])
        ]);
    }
};