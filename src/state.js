const initialState = {
    global: {
        number: 100
    },

    Index: {
        name: 'Kevin',
        age: 26
    },

    Profiles: {
        count: 52,
        title: 'Profiles'
    }
};

const nestPatch = (patch, prop) => ({ [prop]: patch });

const nestUpdate = (update, prop) => (patch) => update( nestPatch(patch, prop) );

const nestComponent = (create, update, prop) => {
    const component = create( nestUpdate(update, prop) );
    return (model) => component(Object.assign({ global: model.global }, model[prop]));
};

export {
    initialState,
    nestPatch,
    nestUpdate,
    nestComponent
};