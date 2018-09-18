import m from 'mithril';
import { model } from 'state';
import actions from 'actions';

const { getProfileData } = actions.profile;

export const Profile = {
    oninit: ({attrs}) => {
        getProfileData(attrs.key);
    },

    view: ({attrs}) => {
        if (!model().profile.user) return null;

        return m('.clearfix', [
            m('.col.col-12.md-col-3.px1', [
                m('.col.col-12', m('h2', attrs.key)),
    
                m('.col.col-12', [
                    m('img.fit', {
                        src: model().profile.user.photoURL,
                        onerror: e => e.target.src = 'https://images2.imgbox.com/a9/72/O6bXtE7c_o.png'
                    }),
                ]),
    
                m('.col.col-12', m('code', model().profile.user.bio))
            ]),
    
            m('.col.col-12.md-col-9.px1.py3', [
                m('p', 'Lorem ipsum potato baby desu desu desu desu desu desu desu desu desu fam fam fam fam fam fam fam fam')
            ])
        ])
    }
}