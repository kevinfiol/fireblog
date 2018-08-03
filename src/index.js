import m from 'mithril';
import stream from 'mithril/stream';
import gstate from 'gstate';
import merge from 'deepmerge';
import { Index } from 'views/Index';
import { Profiles } from 'views/Profiles';

const update = stream();
const models = stream.scan(merge, gstate, update);
// const models = stream.scan((model, f) => f(model), gstate, update);
const nest = (update, prop) => (obj) => update({ [prop]: obj });
// const nest = (update, prop) => {
//     return (f) => {
//         update((model) => {
//             model[prop] = f(model[prop]);
//             return model;
//         });
//     };
// };

const nestComponent = (create, update, prop) => {
    const component = create( nest(update, prop) );
    const res = Object.assign({}, component);

    if (component.model) res.model = () => ({ [prop]: component.model() });
    if (component.view) res.view = (model) => component.view(model[prop]);

    return res;
};

// const IndexView = Index( nest(update, 'Index') );
// const ProfilesView = Profiles( nest(update, 'Profiles') );

const IndexView = nestComponent(Index(), update, 'Index');
const ProfilesView = nestComponent(Profiles(), update, 'Profiles');

models.map((model) => {
    m.route(document.getElementById('app'), '/', {
        '/': {
            render: () => IndexView.view(model)
            // render: () => IndexView(model.Index)
        },

        '/profiles': {
            render: () => ProfilesView.view(model)
            // render: () => ProfilesView(model.Profiles)
        }
    });
});