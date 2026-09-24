import { useSelector } from 'react-redux';

export const useCurrency = () => {
  const { selectedCurrency, currencies } = useSelector((state) => state.currency);
  const defaultCurrency = currencies?.find((c) => c.isDefault) || selectedCurrency || { code: 'INR', symbol: '₹', exchangeRate: 1.0 };
  const currencySymbol = selectedCurrency?.symbol || defaultCurrency?.symbol || '₹';

  const convertPrice = (amount) => {
    const num = Number(amount) || 0;
    const rate = selectedCurrency?.exchangeRate || 1.0;
    return num * rate;
  };

  const formatPrice = (amount) => {
    const converted = convertPrice(amount);
    const symbol = currencySymbol;
    
    // Format options: if currency has decimals or if exchange rate makes it small
    // For INR/EUR/GBP, general formatting:
    const formattedVal = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(converted);
    
    return `${symbol}${formattedVal}`;
  };

  return {
    selectedCurrency,
    defaultCurrency,
    currencySymbol,
    convertPrice,
    formatPrice
  };
};

export default useCurrency;
