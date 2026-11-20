<?php
/**
 * Recebe os formulários do site (Contato, Marca própria, Venda seu gado e
 * Trabalhe conosco) e envia os dados, com o currículo quando houver, por e-mail.
 * Responde em JSON: { "ok": true } ou { "ok": false, "erro": "mensagem para o visitante" }.
 */

// E-mail que recebe os formulários e que aparece como remetente (precisa ser do domínio do site).
// A CONFIRMAR com o cliente: e-mails por setor (comercial, RH, compras).
const DESTINO   = 'sac@redonoponto.com.br';
const REMETENTE = 'sac@redonoponto.com.br';

// Destinos por formulário (deixe vazio para usar DESTINO)
const DESTINO_POR_FORM = [
  'Contato'          => '',
  'Marca própria'    => '',
  'Venda seu gado'   => '', // equipe de compra de animais
  'Trabalhe conosco' => '', // Recursos Humanos
];

const MAX_ANEXO   = 10 * 1024 * 1024; // 10 MB
const INTERVALO_S = 20;               // intervalo mínimo entre envios do mesmo visitante

// Campos aceitos: nome do campo => [rótulo no e-mail, tamanho máximo]
const CAMPOS = [
  'assunto'    => ['Assunto', 80],
  'nome'       => ['Nome', 120],
  'empresa'    => ['Empresa', 120],
  'cnpj'       => ['CNPJ', 20],
  'telefone'   => ['Telefone', 20],
  'email'      => ['E-mail', 120],
  'cidade'     => ['Cidade / UF', 80],
  'segmento'   => ['Segmento', 80],
  'propriedade'=> ['Propriedade', 120],
  'especie'    => ['Espécie', 40],
  'quantidade' => ['Quantidade de animais', 40],
  'area'       => ['Área de interesse', 80],
  'mensagem'   => ['Mensagem', 1500],
];
const FORMULARIOS = ['Contato', 'Marca própria', 'Venda seu gado', 'Trabalhe conosco'];
const TIPOS_ANEXO = [
  'pdf'  => ['application/pdf'],
  'doc'  => ['application/msword', 'application/octet-stream', 'application/x-ole-storage', 'application/CDFV2'],
  'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream'],
];

date_default_timezone_set('America/Sao_Paulo');
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

function responder($ok, $erro = '', $status = 200) {
  http_response_code($status);
  echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'erro' => $erro], JSON_UNESCAPED_UNICODE);
  exit;
}

// Remove quebras de linha (evita injeção de cabeçalhos no e-mail) e espaços sobrando
function limpar_linha($s) {
  return trim(preg_replace('/[\r\n\t]+/', ' ', (string) $s));
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  responder(false, 'Método não permitido.', 405);
}

if (empty($_POST) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
  responder(false, 'O arquivo é grande demais. Envie um arquivo de até 10 MB.', 413);
}

// Robôs: campo-armadilha preenchido → finge que deu certo e não envia nada
if (!empty($_POST['hp_np'])) {
  responder(true);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'desconhecido';
$marca = sys_get_temp_dir() . '/noponto-form-' . md5($ip);
if (is_file($marca) && time() - filemtime($marca) < INTERVALO_S) {
  responder(false, 'Aguarde alguns segundos antes de enviar de novo.', 429);
}

$formulario = limpar_linha($_POST['formulario'] ?? '');
if (!in_array($formulario, FORMULARIOS, true)) {
  $formulario = FORMULARIOS[0];
}

$dados = [];
foreach (CAMPOS as $campo => [$rotulo, $max]) {
  $valor = (string) ($_POST[$campo] ?? '');
  $valor = $campo === 'mensagem' ? trim(str_replace("\r\n", "\n", $valor)) : limpar_linha($valor);
  if ($valor !== '') {
    $dados[$campo] = mb_substr($valor, 0, $max);
  }
}

if (empty($dados['nome'])) {
  responder(false, 'Preencha o seu nome.', 422);
}
if (empty($dados['email']) && empty($dados['telefone'])) {
  responder(false, 'Informe um e-mail ou telefone para a gente responder.', 422);
}
if (!empty($dados['email']) && !filter_var($dados['email'], FILTER_VALIDATE_EMAIL)) {
  responder(false, 'O e-mail informado não parece válido.', 422);
}

// Anexo (currículo)
$anexo = null;
if (!empty($_FILES['arquivo']) && ($_FILES['arquivo']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
  $f = $_FILES['arquivo'];
  if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE || $f['size'] > MAX_ANEXO) {
    responder(false, 'O arquivo é grande demais. Envie um arquivo de até 10 MB.', 413);
  }
  if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) {
    responder(false, 'Não conseguimos receber o arquivo. Tente novamente.', 400);
  }
  $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
  $mime = function_exists('finfo_open') ? finfo_file(finfo_open(FILEINFO_MIME_TYPE), $f['tmp_name']) : '';
  if (!isset(TIPOS_ANEXO[$ext]) || ($mime !== '' && !in_array($mime, TIPOS_ANEXO[$ext], true))) {
    responder(false, 'Formato de arquivo não aceito. Use PDF, DOC ou DOCX.', 415);
  }
  $nomeArquivo = preg_replace('/[^A-Za-z0-9._-]+/', '-', pathinfo($f['name'], PATHINFO_FILENAME));
  $anexo = [
    'nome'     => (trim($nomeArquivo, '-.') ?: 'curriculo') . '.' . $ext,
    'tipo'     => TIPOS_ANEXO[$ext][0],
    'conteudo' => file_get_contents($f['tmp_name']),
  ];
}
if ($formulario === 'Trabalhe conosco' && !$anexo) {
  responder(false, 'Anexe o seu currículo.', 422);
}

