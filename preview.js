const dm = new DataModel({
    data: () => {
        return {
            attributes: {
                author: {
                    r: 'Рамазан Куаныш',
                    v: 'dc11b2a9-b61c-4fa1-9042-056c291c4ffa'
                },
                docdate:   '2024-02-15',
                docnumber: 'PR-BLKM-248',
                docstatus: {
                    r: 'Отправлено на утверждение',
                    v: '3619894b-8c4c-4cc4-bceb-7e9e14024acf'
                },
                mainproject: {
                    r: 'Белкамит 3 очередь  (ЖК Adele) (блоки 1,2,3,4,5,6,7,8,9,10,11,12,35)',
                    v: '036ac49e-93d5-4480-9769-cb680c640d9d'
                },
                ourfirm: {
                    r: 'Qazaq Stroy Almaty',
                    v: 'bbbbb318-b7fe-420d-b8e0-0a50951cd2ce'
                },
                summ: '255'
            },
            attr: {
                user: ''
            },
            rolesList: ['user', 'test'],
            tables:    {
                items: {
                }
            }
        };
    },
    computed: {},
    watch:    {},
    methods:  {}
});

const div = createSVBEL('div', null, 'test-wrapper');

const input = dm.input('attributes.summ');
const inputDouble = dm.input('attributes.summ');
const html = dm.html('attributes.summ', function () { return `<span>${this.attributes.summ}</span>`; });

const custom = dm.custom('attributes.summ', function () {
    const el = createSVBEL('div');
    const span = createSVBEL('span', null, null, 'Кликнуть сюда -> ');
    const label = createSVBEL('span');

    span.style.userSelect = 'none';

    label.style.userSelect = 'none';
    label.style.cursor = 'pointer';
    label.textContent = this.attributes.summ;
    label.addEventListener('click', () => { el.eventChange(); });

    el.appendChild(span);
    el.appendChild(label);

    el.setValue = (value) => { label.textContent = value; };
    el.getInputValue = () => { return parseFloat(label.textContent) + 1; };

    return el;
});

const userInput = dm.input('attr.user');
const userHtml = dm.html('attr.user', function () { return `<span>${this.attr.user}</span>`; });

const list = dm.custom('rolesList', function () {
    const select = createSVBEL('select');

    this.rolesList.forEach((i) => {
        const opt = createSVBEL('option', null, null, i);

        select.appendChild(opt);
        select.addEventListener('change', () => {});
    });

    select.setValue = (value) => {
        const opt = createSVBEL('option', null, null, value);

        select.appendChild(opt);
    };

    return select;
});

dm.proxy.rolesList.push('sdfsdfdsfds');

console.log(dm);

div.appendChild(input);
div.appendChild(inputDouble);
div.appendChild(html);
div.appendChild(custom);
div.appendChild(list);
div.appendChild(userInput);
div.appendChild(userHtml);
panel.setContent(div);
