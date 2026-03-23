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
  // Passa valores falsy e data URIs sem modificação
  if (!url || !url.startsWith('http')) return url;

  // Limpa a URL do Firebase antes de enviar ao proxy
  const cleanUrl = url.includes('firebasestorage.googleapis.com')
    ? cleanFirebaseUrl(url)
    : url;

  // Monta os parâmetros do weserv.nl
  const params = new URLSearchParams();

  // `url` é o parâmetro obrigatório — deve ser a primeira entrada
  params.set('url', cleanUrl);

  // Fallback exibido se a imagem original falhar
  params.set('default', FALLBACK_URL);

  // Formato de saída (webp por padrão = menor tamanho)
  if (format !== 'auto') {
    params.set('output', format);
  }

  // Qualidade (ignorada para PNG)
  params.set('q', String(quality));

  // Redimensionamento proporcional (só adiciona se width foi passado)
  if (width) {
    params.set('w', String(width));
    params.set('fit', 'inside'); // nunca amplia, só reduz
  }

  return `${WESERV_BASE}?${params.toString()}`;
}

/**
 * Versão simplificada para uso rápido sem opções.
 * Mantém compatibilidade com o código existente que chama getOptimizedImage(url).
 *
 * @deprecated Prefira usar getOptimizedImage(url, { width, quality }) para controle total.
 */
export default getOptimizedImage;
