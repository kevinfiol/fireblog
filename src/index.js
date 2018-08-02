import m from 'mithril';
import stream from 'mithril/stream';
import gstate from 'gstate';
import merge from 'deepmerge';
import { Index } from 'views/Index';
import { Profiles } from 'views/Profiles';

const update = stream();
const models = stream.scan(merge, gstate, update);
const nest = (update, prop) => (obj) => update({ [prop]: obj });

models.map((model) => {
    m.route(document.getElementById('app'), '/', {
        '/': {
            render: () => Index( nest(update, 'Index') )(model.Index)
        },

        '/profiles': {
            render: () => Profiles( nest(update, 'Profiles') )(model.Profiles)
        }
    });
});