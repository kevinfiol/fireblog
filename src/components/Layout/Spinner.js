import m from 'mithril';

/**
 * Layout Spinner Component
 */
export const Spinner = {
    /**
     * View Method
     */
    view: () => m('.loading.pl2', {
        style: { height: '36px', zIndex: '9999' }
    })
};