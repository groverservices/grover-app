// global var. Store the info loaded to the DOM during modal creation
var g_listTypeData = {
    options: [],
    price: []
};

/* global var. Store the page owner wsp number */
var g_phone_number = '';

function sendCartToWhatsapp(){
    var newline = '%0A';
    var space = '%20';
    var url = `https://wa.me/${g_phone_number}?text=Hola${newline}Como${space}estas?&lang=es`

    var win = window.open(url, '_blank');
    win.focus();
}

function updateCart(){
    // Get all the info from the current modal
    var newItem = JSON.stringify(
        [{
            "title": "Ensalada Caprezanella_0",
            "image": "https://res.cloudinary.com/goncy/image/upload/v1589485873/pency/ffztrxszbauvihsgnjgq.jpg",
            "price": 280.99,
            "variants": [{
                "extra": "Tamaño",
                "option": "Grande",
                "price": 25.00
            }]
        },{
            "title": "Ensalada lista completa",
            "image": "https://res.cloudinary.com/goncy/image/upload/v1589486001/pency/biujlwqx8bvhbwqk3z2v.jpg",
            "price": 412.99,
            "variants": [{
                "extra": "Tamaño",
                "option": "Chico",
                "price": 25.00
            },{
                "extra": "Carne",
                "option": "Vaca",
                "price": 45.50
            }]
        },
        {
            "title": "Ensalada Caprezanella_0",
            "image": "https://res.cloudinary.com/goncy/image/upload/v1589485873/pency/ffztrxszbauvihsgnjgq.jpg",
            "price": 280.99,
            "variants": [{
                "extra": "Tamaño",
                "option": "Grande",
                "price": 25.00
            }]
        }
    ]);

    // Store that info in newItem

    sessionStorage.setItem('cart', newItem);

    // Get the cart stored in sessionStorage, append the newItem 2 to that, and close 

    //var stored = sessionStorage.getItem('cart');

    //console.log(typeof(stored));

    
    /*var newItem2 = JSON.stringify({
        "sku": 1, 
        "title": "El otro item",
        "price": 280.99,
        "variants": [{
            "extra": "Tamaño",
            "option": "De cancha",
            "price": 25.00
        }]
    });*/

    //var appended_str = '[' + stored + ',' + newItem2 + ']';

    //console.log(JSON.parse(appended_str));



    /* Now, with the data from the modal in cart_item... 

    var cartCurrentStatus  = sessionStorage.getItem('cart');

    console.log(typeof(cartCurrentStatus));    // string
    
    /* We check if something is in the cart right now 
    if (cartCurrentStatus) {

        /* Get the amount of items in the cart 
        var i = JSON.parse(cartCurrentStatus).length;
        
        console.log(cartCurrentStatus);


        var lastRecord = cartCurrentStatus.length;    

        console.log(lastRecord);

        cartCurrentStatus.sku++;



        console.log(typeof(cartCurrentStatus)); //object
        console.log(typeof(newItem));   //

        //cartCurrentStatus.push(newItem);

        sessionStorage.setItem('cart', JSON.stringify(cartCurrentStatus));

    }else{
        /* The cart is empty, store the newItem (string)  
        sessionStorage.setItem('cart', newItem);
    }
    */

    /* Re calcular el precio del carrito completo para mostrar al lado de carrito */
    console.log('recalcular el precio que se muestra en el carrito en base al nuevo carrito');
    closeOptionals();
}

