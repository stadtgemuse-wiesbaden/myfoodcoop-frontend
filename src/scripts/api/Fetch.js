import { get } from 'svelte/store';
import { goto } from '@sapper/app';
import Cookie from 'js-cookie';
import { getUrl, version } from './ApiConfig';
import { 
    refreshToken as refreshTokenStore,
    refreshTokenExpires,
    keepLoggedIn,
    token,
    tokenExpires
} from '../../stores/user';
import Tokens from '../user/Tokens';
import CookieDefaults from '../common/CookieDefaults';
import { isBackendActive, isPointOfSales } from '../../stores/page';

export const Headers = {
    Authorization: 'Authorization'
};

export const getAuthorizationHeader = () => ({
    [Headers.Authorization]: `Bearer ${get(token)}`,
});

export default class Fetch {
    /**
     * Sends a GET request to the api
     * @param {string} subpath Path relativ to the version number of the api
     * @param {object} additionalHeaders Additional header parameters (optional)
     * @returns The JSON response of the request
     */
    static async get(subpath, additionalHeaders) {
        return Fetch.request('GET', subpath, undefined, additionalHeaders);
    }

    /**
     * Sends a POST request to the api
     * @param {string} subpath Path relativ to the version number of the api
     * @param {string} content Body content which should be send to the api
     * @param {object} additionalHeaders Additional header parameters (optional)
     * @returns The JSON response of the request
     */
    static async post(subpath, content, additionalHeaders) {
        return Fetch.request('POST', subpath, content, additionalHeaders);
    }

    /**
     * Sends a PATCH request to the api
     * @param {string} subpath Path relativ to the version number of the api
     * @param {{balance: number}} content Body content which should be send to the api
     * @param {object} additionalHeaders Additional header parameters (optional)
     * @returns The JSON response of the request
     */
    static async patch(subpath, content, additionalHeaders) {
        return Fetch.request('PATCH', subpath, content, additionalHeaders);
    }
    
    /**
     * Sends a DELETE request to the api
     * @param {string} subpath Path relativ to the version number of the api
     * @param {{balance: number}} content Body content which should be send to the api
     * @param {object} additionalHeaders Additional header parameters (optional)
     * @returns The JSON response of the request
     */
    static async delete(subpath, content, additionalHeaders) {
        return Fetch.request('DELETE', subpath, content, additionalHeaders);
    }

    /**
     * Sends a request to the api
     * @param {string} type An http request method
     * @param {string} subpath Path relativ to the version number of the api
     * @param {object} content Body content which should be send to the api
     * @param {object} additionalHeaders Additional header parameters (optional)
     * @param {number} tries the number of tries this request had (optional)
     * @returns The JSON response of the request or undefined if there was no content
     */
    static async request(type, subpath, content, additionalHeaders, tries = 1) {
        const headers = additionalHeaders;

        // check if the authorization header is necessary
        if (additionalHeaders !== undefined && Headers.Authorization in additionalHeaders) {
            // check if the current token has expired, the refresh token is set and the refresh token is still valid
            if ((get(isPointOfSales) || get(keepLoggedIn)) && get(tokenExpires) < Date.now() && get(refreshTokenStore) 
                && get(refreshTokenExpires) > Date.now()) {
                // get a new token
                await Fetch.refreshToken(get(refreshTokenStore));

                // update the token of the current request
                headers[Headers.Authorization] = `Bearer ${get(token)}`;
            } else if (get(tokenExpires) < Date.now()) {
                // if the token is invalid, the refresh token is not set or is invalid, redirect the user to the login
                goto("/profile/login");
            }
        }

        // do the request
        const response = await fetch(`${getUrl()}/${version}/${subpath}`, {
            method: type,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(content)
        });

        isBackendActive.set(true);

        // check if an error occured
        if (response.status >= 400) {
            // get the error
            const errorValue = await response.json();

            if (response.status === 401 && errorValue.errorCode === 401003) {
                // token has expired, try the request again
                if (tries < 3) {
                    // but only if we tried it less then 3 times
                    return Fetch.request(type, subpath, content, additionalHeaders, tries + 1)
                }
            } else if (response.status === 401 && errorValue.errorCode === 401009) {
                // refresh token has been revoked
                Cookie.remove(CookieDefaults.REFRESH_TOKEN);
                Cookie.remove(CookieDefaults.TOKEN);
                
                if (!window.location.href.includes('/login')) {
                    // if we are not on the login page, redirect to login
                    goto("/profile/login");
                }
            }

            // throw the error
            throw errorValue;
        }

        // if the status code has content read and return it
        if (response.status !== 204) {
            return response.json();
        }
        // else return nothing
        return undefined;
    }

    /**
     * Request a new updated token.
     * In example this will also update all assoziated roles.
     * @param {string} refreshToken refresh token which was initially provided during login
     */
    static async refreshToken(refreshToken) {
        const response = await Fetch.post(`auth/refresh`, {
            refreshToken
        });

        Tokens.handleTokens(response.token, response.refreshToken)

        return response;
    }
}
