import m from 'mithril';
import stream from 'mithril/stream';
import merge from 'deepmerge';
import meiosisTracer from 'meiosis-tracer';

const initialState = {
    global: {
        user: null,
        isLoading: false,
        signUpMsg: null,
        signInMsg: null,
        showSignUp: false,
        showSignIn: false 
    }
};

const update = stream();
const model = stream.scan(merge, initialState, update);

meiosisTracer({ selector: '#tracer', streams: [ { stream: model, hide: true } ] });
model.map(m.redraw);

export { update, model, initialState };