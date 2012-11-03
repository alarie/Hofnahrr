define([], function () {
    var DataRetriever = function (opts) {
        opts || (opts = {});
        if (!opts.el) {
            throw new Error('Element required!');
        }

        this.el = opts.el;

        var getValue = {
                input : function (el) {
                    var type = el[0].type || 'text',
                        val = el.val();
                    if (type === 'number') {
                        return val !== '' ? val * 1 : val;
                    }
                    else {
                        return val;
                    }
                },
                checkbox : function (el) {
                    var total = el.length,
                        checked = (el = el.filter(':checked')).length,
                        data = total > 1 ? [] : false,
                        value;

                    if (checked > 1) {
                        data = [];
                        el.each(function () {
                            value = this.value;
                            data.push(value === 'on' && opts.useBool ? true : value);
                        });
                    }
                    else if (checked === 1) {
                        value = el[0].value;
                        data = value === 'on' && opts.useBool ? true : el[0].value;
                    }
                    return data;
                },
                radio : function (el) {
                    // todo
                    return el.filter(':checked').val() || '';
                },
                img : function (el) {
                    return el.attr('src') || '';
                },
                select : function (el) {
                    var data = null;
                    if (el[0].multiple) {
                        data = [];
                        el.find(':selected').each(function () {
                            data.push($(this).val());
                        });
                    }
                    else {
                        data = el.find(':selected').val();
                    }
                    
                    return data;
                }
            },
            
            getName = function (name) {
                var names;
                if (name.indexOf('[') > -1) {
                    names = name.match(/\[([a-z0-9_\-]*)\]/gi);
                    name = name.split('[')[0];
                    names.splice(0, 0, name);
                    name = names;
                }
                return name;
            },

            getHash = function (names, hash) {
                var name = names.shift(),
                    len, n, curr,
                    data;

                data = (hash[name] || (hash[name] = {}));

                for (n = 0, len = names.length; n < len; n += 1) {
                    curr = names[n].replace(/\[|\]/g, '');
                    if (curr === '') {
                        // TODO arrays
                        data = null;
                    }
                    else {
                        if (!data[curr]) {
                            data[curr] = {};
                        }
                        data = data[curr];
                    }
                }

                return data;
            };

        this.getData = function (inputName) {
            var hash = {},
                data,
                namedSelector = '[name' +
                    (typeof inputName !== 'undefined' ? ('^="' + inputName + '"') : '') +
                    ']',
                type,
                tagName,
                name,
                origName,
                last,
                namedItems = this.el.find(namedSelector);
                
            namedItems.each(function () {

                tagName = this.nodeName.toLowerCase();
                origName = this.getAttribute('name');
                name = getName(origName);
                
                if (_.isArray(name)) {
                    last = name.splice(-1);
                    last = last[0].replace(/\[|\]/g, '');

                    if (!(data = getHash(name, hash))) {
                        return;
                    }

                    name = last;
                }
                else {
                    data = hash;
                }

                if (data[name]) {
                    return;
                }

                if (tagName === 'input' && (type = this.type)) {
                    if (type !== 'checkbox' && type !== 'radio') {
                        type = 'input';
                        data[name] = getValue[type]($(this));
                    }
                    else {
                        var peers = namedItems.filter('[name="' + origName + '"]');
                        data[name] = getValue[type](peers);
                    }
                }
                else if (tagName === 'select') {
                    data[name] = getValue.select($(this));
                }
                else if (tagName === 'textarea') {
                    data[name] = getValue.input($(this));
                }
                else if (getValue[tagName]) {
                    data[name] = getValue[tagName]($(this));
                }
            });
            return hash;
        };

        return this;
    };

    return DataRetriever;

});
