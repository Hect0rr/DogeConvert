chrome.runtime.sendMessage({
    from: 'content',
    subject: 'showPageAction',
});

var ids = ["priceblock_ourprice", "priceblock_dealprice", "priceblock_saleprice", "price_inside_buybox"]

function getPageType() {
    if (document.getElementsByClassName('a-price-symbol').length > 0)
        return 0;
    else
        return 1;
}

function getCurrencySymbol(pageType) {
    var currencySymbol = null;
    if (pageType == 0)
        currencySymbol = document.getElementsByClassName('a-price-symbol')[0].innerText
    else {
        var i = 0;
        for (var i = 0; i < ids.length; i++) {
            var currentElement = document.getElementById(ids[i]);
            if (currentElement == null)
                continue;
            currencySymbol = currentElement.innerText.substr(0, 3);
            break;
        }
    }
    if (currencySymbol == "$")
        currencySymbol = "USD";
    currencySymbol = currencySymbol.replace('$', '');
    var conversionTable = { 'USD': 'USD', 'CDN': 'CAD', 'EUR': 'EUR', 'DOGE': 'DOGE' };
    return conversionTable[currencySymbol];
}

function formatItemWholePrice(itemPrice) {
    return itemPrice.replace('\n', '').replace(',', '');
}

function getPriceFromBlock(blockPrice) {
    var space = String.fromCharCode(160);
    var itemPrice = null;
    if (blockPrice.includes(space))
        itemPrice = blockPrice.split(String.fromCharCode(160))[1].split(".");
    else
        itemPrice = blockPrice.replace('$', '').split('.');
    var wholePrice = itemPrice[0];
    var fractionPrice = itemPrice[1];
    return +(formatItemWholePrice(wholePrice + "." + fractionPrice));
}

function multiItemsPageConversion(conversionRate) {
    var itemWholePrices = document.getElementsByClassName('a-price-whole');
    var itemFractionPrices = document.getElementsByClassName('a-price-fraction');

    var hasFraction = itemFractionPrices.length > 0;

    for (var i = 0; i < itemWholePrices.length; i++) {
        var whole = itemWholePrices[i].innerText;
        var fraction = 0;
        if (hasFraction)
            fraction = itemFractionPrices[i].innerText
        var itemPrice = +(formatItemWholePrice(whole + fraction));
        var dogePrice = itemPrice / conversionRate;
        var splitDogePrice = dogePrice.toString().split('.');
        var dogeWhole = splitDogePrice[0];
        var dogeFraction = splitDogePrice[1];
        itemWholePrices[i].innerText = dogeWhole;
        if (hasFraction)
            itemFractionPrices[i].innerText = dogeFraction;
        else
            itemWholePrices[i].innerText = itemWholePrices[i].innerText + "." + dogeFraction;
        document.getElementsByClassName('a-price-symbol')[i].innerText = "DOGE";
    }
}

function singleItemPage(id, conversionRate) {
    var blockPrice = document.getElementById(id);
    if (blockPrice == null)
        return;
    var itemPrice = getPriceFromBlock(blockPrice.innerText) / conversionRate;
    document.getElementById(id).innerText = 'DOGE ' + itemPrice;
}

async function main() {

    //Get page type
    var pageType = getPageType();

    // Get Current Currency
    var currentCurrency = getCurrencySymbol(pageType);
    if (currentCurrency == null && currentCurrency != "DOGE")
        return "Sorry this currency is not supported";

    //Get USD Price For That Currency
    const responseUsdPrice = await fetch("https://api.exchangeratesapi.io/latest?base=USD");
    const usdPriceData = await responseUsdPrice.json();
    var usdPrice = usdPriceData.rates[currentCurrency];

    //Get DOGE Price vs USD
    const responseDogePrice = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=dogecoin&vs_currencies=usd");
    const dogePriceData = await responseDogePrice.json();
    var dogePrice = dogePriceData.dogecoin.usd

    //Conversion rate
    var conversionRate = usdPrice * dogePrice;

    //Convert All Item Prices
    if (pageType == 0)
        multiItemsPageConversion(conversionRate);
    for (var i = 0; i < ids.length; i++)
        singleItemPage(ids[i], conversionRate);

    return "Succesfully converted";
}

async function execute() {
    var result = "";
    try {
        result = await main();
    } catch (error) {
        result = "Much Error. Many sorries";
    }
    chrome.runtime.onMessage.addListener((msg, sender, response) => {
        if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
            var info = {
                resultMessage: result
            };
            response(info);
        }
    });
}

execute();