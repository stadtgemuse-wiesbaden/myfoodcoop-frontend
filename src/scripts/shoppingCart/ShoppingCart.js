import LocalStorageKeys from '../LocalStorageKeys';
import ShoppingCartItem from './ShoppingCartItem';
import { UnitType } from '../UnitType';

export default class ShoppingCart {

    constructor() {
        const cartString = window.localStorage.getItem(LocalStorageKeys.CART);
        if (cartString !== null ) {
            try {
                this.items = JSON.parse(cartString);                
            } catch (e) {
                this.items = [];
            }
        } else {
            this.items = [];
        }
    }

    addItem(name, unitType, unitPrice, quantity) {
        if (unitType !== UnitType.KILO && unitType !== UnitType.PIECE) {
            return false;
        }

        unitPrice = unitPrice.replace(',', '.');
        unitPrice = parseFloat(unitPrice);
        if(isNaN(unitPrice)) {
            return false;
        }            
        unitPrice = unitPrice.toFixed(2);

        quantity = parseInt(quantity);
        if(isNaN(quantity)) {
            return false;
        } 

        // check if item name already exists in item array. if true, update entry
        let itemExists = false;
        for(let item of this.items) {
            if(item.name === name) {
                itemExists = true;
                item.unitType = unitType;
                item.unitPrice = unitPrice;
                item.quantity = quantity;
                break;
            }
        }

        if(itemExists === false) {
            this.items.push(new ShoppingCartItem(name, unitType, unitPrice, quantity));
        }
        
        localStorage.setItem(LocalStorageKeys.CART, JSON.stringify(this.items));
    }

    removeItem(name) {
        for(let i = 0; i < this.items.length; i++) {
            if(this.items[i].name === name) {
                this.items.splice(i, 1);
                break;
            }
        }
        localStorage.setItem(LocalStorageKeys.CART, JSON.stringify(this.items));
    }

    totalPrice() {
        let totalPrice = 0.0;
        this.items.forEach(item => {
            totalPrice += (item.unitPrice * item.quantity);
        });

        return totalPrice.toFixed(2);
    }

    clear() {
        this.items = [];
        localStorage.setItem(LocalStorageKeys.CART, JSON.stringify(this.items));
    }
}