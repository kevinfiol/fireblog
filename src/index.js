import m from 'mithril';
import stream from 'mithril/stream';
import model from 'model';
import { compose } from 'util';
import { createApp, createNavigator } from './factories';

// http://meiosis.js.org/wiki/04-Routing-A-Navigation-Without-Routes.html
// http://meiosis.js.org/tutorial/12-func-update-mithril.html

const update = stream();
const nav = createNavigator(update);

const configs = [
    { page: 'IndexPage', component: Index(nav)(update), route: '/' },
    { page: 'StuffPage', component: Stuff(nav)(update), route: '/stuff' }
];

const app = createApp(update, nav, configs);
const models = stream.scan(0, model, update);

m.route(document.body, '/', )


// Base View
// const Base = (model, nav) => {
//     const component = nav.getComponent(model.route);

//     return {
//         view() {
//             return m('div', [
//                 component.view(model)
//             ]);
//         }
//     };
// };