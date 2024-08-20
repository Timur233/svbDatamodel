import SvbModel from '../../../src/SvbModel.js';
import '../../../scss/main.scss';
import SvbElement from '../../../src/components/SvbElement.js';

window.docConcreterequisitions = new SvbModel({
    mainproject:       null,
    project:           null,
    floor:             null,
    constructives:     null,
    quantity:          null,
    concretepumptypes: null,
    docdate:           null
}, 'doc', 'concreterequisitions');

const svbForm = window.docConcreterequisitions.vm.form({
    attributes: [
        {
            label:      'Объект',
            descriptor: 'mainproject',
            settings:   {
                type:           'catalog',
                typeObjectName: 'projects',
                placeholder:    'Начните вводить',
                filters:        {
                    static: [
                        {
                            preoperator:  'AND',
                            attribute:    'isfolder',
                            filteralias:  'Это блок?',
                            predicate:    '=',
                            value:        true,
                            postoperator: '',
                            represent:    true
                        }
                    ]
                }
            }
        },
        {
            label:      'Блок',
            descriptor: 'project',
            settings:   {
                type:           'catalog',
                typeObjectName: 'projects',
                placeholder:    'Начните вводить',
                filters:        {
                    static: [
                        {
                            preoperator:  'AND',
                            attribute:    'isfolder',
                            filteralias:  'Это блок?',
                            predicate:    '=',
                            value:        true,
                            postoperator: '',
                            represent:    true
                        }
                    ]
                }
            }
        },
        {
            label:      'Этаж',
            descriptor: 'floor',
            settings:   {
                type:        'number',
                placeholder: 'Укажите этаж'
            }
        },
        {
            label:      'Конструктив',
            descriptor: 'constructives',
            settings:   {
                type:           'catalog',
                typeObjectName: 'constructives',
                placeholder:    'Начните вводить',
                filters:        {
                    static: [
                        {
                            preoperator:  'AND',
                            attribute:    'forconcrete',
                            filteralias:  'Это блок?',
                            predicate:    '=',
                            value:        true,
                            postoperator: '',
                            represent:    true
                        }
                    ]
                }
            }
        },
        {
            label:      'Объем',
            descriptor: 'quantity',
            settings:   {
                type:        'number',
                placeholder: 'Объем',
                slots:       [{
                    content: 'М<sup>3</sup>'
                }]
            }
        },
        {
            label:      'Автобетононасос',
            descriptor: 'concretepumptypes',
            settings:   {
                type:           'catalog',
                typeObjectName: 'concretepumptypes',
                placeholder:    'Начните вводить'
            }
        },
        {
            label:      'Дата и время доставки',
            descriptor: 'docdate',
            settings:   {
                type:        'datetime-local',
                placeholder: '17.04.2024 15:00:00'
            }
        }
    ]
});
const summary = window.docConcreterequisitions.vm.custom({
    descriptor: 'summary',
    render:     () => {
        return `
            <div class="svb-form__filed svb-field">
                <label class="svb-field__label">Дата</label>
                <div class="svb-text">
                    <span class="svb-text__text">20.06.24</span>
                </div> 
            </div>
            <div class="svb-form__filed svb-field">
                <label class="svb-field__label">Автор</label>
                <div class="svb-text">
                    <span class="svb-text__text">ФИО автоматически*</span>
                </div> 
            </div>
        `;
    }
});
const buttonsGroup = SvbElement.create('div', null, 'app-form__buttons-group buttons-group buttons-group--column');
const saveButton = SvbElement.create('button', null, 'btn btn--primary', 'Сохранить');
const clearButton = SvbElement.create('button', null, 'btn btn--cancel btn--color-red', 'Сброс');

clearButton.addEventListener('click', () => {
    window.docConcreterequisitions.model.mainproject = null;
    window.docConcreterequisitions.model.project = null;
    window.docConcreterequisitions.model.floor = null;
    window.docConcreterequisitions.model.constructives = null;
    window.docConcreterequisitions.model.quantity = null;
    window.docConcreterequisitions.model.concretepumptypes = null;
    window.docConcreterequisitions.model.docdate = null;
});

buttonsGroup.appendChild(saveButton);
buttonsGroup.appendChild(clearButton);

window.docConcreterequisitions.watch('mainproject', (value) => {
    window.docConcreterequisitions.model.project = null;
    svbForm.getAttribute('project').setFilters({
        static: [
            {
                preoperator:  'AND',
                attribute:    'folder',
                filteralias:  'Основной проект',
                predicate:    '=',
                value:        value?.v,
                postoperator: '',
                represent:    true
            }
        ]
    });
});

// нужно легкое обращение к врапперу
// window.docConcreterequisitions.setFilters(
//     'mainProject', [{
//         test: 123
//     }]
// );

svbForm.getInstance().state.attributes.forEach((attr) => {
    const inputInstance = attr.input.getInstance();

    inputInstance.searchHandling = catalogHelper;
});

async function catalogHelper (typeObjectName, search = '', filters = { static: [], user: [] }) {
    console.log(filters);
    const req = await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            session:    '6aadd550-648a-4c8d-9a0a-87ce48cc43c7',
            type:       'catalog',
            action:     'select',
            reqoptions: {
                name:     typeObjectName,
                datatype: 'list',
                lang:     'ru',
                filters,
                sort:     [],
                limit:    10,
                page:     1,
                search
            },
            resoptions: {
                metadata: false,
                view:     false,
                data:     true,
                filters:  false,
                sort:     true
            }
        })
    }).then(res => res.json());

    if (req.status === 200) {
        const { columns, rows } = req.result.catalog[typeObjectName].list;

        return rows.map((row) => {
            return columns.reduce((acc, curr, index) => {
                acc[curr] = row[index];

                return acc;
            }, {});
        });
    }

    return [];
}

document.querySelector('#content-block').appendChild(svbForm);
document.querySelector('#content-block').appendChild(summary);
document.querySelector('#content-block').appendChild(buttonsGroup);