function viewCurrentCart(){
    // Display a pop up modal in the document
    var modal = document.getElementById("cart-modal");
    modal.style.display = "block";
    modal.scrollIntoView({behavior: "smooth"});

    // Get each element in sessionStorage for htmlPayload
    var objCurrentCart = JSON.parse(sessionStorage.getItem('cart'));
    var htmlPayload = ' ';

    $.each(objCurrentCart, function(i, item){
        // Get the variants for this item
        var variants_description = '';
        var total_price = objCurrentCart[i].price;    

        $.each(objCurrentCart[i].variants, function(j){
            variants_description += `${objCurrentCart[i].variants[j].extra}: ${objCurrentCart[i].variants[j].option} | `;
            console.log(objCurrentCart[i].variants[j].price);
            console.log(typeof(objCurrentCart[i].variants[j].price));

            total_price += objCurrentCart[i].variants[j].price;
        })

        htmlPayload += `<div class="product-card">
            <img src="${objCurrentCart[i].image}" alt="">
            <h3>${objCurrentCart[i].title}</h3>
            <div class="close" id="0" onclick="deleteFromCart(this.id)">&#128465;</div>    
            <p class="description" id="js-toclamp">${variants_description}</p>
            <p class="price">$ ${total_price}</p>
        </div>
        `;
    });

    console.log(htmlPayload);

    document.getElementById('cart-modal-product-table').innerHTML = htmlPayload;
}

function deleteFromCart (del_id){
    console.log(`product id: ${del_id} -> deleted`);
    // Should be deleted from the sessionStorage

    // SHould update the cart Modal
}

function displayCartOptions(payload){
    // Get the product sku from the pressed button id
    var product_sku = payload.substring(payload.indexOf('_') + 1, payload.length);

    // Display a pop up modal in the document
    var modal = document.getElementById("modal");
    modal.style.display = "block";
    modal.scrollIntoView({behavior: "smooth"});

    // Generate a modal with product info from products.json
    $.getJSON('js/products.json', function(data){
        $.each(data, function(i, item){
            if(data[i].sku == product_sku){
                // Cargar imagen, titulo y descripción del producto
                document.getElementById('options-content-header').innerHTML = `
                <div style="display:none" id="category">${data[i].category}</div> 
                <div style="display:none" id="title">${data[i].title}</div> 
                <img src="${data[i].image}" alt="">   
                <h3>${data[i].title} <i>$${data[i].price}</i></h3>
                <div>${data[i].description}</div> 
                `;

                // Load the variants found for the product into html modal
                var optionsTable = document.getElementById('optionsTable');

                // Clear the table before entering new data
                optionsTable.innerHTML = ''; 

                // Clear the g_listTypeData fields for the new product
                g_listTypeData.options = [];
                g_listTypeData.price = [];
                var listTypeIndex = 0;

                for(var j = 0; j<data[i].variants.length; j++){

                    if(data[i].variants[j].type == 'list') listTypeIndex++;
        
                    if (createModalList(optionsTable,
                        data[i].variants[j].type,
                        data[i].variants[j].option,
                        data[i].variants[j].extra,
                        data[i].variants[j].price,
                        listTypeIndex)){
                    }else{
                        console.log ("No variant on sku " + data[i].sku + " variant: " + data[i].variants[j].type);
                    }
                }
            }
        });
    });

    var addToCartDiv = document.getElementById('btn-section');

    addToCartDiv.innerHTML = `<div id='${product_sku}' onclick="updateCart('add', this.id)"><p>Agregar al carrito</p></div>`;
}
function closeCartModal (){
    var modal = document.getElementById("cart-modal");
    modal.style.display = "none";
}

// Hide the modal if the user clicks the X or outside the window
function closeOptionals(){
    var modal = document.getElementById("modal");
    modal.style.display = "none";

    /* Also, when the modal is closed, we should clear the tempProduct from sessionStorage */
    console.log("delete the next line")
    sessionStorage.removeItem("temp");

    /* Clear the modal for next use */
    modal.innerHTML=`
    <div class="options-content">
        <span class="close" id="close-btn" onclick="closeOptionals()">&times;</span>

        <header id="options-content-header">

        </header>
        <table class="options-table" >
            <tbody id="optionsTable">
            </tbody>
        </table>

        <section id='btn-section'>
            
        </section>
    </div>`;
}

