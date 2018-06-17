const m = require('mithril')
const titleCase = require('./titlecase-french.min.js')

module.exports.serializeFieldSet = function(fieldSet) {
    let res = {};
    Object.keys(fieldSet).forEach(function (o) {
        res[o] = fieldSet[o].value;
    });
    return res;
}

module.exports.deserializeFieldSet = function(data, fieldSet) {
    Object.keys(data).forEach(function (o) {
        if (fieldSet[o]) {
            fieldSet[o].value = data[o];
            fieldSet[o].valid = null;
        }
    });
}

module.exports.resetFieldSet = function(fieldSet) {
    Object.keys(fieldSet).forEach(function (o) {
        fieldSet[o].value = fieldSet[o].default;
        fieldSet[o].valid = null;
    });
}

module.exports.resetValidation = function(fieldSet) {
    Object.keys(fieldSet).forEach(function (o) {
        fieldSet[o].valid = null;
    });
}

module.exports.validateFieldSet = function (fieldSet) {
    return Object.keys(fieldSet).every(function (k) {
        return fieldSet[k].validate();
    })
}

function processFilter(f, s, rEx) {
    switch (f.func) {
        case 'titlecase': {
            return titleCase.convert(s)
        }

        case 'replace': {
            return s.replace(rEx, f.pattern)
        }

        case 'eval': {
            switch (f.op) {
                case 'eq':  return (s === f.val)
                case 'neq': return (s !== f.val)
                case 'gt': return (s > f.val)
                case 'lt': return (s < f.val)
                case 'gte': return (s >= f.val)
                case 'lte': return (s <= f.val)
            }
        }
    }
}

module.exports.InputField = {
    oninit: function (vnode) {
        let params = vnode.attrs;
        params.regEx = new RegExp(params.regEx)
        let self = this;
        self.validated = false;
        self.validate = function () {
            if (self.validated) return;
            let isValid = params.regEx.test(params.fieldSet[params.name].value);
            if (isValid) {
                if (params.filter) {
                    let filtered = processFilter(params.filter, params.fieldSet[params.name].value, params.regEx);
                    if (filtered === false) {
                        isValid = false;
                    } else if (filtered !== true) {
                        params.fieldSet[params.name].value = filtered;
                    }
                };
            };
            params.fieldSet[params.name].valid = isValid;
            return isValid;
        }
        self.onChange = function (e) {
            params.fieldSet[params.name].value = e.target.value;
            self.validated = false;
            self.validate();
            self.validated = true;
            if (typeof params.onChange === 'function') {
                params.onChange(e, params.fieldSet[params.name]);
            };
        }
        self.onExit = function () {
            self.validate();
            self.validated = false;
        }
        if (!params.fieldSet[params.name]) {
            params.fieldSet[params.name] = {
                value: params.defaultValue,
                valid: null,
                default: params.defaultValue,
                validate: self.validate
            }
        }
    },
    onremove: function (vnode) {
        let params = vnode.attrs;
        delete params.fieldSet[params.name]
    },
    view: function (vnode) {
        let params = vnode.attrs;
        let self = this;

        let isValid = params.fieldSet[params.name].valid

        return m('.form-group.row' + (params.center ? '.justify-content-center' : ''), m((params.short ? '.col-sm-6' : '.col'), [
            m('label', {'for': params.name}, params.label),
            m('input.form-control'  + (params.small ? '.form-control-sm' : '') + (isValid === true ? '.is-valid' : isValid === false ? '.is-invalid' : ''), {
                oncreate: function (vdom) {
                    if (params.autofocus) {
                        vdom.dom.focus();
                    }
                },
                id: params.name,
                name: params.name,
                type: params.type || 'text',
                placeholder: params.label,
                value: params.fieldSet[params.name].value,
                onchange: self.onChange,
                onblur: self.onExit,
                disabled: params.disabled || false,
                autocomplete: params.autocomplete ? 'on' : 'off',
                autocapitalize: params.autocapitalize ? 'on' : 'off',
                autocorrect: params.autocorrect ? 'on' : 'off',
                spellcheck: params.autocorrect
            }),
            (isValid === true && params.successText) ? m('div.valid-feedback', params.successText) :
            (isValid === false && params.errorText) ? m('div.invalid-feedback', params.errorText) : 
            (params.helpText) ? m('small.form-text.text-muted', params.helpText) : ''
        ]))
    }
}

module.exports.SelectField = {
    oninit: function (vnode) {
        let params = vnode.attrs;
        params.regEx = new RegExp(params.regEx)
        let self = this;
        self.validated = false;
        self.validate = function () {
            if (self.validated) return;
            let isValid = true;
            if (isValid) {
                if (params.filter) {
                    let filtered = processFilter(params.filter, params.fieldSet[params.name].value, params.regEx);
                    if (filtered === false) {
                        isValid = false;
                    } else if (filtered !== true) {
                        params.fieldSet[params.name].value = filtered;
                    }
                };
            };
            params.fieldSet[params.name].valid = isValid;
            return isValid;
        }
        self.onChange = function (e) {
            params.fieldSet[params.name].value = e.target.value;
            self.validated = false;
            self.validate();
            self.validated = true;
            if (typeof params.onChange === 'function') {
                params.onChange(e, params.fieldSet[params.name]);
            };
        }
        self.onExit = function () {
            self.validate();
            self.validated = false;
        }
        if (!params.fieldSet[params.name]) {
            params.fieldSet[params.name] = {
                value: params.defaultValue,
                valid: null,
                default: params.defaultValue,
                validate: self.validate
            }
        }
    },
    onremove: function (vnode) {
        let params = vnode.attrs;
        delete params.fieldSet[params.name]
    },
    view: function (vnode) {
        let params = vnode.attrs;
        let self = this;

        let isValid = params.fieldSet[params.name].valid

        return m('.form-group.row' + (params.center ? '.justify-content-center' : ''), m((params.short ? '.col-sm-6' : '.col'), [
            m('label', {'for': params.name}, params.label),
            m('select.form-control'  + (params.small ? '.form-control-sm' : '') + (isValid === true ? '.is-valid' : isValid === false ? '.is-invalid' : ''), {
                oncreate: function (vdom) {
                    if (params.autofocus) {
                        vdom.dom.focus();
                    }
                },
                id: params.name,
                name: params.name,
                onchange: self.onChange,
                onblur: self.onExit,
                disabled: params.disabled || false
            }, params.options.map((o) => {
                return m('option', {key: o.value, value: o.value, selected: o.value === params.fieldSet[params.name].value}, o.name)
            })),
            (isValid === true && params.successText) ? m('div.valid-feedback', params.successText) :
            (isValid === false && params.errorText) ? m('div.invalid-feedback', params.errorText) : 
            (params.helpText) ? m('small.form-text.text-muted', params.helpText) : ''
        ]))
    }
}