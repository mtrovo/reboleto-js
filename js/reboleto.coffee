DIA_EM_MS=1000*60*60*24;
DIA_0=new Date(Date.UTC(1997,9,7));
MASCARA_PRECO="0000000000"
MASCARA_DIAS="0000"
NUMERO_RE=/^(\d{3})(\d)(\d{5})(\d)(\d{5})(\d{5})(\d)(\d{10})(\d)(\d)(\d{4})(\d{10})$/

ctx=exports ? this

class Boleto
  constructor: (@num) ->
    $=num.match(NUMERO_RE)

    throw new Error("Número de boleto inválido") unless $

    # separa os campos
    @banco=$[1]
    @moeda=$[2]
    @vencimento=$[11]
    @preco=$[12]
    @nosso_numero=$[3]+$[5]
    @favorecido=$[6]+$[8]
    @digito1=$[4]
    @digito2=$[7]
    @digito3=$[9]
    @digito_geral=$[10]

  getVencimentoComoData: ->
    @getDiasComoData(parseInt(@vencimento))

  getDiasComoData:(dias) ->
    new Date(DIA_0.getTime() + dias*DIA_EM_MS)

  getDateComoDias:(dt) ->
    (dt.getTime()-DIA_0.getTime())/DIA_EM_MS

  formatarPreco:(p) ->
    p=p.replace(/,|\./g,'')
    MASCARA_PRECO.substring(p.length)+p

  alterarVencimento:(dt) ->
    throw Error("Data deve ser uma data em UTC") if dt.getUTCHours()
    throw Error("Data inválida") if dt.getTime()<DIA_0.getTime()
    dias= '' + @getDateComoDias(dt)
    @vencimento=MASCARA_DIAS.substring(dias.length) + dias
    @atualizarDigitoGeral()

  alterarValor:(vl) ->
    @preco=@formatarPreco(vl)
    @atualizarDigitoGeral()

  atualizarDigitoGeral: ->
    @digito_geral=@__calcularDigitoGeral()

  getNumeroFormatado: ->
    "#{@banco}#{@moeda}#{@nosso_numero[0]}.#{@nosso_numero[1..4]}#{@digito1} "+
    "#{@nosso_numero[5..]}.#{@favorecido[0..4]}#{@digito2} "+
    "#{@favorecido[5..9]}.#{@favorecido[10..14]}#{@digito3} "+
    "#{@digito_geral} " +
    "#{@vencimento}#{@preco}"

  __calcularDigitoGeral: ->
    reg=@banco+@moeda+@vencimento+@preco+@nosso_numero+@favorecido
    sum= reg.split('').reverse().reduce (p,c,i) ->
      c=parseInt(c)
      p + (i%8 + 2)*c
    ,0
    sum= 11-(sum%11)
    sum=1 if sum>9
    sum

ctx.Boleto=Boleto
