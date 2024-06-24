/* global SvbPanel, SvbWindow, createSVBEL */

import './style.css';
import { DataModel } from './src/DataModel';

const contentBlock = document.querySelector('#contentBlock');
const panel = new SvbPanel();
const window = new SvbWindow(panel, { title: 'React Playground', maxSize: true });

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

contentBlock.appendChild(window);

// dm.bind('attribute.summ', new SvbInput({}))

// // DEFAULT
// const nomenclatureDM = new ListDM('catalog.nomeclature');
// const dm = new DataModel({}, {
//   watch: {
//     contractor() {
//       nomenclatureDM.filters.static = [{

//       }]

//       nomenclatureDM.loadData();
//     }
//   }
// });

// const table = nomenclatureDM.table('list');
// const contractorInput = dm.input('contractor');

(function () {
    const userUuid = '5125081c-fd4d-43b2-bfc2-55386cc19a04';
    const userData = fetch('https://cab.qazaqstroy.kz/svbapi', {
        method:  'POST',
        headers: { 'Content-type': 'application/json' },
        body:    JSON.stringify({
            action:  'checksession',
            name:    'users',
            session: userUuid,
            type:    'system'
        })
    }).then(res => res.json());

    userData.then((res) => {
        const userDM = new DataModel({
            data: () => ({
                user:               res.userSettings.user,
                availableIntefaces: res.interfaceSettings.available,
                currentInterface:   res.interfaceSettings.current,
                availablePoints:    res.pointSettings.available,
                currentPoint:       res.pointSettings.current
            }),
            watch: {
                currentInterface () {
                    console.log(this);
                }
            }
        });
        const userWidget = userDM.html('user', function () {
            return `
                <div class="profile__preview">
                    <div class="profile__login">${this.user.r}</div>
                    <div class="profile__icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="
                            M6.2774 8.33206C4.92785 9.00058 4 10.392 4 12.0001V14.9546C4 
                            16.2098 5.01753 17.2273 6.27273 17.2273H13.3182C14.5734 17.2273 
                            15.5909 16.2098 15.5909 14.9546V12.0001C15.5909 10.3919 14.663 
                            9.00053 13.3134 8.33203C12.5622 9.44607 11.2671 10.1818 9.79541 
                            10.1818C8.32371 10.1818 7.02861 9.44609 6.2774 8.33206Z" fill="#F8F8F8"></path>
                        <ellipse cx="9.79565" cy="5.75" rx="3.75" ry="3.75" fill="white"></ellipse>
                    </svg>
                    </div>
                </div>
            `;
        });
        const pointsSelect = userDM.custom('currentPoints', function () {
            const select = createSVBEL('select');

            select.setAttribute('autocomplete', 'off');
            select.appendChild(createSVBEL('option', null, null, 'Не выбрано'));

            this.availablePoints.forEach((i) => {
                const opt = createSVBEL('option', null, null, i.represent);

                if (this.currentPoint.uuid === i.uuid) opt.setAttribute('selected', 'selected');

                select.appendChild(opt);
            });

            return select;
        });
        const interfaceSelect = userDM.custom('currentInterface.uuid', function () {
            const select = createSVBEL('select');

            select.setAttribute('autocomplete', 'off');
            select.appendChild(createSVBEL('option', null, null, 'Не выбрано'));
            select.setValue = (value) => {
                select.querySelectorAll('option').forEach((i) => {
                    i.value === value
                        ? i.setAttribute('selected', 'selected')
                        : i.removeAttribute('selected');
                });
            };
            select.getInputValue = () => {
                return Array.from(select.querySelectorAll('option'))
                    .reduce((acc, curr) => {
                        if (curr.selected) acc = curr.value;

                        return acc;
                    }, null);
            };
            select.addEventListener('change', () => { select.eventChange(); });

            this.availableIntefaces.forEach((i) => {
                const opt = createSVBEL('option', null, null, i.represent);

                opt.value = i.uuid;

                if (this.currentInterface.uuid === i.uuid) opt.setAttribute('selected', 'selected');

                select.appendChild(opt);
            });

            return select;
        });

        div.appendChild(userWidget);
        div.appendChild(pointsSelect);
        div.appendChild(interfaceSelect);

        window.userDM = userDM;

        console.log(window.userDM);
    });
})();
