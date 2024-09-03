import SvbModal from '../SvbModal.js';
import SvbInputCatalog from './SvbInputCatalog.js';

class SvbInputCatalogHOC extends SvbInputCatalog {
    constructor (settings, classList) {
        super(settings, classList);

        this.hocSettings = { settings, classList };
    }

    inputMethod (e) {
        const modal = new SvbModal();
        const searchInput = new SvbInputCatalog(this.hocSettings.settings, this.hocSettings.classList);

        searchInput.setFilters(this.state.filters);
        searchInput.searchHandling = this.searchHandling;
        searchInput.eventChange = () => {
            this.setValue(searchInput.getValue());
            this.state.additionalInfo = searchInput.state.additionalInfo;
            this.eventChange();

            setTimeout(() => {
                modal.hide();
            }, 300);
        };

        modal.header.addStyles({
            position: 'absolute',
            left:     0,
            right:    0,
            top:      '-38px'
        });
        modal.wrapper.addStyles({ height: '80vh' });
        modal.component.addStyles({ transition: '' });
        modal.setContent(searchInput.component);

        setTimeout(() => {
            modal.show();
            searchInput.input.focus();
            searchInput.inputMethod(e);
        }, 300);
    }
}

export default SvbInputCatalogHOC;
