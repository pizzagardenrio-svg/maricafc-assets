/**
 * Baixa imagens referenciadas nos code.html do Stitch (HQ Maricá FC e Portal do Sócio).
 * Projeto Stitch ID: 13862684011194533691
 * HQ ID: c814768db71f4f6d9db32bd8c9d71166 | Portal ID: ae1ab3647c49486abe563a11ba90d998
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'images');

const IMAGES = [
  // HQ Maricá FC
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuOz130cRBqRIPXE4y6L1QIqJiYLroJEM2QzuhiRyAC6rEeLicT6ES6XAJ36vrb-UVA8MgvUByzHU1pFS1VBYwp1-Nm-vORlTWFaOUpZolWcDAcTIx8kq4OZrpizvKnoGtDwjwMs6D1kBnaFqOWUB6Sq7SjM1ozaqOjaAC-RFi2GVwJKGcxE8sjXLJlhOuMu2kqzcfwZFpGF1SB7PgCmREitgCrYoBzxQ0Ll-InR6v6yPV28eAgZdhQh68BoDBp05LvoF1R3IY1Ahs',
    file: 'hq-marica-training.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBIRAGGf52klj55jpnR_heTxjQmKde4WXy7ScMKBHWg2kFewnrf3HdtHtnUw80wfFPXmmh-4tqVi4RDepQ9f0LXp5oHZ1jfb8djfHFs5BBKNJOo6GvDagPX5cOz2j2Ow_N1lDjB_ae8cEIfJmkuSHJAJUfE-Lt9DPkHfCqIWVov-tqHdE-ph65Yd3yRfbjLsEG8sqLYPtwmT63ooIVDkhNIoIXk6Oijhe1OquuzJ1D6C_pJZ7svsRqxk9Sz6RtGlicUPDnwJ8dPuAB',
    file: 'hq-marica-manager.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2C5IM6XrV5E4FYaQMivrikMrzfiWk-fzm7mH76AGfBDEy1a_JQmGWHzO2xGL2ZXFD9rTnh6DPpkjYWfartgb_tlIx2CS0-n6FPPpWoHDIPxnJmbUVmOfDZHBqq-hmGF71kJ4t93ROtvN9xyLglHMI34iMRfKn76hIrelWc4f9J9imhX8aSN2JqJ-6NVnLCTgl-wyTpDc3t1m4Dgk9vmJPLvHbnhpTpj9vq-v-JnPB2y5z50pq2tbvq0ZEPr9s05IJLT7AvrgyJSFx',
    file: 'hq-marica-stadium.jpg',
  },

  // Portal do Sócio
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDspjLWAkXCSv8yZl6Sb5TPThLzUCW6GYLgVvdLFM3yz7B5_WA1u3LKUra9MBF9mqsP3fORAFVTF1B8ByG9jlSW0qHxDcagXu8CIwahamePBeTpfzqmskX4Flf8R_Cyjbm7vPOIPmKrHSnWrpaFdjuqVqzXELOsmw1WoKA2mWQaz6UdojcLlV8Bs46YJGi9ZX7sf87fjkVZhD_6Am7IvVkojcCWjnPjg0r5H3BmEdK2p1S1g3DhHUOnPyFnmWKVpPYTuOITJD0m7N-_',
    file: 'portal-socio-qrcode.jpg',
  },

  // Diretoria
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhgVXQ7Q7CRHtJObxpguhxYjzw2HMNE_hHi0plejybDa2xx8Iov4MbJ3Vw1ZMVtMk9Xc6p7-sXFn_o22YLas91itvAFLorTCDF9h4k8PlwlWQYqSenhjnzrgS7U_RhRQB5OJ7egB8yjBPTmRcBL0pzk8FmPj-SvMSoexO78euYmc48hVZ3pYPZ8t0PkWq7ET5VPb_rmtd085X_QIsFxeFlmxekKzvD4LVxgqohHmS5Fhb26LFVbZ5o01oWOnbZSv0995D30HIB_-_n',
    file: 'escudo-marica-diretoria.png',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOr8mDocLGdSICCoAHlFIaXwJLjGI9JOGRcbIaxP9HElrx90d1dQ_tjqgDTCjbre37I0HbsgIX7BwMRUSKezpfoYP_-m26MBHkxdeOs9CcZVLfH4UEy_oX9nbl_Vw-eACoPxcUGPe9f_7e2_jKjNinsHkuB6jnAfThM01yeCwpFpemz0aP9rV-0RyHsWm5DUQz5J8uq15of7BKnoMDulL8b3mNSijrpb_BK2KNvhT3lMmteaweOBPuqNaUM_9uMUi_mRj_1x2r1is9',
    file: 'diretoria-douglas-oliveira.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpwKha5IusXdaHCnlYVPDwUZzrElP5Chi4Lhx5tUYSAkkcJ3R7QI3bhcJfbGZEh9m7wmEdyDHS8oxb6FfMRLuNzuUJgZ1DuhfL2rJF_vec0b0s28ECD0ZMyzIn57ClYe-VlVXiUdmcS3Pe0vqkxnJD17BhJWoplBTurGAvX83b2nIVz1Bu6ffAEb3fVFQxoKKvJ-nhL4qSmZZr2Y3sCm9_WKSj8gZe9pTU37o9UH2F38S5k5SQqmcZM3IyiSrZOhNfK4C2e2_wG_Cq',
    file: 'diretoria-rodrigo-costa.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb3tlnHSgy_hdrKJR9ayBVtkupwgOlLeZW5liLKb0GvCKiAc2cts74pywWUEIER39DExUURthtV3_EZbG_XakYS1fZICx0w4Va6RK2oqfBtvvh_5p2ih5Q5-_RjAtdz5eXqW2Jirz1UTXAsFlJTPiq4Q5xwMNIAOlje-TUqhiQxw3faO2Bm67sU-7p7zYHF2dtbxE-npZ7_nW4LGXZUixDagmE_W8g140d-LX4Ww0p3WBNaUPnflBHdukH6x2pjfEnl7fW5otMt1LZ',
    file: 'diretoria-carlos-santos.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCapX-Aa2I5iEhFJi8s7vVRRdoFw5wiAnaQtVRtReT-yVrIM6231ImGWizkh4zfVZEK1UGKmXIUcKPEerjijeL-RwyTRO33QCaZuVskQyvlMvAFdmxxPDrtLGkKnCC5QFYNxTIYyLHMv4hBPwdu0eJ_cal1ZB9wJCSxryYQrFF7n8jnX_Gp4-ujYIZhEVz-PTuSAXJcSSXB7ri20L4P74zLI-Slvujj7WDuWzSkD9mpDJhMlVPzIGbIirKxlkws1nH510HjLChy6CVB',
    file: 'diretoria-ricardo-mendes.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSvvtzXsu-5Zm7pGGLzeas3N1n_IvK42vmNUMt9dom8pvz3WIudLXozlaPgm9mNtyAmaWFcCnY-wlQZkPNcVD958gioRxoyL2tHAQqYMgLF14cEIgPTNOH6UkqwHNr0IQ08lSpF_mUX1cbkEso9kF1eKl5wVH0SVw9A0fBaPoRnkmGcowAVwhlXVVshx-WnE566yRpNStJ59rqmuER9LXj61r0ZSrWb8Vsj1bcAB395oRcTHS7cqOSacnhofzg1iv1LWIG0w75DNSq',
    file: 'diretoria-ana-beatriz.jpg',
  },

  // Perfil Gerson Dida
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeOeUBCtipUPa6n9KsKId4gReO5kxxMZA2z3B9yZFRTmjpOisVQAcjWU-kb276XNSGu3xkEbzEPe0lUA9br1iSiRwkT9wJenYauBW5yq8t3ueHYIsxC4iOwE_sWURrlhHkV4PQCYA6K19XphbkpFuLgmE5Md44X9vuxMXs63iTBowO8SlInfxtGC-8yRdUl908Pwfw0aSob1DPZUmJ9zgX949s4FWbo5cvTJogUxHqhYUEYnFNUKGAzB3hX574DhZhY0wSyIyBpjSX',
    file: 'perfil-gerson-dida.jpg',
  },

  // Títulos e Conquistas
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCseVnnbSPkrkVhZ03BTJfSx5AA732GI1XDi7U5yIFqBtTWZPm3KWX9J72a1_3r9-yh22XboOSKcGAz-iRpcihDk7SWW2RTz7jaLU2ysq6vOGOl_5U8NtL6JYIfmhY6LHupMUN067RqywmDaPAqUPVHI38yyQR1m2G4Z_rKI-lIcWc4-H9wevQM1g6ZRuNVi_3SX7OjbFZ4HtPh_LoOaMFNJuQpF96KlK8soacvaSMcIGBZR3QACGiNGMgre614bgPUeLMqWl2Vro2Q',
    file: 'escudo-marica-titulos.png',
  },

  // História do Clube
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDNf1JPd4yCtF4fvx4rZV8suMxEcYWsESDhCwiAWT0xz8hUK9LmPIfEM32ox5SbASPZHzko0sMhiqHigTw7c_m4gWodbYohk6T9N4BzYAdVW1-aRuJyTIH3o5ZCut8ZMkW6nAEIdHLzm9wjoKy25ovkwiDTY9t3yDhG5NYeEgCrp2UcowROLlPGyznHixb3NoGzYgaNY836TehZeUcYNqoNozmTztb3hVyZuF3eMr8f5leaAOr2s-9CWfyZZCpq20OS-quvLfkEgf5',
    file: 'historia-cover.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA44zcvuH-bHyMhr1N52qa3OUAWbpQPFvK1X98vpZCipsjtIj29PGqIYZyLmMsIi8OlZuWjmgnEUSkiAEsHortWFWTuCAPEtgdqAbUdkAEo-81R_JUz8ZLB8c8oBoVDQ-MWyeDFW0hpR0njPVemRu_aYsk6pYjuUK9WvpiTBYnQ6iIdrnUFChlgMNbkrYR5gIeoDKGerIuWUKshSJPAPem3hhN-crsoQUH9aGOS019wT0mw-DsqGw3oUjPTGeAgnXYxQ7IayOVkh-Mt',
    file: 'escudo-marica-historia.png',
  },

  // Perfil Pablo Thomaz
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAChUQ7E8ULOnlkCRMpbwHAGjEbwaPaCLE214g8Rzaa8PikQyifPRc0QLwk7r9w2sAYyd75QFuaI0xPhl08RhPFyXC7tXDZ0u2913oPC2KAoPgz7EgQSvCwgN9VqjuwttTiUujpcdkFUdNL32WzeM0OIOD8tcXtxh9TLX3qhrgDvepOo833b8F3ISJkQCrvhE_o9psEyCVTv0vZM4bR930hJ3oWIeJMKvH9Y_H7K-xUAU3wwj6_lNvTgIj5hsMzPdYF4khRYD1eupLs',
    file: 'perfil-pablo-thomaz.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA7jwsGTXz7WTfmTUSuMf_AGSj8k29HA4V3ZOUE6M1enEFyepvf2PIy_qdWYkapCVzkLv_J5rD2j2g4dIh51K9nbYflOkXcuxPCNVD7n411SgxgLMqrs1S28Rz2u1-Zzyutn7Ojtv2moPxYjFbdH2qOeTRqMRu61AUEo6-kkzXn7ZhbhJVC83hurXMS2MiizYBOaudEOcCGVkrwJKWTAtnbfoYbv6itoE1bFWKRXa7xYdMFI81Jt-d0CUKuX4eer4bV-NGaQGiLvde',
    file: 'pablo-heatmap.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZggU7PZOh5obl_qDuNaXzYFHplopiGO7YlAdRdYK9TG705FkuWsQSZWFaP00xiRh55Tj7pt9AvzoMtJSthb9rvRxSfmVW9ZLh8aRcLvng3SRfs7CiRcXMF-0L75cp8pUwoEvYe37ZhvfaU1PjgB_X4ZyCLU1J8_bNp0WHPeEhEGjFLIrT03aogSx_fwvAWh88uS-nmFdO78gsKTYH7rtWJK6YSRXQVGo9ijC3n50QFYg4b8a11N271_Eh178GzMHB1Zq_qsADNuhj',
    file: 'escudo-marica-pablo.png',
  },

  // Elenco Maricá FC (exemplo de bandeira)
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPGNd6YMhhtNkVsLex987iig6unRUf7X0AanF3t4XSeXyuPXPnkFBs58yGRl02E23E-ValMpPnYMsYHxt24SO8OFiypyrTLLmi9_HSko67FRHz5qgolVhOVqLQNE4PtsamoxCyaTWss8urhjQnKwlewyuSIHfJGHNOvWfr0RY3K9ocsH2todP0hZj5DAawbOLT4Lrmhn5WLVokmKZUx63ueeBpldE-k5ZzqVhKc0xdnx6yIbhtEOvAq8SVoyDfZke_bgsTzb3aeNr3',
    file: 'elenco-nigeria-flag.png',
  },

  // TV Maricá - vídeos exclusivos
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQgx-F2ETQgNwH2lEYTmAajaZCnKYC7qW1sQ_WCIuZzE3Lk8ISjf0hdQ5tmdVF7OnoUDl0kJSXhkaCXNqjv120mExgqsCvwCfAfacOJVkdA3fjbUkiG1P3a0MOepxI267jlutWXBoMi3DzwK9bRrBlhDnbC43mQ1dEAcgTu5B5_TwY56AU1O8oMGfv66Z241HBjLzMTeuAggwQZ-fttzUZqhh5jJm9VEqMSB8n3mAbJGcO7q2UV181KU_cxhspzfiJ1goRNHr7LxUh',
    file: 'tv-marica-featured.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwjHF0S2nTOFfT17PqJ57gmnhRXXvzriQn0nGNS1Alk-wTHF_Qy3_-u_x9bTaNVVYE3DUKb5bD7nBJi-ZUY57HSR8WqSqwLYGcJT1LPW24vaia2XvyhgmFFi3IWKBmBUkTtAaP5NiM-A90E7u4vo7BUnY2bu-y-xDM8m6C3XcLHL3dyqYpMhg_upAX4qj9xcyvvRWuVHSFxr3riPzRxLZZcbDn_tT5wvDzxVBGlXksWIaGnljQtpN6hEWF97DoaI7H0dEMzdDVUC5_',
    file: 'tv-marica-training.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQmkKg0o7Z5vvjPFm_e9OihJgst3-SEMykNKPxTGJu3coxrMp82Sk0m8J4W-i_EBXSqcomsoVmQ9xhCS7dVCjyS82Xl4SY3JCxQCgXjx6yClrUdVX8pN7bGF_XUFayH3xR_KSm2yp0E9dCcP4qkhKN3lU_zW7znybdzdHoqCtsfuuy4J6xTwFqhBQLxWs2RWrOzt70ixmvMdpjgn03EHw2ZZtKmm_fvhTcnf3QB_GJZPIdw1aqa2dJYpstWAiE8gFMWK32TKHLb4Qx',
    file: 'tv-marica-interview.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm4BiJ38xAEGqA1rmZFtl_Y8ZlyKItAlZkc36g-tUwqB-MFniC4kJmg7Dn8ViZQPnlqRcHhXe1wQtmoVe3AKNnbYiCcgnYl4MyioTrNIljqCpGirubsic46UpwGBy_mlL7th4PZY5J6CqBZ0aKdOnceSUCxxUREHqLHUmBTwxU3tmf0IYzGmE900r4QCyk_wawayXmJ5d6SR2_gLTWwI7gUGxKNVKir86r0_WV1Y6OsMup2s9l0pviOaKrmy7t4gMzMibT8ziv4Enh',
    file: 'tv-marica-crowd.jpg',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAq0z4pvLDTCkEuIVDynyaSMQZF46zIYoMS4yONXPgN41AGGtHtkJhfaIHxtL-KRfe-ESfPQC4f-sF13JWivOhpZLvUwgUbJnwczQ769HBDbL3Fm4Rtpv8NZS-ySCoYTsSQL5htGZ_POZAVfSk9Qkn0E_ci6qnxY4KEZFIoHzhHC6Woxwt_8LHXKGENwGH2U451SvwBX6hHbF3YgV2s7DakRf6f2BvOsD25ztjEN1UHbw0AsW5aTo2MK2pFZLQjxZ9WsBXBIVE-jiQa',
    file: 'tv-marica-ball.jpg',
  },
];

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'MaricaFC-App/1.0' } }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
  for (const { url, file } of IMAGES) {
    const filePath = path.join(ASSETS_DIR, file);
    try {
      const buf = await download(url);
      fs.writeFileSync(filePath, buf);
      console.log('OK:', file);
    } catch (e) {
      console.error('Erro ao baixar', file, e.message);
    }
  }
}

main();
