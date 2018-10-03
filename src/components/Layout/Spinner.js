import m from 'mithril';

/**
 * Layout Spinner Component
 */
export const Spinner = {
    /**
     * View Method
     */
    view: () => m('.loading.p4.top-0.left-0.right-0.center', {
        style: { position: 'absolute', zIndex: '9999' }
    })
};