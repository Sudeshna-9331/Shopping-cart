// VARIABLES
const cart_btn = document.querySelector(".cart-btn");
const close_cart = document.querySelector(".close-cart");
const clear_cart = document.querySelector(".clear-cart ");
const cartDOM = document.querySelector(".cart");
const cart_overlay = document.querySelector(".cart-overlay");
const cart_items = document.querySelector(".cart-items");
const cart_total = document.querySelector(".cart-total");
const cart_content = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// CART
let cart = [];
// Buttons
let buttonsDOM = [];

// Getting the products
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.items;
            products = products.map(function (item) {
                const title = item.fields.title;
                const price = item.fields.price;
                const id = item.sys.id;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image };
            })

            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

// Display Products
class UI {
    displayProducts(products) {

        let result = "";
        products.forEach(product => {
            result += `<!-- SINGLE PRODUCT -->
                        <article class="product">
                            <div class="img-container">
                                <img src="${product.image}" 
                                alt="" srcset="" 
                                class="product-img">

                                <button class="bag-btn" data-id=${product.id}>
                                <i class="fa fa-shopping-cart">
                                </i>Add to cart</button>
                            </div>
                            <h3>${product.title}</h3>
                            <h4>Rs. ${product.price}</h4>
                        </article>`;
        });
        productsDOM.innerHTML = result;
    };
    // Get Bag Btns...
    getBagBtns() {
        const bagBtns = [...document.querySelectorAll('.bag-btn')];

        buttonsDOM = bagBtns;

        bagBtns.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item =>
                item.id === id);

            // Check whether item is in cart...
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            else {
                button.addEventListener("click", function (event) {
                    event.target.innerText = "Added To Cart";
                    event.target.disabled = true;

                    // Get product from products
                    let cartItem = { ...Storage.getProduct(id), amount: 1 };
                    console.log(cartItem);

                    // Add product to the cart
                    cart = [...cart, cartItem];

                    // Save cart in local    Storage
                    Storage.saveCart(cart);
                    // Set cart values
                    setCartValue(cart);

                    // Display cart item
                    addCartItem(cartItem);
                    // Show the cart
                    showCart();

                });
            }
        });
    }

}
// To set cart item value and total cart amount;
function setCartValue(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
        tempTotal += (item.price * item.amount);
        itemsTotal += item.amount;

    });
    cart_total.innerText = tempTotal;
    cart_items.innerText = itemsTotal;

};
// Function to set cart items...
function addCartItem(item) {
    cart_content.classList.remove("showNoItem");
    if (cart.length === 0) {
        cart_content.classList.add("showNoItem");
        cart_content.innerText = `You have no item in cart...`;
    }
    else {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `<img src=${item.image} alt="Product"/>
        <div>
            <h4>${item.title}</h4>
            <h5>Rs. ${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>Remove</span>
        </div>
        <div class="item-number">
            <i class="fa fa-chevron-up" data-id=${item.id}></i>
            <h6 class="item-amount">${item.amount}</h6>
            <i class="fa fa-chevron-down" data-id=${item.id}></i>
        </div>`
        cart_content.appendChild(div);

    }

}
// Function to show cart...
function showCart() {
    cart_btn.addEventListener("click", () => {

        cart_overlay.classList.add("showCart");

    });
    close_cart.addEventListener("click", () => {
        cart_overlay.classList.remove("showCart");
    });
};
// Populate function
function populateCart(cart) {
    cart.forEach(item => {
        addCartItem(item);
    })

}
// Set up
function setUpApp() {

    cart = Storage.getCart();
    setCartValue(cart);
    populateCart(cart);
    showCart();
    cartLogic();
};
// Clear cart
function clearCart() {
    let cartItem = cart.map(item => item.id);

    cartItem.forEach(id => {
        removeItem(id);
    });
    //while(cart_content.children.length>0){
    //cart_content.removeChild(cart_content.children[0]);
    //}
    cart_content.classList.add("showNoItem");
    cart_content.innerText = `You have no item in cart...`;
};
// Remove an cart item...
function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    setCartValue(cart);
    Storage.saveCart(cart);
    let button = getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fa fa-shopping-cart"></i>Add to cart`;
}
// To get indivisual button...
function getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id);
}
// Cart logic
function cartLogic() {
    // Clear cart...
    clear_cart.addEventListener("click", clearCart);
    // Remove item function...
    cart_content.addEventListener("click", event => {

        if (event.target.classList.contains("remove-item")) {
            let remove_Item = event.target;
            let id = remove_Item.dataset.id;

            let item_To_Be_Removed = remove_Item.parentElement.parentElement;
            cart_content.removeChild(item_To_Be_Removed);

            removeItem(id);
        }
        else if (event.target.classList.contains("fa-chevron-up")) {
            let addAmount = event.target;
            let id = addAmount.dataset.id;

            let tempItem = cart.find(item => item.id === id);

            tempItem.amount = tempItem.amount + 1;
            Storage.saveCart(cart);
            setCartValue(cart);
            addAmount.nextElementSibling.innerText = tempItem.amount;

        }
        else if (event.target.classList.contains("fa-chevron-down")) {
            let lowerAmount = event.target;
            let id = lowerAmount.dataset.id;

            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount - 1;
            if (tempItem.amount > 0) {
                Storage.saveCart(cart);
                setCartValue(cart);

                lowerAmount.previousElementSibling.innerText = tempItem.amount;
            }
            else{
                cart_content.removeChild(lowerAmount.parentElement.parentElement);

                removeItem(id);
                Storage.saveCart(cart);
                setCartValue(cart);
            }

        }
    });
}

// Local Storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {

        // Store the array that we have in local storage in "products"..
        let products = JSON.parse(localStorage.getItem("products"));

        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));

    }
    static getCart() {
        if (localStorage.getItem("cart")) {
            return JSON.parse(localStorage.getItem("cart"));
        }
        else {
            return [];
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    // Set up
    setUpApp();
    // If the cart is empty

    // Get all products
    products.getProducts().then(function (products) {
        ui.displayProducts(products)
        Storage.saveProducts(products);
    }).then(function () {
        ui.getBagBtns();

    });
});


