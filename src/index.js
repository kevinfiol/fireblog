import m from 'mithril';
import stream from 'mithril/stream';
import model from 'model';
import { compose } from 'util';

// http://meiosis.js.org/wiki/04-Routing-A-Navigation-Without-Routes.html
// http://meiosis.js.org/tutorial/12-func-update-mithril.html

// const coffees = [
//     { id: "c1", title: "Coffee 1", description: "Description of Coffee 1" },
//     { id: "c2", title: "Coffee 2", description: "Description of Coffee 2" }
// ];

// const coffeeMap = coffees.reduce((result, next) => {
//     result[next.id] = next;
//     return result;
// }, {});

// const Coffee = (nav) => (_update) => ({
//     navigating(params, navigate) {
//         if (params && params.id) {
//             const coffee = coffeeMap[params.id];
//             navigate(model => Object.assign(model, { coffees, coffee: coffee.description }));
//         } else {
//             navigate(model => Object.assign(model, { coffees, coffee: null }));
//         }
//     } 
// });

// Routes
const IndexPage = 'IndexPage';
const StuffPage = 'StuffPage';

// Create App
const createApp = (update) => {
    const nav = createNavigator(update);

    nav.register([
        { key: IndexPage, component: Index(nav)(update) },
        { key: StuffPage, component: Stuff(nav)(update) }
    ]);
};

const update = stream();
const nav = createNavigator(update);
const app = createApp(update);


// Base View
const Base = (model, nav) => {
    const component = nav.getComponent(model.route);

    return {
        view() {
            return m('div', [
                component.view(model)
            ]);
        }
    };
};

// Create Navigator
const createNavigator = (update) => {
    const components = {};
    const map = {};

    return {
        getComponent: route => components[route],

        register(configs) {
            configs.forEach((c) => {
                const component = c.component; // considering removing this line
                components[c.key] = component;
                
                map[c.key] = (params) => {
                    const updateModel = model => Object.assign(model, { route: c.key });

                    if (component.navigating)
                        component.navigating(params, f => update(compose(f, updateModel)));
                    else
                        update(updateModel);

                    update(model => Object.assign(model, { route: c.key }));
                };
            });
        },

        
        navTo(route, params) {
            const target = map[route];
            if (target) target(params);
        }
    };
};





// const One = {
//     initializeComp: controller.getSignal('init'),

//     view({state}) {
//         return [
//             m('p', controller.getState('foo')),
//             m('button', {
//                 onclick: state.initializeComp
//             }, 'switch')
//         ];
//     }
// };

m.route(document.getElementById('app'), '/', {
    '/': {
        render: () => m(One)
    }
});