// Corpo do e-mail
$titulo = 'Site No Ponto — ' . $formulario;
$linhas = [$titulo, str_repeat('=', mb_strlen($titulo)), ''];
foreach (CAMPOS as $campo => [$rotulo]) {
  if (isset($dados[$campo]) && $campo !== 'mensagem') {
    $linhas[] = $rotulo . ': ' . $dados[$campo];
  }
}
if (isset($dados['mensagem'])) {
  $linhas[] = '';
  $linhas[] = 'Mensagem:';
  $linhas[] = $dados['mensagem'];
}
if ($anexo) {
  $linhas[] = '';
  $linhas[] = 'Arquivo anexado: ' . $anexo['nome'];
}
$linhas[] = '';
$linhas[] = '--';
$linhas[] = 'Enviado pelo site do No Ponto Frigorífico em ' . date('d/m/Y \à\s H:i');
$texto = implode("\n", $linhas);

$assunto = '[Site No Ponto] ' . $formulario . (isset($dados['assunto']) ? ' — ' . $dados['assunto'] : '') . ' — ' . $dados['nome'];
$destino = DESTINO_POR_FORM[$formulario] ?: DESTINO;

$cabecalhos = [
  'From: =?UTF-8?B?' . base64_encode('Site No Ponto') . '?= <' . REMETENTE . '>',
  'MIME-Version: 1.0',
  'X-Mailer: Site No Ponto',
];
if (!empty($dados['email'])) {
  $cabecalhos[] = 'Reply-To: ' . $dados['email'];
}

if ($anexo) {
  $limite = 'noponto-' . bin2hex(random_bytes(12));
  $cabecalhos[] = 'Content-Type: multipart/mixed; boundary="' . $limite . '"';
  $corpo = "--$limite\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n"
    . "Content-Transfer-Encoding: base64\r\n\r\n"
    . chunk_split(base64_encode($texto))
    . "--$limite\r\n"
    . 'Content-Type: ' . $anexo['tipo'] . '; name="' . $anexo['nome'] . "\"\r\n"
    . "Content-Transfer-Encoding: base64\r\n"
    . 'Content-Disposition: attachment; filename="' . $anexo['nome'] . "\"\r\n\r\n"
    . chunk_split(base64_encode($anexo['conteudo']))
    . "--$limite--";
} else {
  $cabecalhos[] = 'Content-Type: text/plain; charset=UTF-8';
  $cabecalhos[] = 'Content-Transfer-Encoding: base64';
  $corpo = chunk_split(base64_encode($texto));
}

$enviado = mail(
  $destino,
  mb_encode_mimeheader($assunto, 'UTF-8', 'B'),
  $corpo,
  implode("\r\n", $cabecalhos),
  '-f' . REMETENTE
);

if (!$enviado) {
  responder(false, 'Não foi possível enviar agora. Tente de novo ou fale pelo WhatsApp (46) 99202-4048.', 500);
}

@touch($marca);
responder(true);
