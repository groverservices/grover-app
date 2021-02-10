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
    var info = JSON.parse(sessionStorage.getItem('cart'));

    var url = `https://wa.me/${g_phone_number}?text=`;

    var total_price = 0;

    url += `Hola quería hacer un pedido${newline}`;

    url += `Pedido: ${newline}`;

    $.each(info, function(i){

        console.log(info[i]);

        url += `Item ${i+1} x ${info[i].title} ${newline}`;

        // Sumar precio del producto 
        total_price += info[i].price;

        var sub_total = 0;
        sub_total = info[i].price;

        var string = '';

        $.each(info[i].variants, function (j){
            string += info[i].variants[j].option;

            // Si item existe item
            if (info[i].variants[j].item) string += info[i].variants[j].item;
    
            // Si amount existe amount
            if (info[i].variants[j].amount) string += info[i].variants[j].amount;

            // Sumar los precios por variante
            total_price += info[i].variants[j].price;
            sub_total += info[i].variants[j].price;

        });

        url += `${string}${newline}`;
        url += `Sub-total: $${total_price}`;
        url += `${newline}#-----${newline}`;
    });

    url += `Total pedido:$${total_price} ${newline}`;

    url += `${newline}Enviado desde GroverAPP?&lang=es`;

    url = url.replaceAll(' ', space);

    console.log(url);

    if (sessionStorage.getItem('cart')){
        var win = window.open(url, '_blank');
        win.focus();
    }else{
        console.warn("Cart is currently empty");
        alert("Debe agregar items al carrito antes de continuar.");
    }
    closeCartModal();
}
function updateCart(element_id){
    // Get the info for this product
    var payload = document.querySelector("#options-content-header > h3").innerText
    var tempPrice_s = payload.substring(payload.indexOf(' $')+1, payload.length);

    var tempCart = {
        "title": payload.substring(0, payload.indexOf(' $')),
        "image": document.querySelector("#options-content-header > img").src,
        "price": parseFloat(tempPrice_s.replace('$', '')),
        "variants": []
    }
  
    $('#optionsTable tr').each(function(){
        /* Get the option name */
        var var_title = $(this).find('td.options-table-title')[0].innerText;

        /* Get the option choosen */
        var optionType = $(this).find('td')[1].className;

        if (optionType == 'checkbox'){
            var_title = var_title.substring(0, var_title.indexOf('(+ ') - 1);

            var checkbox_selected = $(this).find('td.checkbox input[type=checkbox]')[0].checked;

            if(checkbox_selected) {
                console.log(`la chechbox ${var_title} estaba marcada`);

                var tempPrice_s = $(this).find('td.table-ref-price')[0].innerHTML;
                var tempPrice_f = parseFloat(tempPrice_s.replace('$', ''));
            
                tempCart.variants.push({
                    //"extra": "",
                    "option": var_title,
                    "price": tempPrice_f
                });
            }
        }else if(optionType == 'amount'){
            var_title = var_title.substring(0, var_title.indexOf('(+ ') - 1);

            var amount_choosen = parseInt($(this).find('td.amount div p')[0].innerText);

            var opt_price_s = $(this).find('td.table-ref-price')[0].innerHTML;
            var opt_price_f = parseFloat(opt_price_s.replace('$', ''));

            /* Check if the U choosen 1 or more units */
            if (amount_choosen){
                if (isNaN(opt_price_f)){ // The User choosen this, but its free */
                    //console.log (`${var_title} is Free`); 
                    opt_price_f = 0.00; // Replace the NaN
                }

                tempCart.variants.push({
                    //"extra": "",
                    "option": var_title,
                    "amount": amount_choosen,
                    "price": opt_price_f
                });
            }

        }else if(optionType == 'list'){
            // -> Option title is var_title
            // -> Here I just need the element choosen and its price

            var options_list = $(this).find('td.list select option');

            var opt_price_s = $(this).find('td.table-ref-price')[0].innerHTML;
            var opt_price_f = parseFloat(opt_price_s.replace('$', ''));

            if (isNaN(opt_price_f)){    // The User choosen this, but its free */
                opt_price_f = 0.00;     // Replace the NaN
            }
            
            $.each(options_list, function(i){
               
                // Look for the selected option from this list
                if (options_list[i].selected){
                    var sub_string = '(+ ';

                    var option_name = options_list[i].innerText;

                    var index = option_name.indexOf(sub_string);

                    if (index > -1){
                        option_name = option_name.substring(1, index - 1);
                    }else{
                        option_name = option_name.substring(1, option_name.length);
                    }
                    
                    tempCart.variants.push({
                        "option": var_title,
                        "item": option_name,
                        "price": opt_price_f,
                    })
                }
            });
        }else{
            console.error(`Oops.. It seems that ${optionType} does not exists!.`);
        }
    });

    /* Despues de todo esto, ya deberíamos tener el tempCart completo con info  */
    var strCurrentCart = sessionStorage.getItem('cart');

    if (strCurrentCart){ // If the cart was empty
        strCurrentCart = strCurrentCart.slice(0, -1); // Delete the last ]
        sessionStorage.setItem('cart', `${strCurrentCart},${JSON.stringify(tempCart)}]`);

    }else{ // Crear el primer elemento para el carrito

        sessionStorage.setItem('cart', `[${JSON.stringify(tempCart)}]`);
    }

    closeOptionals();
}
function deleteFromCart (del_id){
    console.log(`product id: ${del_id} -> deleted`);
    // Should be deleted from the sessionStorage
    var currentCart = JSON.parse(sessionStorage.getItem('cart'));

    currentCart.splice(del_id, 1)

    console.log(`Items actualmente en el carrito... ${currentCart.length}`);

    if (currentCart.length > 0){
        sessionStorage.setItem('cart', JSON.stringify(currentCart));
    }else{
        sessionStorage.removeItem('cart')
    }
    
    // Should update the cart Modal
    viewCurrentCart();

    // Should update the fixed footer
    updateFixedCartFooter ()

}

