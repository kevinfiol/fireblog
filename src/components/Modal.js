import m from 'mithril';
import { LoadingBtn } from 'components/LoadingBtn';

/**
 * Modal Component
 */
export const Modal = {
    /**
     * Oninit Method
     */
    oninit() {
        document.body.style.overflow = 'hidden';
    },

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
     * Onremove Method
     */
    onremove() {
        document.body.style.overflow = '';
    },

    /**
     * View Method
     * @param {Object} attrs View Attributes
     * @param {Object} children Child Components 
     */
    view({attrs, children}) {
        /**
         * View
         */
        return m('.z4.fixed.left-0.right-0.top-0.bottom-0.charcoal.bg-paper.p2.overflow-auto', [
            m('.max-width-3.mx-auto', [
                m('.col.col-12.my3', [
                    m(LoadingBtn, {
                        className: 'right mx1 btn-outline',
                        onclick: () => {
                            if (attrs.cancelMethod) attrs.cancelMethod();
                            attrs.enableModal(false);
                        }
                    }, 'Cancel'),
    
                    attrs.saveMethod
                        ? m(LoadingBtn, {
                            className: 'right mx1 btn-outline',
                            disabled: attrs.disabledCondition || false,
                            onclick: () => {
                                attrs.saveMethod();
                                attrs.enableModal(false);
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