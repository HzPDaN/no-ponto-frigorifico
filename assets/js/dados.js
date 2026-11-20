/* ==================================================================
   Dados do site — No Ponto Frigorífico
   Usado pelo navegador (mapa de cortes) e pelo gerador das páginas
   (_ferramentas/montar.js). Altere aqui e rode: node _ferramentas/montar.js

   A CONFIRMAR COM O CLIENTE:
   - capacidade: números do briefing (unidade/período ainda não confirmados)
   - cortes: nomenclatura de referência do mercado (Portaria MAPA nº 05/1988
     para bovinos; cortes ovinos Embrapa). Ajustar ao portfólio real.

   Mapas: cada espécie usa uma silhueta real (PhyloPic, domínio público —
   ver _ferramentas/silhuetas.json). As regiões abaixo são polígonos no mesmo
   quadro (0 0 820 440) e são recortadas pelo contorno do animal; por isso
   podem passar do contorno. O terceiro item é a posição do número.
   ================================================================== */
(function (raiz) {
  'use strict';

  var CONTATO = {
    whatsapp: '5546992024048',
    whatsappTexto: '(46) 99202-4048',
    telefone: '+554635261115',
    telefoneTexto: '(46) 3526-1115',
    celular: '+5546999360112',
    celularTexto: '(46) 9 9936-0112',
    sif: '7439',
    email: 'sac@redonoponto.com.br',
    instagram: 'https://instagram.com/nopontofrigorifico',
    endereco: 'Rodovia PR 493, km 28,5',
    cidade: "Itapejara D'Oeste — PR",
    cep: '85.580-000',
    razao: 'Guerro e Pagnussat Ltda',
    cnpj: '09.461.639/0001-49'
  };

  var CORTES_BOI = {
    'pescoco': ['Pescoço', 'Dianteiro', ['Pescoço']],
    'cupim': ['Cupim', 'Dianteiro', ['Cupim']],
    'acem': ['Acém', 'Dianteiro', ['Acém', 'Miolo de acém']],
    'peito': ['Peito', 'Dianteiro', ['Peito']],
    'paleta': ['Paleta', 'Dianteiro', ['Paleta', 'Raquete', 'Peixinho']],
    'musculo-d': ['Músculo dianteiro', 'Dianteiro', ['Músculo dianteiro']],
    'contrafile': ['Contrafilé', 'Lombo', ['Contrafilé', 'Ancho', 'T-bone']],
    'file': ['Filé mignon', 'Lombo', ['Filé mignon']],
    'alcatra': ['Alcatra', 'Traseiro', ['Alcatra', 'Maminha', 'Baby beef']],
    'picanha': ['Picanha', 'Traseiro', ['Picanha']],
    'costela': ['Costela', 'Costado', ['Costela', 'Costela janela']],
    'ponta-agulha': ['Ponta de agulha', 'Costado', ['Ponta de agulha']],
    'fraldinha': ['Fraldinha', 'Costado', ['Fraldinha', 'Vazio']],
    'coxao': ['Coxões e lagarto', 'Traseiro', ['Coxão mole', 'Coxão duro', 'Patinho', 'Lagarto']],
    'musculo-t': ['Músculo traseiro', 'Traseiro', ['Músculo traseiro', 'Ossobuco']]
  };

  var ESPECIES = [
    {
      slug: 'suinos', nome: 'Suínos', singular: 'Suíno', capacidade: 600,
      titulo: 'Frigorífico de Suínos com SIF',
      chamada: 'Cortes suínos com procedência, da carcaça ao porcionado.',
      texto: 'A maior capacidade de abate da planta é dedicada aos suínos. Os animais chegam de produtores parceiros, passam por recebimento em instalações de baixo estresse e seguem por uma linha de abate moderna, acompanhada pelo Serviço de Inspeção Federal do recebimento ao produto final.',
      marcas: ['No Ponto Frigorífico', 'ponto.08'],
      destaque: 'Cortes inteiros e porcionados, resfriados e congelados, embalados com identificação da espécie e do corte.',
      geo: {
        silhueta: 'porco',
        regioes: [
          ['copa', '215,0 330,0 330,150 200,170', [272, 100]],
          ['paleta', '200,170 330,150 330,300 195,300', [268, 228]],
          ['joelho-d', '190,300 330,300 330,450 190,450', [228, 362]],
          ['lombo', '330,0 600,0 600,130 330,150', [465, 88]],
          ['costelinha', '330,150 480,145 480,230 330,230', [405, 192]],
          ['file', '480,145 600,130 600,215 480,230', [540, 185]],
          ['barriga', '330,230 480,230 600,215 610,330 330,330', [465, 278]],
          ['pernil', '600,0 820,0 820,320 700,320 610,330 600,215', [668, 190]],
          ['joelho-t', '560,330 610,330 700,320 820,320 820,450 560,450', [607, 362]]
        ]
      },
      regioes: {
        'copa': ['Copa', 'Dianteiro', ['Copa lombo', 'Sobrepaleta']],
        'paleta': ['Paleta', 'Dianteiro', ['Paleta', 'Paleta sem osso']],
        'joelho-d': ['Joelho dianteiro', 'Pernas', ['Joelho']],
        'lombo': ['Lombo', 'Lombo', ['Lombo', 'Bisteca', 'Carré']],
        'costelinha': ['Costelinha', 'Costado', ['Costelinha', 'Costela em tiras']],
        'file': ['Filé mignon', 'Lombo', ['Filé mignon suíno']],
        'barriga': ['Barriga', 'Barriga', ['Panceta', 'Barriga']],
        'pernil': ['Pernil', 'Traseiro', ['Pernil', 'Pernil sem osso']],
        'joelho-t': ['Joelho traseiro', 'Pernas', ['Joelho (eisbein)']]
      }
    },
    {
      slug: 'bovinos', nome: 'Bovinos', singular: 'Bovino', capacidade: 300,
      titulo: 'Frigorífico de Bovinos com SIF',
      chamada: 'Carne bovina com alto nível de acabamento de gordura.',
      texto: 'Os bovinos são escolhidos por uma equipe dedicada à compra e seleção dos animais, valorizando genética e cobertura de gordura. O resultado são cortes com maciez, sabor e suculência superiores, entregues inteiros ou porcionados, resfriados ou congelados.',
      marcas: ['No Ponto Frigorífico', 'ponto.08'],
      destaque: 'Cortes nobres e selecionados na linha premium ponto.08.',
      geo: {
        silhueta: 'boi',
        regioes: [
          ['pescoco', '190,80 280,95 285,230 190,230', [248, 160]],
          ['cupim', '270,0 400,0 385,92 280,95', [330, 70]],
          ['acem', '280,95 385,92 390,175 285,175', [335, 135]],
          ['peito', '190,230 285,230 300,330 190,330', [248, 268]],
          ['paleta', '285,175 390,175 395,260 300,260 285,230', [340, 215]],
          ['musculo-d', '300,260 395,260 400,450 290,450', [334, 330]],
          ['contrafile', '385,0 500,0 500,165 390,175', [445, 130]],
          ['alcatra', '500,0 560,0 570,160 500,165', [533, 122]],
          ['picanha', '560,0 720,0 640,130 570,160', [596, 116]],
          ['file', '500,165 570,160 570,195 500,200', [535, 182]],
          ['costela', '390,175 500,165 500,200 570,195 560,240 395,245', [468, 214]],
          ['ponta-agulha', '395,245 480,242 480,330 395,330', [440, 265]],
          ['fraldinha', '480,242 560,240 600,300 480,330', [522, 268]],
          ['coxao', '570,160 640,130 720,0 760,0 760,320 600,300 560,240 570,195', [612, 212]],
          ['musculo-t', '480,330 600,300 760,320 760,450 480,450', [538, 352]]
        ]
      },
      regioes: CORTES_BOI
    },
    {
      slug: 'bubalinos', nome: 'Bubalinos', singular: 'Bubalino', capacidade: 300,
      titulo: 'Frigorífico de Búfalos com SIF',
      chamada: 'Carne de búfalo, com identidade própria.',
      texto: 'A carne bubalina tem características próprias e é tratada como uma linha independente da bovina, do abate à identificação do produto. Uma carne naturalmente magra, de gordura branca e sabor suave, para quem busca diferenciação no balcão e no cardápio.',
      marcas: [],
      destaque: 'Linha separada da bovina, com cortes e identificação próprios.',
      geo: {
        silhueta: 'bufalo',
        regioes: [
          ['pescoco', '190,90 300,40 300,200 195,240 160,180', [248, 160]],
          ['acem', '300,0 400,0 400,170 300,180', [350, 118]],
          ['peito', '195,240 300,200 300,290 250,300 195,320', [244, 266]],
          ['paleta', '300,180 400,170 410,290 300,290', [355, 236]],
          ['musculo-d', '250,300 300,290 410,290 450,300 450,450 250,450', [312, 345]],
          ['contrafile', '400,0 520,0 520,160 400,170', [460, 110]],
          ['alcatra', '520,0 610,0 610,150 520,160', [565, 100]],
          ['picanha', '610,0 800,0 660,130 610,150', [633, 108]],
          ['file', '520,160 610,150 610,190 520,195', [565, 173]],
          ['costela', '400,170 520,160 520,195 610,190 600,250 405,255', [505, 218]],
          ['ponta-agulha', '405,255 510,252 510,330 450,330 450,300 410,290', [458, 280]],
          ['fraldinha', '510,252 600,250 640,320 510,330', [560, 284]],
          ['coxao', '610,150 660,130 800,0 800,330 640,320 600,250 610,190', [668, 222]],
          ['musculo-t', '500,330 640,320 800,330 800,450 500,450', [538, 350]]
        ]
      },
      regioes: CORTES_BOI
    },
    {
      slug: 'ovinos', nome: 'Ovinos', singular: 'Ovino', capacidade: 200,
      titulo: 'Frigorífico de Ovinos e Cordeiro com SIF',
      chamada: 'Cortes de cordeiro sob medida para quem exige excelência.',
      texto: 'O propósito da No Ponto é tornar-se referência nacional em cortes ovinos. A linha atende supermercados, açougues e boutiques de carne com cortes selecionados e acompanhamento de pós-venda.',
      marcas: [],
      destaque: 'Cortes selecionados de cordeiro para supermercados, açougues e boutiques de carne.',
      geo: {
        silhueta: 'ovelha',
        regioes: [
          ['pescoco', '310,60 380,70 380,190 330,230 300,140', [348, 145]],
          ['paleta', '300,240 330,230 380,190 440,180 440,290 300,290', [398, 240]],
          ['stinco-d', '290,290 440,290 440,450 290,450', [345, 352]],
          ['carre', '380,0 500,0 500,170 380,190', [440, 128]],
          ['lombo', '500,0 580,0 580,160 500,170', [540, 122]],
          ['costela', '440,180 500,170 580,160 590,290 440,290', [515, 232]],
          ['pernil', '580,0 820,0 820,290 590,290 580,160', [622, 200]],
          ['stinco-t', '520,290 820,290 820,450 520,450', [565, 352]]
        ]
      },
      regioes: {
        'pescoco': ['Pescoço', 'Dianteiro', ['Pescoço']],
        'paleta': ['Paleta', 'Dianteiro', ['Paleta', 'Paleta sem osso']],
        'stinco-d': ['Stinco dianteiro', 'Pernas', ['Stinco']],
        'carre': ['Carré', 'Lombo', ['French rack', 'Short rack', 'Costeletas']],
        'lombo': ['Lombo', 'Lombo', ['Lombo', 'Medalhão']],
        'costela': ['Costela', 'Costado', ['Costela', 'Peito']],
        'pernil': ['Pernil', 'Traseiro', ['Pernil', 'Pernil sem osso', 'Picanha de cordeiro']],
        'stinco-t': ['Stinco traseiro', 'Pernas', ['Stinco', 'Ossobuco']]
      }
    }
  ];

  // logo: caminho do arquivo da marca. Vazio = espaço em branco reservado para a logo.
  var MARCAS = [
    {
      slug: 'no-ponto', nome: 'No Ponto Frigorífico', logo: 'assets/img/marca/logo-color.png', linha: 'Primeira linha',
      especies: 'Cortes bovinos e suínos', slogan: 'O delicioso sabor da carne',
      texto: 'A marca que dá nome ao frigorífico: cortes bovinos e suínos de primeira linha, com o padrão de qualidade No Ponto em cada etapa.'
    },
    {
      slug: 'ponto08', logo: '', nome: 'ponto.08', linha: 'Linha premium',
      especies: 'Cortes nobres bovinos e suínos', slogan: 'O delicioso sabor da carne',
      texto: 'Cortes nobres e selecionados, resultado de uma cuidadosa escolha dos animais e da valorização da cobertura de gordura.'
    }
  ];

  /* Ficha de produto (abre ao clicar em um corte). Preencher com o catálogo
     do cliente. Chave: 'espécie/Nome do corte' exatamente como em ESPECIES.
     foto: caminho da imagem (ex.: 'assets/img/cortes/ovinos-french-rack.jpg').
     Campos vazios aparecem como "Em breve" no site. Exemplo:
     'ovinos/French rack': { codigo: 'OVC01005', descricao: 'Carne congelada de ovino com osso', peso: '0,580 kg', foto: '' } */
  var CATALOGO = {
  };

  /* Churrascômetro: cortes oferecidos por espécie e gramas por adulto
     (base de mercado: 400 g de carne por adulto em churrasco de até 4 h). */
  var CHURRASCO = {
    gramasAdulto: 400, gramasCrianca: 200,
    cortes: [
      ['bovinos', 'Bovino', ['Picanha', 'Alcatra', 'Maminha', 'Fraldinha', 'Contrafilé', 'Costela', 'Cupim']],
      ['suinos', 'Suíno', ['Costelinha', 'Panceta', 'Lombo', 'Pernil']],
      ['ovinos', 'Cordeiro', ['Paleta', 'Costela', 'Carré', 'Pernil']],
      ['bubalinos', 'Búfalo', ['Picanha', 'Contrafilé', 'Fraldinha']]
    ],
    padrao: ['bovinos/Picanha', 'bovinos/Fraldinha', 'suinos/Costelinha']
  };

  /* Selos e certificações (página certificacoes.html, faixa da home e qualidade).
     status: 'ativo' | 'implantacao' | 'planejado'.
     provisorio: true = levantamento de mercado, ainda NÃO confirmado pelo cliente.
     Confirmar cada item antes de publicar. destaque: aparece na faixa da home. */
  var CERTIFICACOES = [
    { grupo: 'Inspeção e segurança dos alimentos', sigla: 'SIF', nome: 'SIF nº 7439', texto: 'Serviço de Inspeção Federal', principal: true, destaque: true, status: 'ativo',
      orgao: 'Ministério da Agricultura e Pecuária (MAPA / DIPOA)',
      desc: 'Registro que habilita o abate e a venda de produtos de origem animal para todo o Brasil, com fiscal federal acompanhando do recebimento ao produto final.' },
    { grupo: 'Inspeção e segurança dos alimentos', sigla: 'BPF', nome: 'Boas Práticas de Fabricação', texto: 'Programas de autocontrole', destaque: true, status: 'ativo',
      orgao: 'Exigência do MAPA (RIISPOA)',
      desc: 'BPF, PPHO e Procedimentos Operacionais Padrão que definem higiene, instalações e manipulação em cada etapa da planta.' },
    { grupo: 'Inspeção e segurança dos alimentos', sigla: 'APPCC', nome: 'APPCC (HACCP)', texto: 'Análise de perigos e pontos críticos', destaque: true, status: 'ativo',
      orgao: 'Codex Alimentarius / MAPA',
      desc: 'Identifica e controla os pontos críticos do processo para garantir a inocuidade da carne.' },
    { grupo: 'Inspeção e segurança dos alimentos', sigla: 'FSSC', nome: 'FSSC 22000', texto: 'Gestão de segurança de alimentos', destaque: true, status: 'implantacao', provisorio: true,
      orgao: 'Foundation FSSC · base ISO 22000 (GFSI)',
      desc: 'Certificação internacional de gestão de segurança de alimentos, reconhecida pelas grandes redes de varejo.' },
    { grupo: 'Inspeção e segurança dos alimentos', sigla: 'BRC', nome: 'BRCGS Food Safety', texto: 'Padrão global do varejo', status: 'planejado', provisorio: true,
      orgao: 'BRCGS (GFSI)',
      desc: 'Padrão exigido por varejistas e importadores para fornecedores de alimentos.' },
    { grupo: 'Bem-estar animal e origem', sigla: 'BEA', nome: 'Certified Humane', texto: 'Bem-estar animal', destaque: true, status: 'planejado', provisorio: true,
      orgao: 'Humane Farm Animal Care (HFAC)',
      desc: 'Atesta práticas de bem-estar animal no transporte, no recebimento e no abate.' },
    { grupo: 'Bem-estar animal e origem', sigla: 'RAST', nome: 'Rastreabilidade (SISBOV)', texto: 'Origem dos bovinos e búfalos', status: 'planejado', provisorio: true,
      orgao: 'Ministério da Agricultura e Pecuária (MAPA)',
      desc: 'Identificação individual dos animais, ligando cada lote à propriedade de origem.' },
    { grupo: 'Meio ambiente', sigla: 'LO', nome: 'Licença de Operação', texto: 'Licenciamento ambiental', status: 'ativo', provisorio: true,
      orgao: 'Instituto Água e Terra (IAT-PR)',
      desc: 'Licença ambiental estadual da planta, incluindo o tratamento próprio de efluentes.' },
    { grupo: 'Meio ambiente', sigla: 'ISO', nome: 'ISO 14001', texto: 'Gestão ambiental', status: 'planejado', provisorio: true,
      orgao: 'ISO · organismo certificador acreditado',
      desc: 'Sistema de gestão ambiental com metas de redução de impacto, água e resíduos.' },
    { grupo: 'Mercados', sigla: 'HALAL', nome: 'Halal', texto: 'Abate para o mercado islâmico', status: 'planejado', provisorio: true,
      orgao: 'FAMBRAS Halal ou CDIAL Halal',
      desc: 'Certificação de abate conforme os preceitos islâmicos, exigida em parte do mercado externo.' }
  ];

  var dados = { CERTIFICACOES: CERTIFICACOES, CONTATO: CONTATO, ESPECIES: ESPECIES, MARCAS: MARCAS, CATALOGO: CATALOGO, CHURRASCO: CHURRASCO };
  if (typeof module !== 'undefined' && module.exports) module.exports = dados;
  else raiz.NP_DADOS = dados;
})(this);
