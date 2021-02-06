chrome.runtime.sendMessage({
    from: 'content',
    subject: 'showPageAction',
});

function getCurrencySymbol() {
    var currencySymbol = document.getElementsByClassName('a-price-symbol')[0].innerText
    currencySymbol = currencySymbol.replace('$', '');
    var conversionTable = { 'CDN': 'CAD', 'JPY': 'JPY', 'EUR': 'EUR', 'INR': 'INR', 'RUB': 'RUB', 'CNY': 'CNY', 'DOGE': 'DOGE' };
    return conversionTable[currencySymbol];
}

function formatItemWholePrice(itemPrice) {
    return itemPrice.replace('\n', '').replace(',', '');
}

async function main() {
    console.log("début de la méthode");
    // Get Current Currency
    var currentCurrency = getCurrencySymbol();
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
    console.log("fin de la méthode");
    return "Succesfully converted :)";
}

async function execute() {
    var result = await main();
    chrome.runtime.onMessage.addListener((msg, sender, response) => {
        if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
            var info = {
                resultMessage: result
            };
            console.log("envoie des infos");
            response(info);
        }
    });
}

execute();