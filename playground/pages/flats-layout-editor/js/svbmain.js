'use strict';

var url = `${window.location.protocol}//${window.location.host}`;
var svbApiUrl = `${url}/api/svb/v4.0`;
var svb;


async function svbInit() {
    if (!svb) {
        svb = new Svb(svbApiUrl);
    }
    await svb.init();
    
    svb.onUnauthorized = async () => {
        window.location.replace(`${url}/signin`);
        return false;
    };
    
    return svb;
}