function updateModalPrice(reference, type, prices, amount_ref_id, listTypeIndex){
    /* 
        reference -> HTML reference to the element the user interacts with (checkbox, buttons, the list itself..)
        type -> could be checkbox, amount or list
        prices -> is a [float or vector] of the individual price
        amount_ref_id -> for type 'amount' (- X +), is the amount chosen by the user 
    */

    if(type == 'checkbox'){
        if($(reference)[0].checked && prices != 0){
            $(reference).parent().siblings('.table-ref-price')[0].innerText = '$' + prices.toFixed(2);
        }else{
            $(reference).parent().siblings('.table-ref-price')[0].innerText = ''
        }
    }else if(type == 'amount'){
        /* prices -> referencia al precio unitario */
        var unit_price = parseFloat(prices);

        /* amount_ref_id ->  id de la cantidad */
        var amount = parseInt(document.getElementById(amount_ref_id).innerHTML);

        /* reference -> elemento al que escribir el precio calculado */
        var final_price = amount * unit_price;

        if (final_price == 0){
            $(reference).parent().parent().siblings('.table-ref-price')[0].innerText = '';
        }else{
            $(reference).parent().parent().siblings('.table-ref-price')[0].innerText = '$' + final_price.toFixed(2);
        }
    }else if(type == 'list'){
        // List type element index
        var list_index = listTypeIndex - 1;    

        // Search the chosen option in g_listTypeData
        var option_index = g_listTypeData.options[list_index].indexOf(reference.value)

        // Get the price for that option
        var final_price = parseFloat(g_listTypeData.price[list_index][option_index]);

        if (isNaN(final_price)){
            $(reference).parent().siblings('.table-ref-price')[0].innerText = '';
        }else{
            $(reference).parent().siblings('.table-ref-price')[0].innerText = '$' + final_price.toFixed(2);
        }


    }else{
        console.log(`Oops! Something is wrong with type ${type} not expected!`);
    } 
}

// Load the modal table with info from variants in elements in products.json
function createModalList(HTMLreference, modalType, variantOptions, variantTitle, variantPrice, listTypeIndex){
    var htmlPayload = '';
    if(modalType == 'checkbox'){
        htmlPayload =
        `<tr>
            <td class="options-table-title">${variantTitle}    <i>(+ $${variantPrice})</i></td>
            <td class="${modalType}">
                <input type="checkbox" onchange="updateModalPrice(this, '${modalType}', ${variantPrice}, null)">
            </td>
            <td class="table-ref-price">
            </td>
        </tr`;
    }else if(modalType == 'amount'){
        htmlPayload = `
        <tr>
            <td class="options-table-title">${variantTitle}    <i>(+ $${variantPrice})</i></td>
            <td class="${modalType}">
                <div class="number-add-substract" style="margin: auto;">
                    <button type="button" aria-label="restar" class="css-p6o1lj" onclick="updateModalAmountVariable(false, '${variantTitle}', this, '${variantPrice}')">
                        <svg viewBox="0 0 24 24" focusable="false" role="presentation" aria-hidden="true" class="css-1im46kq">
                            <g fill="currentColor">
                                <rect height="4" width="20" x="2" y="10"></rect>
                            </g>
                        </svg>
                    </button>
                    <p id="${variantTitle}-amount">0</p> 
                    <button type="button" aria-label="sumar" class="css-1lq1pnb" onclick="updateModalAmountVariable(true, '${variantTitle}', this, '${variantPrice}')">
                        <svg viewBox="0 0 24 24" focusable="false" role="presentation" aria-hidden="true" class="css-1im46kq">
                            <path fill="currentColor" d="M0,12a1.5,1.5,0,0,0,1.5,1.5h8.75a.25.25,0,0,1,.25.25V22.5a1.5,1.5,0,0,0,3,0V13.75a.25.25,0,0,1,.25-.25H22.5a1.5,1.5,0,0,0,0-3H13.75a.25.25,0,0,1-.25-.25V1.5a1.5,1.5,0,0,0-3,0v8.75a.25.25,0,0,1-.25.25H1.5A1.5,1.5,0,0,0,0,12Z"></path>
                        </svg>
                    </button>
                </div>
            </td>
            <td class="table-ref-price">
            </td>
        </tr>`; 
    }else if(modalType == 'list'){       
        htmlPayload = `  
        <tr>
            <td class="options-table-title">${variantTitle}</td>
            <td class="${modalType}">
                <select class="list" onchange="updateModalPrice(this, 'list', null, null, ${listTypeIndex})">
                    <option disabled selected value> -- ${variantTitle} -- </option>`;

                    g_listTypeData.options.push(variantOptions);
                    g_listTypeData.price.push(variantPrice);

                    for(var i = 0; i<variantOptions.length; i++){
                        htmlPayload += `<option value = "${variantOptions[i]}"> ${variantOptions[i]}`;
                        if(variantPrice[i] != undefined){
                            htmlPayload += `<i>(+ $${variantPrice[i]})</i>`;
                        }
                        htmlPayload += `</option>`;
                    }
        htmlPayload += `
                </select>
            </td>
            <td class="table-ref-price">
            </td>
        </tr>`;
    }else{
        return false; //error
    }

    HTMLreference.innerHTML += htmlPayload;  

    return true; // no errors found
}

