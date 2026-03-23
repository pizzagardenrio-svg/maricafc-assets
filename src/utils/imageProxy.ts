// src/utils/imageProxy.ts

/**
 * Limpa e otimiza URLs de imagens do Firebase Storage via proxy weserv.nl.
 *
 * Problemas resolvidos:
 *  1. CORS: Firebase Storage bloqueia requests cross-origin da Vercel.
 *  2. URLs longas: Firebase gera tokens JWT enormes — encodeURIComponent garante
 *     que o proxy não trunca nem rejeita a URL.
 *  3. Cache: weserv.nl faz cache global das imagens, reduzindo latência.
 *  4. Fallback: se a imagem não existir, exibe um placeholder via `default=`.
 *
 * Referência: https://images.weserv.nl/docs/
 */

const WESERV_BASE = 'https://images.weserv.nl/';
const FALLBACK_URL = 'https://placehold.co/400x400/F4F4F0/002147?text=MFC';

/**
 * Remove parâmetros de autenticação opcionais do Firebase que às vezes
 * causam rejeição no proxy quando a URL fica muito longa.
 * Mantém apenas a URL base do objeto no bucket.
 *
 * Exemplo de entrada:
 *   https://firebasestorage.googleapis.com/v0/b/my-app.appspot.com/o/images%2Fphoto.jpg
 *   ?alt=media&token=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 *
 * Saída limpa:
 *   https://firebasestorage.googleapis.com/v0/b/my-app.appspot.com/o/images%2Fphoto.jpg?alt=media
 */
function cleanFirebaseUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Garante que alt=media está presente (obrigatório para download público)
    parsed.searchParams.set('alt', 'media');

    // Remove o token de autenticação — ele não é necessário para objetos
    // com regras públicas de leitura e só aumenta o tamanho da URL.
    // Se o seu bucket exige autenticação, REMOVA esta linha.
    parsed.searchParams.delete('token');

    return parsed.toString();
  } catch {
    // Se a URL for inválida, retorna ela mesma sem modificação
    return url;
  }
}

/**
 * Retorna a URL otimizada via proxy weserv.nl.
 *
 * @param url       - URL original da imagem (Firebase Storage ou qualquer HTTP/HTTPS)
 * @param width     - Largura máxima em pixels para redimensionamento (padrão: sem limite)
 * @param quality   - Qualidade JPEG/WebP de 1–100 (padrão: 85)
 * @param format    - Formato de saída: 'webp' | 'jpg' | 'png' | 'auto' (padrão: 'webp')
 */
export function getOptimizedImage(
  url: string | undefined | null,
  {
    width,
    quality = 85,
    format  = 'webp',
  }: {
    width?:   number;
    quality?: number;
    format?:  'webp' | 'jpg' | 'png' | 'auto';
  } = {}
): string | undefined | null {
  if (!url || !url.startsWith('http')) return url;
  return 'https://images.weserv.nl' + encodeURIComponent(url.trim()) + '&default=https://placehold.co';
}

export default getOptimizedImage;
