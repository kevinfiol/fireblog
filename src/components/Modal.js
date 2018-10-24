import m from 'mithril';
// import { LoadingBtn } from 'components/LoadingBtn';

/**
 * Modal Component
 */
export const Modal = () => {
    return {
        /**
         * Oninit Method
         */
        oninit: () => {
            // Hide Body Overflow
            document.body.classList.add('overflow-hidden');
        },

        /**
         * Onbeforeremove Method
         * @param {Object} dom Reference to DOM Object
         */
        onbeforeremove: ({dom}) => {
            // Add Exit Animation Class
            dom.classList.add('exit');

            return new Promise(res => {
                dom.addEventListener('animationend', res);
            });
        },

        /**
         * Onremove Method
         */
        onremove: () => {
            // Re-enable Body Overflow
            document.body.classList.remove('overflow-hidden');
        },

        /**
         * View Method
         * @param {Object} attrs View Attributes
         * @param {Object} children Child Components 
         */
        view: ({children}) => {
            /**
             * View
             */
            return m('.z4.fixed.left-0.right-0.top-0.bottom-0.charcoal.bg-paper.overflow-auto', [
                m('.py4.px2', children)
            ]);
        }
    };
};