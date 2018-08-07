import m from 'mithril';
import { SignUpForm } from 'components/SignUpForm';
import { Counter } from 'components/Index/Counter';

export const Index = (update) => {
    const counter = Counter(update);
    const signUpForm = SignUpForm();

    return (model) => {
        return m('div', [
            signUpForm()
            // counter(model)
        ]);
    };
};