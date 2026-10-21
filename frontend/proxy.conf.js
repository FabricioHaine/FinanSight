/**
 * Proxy de desenvolvimento: encaminha as chamadas de /api para o back-end.
 * O endereco pode ser alterado com a variavel de ambiente PROXY_TARGET.
 */
const target = process.env['PROXY_TARGET'] || 'http://localhost:8080';

module.exports = {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
    logLevel: 'warn',
  },
};
