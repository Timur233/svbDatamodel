/* global SvbPanel, SvbWindow */

import './style.css';
import { DataModel } from './src/DataModel';

const contentBlock = document.querySelector('#contentBlock');
const panel = new SvbPanel();
const window = new SvbWindow(panel, { title: 'React Playground', maxSize: true });

async function docPurchaseorders () {
    const contractorTable = await initContractorTable();
    // const orderTable = await initOrderTable();
    // const projectTable = await initProjectTable();

    panel.setSidebar(contractorTable.table);
    // panel.setContent(orderTable.table);
    // panel.rightSidebar(projectTable.table);
}

async function initContractorTable () {
    const contractorListDM = new DataModel({
        data: () => ({
            descriptor: 'catalog.goodes',
            filters:    [{
                filter: 1
            }],
            // eslint-disable-next-line max-len
            attributes: { nomenclature: { md: { name: 'nomenclature', type: 'catalog', index: '0', represent: 'Название' }, vset: { represent: 'Название', name: 'nomenclature', order: '0', format: '', hidden: false, length: '', labeled: true, readOnly: true, editOnly: '', required: '', sortable: '', inputType: '', multiline: '', textAlign: '', filterable: '', inputWidth: '180', inputHeight: '24', linenumber: '0', maxSymbols: '0', minSymbols: '0', precision: '0', defaultValue: '', showable: '', clearable: '', searchable: '', unselectable: '', noStyle: '', itarable: '' } }, measure: { md: { name: 'measure', type: 'catalog', index: '1', represent: 'Ед.' }, vset: { represent: 'Ед.', name: 'measure', order: '0', format: '', hidden: false, length: '', labeled: true, readOnly: true, editOnly: '', required: '', sortable: '', inputType: '', multiline: '', textAlign: '', filterable: '', inputWidth: '60', inputHeight: '24', linenumber: '0', maxSymbols: '0', minSymbols: '0', precision: '0', defaultValue: '', showable: '', clearable: '', searchable: '', unselectable: '', noStyle: '', itarable: '' } } },
            list:       [{
                represent:    { value: 'adfadfsda' },
                uuid:         { value: 'adsfadf-adfasdf-dsfasdfa' },
                nomenclature: {
                    value: {
                        r: 'Название',
                        v: '34534345v-345435-345435-345'
                    }
                },
                measure: {
                    value: {
                        r: 'el',
                        v: 'asdfaasdf-sdfsdf-sdfsdf-sdf'
                    }
                }
            }]
        })
    });

    return {
        table: contractorListDM.table('list')
    };
}

docPurchaseorders();

contentBlock.appendChild(window);
