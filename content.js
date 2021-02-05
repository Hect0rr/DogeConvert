function getCurrencySymbol() {
    var currencySymbol = document.getElementsByClassName('a-price-symbol')[0].innerText
    currencySymbol = currencySymbol.replace('$', '');
    var conversionTable = { 'CDN': 'CAD', '': '' };
    return conversionTable[currencySymbol];
}

async function main() {
    // Get Current Currency
    var currentCurrency = getCurrencySymbol();
    console.log(currentCurrency);

    //Get USD Price For That Currency
    const responseUsdPrice = await fetch("https://api.exchangeratesapi.io/latest?base=USD");
    const usdPriceData = await responseUsdPrice.json();
    var usdPrice = usdPriceData.rates[currentCurrency];
    console.log(usdPrice);

    //Get DOGE Price vs USD
    const responseDogePrice = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=dogecoin&vs_currencies=usd");
    const dogePriceData = await responseDogePrice.json();
    var dogePrice = dogePriceData.dogecoin.usd
    console.log(dogePrice);

    //Conversion rate
    var conversionRate = usdPrice * dogePrice;
    console.log(conversionRate);

    //Convert All Item Prices
    var itemWholePrices = document.getElementsByClassName('a-price-whole');
    var itemFractionPrices = document.getElementsByClassName('a-price-fraction');

    for (var i = 0; i < itemWholePrices.length; i++) {
        var itemPrice = +((itemWholePrices[i].innerText + itemFractionPrices[i].innerText).replace('\n', ''));
        var dogePrice = itemPrice / conversionRate;
        var splitDogePrice = dogePrice.toString().split('.');
        var dogeWhole = splitDogePrice[0];
        var dogeFraction = splitDogePrice[1];
        itemWholePrices[i].innerText = dogeWhole;
        itemFractionPrices[i].innerText = dogeFraction;
        document.getElementsByClassName('a-price-symbol')[i].innerText = "DOGE";
        console.log(splitDogePrice);
    }
}

main();