/* Modal type 'amount' | buttons script */
function updateModalAmountVariable(increase, variant_id, HTMLreference, price) {
    var num = document.getElementById(`${variant_id}-amount`);
    var numValue = parseInt(num.innerHTML);
    var maxValue = 10;

    if (increase) numValue++;
    else numValue --;

    // Only update modal-amount if its within the range
    if(numValue > -1 && numValue <= maxValue) num.innerHTML = numValue;
    else return;

    var id = `${variant_id}-amount`

    updateModalPrice(HTMLreference, 'amount', price, id);
}

/* -------------------------------------- OLD CODE | ALREADY FUNCTIONAL -------------------------------------- */

function mostrarInfo (){
    document.getElementById('Info').style.display = 'block';
    document.getElementById('Mostrar-tuinfo').style.borderBottom = '3px solid var(--details-color)';
    document.getElementById('Mostrar-tutienda').style.borderBottom = 'none';
    document.getElementById('products-section').style.display = 'none';
}

function mostrarTienda (){
  document.getElementById('products-section').style.display = 'grid';
  document.getElementById('Mostrar-tutienda').style.borderBottom = '3px solid var(--details-color)';
  document.getElementById('Mostrar-tuinfo').style.borderBottom = 'none';
  document.getElementById('Info').style.display = 'none';
}

