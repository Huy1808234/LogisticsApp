
export const formatMoney = (amount) => {
    if (isNaN(amount)) return '0 ₫';

    return Number(amount)
        .toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
        });
};
