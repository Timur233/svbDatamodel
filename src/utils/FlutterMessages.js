import { base64ToFile } from '../utilities.js';

export class FlutterMessages {
    static openCamera () {
        try {
            window.flutter_inappwebview.callHandler('camera', '');
        } catch (error) { console.log(error); }
    };

    static uploadPhoto (file, name) {
        if (file) {
            try {
                window.fileUploader.getInstance().loadFile(base64ToFile(file, name));
            } catch (error) { console.log(error); }
        }
    };

    static success (message) {
        try {
            window.flutter_inappwebview.callHandler('success', message);
        } catch (error) { console.log(error); }
    };

    static error (message) {
        try {
            window.flutter_inappwebview.callHandler('error', message);
        } catch (error) { console.log(error); }
    };
}