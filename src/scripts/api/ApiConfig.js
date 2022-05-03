import { get } from 'svelte/store'
import { backendUrl } from '../../stores/page';

export const getUrl = () => process.env.NODE_ENV === 'development'
    ? 'https://stage-gemuese-service.herokuapp.com'
    : get(backendUrl) ;

export const version = 'v2';

export const appVersion = process.env.APP_VERSION;
