import m from 'mithril';
import { compose } from 'util';

const createApp = (update, navigator, configs) => {
    navigator.register(configs);

    return {
        navigator,
        view({attrs}) {
            const model = attrs.model;
            const Component = navigator.getComponent(model.page);
            return m(Component, { model });
        }
    };
};

const createNavigator = (update) => {
    // Map of page ID to Component
    const components = {};

    // Map of page ID to Navigation Method
    const map = {};

    // Framework Routes
    const routes = {};

    return {
        getComponent: route => components[route],

        register(configs) {
            configs.forEach((c) => {
                const component = c.component; // considering removing this line
                components[c.page] = component;
                routes[c.route] = c.key;

                map[c.page] = (params) => {
                    const updateModel = model => Object.assign(model, { page: c.page });

                    if (component.navigating)
                        component.navigating(params, f => update(compose(f, updateModel)));
                    else
                        update(updateModel);
                };
            });
        },

        navTo(page, params) {
            const target = map[page];
            if (target) target(params);
        }
    };
};

export {
    createApp,
    createNavigator
};