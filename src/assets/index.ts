const ERP_BASE_URL_ICONS = './icons'
const ERP_BASE_URL_GIF = './gif'

const APP_LOGO = require(`${ERP_BASE_URL_ICONS}/logo.png`);

const ERROR = require(`${ERP_BASE_URL_GIF}/error.gif`);
const LOADING = require(`${ERP_BASE_URL_GIF}/loader.gif`);
const SEARCH_LOADER = require(`${ERP_BASE_URL_GIF}/search.gif`);
const NO_INTERNET = require(`${ERP_BASE_URL_GIF}/nointernet.gif`);
const NO_DATA = require(`${ERP_BASE_URL_GIF}/nodata.gif`);

export const ERP_ICON = {
    APP_LOGO
};

export const ERP_GIF = {
    ERROR,
    LOADING,
    SEARCH_LOADER,
    NO_DATA,
    NO_INTERNET
};
