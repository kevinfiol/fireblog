import m from 'mithril';
import stream from 'mithril/stream';
import merge from 'deepmerge';
import { initialState, nestComponent } from 'state';
import { Index } from 'views/Index';
import { Profiles } from 'views/Profiles';

const update = stream();
const models = stream.scan(merge, initialState, update);

const IndexView = nestComponent(Index, update, 'Index');
// const ProfilesView = nestComponent(Profiles(), update, 'Profiles');

models.map((model) => {
    m.route(document.getElementById('app'), '/', {
        '/': {
            render: () => m( IndexView(model) )
        },

        // '/profiles': {
        //     render: () => ProfilesView.view(model)
        // }
    });
});