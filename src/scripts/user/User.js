import { get } from 'svelte/store';
import Cookie from 'js-cookie'
import Fetch, {getAuthorizationHeader} from '../api/Fetch';
import Tokens from './Tokens';
import LocalStorageKeys from '../common/LocalStorageKeys';
import { refreshToken as refreshTokenStore, refreshTokenExpires, tokenExpires } from '../../stores/user';
import CookieDefaults from '../common/CookieDefaults';

export default class User { 
    /**
     * Register the user
     * @param {string} username username as defined by the user
     * @param {string} memberId memberid given to the user by the customer
     * @param {string} password password as defined by the user
     * @param {string} email email as defined by the user (optional)
     */
    static async register(username, memberId, password, email) {
        return Fetch.post('user/register', {
            username,
            memberId,
            password,
            email,
        })
    }
    
    /**
     * Update the user
     * @param {string} userId username as defined by the user
     * @param {string} memberId memberid given to the user by the customer
     * @param {string} password password as defined by the user
     * @param {string} email email as defined by the user (optional)
     */
    static async update(userId, memberId, password, email) {
        return Fetch.patch(`user/${userId}`, {
            password,
            memberId,
            email,
        }, getAuthorizationHeader());
    }

    /**
     * Login the user in and request the jwt token
     * @param {string} username username of the user
     * @param {string} password password of the user
     * @param {boolean} keepLoggedIn whether to keep the user logged in
     */
    static async login(username, password, keepLoggedIn) {
        localStorage.setItem(LocalStorageKeys.KEEP_LOGGED_IN, keepLoggedIn);
        
        const response = await Fetch.post('auth/login', {
            username,
            password
        })

        Tokens.handleTokens(response.token, response.refreshToken);

        return response;
    }

    /**
     * Fetch the data of all users
     */
    static async getAllUsers() {
        return Fetch.get(`user/`, getAuthorizationHeader());
    }

    /**
     * Fetch the data of the current user
     */
    static async getUserById(userId) {
        return Fetch.get(`user/${userId}`, getAuthorizationHeader());
    }
     
    /**
     * Deletes the given user
     */
    static async deleteUserById(userId) {
        return Fetch.delete(`user/${userId}`, undefined, getAuthorizationHeader());
    }

    /**
     * Add a role to the user
     * @param {string} userId unique user id of the user the role should be added to
     * @param {string} role name of the role which should be added to the user
     */
    static async userAddRole(userId, role) {
        return Fetch.post(`user/${userId}/roles/${role}`,{}, getAuthorizationHeader());
    }    
    
    /**
     * Removes a role from the user
     * @param {string} userId unique user id of the user the role should be removed from
     * @param {string} role name of the role which should be removed from the user
     */
    static async userDeleteRole(userId, role) {
        return Fetch.delete(`user/${userId}/roles/${role}`, undefined, getAuthorizationHeader());
    }

    /**
     * Request a new updated token.
     * In example this will also update all assoziated roles.
     * @param {string} refreshToken refresh token which was initially provided during login
     */
    static async refreshToken(refreshToken) {
        // The content of the refreshToken Method should probably be locatet in this class.
        // The Problem is that we would introduce a depency cycle between Fetch and User class, 
        // becaus the Fetch class also wants to use this method.
        // Svelte handles dependency cycles as warnings and eslint gives us an error.
        // Thats why the content of this method was abstracted as best as possible an placed in Fetch,
        // which is not ideal but one of the best ways (in this case) to solve this problem.
        return Fetch.refreshToken(refreshToken);
    }

    static async revokeRefreshToken(refreshToken) {
        return Fetch.delete(`auth/refresh`, {
            refreshToken
        }, undefined, getAuthorizationHeader());
    }

    /**
     * Logs out the current user and reloads the page
     */
    static async logout() {
        try {
            // logout on the server
            if (get(refreshTokenExpires) > new Date()) {
                // only logout on the server if the refresh token is still valid

                if (get(tokenExpires) < new Date()) {
                    // if the token expired get a new one
                    await User.refreshToken(get(refreshTokenStore));
                }

                // revoke the refresh token
                await User.revokeRefreshToken(get(refreshTokenStore));
            }
        } finally {
            // logout on the client
            Cookie.remove(CookieDefaults.TOKEN);
            Cookie.remove(CookieDefaults.REFRESH_TOKEN);

            localStorage.removeItem(LocalStorageKeys.CART);

            // reload the page
            window.location.href = '/';
        }
    }
}