/* When document is loaded start creating the new page */
$(document).ready(function(){
    // DEBUG ONLY: clear the sessionMem variable created by liveServer plugin
    sessionStorage.removeItem('IsThisFirstTime_Log_From_LiveServer'); 

    // Get and fill the information about the page owner from owner.json 
    loadOwnerInfo();
    
    //loadProductsInfo(): Get and fill the information about each product from product.json  
    $.getJSON('js/products.json', function(data){
        /* DEBUG: Asegurar que el archivo json tenga indices correctos */
        debug_productIndexError();
        /* Next version: La correccion de indices no será necesaria , ya que el id se 
        validará en backend */

        /* Get unique categories in products.json */
        var product_categories = [];

        $.each(data, function(i, item){
            product_categories.push(data[i].category);
        });

        /* Eliminar las categorias repetidas */
        product_categories = uniq(product_categories);

        /* For each product category */
        for (var i = 0; i<product_categories.length; i++){
            /* UI: Conteo de productos por categoria */
            var count = 0;
            $.each(data, function(j, item){
                if(data[j].category == product_categories[i]){
                    count++;
                }
            })

            /* Creación del espacio de titulo de categorias */ 
            $("#products-section").append(`<h2 class="category-name" id="cat_${i}">${product_categories[i]} (${count}) </h2>`);

            /* Insert the products section for this category */
            var cardHtmlPayload = "<div class=\"products-table\">";

            $.each(data, function(j, item){
                if(data[j].category == product_categories[i]){
                    cardHtmlPayload += 
                    `<div class="product-card">
                        <img src=${data[j].image} alt="">
                        <h3>${data[j].title}</h3>
                        <p class="description" id="js-toclamp">${data[j].description}</p>
                        <p class="price">$ ${data[j].price}</p>
                        <button id="btnId_${data[j].sku}" onClick="displayCartOptions(this.id)" >Ver más</button>
                    </div>`;
                }
            })
            cardHtmlPayload += "</div>"
            $("#products-section").append(cardHtmlPayload);
        }
    });
});
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == document.getElementById("modal")) {
        document.getElementById("modal").style.display = "none";

        // closeOptionals will not affect again if the modal is already closed
        // But it will clear the tempProduct memory
        closeOptionals();
    }
}
// Get and fill the information about the page owner from owner.json 
function loadOwnerInfo(){
    $.getJSON('js/owner.json',function(json_data){
        // Populate the header information
        $("#cover_img").attr("src", json_data.cover_img);
        $("#profile_img").attr("src", json_data.profile_img);

        $("#page_title").html(json_data.title);
        $("#page_info").html(json_data.sub_title);

        $("#address").html(json_data.address);
        $("#address").attr("href", json_data.maps_link);

        /* Load the banner info */
        if(!json_data.banners[0]){
            alert('Banner info empty or not defined in owner.json');
            $("#banner_1").parent().hide();
        }else{
            $("#banner_1").html(json_data.banners[0].data);
        }

        g_phone_number = json_data.whatsapp_contact; 

        // Get the owners phone number


        // Change social media icons (up to 4)

        /* Next version: Style banners based on priority */
        /* Next version: Make the social icons populate itself based on available info */
    });
} // End of fillOwnerInfo();

/* Funcion usada para encontrar elementos unicos en un array */
function uniq(a) {
    var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

    return a.filter(function(item) {
        var type = typeof item;
        if(type in prims)
            return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
        else
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
    });
}// End of uniq();

/* --------- DEBUG ONLY FUNCTIONS ---------- */

/* DEBUG: Asegurar que el archivo json tenga indices correctos */
function debug_productIndexError() {
    $.getJSON('js/products.json', function(data){
        $.each(data, function(i, item){
            if(data[i].sku != i){
                //alert(`[debug]: Error found on products.json index: ${data[i].sku}`);
            }
        });
    });
}
/*

var Detect = {
    init: function () {
        this.OS = this.searchString(this.dataOS);
    },
    searchString: function (data) {
        for (var i=0;i<data.length;i++) {
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) != -1)
                    return data[i].identity;
            }
            else if (dataProp)
                return data[i].identity;
        }
    },
    dataOS : [
        {
            string: navigator.platform,
            subString: 'Win',
            identity: 'Windows'
        },
        {
            string: navigator.platform,
            subString: 'Mac',
            identity: 'macOS'
        },
        {
            string: navigator.userAgent,
            subString: 'iPhone',
            identity: 'iOS'
        },
        {
            string: navigator.userAgent,
            subString: 'iPad',
            identity: 'iOS'
        },
        {
            string: navigator.userAgent,
            subString: 'iPod',
            identity: 'iOS'
        },
        {
            string: navigator.userAgent,
            subString: 'Android',
            identity: 'Android'
        },
        {
            string: navigator.platform,
            subString: 'Linux',
            identity: 'Linux'
        }
    ]
};

Detect.init();

console.log("We know your OS – it's " + Detect.OS + ". We know everything about you.");


 */