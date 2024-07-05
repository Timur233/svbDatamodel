import SvbInputCatalog from "./SvbInputCatalog";
import BaseInput from "./BaseInput";

class SvbInput {
    constructor(settings, classList) {
        this.settings = settings;
        this.classList = classList;

        return this.init();
    }

    init() {
        const inputType = SvbInput.getInputType(this.settings?.type, this.settings?.multiline);

        switch (inputType) {
            case 'catalog':
            case 'system':
            case 'document':
            case 'doctable':
                return new SvbInputCatalog(this.settings, this.classList);
            default:
                return new BaseInput(this.settings, this.classList);
        }
    }

    static getInputType(type = 'text', isMultyply = false) {
        if (type === 'text' && isMultyply) {
            return 'textarea';
        }

        return type;
    }
}

export default SvbInput;