function hideEmptyCartMsg(opt){
    if (opt) $('#EmptyCartMsg').hide();
    else $('#EmptyCartMsg').show();
}

function viewCurrentCart(){
    // Display a pop up modal in the document
    var modal = document.getElementById("cart-modal");
    modal.style.display = "block";
    modal.scrollIntoView({behavior: "smooth"});

    // Get each element in sessionStorage for htmlPayload
    var objCurrentCart = JSON.parse(sessionStorage.getItem('cart'));
    var htmlPayload = ' ';

    if(!objCurrentCart){
        hideEmptyCartMsg(false);
    }else{
        hideEmptyCartMsg(true);
    }
    
    $.each(objCurrentCart, function(i, item){
        // Get the variants for this item
        var variants_description = '';
        var total_price = objCurrentCart[i].price;    

        console.warn("Here we make the descirption for the cart element");

        $.each(objCurrentCart[i].variants, function(j){

            /* {
                    option: "Tamaño", item: " 3500 frigorias(+ $5800)", price: 5800
                }
                
                item: " 3500 frigorias(+ $5800)"
                option: "Tamaño"
                price: 5800 */

            /* Tamaño: 3500 Frigorias (+ $5800) */
            variants_description += `${objCurrentCart[i].variants[j].option}: `;
            variants_description += `${objCurrentCart[i].variants[j].item}`;
            variants_description += `(+ $${objCurrentCart[i].variants[j].price})`;

            /* */
            
            

            //console.log(objCurrentCart[i].variants[j]);

            /*variants_description += `${objCurrentCart[i].variants[j].option} ${objCurrentCart[i].variants[j].extra}:  | `;
            total_price += objCurrentCart[i].variants[j].price;*/
        })

        htmlPayload += `<div class="product-card">
            <img src="${objCurrentCart[i].image}" alt="">
            <h3>${objCurrentCart[i].title}</h3>
            <div class="close" id="${i}" onclick="deleteFromCart(this.id)">&#128465;</div>    
            <p class="description" id="js-toclamp">${variants_description}</p>
            <p class="price">$ ${total_price}</p>
        </div>
        `;
    });
    document.getElementById('cart-modal-product-table').innerHTML = htmlPayload;
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
                <h3>${data[i].title} <i id="item-price">$${data[i].price}</i></h3>
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
                        data[i].variants[j].option, /* Options available (Lists type only) */
                        data[i].variants[j].title,  /* Variant name */
                        data[i].variants[j].price,  /* Price for each unit of variant */
                        listTypeIndex)){
                    }else{
                        console.log ("No variant on sku " + data[i].sku + " variant: " + data[i].variants[j].type);
                    }
                }
            }
        });
    });
    var addToCartDiv = document.getElementById('btn-section');

    addToCartDiv.innerHTML = `<div id='${product_sku}' onclick="updateCart(this.id)"><p>Agregar al carrito</p></div>`;
}
function closeCartModal (){
    var modal = document.getElementById("cart-modal");
    modal.style.display = "none";
}
function updateFixedCartFooter (){
    const ref = document.querySelector("body > div.container > section > p > b");
    var cart = JSON.parse(sessionStorage.getItem('cart'));
    var acum_price = 0.00;

    if (cart){
        $.each(cart, function(i){
            acum_price = acum_price + cart[i].price;

            $.each(cart[i].variants, function(j){
                acum_price = acum_price + cart[i].variants[j].price;
            })
        })
        ref.innerText = `($ ${acum_price.toFixed(2)})`;
    }else{
        ref.innerText = `(vacío)`;
    }   
}

// Hide the modal if the user clicks the X or outside the window
function closeOptionals(){
    var modal = document.getElementById("modal");
    modal.style.display = "none";

    updateFixedCartFooter ();

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
        console.error(`Oops! Something is wrong with type ${type} not expected!`);
    } 
}

// Load the modal table with info from variants in elements in products.json
function createModalList(HTMLreference, modalType, variantOptions, variantTitle, variantPrice, listTypeIndex){
/*
    data[i].variants[j].option  ->  variantOptions
    data[i].variants[j].extra   ->  variantTitle
    data[i].variants[j].price   ->  variantPrice
    listTypeIndex               ->  listTypeIndex
*/

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
    updateFixedCartFooter ();
}); // END OF $(document).ready()
window.onclick = function(event) { // When the user clicks anywhere outside of the modal, close it
    if (event.target == document.getElementById("modal")) {
        document.getElementById("modal").style.display = "none";

        // closeOptionals will not affect again if the modal is already closed
        // But it will clear the tempProduct memory
        closeOptionals();
        closeCartModal();
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