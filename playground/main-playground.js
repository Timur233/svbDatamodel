import SvbModel from '../src/SvbModel';
import '../scss/main.scss';

window.DataModel = SvbModel;
window.test = new SvbModel({
    a: 1,
    b: 2,
    c: 3
});

const testComponent = window.test.vm.custom({
    descriptor: 'a',
    render:     (value) => {
        return `
            <input value="${value}"/>
            <b>${value}</b>
        `;
    },
    update: function (value) {
        this.wrapper.querySelector('input').value = value;
        this.wrapper.querySelector('b').textContent = value;
    }
});

const newTestComponent = window.test.vm.custom({
    id:         'testComponent',
    descriptor: 'a',
    render:     function (value, changeEvent) {
        const input = document.createElement('input');

        input.value = value;
        input.addEventListener('input', () => {
            this.eventChange(input.value)
        });

        return input;
    },
    update: function (value) {
        this.component.value = value;
    }
});

const input = window.test.vm.input({
    descriptor: 'a'
})

const input1 = window.test.vm.input({
    descriptor: 'b',
    settings: {
        type: 'catalog',
        slots: [{
            title: 'firstSlot',
            content: 'М<sup>3</sup>'
        }]
    }
});

const svbForm = window.test.vm.form({
    attributes: [
        {
            label: 'Объем',
            descriptor: 'a',
            settings: {
                type: 'text',
                placeholder: 'Объем',
                slots: [{
                    content: 'М<sup>3</sup>'
                }]
            }
        },
        {
            label: 'Дата и время доставки',
            descriptor: 'b',
            settings: {
                type: 'text',
                placeholder: '17.04.2024 15:00:00'
            }
        }
    ]
});

const computedPreview = window.test.vm.custom({
    descriptor: 'c',
    render:     (value) => {
        return `
            first computed: 
            <b>${value}</b>
        `;
    }
});


window.test.computed(
    'c', ['a', 'b'],
    function(a, b) {
        return Number(a) + Number(b); 
    })

document.body.appendChild(svbForm);
// document.body.appendChild(newTestComponent);
// document.body.appendChild(input);
// document.body.appendChild(input1);
// document.body.appendChild(computedPreview);

// window.data = new Model({
//     instance: {
//         attr: {
//             docnumber: {
//                 value: '322'
//             },
//             contractor: {
//                 value: {
//                     r: 'test',
//                     v: '24'
//                 }
//             }
//         },
//         tableItems: [{
//             rownumber: 1,
//             summ:      225
//         }]
//     }
// }, 'document', 'workcomplimantation_acts');

// window.reactiveInput = document.createElement('input');
// window.reactiveInput.value = window.data.instance.attr.docnumber.value;
// window.reactiveInput.addEventListener('input', () => {
//     window.data.instance.attr.docnumber.value =
//      window.reactiveInput.value;
// });

// document.body.appendChild(window.reactiveInput);
// document.addEventListener('model:model-document', (event) => { console.log('event', event.detail); });

/**
 * 'document.instance.dm.attr.docnumber.value.v'
 * 'document.instance.tables.rows[0].rownumber.value.v'
 */
