export const onlyDigits = (v) => (v || '').replace(/\D/g, '');
export const formatID = (s) => (s || '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const parseID = (s) => parseInt((s || '').replace(/\./g, ''), 10) || 0;
export const rupiah = (n) => new Intl.NumberFormat('id-ID').format(n || 0);
