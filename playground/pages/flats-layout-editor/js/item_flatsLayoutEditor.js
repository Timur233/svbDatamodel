'use strict';

async function flatsLayoutEditor (e) {
    window.svb = await svbInit();

    const catProjectsList = await window.svb.createSvbObject('catalog', 'projects', 'list', 'catProjectsList', { vset: 'catProjectsList' });

    await catProjectsList_handler(catProjectsList);

    const catBuildingsList = await window.svb.createSvbObject('catalog', 'buildings', 'list', 'catBuildingsList', { vset: 'catBuildingsList' });

    await catBuildingsList_handler(catBuildingsList);

    const catSectionsList = await window.svb.createSvbObject('catalog', 'sections', 'list', 'catSectionsList', { vset: 'catSectionsList' });

    await catSectionsList_handler(catSectionsList);

    //    const copySectionForm = await window.svb.createCustomObject("copySectionForm");
    //    await copySectionForm_handler(copySectionForm);

    const catRealestatesList = await window.svb.createSvbObject('catalog', 'realestates', 'list', 'catRealestatesList', {});

    await catRealestatesList_handler(catRealestatesList);

    const catRealestatesInstance = await window.svb.createSvbObject('catalog', 'realestates', 'instance', 'catRealestatesInstance', {});

    await catRealestatesInstance_handler(catRealestatesInstance);

    const contentBlocks = document.getElementById('contentBlocks');

    const htmlTemplate = await window.svb.getHtmlTemplate('flatsLayoutEditor');
    const svbElement = await window.svb.bind(htmlTemplate, [
        catProjectsList,
        catBuildingsList,
        catSectionsList,
        // copySectionForm,
        catRealestatesList,
        catRealestatesInstance
    ]);

    contentBlocks.appendChild(svbElement);
}

async function catProjectsList_handler (catProjects_list) {
    await catProjects_list.init({
        list: {
            viewType: 'select'
        },
        toolbar: {
            standart: [
                { type: 'button', name: 'add' }
            ]
        },
        filter: {
            static: {
                active: true
            }
        }
    });

    // await catProjects_list.loadData();
    // if (catProjects_list.rowCount > 0) catProjects_list.table.setSelectedRow(1);
}

async function catBuildingsList_handler (catBuildings_list) {
    await catBuildings_list.init({
        list: {
            componentType: 'select'
        },
        toolbar: {
            standart: [
                { type: 'button', name: 'add' }
            ]
        },
        filter: {
            static: {
                active: true
            },
            user: {
                project: {
                    //                    watch: () => {
                    //                        window.svb.reg({
                    //                            svbObject: "catProjects_list",
                    //                            component: "ыудусе",
                    //                            event: "onActivateRow"
                    //                        });
                    //                    }
                }
            }
        }
    });

    // await catBuildings_list.loadData();
    // if (catBuildings_list.rowCount > 0) catBuildings_list.table.setSelectedRow(1);
}

async function catSectionsList_handler (catSections_list) {

    // await catSections_list.loadData();
    // if (catSections_list.rowCount > 0) catSections_list.table.setSelectedRow(1);
}

async function copySectionForm_handler (copySectionForm) {
    copySectionForm.createAttr([
        {
            name:       'project',
            represent:  'Проект',
            type:       'catalog',
            typeObject: 'catalog.projects'
        },
        {
            name:       'building',
            represent:  'Строение',
            type:       'catalog',
            typeObject: 'catalog.buildings'
        },
        {
            name:       'section',
            represent:  'Секция',
            type:       'catalog',
            typeObject: 'catalog.sections'
        }
    ]);

    copySectionForm.toolbar.set([
        {
            standart:  false,
            type:      'button',
            name:      'copy',
            represent: 'Копировать',
            handler:   () => {
            // обработка копирования
            }
        },
        {
            standart:  false,
            type:      'button',
            name:      'mirrorcopy',
            represent: 'Копировать зеркально',
            handler:   () => {
            // обработка зеркального копирования
            }
        }
    ]);
}

async function catRealestatesList_handler (catRealestates_list) {
    // await catRealestates_list.loadData();

}

async function catRealestatesInstance_handler (catRealestates_inst) {

}
