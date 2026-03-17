const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

// SUA CHAVE DE ACESSO DA API
const API_KEY = "840e486a563b3be91c14962502acfc8f";

// DADOS OFICIAIS DE BUSCA
const MARICA_ID = 25595;     // ID Oficial do Maricá FC na API-Football
const TEMPORADA = 2026;      // Ano corrente
// IDs de Exemplo (Você precisará buscar os exatos do Carioca A, Brasileiro D e Copa Rio)
const LIGAS_IDS = [252, 604, 881];

/**
 * Função Agendada (Cron Job)
 * Roda automaticamente todos os dias às 03:00 da manhã (Horário de Brasília)
 * Não consome a bateria do seu usuário, não trava o aplicativo, e gasta apenas 1 requisição na API!
 */
exports.syncJogosMarica = functions.pubsub.schedule("0 3 * * *")
  .timeZone("America/Sao_Paulo")
  .onRun(async (context) => {
    
    try {
      console.log("Iniciando varredura de jogos do Maricá FC...");
      const promessasLigas = LIGAS_IDS.map(ligaId => {
        return axios.get("https://v3.football.api-sports.io/fixtures", {
          headers: { "x-apisports-key": API_KEY },
          params: {
            team: MARICA_ID,
            league: ligaId,
            season: TEMPORADA
          }
        });
      });

      const respostas = await Promise.all(promessasLigas);
      const batch = db.batch(); // Para gravar tudo no Firebase de uma só vez (mais barato!)

      // Percorre os resultados das ligas
      respostas.forEach(respostaAPI => {
        const jogos = respostaAPI.data.response;
        
        jogos.forEach(jogoRaw => {
          // Extrai APENAS o que o seu Aplicativo precisa para a UI ficar bonita
          const dadosLimpos = {
            idDaPartida: jogoRaw.fixture.id,
            campeonato: jogoRaw.league.name,
            temporada: jogoRaw.league.season,
            dataHoraISO: jogoRaw.fixture.date,
            status: jogoRaw.fixture.status.short, // 'NS' (Not Started), 'FT' (Full Time), '1H', etc
            
            timeCasa: jogoRaw.teams.home.name,
            escudoCasa: jogoRaw.teams.home.logo,
            golsCasa: jogoRaw.goals.home !== null ? jogoRaw.goals.home : 0,
            
            timeFora: jogoRaw.teams.away.name,
            escudoFora: jogoRaw.teams.away.logo,
            golsFora: jogoRaw.goals.away !== null ? jogoRaw.goals.away : 0,

            // Pegar o mês da partida para criar o filtro das Abas Horizontais depois!
            mesRealizou: new Date(jogoRaw.fixture.date).getMonth() + 1
          };

          // Define o caminho no Firebase: colecao `jogos`, documento = idPadrão da API
          const docRef = db.collection("jogos").doc(String(dadosLimpos.idDaPartida));
          batch.set(docRef, dadosLimpos, { merge: true });
        });
      });

      // Executa a gravação mastigada no Banco de Dados
      await batch.commit();
      console.log("Sincronização concluída com sucesso! Banco atualizado.");
      return null;

    } catch (error) {
      console.error("Erro drástico ao tentar sincronizar a API:", error);
      return null; // Encerra silenciosamente
    }
});
